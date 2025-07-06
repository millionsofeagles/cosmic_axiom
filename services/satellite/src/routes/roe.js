import { Router } from 'express';
import axios from 'axios';
import { authenticateRequest } from '../middleware/authenticateRequest.js';

const router = Router();
const SINGULARITY_URL = process.env.SINGULARITY_URL;
const FORGE_URL = process.env.FORGE_URL;

// GET /roe - Get all RoE documents enriched with engagement data
router.get('/', authenticateRequest, async (req, res) => {
    try {
        console.log('GET /roe - URLs:', { SINGULARITY_URL, FORGE_URL });
        
        // 1. Fetch RoE documents from Singularity
        console.log('Fetching RoE documents from Singularity...');
        let roes;
        try {
            const roesRes = await axios.get(`${SINGULARITY_URL}/roe`, {
                headers: { Authorization: req.headers.authorization },
            });
            roes = roesRes.data;
            console.log(`Got ${roes.length} RoE documents from Singularity`);
        } catch (err) {
            console.error('Failed to fetch from Singularity:', err.message);
            throw err;
        }

        // 2. Fetch engagements from Forge
        console.log('Fetching engagements from Forge...');
        let engagements;
        try {
            const engagementsRes = await axios.get(`${FORGE_URL}/engagement`, {
                headers: { Authorization: req.headers.authorization },
            });
            engagements = engagementsRes.data;
            console.log(`Got ${engagements.length} engagements from Forge`);
        } catch (err) {
            console.error('Failed to fetch from Forge:', err.message);
            throw err;
        }

        // 3. Map engagementId → engagement details
        const engagementMap = {};
        for (const eng of engagements) {
            engagementMap[eng.id] = eng;
        }

        // 4. Enrich each RoE document
        const enriched = roes.map((roe) => ({
            ...roe,
            engagement: engagementMap[roe.engagementId] || null,
        }));

        res.json(enriched);
    } catch (err) {
        console.error('GET /roe failed:', err.message);
        console.error('Full error:', err.response?.data || err);
        res.status(500).json({ error: 'Failed to fetch enriched RoE documents' });
    }
});

// GET /roe/engagement/:engagementId - Get RoE documents for specific engagement
router.get('/engagement/:engagementId', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/roe/engagement/${req.params.engagementId}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching engagement RoE documents:', error.message);
        res.status(500).json({ error: 'Failed to fetch engagement RoE documents' });
    }
});

// GET /roe/:id - Get specific RoE document
router.get('/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/roe/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching RoE document:', error.message);
        res.status(500).json({ error: 'Failed to fetch RoE document' });
    }
});

// POST /roe - Create new RoE document
router.post('/', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${SINGULARITY_URL}/roe`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating RoE document:', error.message);
        res.status(500).json({ error: 'Failed to create RoE document' });
    }
});

// PUT /roe/:id - Update RoE document
router.put('/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/roe/${req.params.id}`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error updating RoE document:', error.message);
        res.status(500).json({ error: 'Failed to update RoE document' });
    }
});

// DELETE /roe/:id - Delete RoE document
router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${SINGULARITY_URL}/roe/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting RoE document:', error.message);
        res.status(500).json({ error: 'Failed to delete RoE document' });
    }
});

// POST /roe/:id/sections - Add section to RoE document
router.post('/:id/sections', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${SINGULARITY_URL}/roe/${req.params.id}/sections`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error adding RoE section:', error.message);
        res.status(500).json({ error: 'Failed to add RoE section' });
    }
});

// PUT /roe/:id/sections/:sectionId - Update RoE section
router.put('/:id/sections/:sectionId', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/roe/${req.params.id}/sections/${req.params.sectionId}`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error updating RoE section:', error.message);
        res.status(500).json({ error: 'Failed to update RoE section' });
    }
});

// DELETE /roe/:id/sections/:sectionId - Delete RoE section
router.delete('/:id/sections/:sectionId', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${SINGULARITY_URL}/roe/${req.params.id}/sections/${req.params.sectionId}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting RoE section:', error.message);
        res.status(500).json({ error: 'Failed to delete RoE section' });
    }
});

// PUT /roe/:id/sections/reorder - Reorder RoE sections
router.put('/:id/sections/reorder', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/roe/${req.params.id}/sections/reorder`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error reordering RoE sections:', error.message);
        res.status(500).json({ error: 'Failed to reorder RoE sections' });
    }
});

// GET /roe/section-templates - Get all section templates
router.get('/section-templates', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/roe/section-templates`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching section templates:', error.message);
        res.status(500).json({ error: 'Failed to fetch section templates' });
    }
});

// GET /roe/section-templates/:sectionType - Get template for specific section type
router.get('/section-templates/:sectionType', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/roe/section-templates/${req.params.sectionType}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching section template:', error.message);
        if (error.response?.status === 404) {
            res.status(404).json({ error: 'Section template not found' });
        } else {
            res.status(500).json({ error: 'Failed to fetch section template' });
        }
    }
});

// PUT /roe/section-templates/:sectionType - Update template for specific section type
router.put('/section-templates/:sectionType', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/roe/section-templates/${req.params.sectionType}`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error updating section template:', error.message);
        res.status(500).json({ error: 'Failed to update section template' });
    }
});

// GET /roe/templates/list - Get all RoE templates
router.get('/templates/list', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/roe/templates/list`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching RoE templates:', error.message);
        res.status(500).json({ error: 'Failed to fetch RoE templates' });
    }
});

// POST /roe/from-template - Create RoE from template
router.post('/from-template', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${SINGULARITY_URL}/roe/from-template`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating RoE from template:', error.message);
        res.status(500).json({ error: 'Failed to create RoE from template' });
    }
});

// GET /roe/templates/:id - Get specific RoE template
router.get('/templates/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/roe/templates/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching RoE template:', error.message);
        if (error.response?.status === 404) {
            res.status(404).json({ error: 'Template not found' });
        } else {
            res.status(500).json({ error: 'Failed to fetch RoE template' });
        }
    }
});

// POST /roe/templates - Create new RoE template
router.post('/templates', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${SINGULARITY_URL}/roe/templates`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating RoE template:', error.message);
        res.status(500).json({ error: 'Failed to create RoE template' });
    }
});

// PUT /roe/templates/:id - Update RoE template
router.put('/templates/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/roe/templates/${req.params.id}`, req.body, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization 
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error updating RoE template:', error.message);
        res.status(500).json({ error: 'Failed to update RoE template' });
    }
});

// DELETE /roe/templates/:id - Delete RoE template
router.delete('/templates/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${SINGULARITY_URL}/roe/templates/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting RoE template:', error.message);
        if (error.response?.status === 400) {
            res.status(400).json({ error: error.response.data?.error || 'Bad request' });
        } else {
            res.status(500).json({ error: 'Failed to delete RoE template' });
        }
    }
});

export default router;