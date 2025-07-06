import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '../middleware/authenticateRequest.js';

const router = Router();
const prisma = new PrismaClient();

// Get all RoE documents (across all engagements)
router.get('/', authenticateRequest, async (req, res) => {
    try {
        const roes = await prisma.rulesOfEngagement.findMany({
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json(roes);
    } catch (error) {
        console.error('Error fetching all RoE documents:', error);
        res.status(500).json({ error: 'Failed to fetch RoE documents' });
    }
});

// Get all RoE documents for an engagement
router.get('/engagement/:engagementId', authenticateRequest, async (req, res) => {
    try {
        const { engagementId } = req.params;
        
        const roes = await prisma.rulesOfEngagement.findMany({
            where: { engagementId },
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json(roes);
    } catch (error) {
        console.error('Error fetching RoE documents:', error);
        res.status(500).json({ error: 'Failed to fetch RoE documents' });
    }
});

// GET /section-templates - Get all section templates
router.get('/section-templates', authenticateRequest, async (req, res) => {
    try {
        const templates = await prisma.roeSectionTemplate.findMany({
            orderBy: { sectionType: 'asc' }
        });
        
        res.json(templates);
    } catch (error) {
        console.error('Error fetching section templates:', error);
        res.status(500).json({ error: 'Failed to fetch section templates' });
    }
});

// GET /section-templates/:sectionType - Get template for specific section type
router.get('/section-templates/:sectionType', authenticateRequest, async (req, res) => {
    try {
        const { sectionType } = req.params;
        
        const template = await prisma.roeSectionTemplate.findUnique({
            where: { sectionType }
        });
        
        if (!template) {
            return res.status(404).json({ error: 'Section template not found' });
        }
        
        res.json(template);
    } catch (error) {
        console.error('Error fetching section template:', error);
        res.status(500).json({ error: 'Failed to fetch section template' });
    }
});

// PUT /section-templates/:sectionType - Update template for specific section type
router.put('/section-templates/:sectionType', authenticateRequest, async (req, res) => {
    try {
        const { sectionType } = req.params;
        const { title, content } = req.body;
        
        console.log('Updating section template:', { sectionType, title, content });
        
        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ 
                error: 'Both title and content are required',
                received: { title, content }
            });
        }
        
        const template = await prisma.roeSectionTemplate.upsert({
            where: { sectionType },
            update: {
                title,
                content
            },
            create: {
                sectionType,
                title,
                content
            }
        });
        
        res.json(template);
    } catch (error) {
        console.error('Error updating section template:', error);
        res.status(500).json({ error: 'Failed to update section template' });
    }
});

// Get a specific RoE document
router.get('/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        
        const roe = await prisma.rulesOfEngagement.findUnique({
            where: { id },
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        
        if (!roe) {
            return res.status(404).json({ error: 'RoE document not found' });
        }
        
        res.json(roe);
    } catch (error) {
        console.error('Error fetching RoE document:', error);
        res.status(500).json({ error: 'Failed to fetch RoE document' });
    }
});

// Create a new RoE document
router.post('/', authenticateRequest, async (req, res) => {
    try {
        const {
            engagementId,
            title,
            version,
            classification,
            authorizedBy,
            authorizedTitle,
            authorizedDate,
            testingWindow,
            emergencyContact,
            sections
        } = req.body;
        
        const roe = await prisma.rulesOfEngagement.create({
            data: {
                engagementId,
                title,
                version: version || '1.0',
                classification: classification || 'CONFIDENTIAL',
                authorizedBy,
                authorizedTitle,
                authorizedDate: authorizedDate ? new Date(authorizedDate) : null,
                testingWindow,
                emergencyContact,
                sections: {
                    create: sections?.map((section, index) => ({
                        type: section.type,
                        position: index,
                        title: section.title,
                        content: section.content,
                        data: section.data
                    })) || []
                }
            },
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        
        res.status(201).json(roe);
    } catch (error) {
        console.error('Error creating RoE document:', error);
        res.status(500).json({ error: 'Failed to create RoE document' });
    }
});

// Update an RoE document
router.put('/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            version,
            status,
            classification,
            authorizedBy,
            authorizedTitle,
            authorizedDate,
            approvedAt,
            expiresAt,
            testingWindow,
            emergencyContact
        } = req.body;
        
        const roe = await prisma.rulesOfEngagement.update({
            where: { id },
            data: {
                title,
                version,
                status,
                classification,
                authorizedBy,
                authorizedTitle,
                authorizedDate: authorizedDate ? new Date(authorizedDate) : undefined,
                approvedAt: approvedAt ? new Date(approvedAt) : undefined,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                testingWindow,
                emergencyContact
            },
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        
        res.json(roe);
    } catch (error) {
        console.error('Error updating RoE document:', error);
        res.status(500).json({ error: 'Failed to update RoE document' });
    }
});

// Delete an RoE document
router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.rulesOfEngagement.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting RoE document:', error);
        res.status(500).json({ error: 'Failed to delete RoE document' });
    }
});

// Add a section to an RoE document
router.post('/:id/sections', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, content, data, position } = req.body;
        
        // Get the highest position if not provided
        let finalPosition = position;
        if (finalPosition === undefined) {
            const lastSection = await prisma.roeSection.findFirst({
                where: { roeId: id },
                orderBy: { position: 'desc' }
            });
            finalPosition = (lastSection?.position || -1) + 1;
        }
        
        const section = await prisma.roeSection.create({
            data: {
                roeId: id,
                type,
                title,
                content,
                data,
                position: finalPosition
            }
        });
        
        res.status(201).json(section);
    } catch (error) {
        console.error('Error adding section:', error);
        res.status(500).json({ error: 'Failed to add section' });
    }
});

// Update a section
router.put('/:id/sections/:sectionId', authenticateRequest, async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { type, title, content, data, position } = req.body;
        
        const section = await prisma.roeSection.update({
            where: { id: sectionId },
            data: {
                type,
                title,
                content,
                data,
                position
            }
        });
        
        res.json(section);
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: 'Failed to update section' });
    }
});

// Delete a section
router.delete('/:id/sections/:sectionId', authenticateRequest, async (req, res) => {
    try {
        const { sectionId } = req.params;
        
        await prisma.roeSection.delete({
            where: { id: sectionId }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ error: 'Failed to delete section' });
    }
});

// Reorder sections
router.put('/:id/sections/reorder', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { sectionIds } = req.body; // Array of section IDs in new order
        
        const updates = sectionIds.map((sectionId, index) => 
            prisma.roeSection.update({
                where: { id: sectionId },
                data: { position: index }
            })
        );
        
        await prisma.$transaction(updates);
        
        const updatedRoe = await prisma.rulesOfEngagement.findUnique({
            where: { id },
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        
        res.json(updatedRoe);
    } catch (error) {
        console.error('Error reordering sections:', error);
        res.status(500).json({ error: 'Failed to reorder sections' });
    }
});

// Get RoE templates
router.get('/templates/list', authenticateRequest, async (req, res) => {
    try {
        const templates = await prisma.roeTemplate.findMany({
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' }
            ]
        });
        
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Get specific RoE template
router.get('/templates/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        
        const template = await prisma.roeTemplate.findUnique({
            where: { id }
        });
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Create new RoE template
router.post('/templates', authenticateRequest, async (req, res) => {
    try {
        const { name, description, isDefault, sections } = req.body;
        
        // If this is being set as default, unset other defaults
        if (isDefault) {
            await prisma.roeTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }
        
        const template = await prisma.roeTemplate.create({
            data: {
                name,
                description,
                isDefault: isDefault || false,
                sections: sections || []
            }
        });
        
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Update RoE template
router.put('/templates/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isDefault, sections } = req.body;
        
        // If this is being set as default, unset other defaults
        if (isDefault) {
            await prisma.roeTemplate.updateMany({
                where: { 
                    isDefault: true,
                    id: { not: id }
                },
                data: { isDefault: false }
            });
        }
        
        const template = await prisma.roeTemplate.update({
            where: { id },
            data: {
                name,
                description,
                isDefault,
                sections
            }
        });
        
        res.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete RoE template
router.delete('/templates/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        
        const template = await prisma.roeTemplate.findUnique({
            where: { id }
        });
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        // Don't allow deleting the default template if it's the only one
        if (template.isDefault) {
            const totalTemplates = await prisma.roeTemplate.count();
            if (totalTemplates === 1) {
                return res.status(400).json({ error: 'Cannot delete the only template' });
            }
            
            // If there are other templates, make the first non-default one the new default
            await prisma.roeTemplate.updateMany({
                where: { 
                    id: { not: id }
                },
                data: { isDefault: true }
            });
        }
        
        await prisma.roeTemplate.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// Create RoE from template
router.post('/from-template', authenticateRequest, async (req, res) => {
    try {
        const { templateId, engagementId, title } = req.body;
        
        const template = await prisma.roeTemplate.findUnique({
            where: { id: templateId }
        });
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        const sections = template.sections;
        
        const roe = await prisma.rulesOfEngagement.create({
            data: {
                engagementId,
                title,
                version: '1.0',
                status: 'DRAFT',
                classification: 'CONFIDENTIAL',
                sections: {
                    create: sections.map((section, index) => ({
                        type: section.type,
                        position: index,
                        title: section.title,
                        content: section.content,
                        data: section.data || {}
                    }))
                }
            },
            include: {
                sections: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        
        res.status(201).json(roe);
    } catch (error) {
        console.error('Error creating RoE from template:', error);
        res.status(500).json({ error: 'Failed to create RoE from template' });
    }
});


export default router;