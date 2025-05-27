import express from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
import axios from 'axios';
import { getApiKey } from '../utils/apiKeyClient.js';

const router = express.Router();

// Test Microsoft API key
router.get('/microsoft', authenticateRequest, async (req, res) => {
  try {
    const apiKeyData = await getApiKey('microsoft');
    
    if (!apiKeyData || !apiKeyData.key) {
      return res.status(404).json({ 
        error: 'No Microsoft API key configured',
        message: 'Please add a Microsoft API key in System Admin > API Keys'
      });
    }
    
    // Try a simple API call to list available updates using v3 API
    const testUrl = 'https://api.msrc.microsoft.com/cvrf/v3/Updates';
    
    console.log('Testing Microsoft API with URL:', testUrl);
    
    const response = await axios.get(testUrl, {
      headers: {
        'Accept': 'application/json',
        'api-key': apiKeyData.key
      },
      timeout: 10000
    });
    
    // Also test fetching a specific CVRF document if we have updates
    let sampleCvrf = null;
    if (response.data?.value?.length > 0) {
      const latestUpdate = response.data.value[0];
      try {
        const cvrfResponse = await axios.get(
          `https://api.msrc.microsoft.com/cvrf/v3/cvrf/${latestUpdate.ID}`,
          {
            headers: {
              'Accept': 'application/json',
              'api-key': apiKeyData.key
            },
            timeout: 10000
          }
        );
        sampleCvrf = {
          updateId: latestUpdate.ID,
          vulnerabilityCount: cvrfResponse.data?.Vulnerability?.length || 0,
          documentTitle: cvrfResponse.data?.DocumentTitle || 'Unknown'
        };
      } catch (cvrfError) {
        console.error('Error fetching sample CVRF:', cvrfError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Microsoft API key is valid',
      availableUpdates: response.data?.value?.length || 0,
      sampleUpdate: response.data?.value?.[0] || null,
      sampleCvrf: sampleCvrf
    });
    
  } catch (error) {
    console.error('Microsoft API test error:', error.message);
    
    let errorDetails = {
      success: false,
      error: error.message
    };
    
    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      errorDetails.data = error.response.data;
      
      if (error.response.status === 401) {
        errorDetails.message = 'Invalid API key';
      } else if (error.response.status === 403) {
        errorDetails.message = 'API key lacks required permissions';
      }
    }
    
    res.status(error.response?.status || 500).json(errorDetails);
  }
});

export default router;