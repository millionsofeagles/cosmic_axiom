import express from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
import axios from 'axios';

const router = express.Router();

// Security News endpoint
router.get('/security', authenticateRequest, async (req, res) => {
  try {
    console.log('Fetching security news from multiple sources');
    
    let allNews = [];
    
    // Try multiple security news sources
    const sources = [
      {
        name: 'The Hacker News',
        url: 'https://feeds.feedburner.com/TheHackersNews',
        source: 'The Hacker News'
      },
      {
        name: 'Krebs on Security',
        url: 'https://krebsonsecurity.com/feed/',
        source: 'Krebs on Security'
      },
      {
        name: 'Threatpost',
        url: 'https://threatpost.com/feed/',
        source: 'Threatpost'
      }
    ];
    
    // Try each source and collect news
    for (const source of sources) {
      try {
        console.log(`Fetching from ${source.name}...`);
        
        const response = await axios.get(source.url, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'User-Agent': 'CosmicAxiom/1.0'
          },
          timeout: 8000
        });
        
        if (response.data) {
          const news = parseRSSFeed(response.data, source.source);
          if (news.length > 0) {
            allNews.push(...news.slice(0, 4)); // Take top 4 from each source
            console.log(`Fetched ${news.length} articles from ${source.name}`);
          }
        }
      } catch (sourceError) {
        console.log(`Failed to fetch from ${source.name}: ${sourceError.message}`);
      }
      
      // Stop if we have enough news
      if (allNews.length >= 10) break;
    }
    
    // Sort by published date and limit to 10
    allNews.sort((a, b) => new Date(b.published) - new Date(a.published));
    allNews = allNews.slice(0, 10);
    
    if (allNews.length > 0) {
      res.json({ data: allNews });
    } else {
      // Return enhanced mock data as fallback
      const mockNews = [
        {
          id: 'api-1',
          title: 'OWASP API Security Top 10 2025 Update',
          source: 'API Security Community',
          published: new Date().toISOString(),
          url: 'https://owasp.org/API-Security/',
          summary: 'The latest update to the OWASP API Security Top 10 includes new threat vectors and updated mitigation strategies for modern API architectures.',
          category: 'Standards'
        },
        {
          id: 'api-2',
          title: 'GraphQL Rate Limiting Best Practices',
          source: 'Security Research',
          published: new Date(Date.now() - 2 * 3600000).toISOString(),
          url: 'https://graphql.org/learn/',
          summary: 'Comprehensive guide to implementing effective rate limiting in GraphQL APIs to prevent abuse and ensure system stability.',
          category: 'Best Practices'
        },
        {
          id: 'api-3',
          title: 'REST API Authentication Vulnerabilities',
          source: 'Vulnerability Research',
          published: new Date(Date.now() - 4 * 3600000).toISOString(),
          url: 'https://portswigger.net/research',
          summary: 'Analysis of common authentication flaws in REST APIs and practical steps to implement secure authentication mechanisms.',
          category: 'Vulnerabilities'
        },
        {
          id: 'api-4',
          title: 'API Gateway Security Configuration Guide',
          source: 'DevSecOps Weekly',
          published: new Date(Date.now() - 6 * 3600000).toISOString(),
          url: 'https://www.nginx.com/resources/',
          summary: 'Essential security configurations for API gateways including WAF rules, rate limiting, and threat detection.',
          category: 'Configuration'
        },
        {
          id: 'api-5',
          title: 'Zero Trust Architecture for APIs',
          source: 'Cloud Security Alliance',
          published: new Date(Date.now() - 8 * 3600000).toISOString(),
          url: 'https://cloudsecurityalliance.org/',
          summary: 'Implementing zero trust principles in API architectures to enhance security posture and reduce attack surface.',
          category: 'Architecture'
        }
      ];
      
      res.json({ 
        data: mockNews,
        note: 'Using curated API security content - external feeds temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Error fetching security news:', error.message);
    
    // Emergency fallback
    res.json({ 
      data: [{
        id: 'error-1',
        title: 'Security News Service Unavailable',
        source: 'System',
        published: new Date().toISOString(),
        url: '#',
        summary: 'Unable to fetch latest security news. Please try again later.',
        category: 'System'
      }],
      error: 'News service temporarily unavailable'
    });
  }
});

// Simple RSS parser function
function parseRSSFeed(xmlData, sourceName = 'Security News') {
  try {
    const news = [];
    
    // Basic regex parsing for RSS items
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/i;
    const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i;
    const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i;
    const categoryRegex = /<category[^>]*><!\[CDATA\[(.*?)\]\]><\/category>|<category[^>]*>(.*?)<\/category>/i;
    
    let match;
    let itemCount = 0;
    
    while ((match = itemRegex.exec(xmlData)) !== null && itemCount < 8) {
      const itemXml = match[1];
      
      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);
      const categoryMatch = categoryRegex.exec(itemXml);
      
      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : 'No title';
      const link = linkMatch ? linkMatch[1].trim() : '#';
      const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : 'No description';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
      const category = categoryMatch ? (categoryMatch[1] || categoryMatch[2] || '').trim() : 'Security';
      
      // Clean up description by removing HTML tags and limiting length
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .substring(0, 250) + (description.length > 250 ? '...' : '');
      
      // Skip if title or description is too short (likely not real content)
      if (title.length < 10 || cleanDescription.length < 20) {
        continue;
      }
      
      news.push({
        id: `${sourceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${itemCount}`,
        title: title,
        source: sourceName,
        published: pubDate,
        url: link,
        summary: cleanDescription,
        category: category
      });
      
      itemCount++;
    }
    
    console.log(`Parsed ${news.length} news items from ${sourceName}`);
    return news;
    
  } catch (parseError) {
    console.error('Error parsing RSS feed:', parseError.message);
    return [];
  }
}

export default router;