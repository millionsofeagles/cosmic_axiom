import express from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
import axios from 'axios';
import { getApiKey } from '../utils/apiKeyClient.js';

const router = express.Router();

// Simple in-memory cache for CIRCL data (expires after 30 minutes)
const circlCache = {
  data: null,
  timestamp: null,
  maxAge: 30 * 60 * 1000 // 30 minutes
};

// CVE Feed endpoint
router.get('/feeds/:source', authenticateRequest, async (req, res) => {
  const { source } = req.params;
  
  try {
    let data = [];
    
    switch (source) {
      case 'nvd':
        // NVD API
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const nvdResponse = await axios.get(
          `https://services.nvd.nist.gov/rest/json/cves/2.0?lastModStartDate=${startDate}&lastModEndDate=${endDate}`,
          { timeout: 10000 }
        );
        
        if (nvdResponse.data && nvdResponse.data.vulnerabilities) {
          // Sort by published date (fewest days old first) before slicing
          const sortedVulns = nvdResponse.data.vulnerabilities.sort((a, b) => {
            const dateA = new Date(a.cve.published);
            const dateB = new Date(b.cve.published);
            return dateB - dateA; // Newest (fewest days old) first
          });
          
          data = sortedVulns.slice(0, 20).map(vuln => ({
            id: vuln.cve.id,
            description: vuln.cve.descriptions?.[0]?.value || 'No description available',
            severity: vuln.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 
                      vuln.cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
            score: vuln.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 
                   vuln.cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore || 0,
            published: vuln.cve.published,
            lastModified: vuln.cve.lastModified,
            references: [
              { url: `https://nvd.nist.gov/vuln/detail/${vuln.cve.id}` },
              ...(vuln.cve.references?.slice(0, 2) || [])
            ],
            cweIds: vuln.cve.weaknesses?.[0]?.description?.[0]?.value || 'Unknown',
            affectedProducts: extractAffectedProducts(vuln),
            source: 'NVD'
          }));
        }
        break;
        
      case 'circl':
        // Check cache first
        const now = Date.now();
        if (circlCache.data && circlCache.timestamp && (now - circlCache.timestamp < circlCache.maxAge)) {
          console.log('Using cached CIRCL data');
          data = circlCache.data;
        } else {
          // CIRCL CVE API - fetch only last 7 days for better performance
          console.log('Fetching fresh CIRCL data...');
          const circlResponse = await axios.get('https://cve.circl.lu/api/last/7', { 
            timeout: 10000, // Reduced timeout
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CosmicAxiom/1.0'
            }
          });
          console.log('CIRCL API response received, data length:', circlResponse.data?.length);
          
          if (circlResponse.data && Array.isArray(circlResponse.data)) {
            // Take only first 50 entries before processing to improve performance
            const limitedData = circlResponse.data.slice(0, 50);
            console.log('Processing CIRCL data, limited to:', limitedData.length);
            data = limitedData.slice(0, 20).map(cve => {
            // Handle both CSAF and CVE 5.0 JSON formats
            let cveId = 'Unknown';
            let description = 'No description available';
            let severity = 'UNKNOWN';
            let score = 0;
            let published = null;
            let lastModified = null;
            let references = [];
            let cweIds = 'Unknown';
            let products = [];

            // Check if this is CSAF format (new CIRCL format)
            if (cve.document && cve.document.vulnerabilities) {
              // CSAF format
              const vuln = cve.document.vulnerabilities[0];
              if (vuln) {
                cveId = vuln.cve || 'Unknown';
                description = vuln.title || vuln.notes?.[0]?.text || 'No description available';
                
                // Try to extract CVSS scores from CSAF
                if (vuln.scores && vuln.scores.length > 0) {
                  const cvss = vuln.scores[0];
                  score = cvss.cvss_v3?.baseScore || cvss.cvss_v2?.baseScore || 0;
                  severity = cvss.cvss_v3?.baseSeverity || cvss.cvss_v2?.baseSeverity || 'UNKNOWN';
                }
                
                published = cve.document.tracking?.initial_release_date || new Date().toISOString();
                lastModified = cve.document.tracking?.current_release_date || published;
                
                references = vuln.references?.slice(0, 3) || [];
                
                // Extract affected products from CSAF
                if (cve.document.product_tree?.full_product_names) {
                  products = cve.document.product_tree.full_product_names.slice(0, 3).map(p => p.name || p.product_name || 'Unknown');
                }
              }
            } else {
              // Original CVE 5.0 format
              cveId = cve.cveMetadata?.cveId || cve.id || 'Unknown';
              const cna = cve.containers?.cna || {};
              const descriptions = cna.descriptions || [];
              description = descriptions[0]?.value || 'No description available';
              
              // Extract CVSS scores
              const metrics = cna.metrics || [];
              
              // Try to find CVSS v3.1 first, then v4.0
              const cvssV3 = metrics.find(m => m.cvssV3_1)?.cvssV3_1;
              const cvssV4 = metrics.find(m => m.cvssV4_0)?.cvssV4_0;
              
              if (cvssV3) {
                score = cvssV3.baseScore || 0;
                severity = cvssV3.baseSeverity || 'UNKNOWN';
              } else if (cvssV4) {
                score = cvssV4.baseScore || 0;
                severity = cvssV4.baseSeverity || 'UNKNOWN';
              }
              
              published = cve.cveMetadata?.datePublished || cna.datePublic;
              lastModified = cve.cveMetadata?.dateUpdated || cve.cveMetadata?.datePublished;
              
              // Extract affected products
              const affected = cna.affected || [];
              products = affected.map(a => a.packageName || a.product || 'Unknown').filter(p => p !== 'Unknown');
              
              // Extract CWE IDs
              const problemTypes = cna.problemTypes || [];
              cweIds = problemTypes.flatMap(pt => 
                pt.descriptions?.map(d => d.cweId || '').filter(Boolean) || []
              ).join(', ') || 'Unknown';
              
              // Extract references
              references = (cna.references || []).slice(0, 2).map(ref => ({ 
                url: ref.url || ref 
              }));
            }

            // Add CIRCL link first for all formats
            references.unshift({ url: `https://cve.circl.lu/cve/${cveId}` });
            
            return {
              id: cveId,
              description: description,
              severity: severity.toUpperCase(),
              score: score,
              published: published,
              lastModified: lastModified,
              references: references,
              cweIds: cweIds,
              affectedProducts: products.slice(0, 3),
              source: 'CIRCL'
            };
          });
          console.log(`Processed ${data.length} CIRCL CVEs`);
          
          // Update cache
          circlCache.data = data;
          circlCache.timestamp = now;
          console.log('CIRCL data cached');
        } else {
          console.log('CIRCL response data is not an array or is empty');
        }
      }
        break;
        
      case 'cisa':
        // CISA Known Exploited Vulnerabilities
        const cisaResponse = await axios.get(
          'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
          { timeout: 10000 }
        );
        
        if (cisaResponse.data && cisaResponse.data.vulnerabilities) {
          data = cisaResponse.data.vulnerabilities.slice(0, 20).map(vuln => ({
            id: vuln.cveID,
            description: vuln.shortDescription || vuln.vulnerabilityName || 'No description available',
            severity: 'HIGH', // CISA KEV are all actively exploited
            score: 8.0, // Default high score for exploited vulns
            published: vuln.dateAdded,
            lastModified: vuln.dateAdded,
            references: [
              { url: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog` },
              { url: `https://nvd.nist.gov/vuln/detail/${vuln.cveID}` }
            ],
            cweIds: 'Actively Exploited',
            affectedProducts: [`${vuln.vendorProject} ${vuln.product}`],
            source: 'CISA KEV',
            additionalInfo: {
              dueDate: vuln.dueDate,
              requiredAction: vuln.requiredAction
            }
          }));
        }
        break;
        
      case 'github':
        // GitHub Advisory Database
        // For GitHub, we'll use their public REST API which doesn't require authentication
        const githubResponse = await axios.get(
          'https://api.github.com/advisories?type=reviewed&per_page=20',
          { 
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            },
            timeout: 10000 
          }
        );
        
        if (githubResponse.data) {
          data = githubResponse.data.map(advisory => ({
            id: advisory.ghsa_id || advisory.id || 'Unknown',
            description: advisory.summary || advisory.description || 'No description available',
            severity: advisory.severity?.toUpperCase() || 'UNKNOWN',
            score: mapSeverityToScore(advisory.severity),
            published: advisory.published_at,
            lastModified: advisory.updated_at,
            references: [
              { url: advisory.html_url || `https://github.com/advisories/${advisory.ghsa_id}` },
              ...(advisory.references?.slice(0, 2).map(ref => ({ url: ref })) || [])
            ],
            cweIds: advisory.cwe_ids?.join(', ') || advisory.cwes?.map(c => c.cwe_id).join(', ') || 'Unknown',
            affectedProducts: extractGitHubProducts(advisory),
            source: 'GitHub Advisory'
          }));
        }
        break;
        
      case 'microsoft':
        // Microsoft Security Response Center (no API key required)
        try {
          console.log('Fetching Microsoft security updates');
          
          // Use the v2 Updates endpoint (public, no auth required)
          const msrcUrl = 'https://api.msrc.microsoft.com/cvrf/v2.0/Updates';
          
          console.log('Calling Microsoft API:', msrcUrl);
          
          const msrcResponse = await axios.get(msrcUrl, {
            headers: {
              'Accept': 'application/json'
            },
            timeout: 15000
          });
          
          if (msrcResponse.data && msrcResponse.data.value) {
            console.log('Microsoft API response received');
            
            // Get the most recent updates (last 6 months)
            const recentUpdates = msrcResponse.data.value
              .filter(update => {
                const updateDate = new Date(update.CurrentReleaseDate);
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                return updateDate >= sixMonthsAgo;
              })
              .sort((a, b) => new Date(b.CurrentReleaseDate) - new Date(a.CurrentReleaseDate))
              .slice(0, 3); // Get 3 most recent update IDs
            
            const cves = [];
            
            // Fetch CVRF details for each update
            for (const update of recentUpdates) {
              try {
                console.log(`Fetching CVRF for update: ${update.ID}`);
                // Use the v2 CVRF endpoint
                const cvrfUrl = `https://api.msrc.microsoft.com/cvrf/v2.0/cvrf/${update.ID}`;
                
                const cvrfResponse = await axios.get(cvrfUrl, {
                  headers: {
                    'Accept': 'application/json'
                  },
                  timeout: 15000
                });
                
                if (cvrfResponse.data && cvrfResponse.data.Vulnerability) {
                  // Extract CVEs from the CVRF document
                  cvrfResponse.data.Vulnerability.forEach(vuln => {
                    if (cves.length >= 20) return; // Limit to 20 CVEs
                    
                    // Skip CVEs that don't have proper descriptions (likely third-party CVEs)
                    const vulnNotes = vuln.Notes || [];
                    const vulnDescriptionNote = vulnNotes.find(n => n.Type === 2 && n.Title === 'Description');
                    if (!vulnDescriptionNote || !vulnDescriptionNote.Value) {
                      return; // Skip this CVE if no description
                    }
                    
                    // Extract CVE ID, handling object structure
                    let cveId = 'Unknown';
                    if (vuln.CVE) {
                      if (typeof vuln.CVE === 'string') {
                        cveId = vuln.CVE;
                      } else if (vuln.CVE.Value) {
                        cveId = vuln.CVE.Value;
                      }
                    } else if (vuln.Title) {
                      if (typeof vuln.Title === 'string') {
                        cveId = vuln.Title;
                      } else if (vuln.Title.Value) {
                        cveId = vuln.Title.Value;
                      }
                    }
                    const notes = vuln.Notes || [];
                    
                    // Find description from Notes (Type 2 = Description)
                    let description = 'No description available';
                    const descriptionNote = notes.find(n => n.Type === 2 && n.Title === 'Description');
                    if (descriptionNote && descriptionNote.Value) {
                      description = descriptionNote.Value;
                    }
                    
                    // Fallback to vulnerability title if no description found
                    if (!description || description === 'No description available') {
                      if (vuln.Title && typeof vuln.Title === 'object' && vuln.Title.Value) {
                        description = vuln.Title.Value;
                      } else if (vuln.Title && typeof vuln.Title === 'string') {
                        description = vuln.Title;
                      }
                    }
                    
                    // If still no description, use a simple generic one
                    if (!description || description === 'No description available') {
                      description = `Security vulnerability tracked by Microsoft Security Response Center`;
                    }
                    
                    // Ensure description is a string and strip HTML tags
                    description = String(description || 'No description available');
                    description = description.replace(/<[^>]*>/g, '').trim();
                    
                    // Extract CVSS scores
                    let score = 0;
                    let severity = 'UNKNOWN';
                    if (vuln.CVSSScoreSets && vuln.CVSSScoreSets.length > 0) {
                      const cvss = vuln.CVSSScoreSets[0];
                      score = cvss.BaseScore || 0;
                      severity = mapCvssToSeverity(score);
                    }
                    
                    // Extract affected products
                    const products = [];
                    if (vuln.ProductStatuses) {
                      vuln.ProductStatuses.forEach(ps => {
                        if (ps.Status === 0 && ps.ProductID) { // Status 0 = Affected
                          // Try to get product name from ProductTree
                          const productName = findProductName(cvrfResponse.data.ProductTree, ps.ProductID) || ps.ProductID;
                          if (productName && products.length < 3) {
                            products.push(productName);
                          }
                        }
                      });
                    }
                    
                    cves.push({
                      id: cveId,
                      description: description.substring(0, 500), // Limit description length
                      severity: severity,
                      score: score,
                      published: update.CurrentReleaseDate || new Date().toISOString(),
                      lastModified: update.CurrentReleaseDate || new Date().toISOString(),
                      references: [
                        { url: `https://msrc.microsoft.com/update-guide/vulnerability/${cveId}` },
                        { url: `https://nvd.nist.gov/vuln/detail/${cveId}` }
                      ],
                      cweIds: vuln.CWE || 'Unknown',
                      affectedProducts: products.length > 0 ? products : ['Microsoft Products'],
                      source: 'Microsoft'
                    });
                  });
                }
              } catch (cvrfError) {
                console.error(`Error fetching CVRF for update ${update.ID}:`, cvrfError.message);
              }
            }
            
            data = cves.slice(0, 20);
            console.log(`Retrieved ${data.length} Microsoft CVEs`);
          }
        } catch (error) {
          console.error('Microsoft API error:', error.message);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
          }
          
          // Return more informative error data
          let errorMessage = 'Unknown error';
          if (error.response) {
            if (error.response.status === 401) {
              errorMessage = 'Invalid API key. Please check your Microsoft API key.';
            } else if (error.response.status === 403) {
              errorMessage = 'Access denied. Your API key may not have the required permissions.';
            } else if (error.response.status === 404) {
              errorMessage = 'API endpoint not found. The Microsoft API may have changed.';
            } else {
              errorMessage = `API returned status ${error.response.status}: ${error.response.data?.message || error.message}`;
            }
          } else {
            errorMessage = error.message;
          }
          
          data = [{
            id: 'API_CONFIG',
            description: errorMessage,
            severity: 'LOW',
            score: 0,
            published: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            references: [{ url: 'https://msrc.microsoft.com/engage/cars' }],
            cweIds: 'N/A',
            affectedProducts: ['Configure API key in Settings'],
            source: 'Microsoft'
          }];
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid CVE source' });
    }
    
    res.json({ data });
  } catch (error) {
    console.error(`Error fetching CVE data from ${source}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch CVE data',
      message: error.message,
      source: source
    });
  }
});

// Helper functions
function extractAffectedProducts(vuln) {
  const products = [];
  vuln.cve.configurations?.forEach(config => {
    config.nodes?.forEach(node => {
      node.cpeMatch?.forEach(cpe => {
        if (cpe.criteria) {
          const parts = cpe.criteria.split(':');
          if (parts[3] && parts[4]) {
            products.push(`${parts[3]} ${parts[4]}`);
          }
        }
      });
    });
  });
  return [...new Set(products)].slice(0, 3);
}

function mapCvssToSeverity(cvss) {
  const score = parseFloat(cvss);
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score >= 0.1) return 'LOW';
  return 'UNKNOWN';
}

function extractProductsFromCpe(cpeList) {
  const products = [];
  cpeList.forEach(cpe => {
    if (typeof cpe === 'string') {
      const parts = cpe.split(':');
      if (parts[3] && parts[4]) {
        products.push(`${parts[3]} ${parts[4]}`);
      }
    }
  });
  return [...new Set(products)].slice(0, 3);
}

function mapSeverityToScore(severity) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 9.5;
    case 'HIGH': return 8.0;
    case 'MODERATE':
    case 'MEDIUM': return 5.0;
    case 'LOW': return 2.0;
    default: return 0;
  }
}

function extractGitHubProducts(advisory) {
  const products = [];
  
  // Try vulnerabilities array first (newer API format)
  if (advisory.vulnerabilities) {
    advisory.vulnerabilities.forEach(vuln => {
      if (vuln.package?.name) {
        const ecosystem = vuln.package.ecosystem || '';
        const name = vuln.package.name;
        products.push(ecosystem ? `${ecosystem}:${name}` : name);
      }
    });
  }
  
  // Try affected array (older API format)
  if (advisory.affected) {
    advisory.affected.forEach(pkg => {
      if (pkg.package?.name) {
        products.push(pkg.package.name);
      }
    });
  }
  
  // If no products found, try to extract from title or summary
  if (products.length === 0 && advisory.summary) {
    const match = advisory.summary.match(/in ([a-zA-Z0-9\-_]+)/);
    if (match) {
      products.push(match[1]);
    }
  }
  
  return [...new Set(products)].slice(0, 3);
}

function findProductName(productTree, productId) {
  if (!productTree) return null;
  
  function searchBranch(branch) {
    // Check FullProductName entries
    if (branch.FullProductName) {
      for (const product of branch.FullProductName) {
        if (product.ProductID === productId) {
          return product.Value;
        }
      }
    }
    
    // Recursively search child branches
    if (branch.Branch) {
      for (const subBranch of branch.Branch) {
        const result = searchBranch(subBranch);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  // Start searching from the root
  if (productTree.Branch) {
    for (const branch of productTree.Branch) {
      const result = searchBranch(branch);
      if (result) return result;
    }
  }
  
  // If not found in branches, check root FullProductName
  if (productTree.FullProductName) {
    for (const product of productTree.FullProductName) {
      if (product.ProductID === productId) {
        return product.Value;
      }
    }
  }
  
  return null;
}

export default router;