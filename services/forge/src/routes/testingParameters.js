import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

const router = Router();
const prisma = new PrismaClient();

// GET /testing-parameters/:engagementId - Get testing parameters for an engagement
router.get("/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;

    try {
        const params = await prisma.testingParameters.findUnique({
            where: { engagementId }
        });

        if (!params) {
            return res.status(404).json({ error: "Testing parameters not found" });
        }

        res.json(params);
    } catch (err) {
        console.error(`Failed to get testing parameters for engagement ${engagementId}:`, err.message);
        res.status(500).json({ error: "Failed to fetch testing parameters" });
    }
});

// POST /testing-parameters - Create testing parameters for an engagement
router.post("/", authenticateRequest, async (req, res) => {
    const { engagementId, ...params } = req.body;

    if (!engagementId) {
        return res.status(400).json({ error: "engagementId is required" });
    }

    try {
        const testingParams = await prisma.testingParameters.create({
            data: {
                engagementId,
                ...params
            }
        });

        res.status(201).json(testingParams);
    } catch (err) {
        console.error("Failed to create testing parameters:", err.message);
        if (err.code === 'P2002') {
            res.status(409).json({ error: "Testing parameters already exist for this engagement" });
        } else {
            res.status(500).json({ error: "Failed to create testing parameters" });
        }
    }
});

// PUT /testing-parameters/:engagementId - Update testing parameters
router.put("/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;
    const params = req.body;

    try {
        const testingParams = await prisma.testingParameters.update({
            where: { engagementId },
            data: params
        });

        res.json(testingParams);
    } catch (err) {
        console.error("Failed to update testing parameters:", err.message);
        if (err.code === 'P2025') {
            res.status(404).json({ error: "Testing parameters not found" });
        } else {
            res.status(500).json({ error: "Failed to update testing parameters" });
        }
    }
});

// DELETE /testing-parameters/:engagementId - Delete testing parameters
router.delete("/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;

    try {
        await prisma.testingParameters.delete({
            where: { engagementId }
        });

        res.json({ message: "Testing parameters deleted successfully" });
    } catch (err) {
        console.error("Failed to delete testing parameters:", err.message);
        if (err.code === 'P2025') {
            res.status(404).json({ error: "Testing parameters not found" });
        } else {
            res.status(500).json({ error: "Failed to delete testing parameters" });
        }
    }
});

export default router;