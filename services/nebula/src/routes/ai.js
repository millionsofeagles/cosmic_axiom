import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
import { generateContent as generateClaudeContent } from '../services/claudeService.js';
import { generateContent as generateOllamaContent } from '../services/ollamaService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Debug logging
console.log('AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('Using:', process.env.AI_PROVIDER === 'ollama' ? 'Ollama' : 'Claude');

// Select the appropriate AI service based on configuration
const generateContent = process.env.AI_PROVIDER === 'ollama' ? generateOllamaContent : generateClaudeContent;

// Helper function to handle section generation
const generateSection = async (req, res, sectionType) => {
    try {
        const { 
            reportData, 
            engagementData, 
            customerData, 
            findingsData,
            scopeData 
        } = req.body;

        console.log(`AI generation requested for ${sectionType}`);
        console.log('Context data received:', {
            hasReport: !!reportData,
            hasEngagement: !!engagementData,
            hasCustomer: !!customerData,
            findingsCount: findingsData?.length || 0,
            scopesCount: scopeData?.length || 0
        });

        // Generate content with section-specific prompt
        const result = await generateContent({
            prompt: '', // Empty prompt, as the section type will determine the content
            sectionType,
            reportData,
            engagementData,
            customerData,
            findingsData,
            scopeData
        });

        res.json({
            success: true,
            sectionType,
            content: result.content,
            metadata: {
                tokensUsed: result.tokensUsed,
                model: result.model,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error(`AI generation error for ${sectionType}:`, error);
        res.status(500).json({ error: `Failed to generate ${sectionType} content` });
    }
};

// POST /generate/executive - Generate Executive Summary
router.post('/generate/executive', authenticateRequest, async (req, res) => {
    await generateSection(req, res, 'executive');
});

// POST /generate/methodology - Generate Methodology section
router.post('/generate/methodology', authenticateRequest, async (req, res) => {
    await generateSection(req, res, 'methodology');
});

// POST /generate/tools - Generate Tools & Techniques section
router.post('/generate/tools', authenticateRequest, async (req, res) => {
    await generateSection(req, res, 'tools');
});

// POST /generate/conclusion - Generate Conclusion section
router.post('/generate/conclusion', authenticateRequest, async (req, res) => {
    await generateSection(req, res, 'conclusion');
});

// Legacy endpoint - kept for backward compatibility
router.post('/generate', authenticateRequest, async (req, res) => {
    try {
        const { 
            prompt, 
            sectionType, 
            reportData, 
            engagementData, 
            customerData, 
            findingsData,
            scopeData 
        } = req.body;

        if (!sectionType) {
            return res.status(400).json({ error: 'Missing required field: sectionType' });
        }

        // Use the section-specific handler
        req.body = { reportData, engagementData, customerData, findingsData, scopeData };
        await generateSection(req, res, sectionType);

    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({ error: 'Failed to generate AI content' });
    }
});

export default router;