import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ASTRAL_URL = process.env.ASTRAL_URL || 'http://localhost:3001';

// Cache for API keys to avoid repeated calls
const apiKeyCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getApiKey(service) {
  // Check cache first
  const cacheKey = `${service}`;
  const cached = apiKeyCache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  try {
    const response = await axios.post(
      `${ASTRAL_URL}/apikeys/retrieve`,
      {
        service,
        requestingService: 'satellite'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    const data = response.data;
    
    // Cache the result
    apiKeyCache.set(cacheKey, {
      data,
      expiry: Date.now() + CACHE_TTL
    });

    return data;
  } catch (error) {
    console.error(`Failed to retrieve API key for ${service}:`, error.message);
    
    // Return null if no key found
    if (error.response?.status === 404) {
      return null;
    }
    
    // Return null for any error instead of throwing
    return null;
  }
}

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiKeyCache.entries()) {
    if (value.expiry <= now) {
      apiKeyCache.delete(key);
    }
  }
}, 60000); // Clean every minute