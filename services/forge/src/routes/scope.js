import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

const router = Router();
const prisma = new PrismaClient();

// GET /scope/engagement/:engagementId - Get all scopes for an engagement
router.get("/engagement/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;

    try {
        const scopes = await prisma.scope.findMany({
            where: { engagementId },
            orderBy: { createdAt: "desc" }
        });

        res.json(scopes);
    } catch (err) {
        console.error(`Failed to get scopes for engagement ${engagementId}:`, err.message);
        res.status(500).json({ error: "Failed to fetch scopes" });
    }
});

// POST /scope - Create a new scope entry
router.post("/", authenticateRequest, async (req, res) => {
    const { engagementId, address, description, inScope, notes } = req.body;

    if (!engagementId || !address) {
        return res.status(400).json({ error: "engagementId and address are required" });
    }

    try {
        const scope = await prisma.scope.create({
            data: {
                engagementId,
                address,
                description,
                inScope: inScope !== undefined ? inScope : true,
                notes
            }
        });

        res.status(201).json(scope);
    } catch (err) {
        console.error("Failed to create scope:", err.message);
        res.status(500).json({ error: "Failed to create scope" });
    }
});

// POST /scope/bulk - Bulk create scope entries from text input
router.post("/bulk", authenticateRequest, async (req, res) => {
    const { engagementId, addresses, inScope } = req.body;

    if (!engagementId || !addresses || !Array.isArray(addresses)) {
        return res.status(400).json({ error: "engagementId and addresses array are required" });
    }

    try {
        const scopeEntries = addresses
            .filter(address => address.trim()) // Remove empty lines
            .map(address => ({
                engagementId,
                address: address.trim(),
                inScope: inScope !== undefined ? inScope : true
            }));

        if (scopeEntries.length === 0) {
            return res.status(400).json({ error: "No valid addresses provided" });
        }

        const result = await prisma.scope.createMany({
            data: scopeEntries,
            skipDuplicates: true // Skip if address already exists for this engagement
        });

        res.status(201).json({ 
            message: `Successfully created ${result.count} scope entries`,
            count: result.count 
        });
    } catch (err) {
        console.error("Failed to bulk create scopes:", err.message);
        res.status(500).json({ error: "Failed to bulk create scopes" });
    }
});

// PUT /scope/:id - Update a scope entry
router.put("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    const { address, description, inScope, notes } = req.body;

    try {
        const scope = await prisma.scope.update({
            where: { id },
            data: {
                address,
                description,
                inScope,
                notes
            }
        });

        res.json(scope);
    } catch (err) {
        console.error("Failed to update scope:", err.message);
        res.status(500).json({ error: "Failed to update scope" });
    }
});

// DELETE /scope/:id - Delete a scope entry
router.delete("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.scope.delete({
            where: { id }
        });

        res.json({ message: "Scope deleted successfully" });
    } catch (err) {
        console.error("Failed to delete scope:", err.message);
        res.status(500).json({ error: "Failed to delete scope" });
    }
});

export default router;