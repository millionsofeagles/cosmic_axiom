import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  NewspaperIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ShieldExclamationIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import VulnerabilityModal from '../components/VulnerabilityModal';
import NewFindingModal from '../components/NewFindingModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [cveData, setCveData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [stats, setStats] = useState({
    totalCVEs: 0,
    criticalCVEs: 0,
    todayCVEs: 0,
    trendingTech: []
  });
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedCVE, setSelectedCVE] = useState(null);
  const [addedToLibrary, setAddedToLibrary] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFeed, setSelectedFeed] = useState('nvd');
  const [feedLoading, setFeedLoading] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [findingModalOpen, setFindingModalOpen] = useState(false);
  const [cveToConvert, setCveToConvert] = useState(null);

  // CVE Feed configurations
  const cveFeeds = {
    nvd: {
      name: 'NIST NVD',
      description: 'National Vulnerability Database'
    },
    circl: {
      name: 'CIRCL CVE',
      description: 'Computer Incident Response Center Luxembourg'
    },
    cisa: {
      name: 'CISA KEV',
      description: 'Known Exploited Vulnerabilities Catalog'
    },
    github: {
      name: 'GitHub Advisory',
      description: 'GitHub Security Advisories Database'
    },
    microsoft: {
      name: 'Microsoft',
      description: 'Microsoft Security Response Center'
    }
  };

  // Handle opening vulnerability modal
  const openVulnerabilityModal = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setModalOpen(true);
  };

  // Handle closing vulnerability modal
  const closeVulnerabilityModal = () => {
    setSelectedVulnerability(null);
    setModalOpen(false);
  };

  // Convert CVE data to finding format based on source
  const convertCVEToFinding = (cve) => {
    let title = cve.id;
    let description = cve.description || 'No description available';
    let impact = '';
    let recommendation = '';
    let tags = [];
    let reference = '';

    // Source-specific conversions
    switch (cve.source) {
      case 'NVD':
        title = `${cve.id} - ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`;
        impact = `Exploitation of this vulnerability could lead to ${cve.severity === 'CRITICAL' ? 'complete system compromise' : cve.severity === 'HIGH' ? 'significant security impact' : cve.severity === 'MEDIUM' ? 'moderate security impact' : 'limited security impact'}. `;
        if (cve.score >= 9.0) impact += 'This vulnerability has a critical CVSS score indicating severe potential impact. ';
        if (cve.affectedProducts && cve.affectedProducts.length > 0) {
          impact += `Affected systems include: ${cve.affectedProducts.join(', ')}.`;
        }
        recommendation = `Review and patch systems affected by ${cve.id}. `;
        if (cve.references && cve.references.length > 0) {
          reference = cve.references[0].url;
          recommendation += `Refer to the official NVD entry for detailed remediation guidance.`;
        }
        tags = ['nvd', cve.severity?.toLowerCase() || 'medium'];
        if (cve.cweIds && cve.cweIds !== 'Unknown') {
          tags.push(cve.cweIds.toLowerCase());
        }
        break;

      case 'CISA KEV':
        title = `[ACTIVELY EXPLOITED] ${cve.id}`;
        description = `${cve.description}\n\nThis vulnerability is in CISA's Known Exploited Vulnerabilities catalog, indicating active exploitation in the wild.`;
        impact = 'This vulnerability is being actively exploited in the wild and poses an immediate threat to affected systems. ';
        impact += 'Threat actors are known to be leveraging this vulnerability for unauthorized access, data theft, or system compromise. ';
        impact += 'Organizations that fail to patch this vulnerability are at high risk of security breach.';
        recommendation = cve.additionalInfo?.requiredAction || 
          `Immediate action required. This vulnerability is being actively exploited. Apply available patches or mitigations immediately.`;
        if (cve.additionalInfo?.dueDate) {
          recommendation += ` Federal agencies must remediate by ${new Date(cve.additionalInfo.dueDate).toLocaleDateString()}.`;
        }
        reference = 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog';
        tags = ['cisa-kev', 'actively-exploited', 'critical'];
        break;

      case 'GitHub Advisory':
        title = `${cve.id} - GitHub Security Advisory`;
        impact = 'Supply chain attacks through vulnerable dependencies can compromise application security. ';
        if (cve.severity === 'CRITICAL' || cve.severity === 'HIGH') {
          impact += 'This vulnerability could allow attackers to execute arbitrary code, access sensitive data, or compromise the application. ';
        }
        impact += 'All applications using the affected packages are potentially vulnerable until patched.';
        recommendation = `Update affected packages to patched versions. Check your dependency tree for vulnerable versions.`;
        if (cve.references && cve.references.length > 0) {
          reference = cve.references[0].url;
        }
        tags = ['github', cve.severity?.toLowerCase() || 'medium'];
        if (cve.affectedProducts && cve.affectedProducts.length > 0) {
          cve.affectedProducts.forEach(product => {
            if (product.includes(':')) {
              tags.push(product.split(':')[0].toLowerCase()); // ecosystem
            }
          });
        }
        break;

      case 'Microsoft':
        title = `${cve.id} - Microsoft Security Update`;
        impact = 'Microsoft vulnerabilities can affect Windows systems, Office applications, and other Microsoft products. ';
        if (cve.severity === 'CRITICAL') {
          impact += 'Critical vulnerabilities may allow remote code execution, elevation of privilege, or complete system compromise. ';
        } else if (cve.severity === 'HIGH') {
          impact += 'This vulnerability could lead to privilege escalation, information disclosure, or denial of service. ';
        }
        impact += 'Unpatched systems remain vulnerable to exploitation.';
        recommendation = `Apply the latest Microsoft security updates. Check Windows Update or Microsoft Update Catalog for available patches.`;
        reference = `https://msrc.microsoft.com/update-guide/vulnerability/${cve.id}`;
        tags = ['microsoft', 'windows', cve.severity?.toLowerCase() || 'medium'];
        break;

      case 'CIRCL':
        title = `${cve.id} - Security Vulnerability`;
        impact = `This vulnerability has been assigned a ${cve.severity || 'MEDIUM'} severity rating. `;
        if (cve.score) {
          impact += `With a CVSS score of ${cve.score}, `;
          if (cve.score >= 7.0) {
            impact += 'this represents a significant security risk that should be prioritized for remediation. ';
          } else {
            impact += 'this vulnerability should be addressed as part of regular security maintenance. ';
          }
        }
        impact += 'Exploitation could lead to unauthorized access or system compromise.';
        recommendation = `Review the CIRCL advisory and apply recommended mitigations or patches.`;
        if (cve.references && cve.references.length > 0) {
          reference = cve.references[0].url;
        }
        tags = ['circl', cve.severity?.toLowerCase() || 'medium'];
        break;

      default:
        impact = `This ${cve.severity || 'MEDIUM'} severity vulnerability could potentially impact system security. `;
        impact += 'The specific impact depends on the nature of the vulnerability and the affected systems.';
        recommendation = `Review and remediate the vulnerability according to vendor guidance.`;
        tags = [cve.source?.toLowerCase() || 'cve', cve.severity?.toLowerCase() || 'medium'];
    }

    // Add affected products to tags
    if (cve.affectedProducts && cve.affectedProducts.length > 0) {
      cve.affectedProducts.slice(0, 3).forEach(product => {
        const productTag = product.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 20);
        if (productTag) tags.push(productTag);
      });
    }

    return {
      title,
      severity: cve.severity?.toUpperCase() || 'MEDIUM',
      reference,
      description,
      impact,
      recommendation,
      tags: tags.join(', ')
    };
  };

  // Handle opening finding modal with CVE data
  const openFindingModalWithCVE = (cve) => {
    const findingData = convertCVEToFinding(cve);
    setCveToConvert(findingData);
    setFindingModalOpen(true);
  };

  // Handle saving finding
  const handleSaveFinding = async (findingData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(findingData)
      });

      if (response.ok) {
        // Mark as added using the original CVE data
        const cveId = findingData.reference?.split('/').pop() || findingData.title.split(' - ')[0];
        setAddedToLibrary(prev => ({ ...prev, [cveId]: true }));
        setFindingModalOpen(false);
        setCveToConvert(null);
      }
    } catch (error) {
      console.error('Error saving finding:', error);
    }
  };

  // Fetch CVE data from selected source
  const fetchCVEData = async () => {
    setFeedLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/cve/feeds/${selectedFeed}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCveData(result.data || []);
        calculateStats(result.data || []);
      } else {
        console.error(`Error fetching CVE data from ${selectedFeed}: ${response.status}`);
        setCveData([]);
      }
    } catch (error) {
      console.error(`Error fetching CVE data from ${selectedFeed}:`, error);
      setCveData([]);
    } finally {
      setFeedLoading(false);
    }
  };


  // Fetch security news
  const fetchSecurityNews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/news/security`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setNewsData(result.data || []);
        
        if (result.note) {
          console.log('News feed note:', result.note);
        }
      } else {
        console.error('Error fetching security news:', response.status);
        // Fall back to mock data if API fails
        setNewsData([
          {
            id: 'fallback-1',
            title: 'API Security News Temporarily Unavailable',
            source: 'System',
            published: new Date().toISOString(),
            url: 'https://apisecurity.io',
            summary: 'Unable to fetch latest security news. Please check your connection and try again.',
            category: 'System'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching security news:', error);
      // Fall back to mock data if request fails
      setNewsData([
        {
          id: 'error-1',
          title: 'Security News Feed Error',
          source: 'System',
          published: new Date().toISOString(),
          url: 'https://apisecurity.io',
          summary: 'Error connecting to news feed. Please try refreshing the page.',
          category: 'Error'
        }
      ]);
    }
  };

  // Calculate statistics and trends
  const calculateStats = (cves) => {
    const today = new Date().toDateString();
    const todayCount = cves.filter(cve => 
      new Date(cve.published).toDateString() === today
    ).length;

    const criticalCount = cves.filter(cve => 
      cve.severity === 'CRITICAL' || cve.score >= 9.0
    ).length;

    // Extract trending technologies
    const techCount = {};
    cves.forEach(cve => {
      cve.affectedProducts.forEach(product => {
        const tech = product.split(' ')[0];
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });

    const trending = Object.entries(techCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tech, count]) => ({ tech, count }));

    setStats({
      totalCVEs: cves.length,
      criticalCVEs: criticalCount,
      todayCVEs: todayCount,
      trendingTech: trending
    });
  };


  useEffect(() => {
    fetchCVEData();

    // Set up auto-refresh for CVE data only
    const interval = setInterval(() => {
      fetchCVEData();
    }, refreshInterval);

    // Set up clock update
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, [refreshInterval, selectedFeed]);

  // Separate useEffect for news feed - only runs once on mount
  useEffect(() => {
    const loadNews = async () => {
      await fetchSecurityNews();
      setNewsLoading(false);
    };
    
    loadNews();

    // Set up auto-refresh for news (less frequent)
    const newsInterval = setInterval(() => {
      fetchSecurityNews();
    }, 600000); // Refresh news every 10 minutes

    return () => {
      clearInterval(newsInterval);
    };
  }, []); // Empty dependency array - only runs once

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Unknown time';
    
    const seconds = Math.floor((new Date() - parsedDate) / 1000);
    if (seconds < 0) return 'Just now';
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Real-time CVE monitoring and security intelligence
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-2xl font-mono text-gray-700 dark:text-gray-300">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
          </div>
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            {[
              { value: 60000, label: '1m' },
              { value: 300000, label: '5m' },
              { value: 900000, label: '15m' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRefreshInterval(value)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-all
                  ${refreshInterval === value
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldExclamationIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total CVEs (7 days)
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.totalCVEs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Critical CVEs
                  </dt>
                  <dd className="text-lg font-semibold text-red-600">
                    {stats.criticalCVEs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Today's CVEs
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.todayCVEs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Top Affected
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.trendingTech[0]?.tech || 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CVE Feed - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Combined CVE Feed with Tabs */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                  <FireIcon className="h-5 w-5 mr-2 text-red-500" />
                  Latest CVEs
                </h3>
              </div>
              <nav className="-mb-5 flex space-x-8" aria-label="CVE Sources">
                {Object.entries(cveFeeds).map(([key, feed]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFeed(key)}
                    disabled={feedLoading}
                    className={`
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${selectedFeed === key
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {feed.name}
                      {feedLoading && selectedFeed === key && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cveFeeds[selectedFeed]?.description}
              </p>
            </div>
            <div className="relative">
              <div className="max-h-96 overflow-y-auto scroll-smooth">
                {feedLoading ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading vulnerabilities...</p>
                  </div>
                ) : cveData.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <ShieldExclamationIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No vulnerabilities found</p>
                  </div>
                ) : (
                  cveData.map((cve) => (
                    <div
                      key={cve.id}
                      onClick={() => openVulnerabilityModal(cve)}
                      className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {cve.id}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full border ${getSeverityColor(cve.severity)}`}>
                          {cve.severity} ({cve.score})
                        </span>
                        {cve.source && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {cve.source}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {getTimeAgo(cve.published)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {cve.description}
                      </p>
                      {cve.additionalInfo?.requiredAction && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          <strong>Action Required:</strong> {cve.additionalInfo.requiredAction}
                        </p>
                      )}
                      {cve.additionalInfo?.dueDate && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          <strong>Due Date:</strong> {new Date(cve.additionalInfo.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {cve.affectedProducts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cve.affectedProducts.map((product, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {product}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {addedToLibrary[cve.id] ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening vulnerability modal
                            openFindingModalWithCVE(cve);
                          }}
                          className="text-indigo-600 hover:text-indigo-500"
                          title="Add to Finding Library"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                  ))
                )}
              </div>
              {/* Scroll indicator - only show if there are multiple CVEs */}
              {cveData.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
              )}
            </div>
          </div>

          {/* Trending Analysis */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Trending Vulnerabilities
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                {stats.trendingTech.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.tech}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(item.count / stats.trendingTech[0].count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security News - Takes up 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg relative">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center">
                  <NewspaperIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Security News
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newsData.length} articles
                </span>
              </h3>
            </div>
            <div className="relative">
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 scroll-smooth">
                {newsLoading ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading security news...</p>
                  </div>
                ) : newsData.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <NewspaperIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No security news available</p>
                  </div>
                ) : (
                  newsData.map((news) => (
                    <a
                      key={news.id}
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400">
                            {news.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {news.source} • {getTimeAgo(news.published)}
                            </p>
                            {news.category && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 rounded-md">
                                {news.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {news.summary}
                          </p>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0" />
                      </div>
                    </a>
                  ))
                )}
              </div>
              {/* Scroll indicator - only show if there are multiple articles */}
              {newsData.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/reports/new')}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span>Create New Report</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/findings')}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span>Browse Finding Library</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/customers')}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span>Manage Customers</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Details Modal */}
      <VulnerabilityModal
        vulnerability={selectedVulnerability}
        isOpen={modalOpen}
        onClose={closeVulnerabilityModal}
      />

      {/* New Finding Modal */}
      <NewFindingModal
        isOpen={findingModalOpen}
        onClose={() => {
          setFindingModalOpen(false);
          setCveToConvert(null);
        }}
        onSave={handleSaveFinding}
        initialData={cveToConvert}
      />
    </div>
  );
};

export default Dashboard;