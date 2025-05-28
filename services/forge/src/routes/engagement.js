import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

const prisma = new PrismaClient();
const router = Router();

// GET /engagement - List all engagements
router.get("/", authenticateRequest, async (req, res) => {
    try {
        const engagements = await prisma.engagement.findMany({
            include: {
                customer: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(
            engagements.map((e) => ({
                id: e.id,
                name: e.name,
                status: e.status,
                startDate: e.startDate,
                endDate: e.endDate,
                customerId: e.customerId,
                customer: e.customer?.name || "Unknown",
            }))
        );
    } catch (err) {
        console.error("Failed to fetch engagements:", err.message);
        res.status(500).json({ error: "Failed to fetch engagements" });
    }
});

// GET /engagement/:id - Get a specific engagement
router.get("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;

    try {
        const engagement = await prisma.engagement.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!engagement) {
            return res.status(404).json({ error: "Engagement not found" });
        }

        res.json({
            id: engagement.id,
            name: engagement.name,
            status: engagement.status,
            startDate: engagement.startDate,
            endDate: engagement.endDate,
            customerId: engagement.customerId,
            customer: engagement.customer?.name || "Unknown",
        });
    } catch (err) {
        console.error("Failed to fetch engagement:", err.message);
        res.status(500).json({ error: "Failed to fetch engagement" });
    }
});

// POST /engagement - Create a new engagement
router.post("/", authenticateRequest, async (req, res) => {
    const { name, description, customerId, status, startDate, endDate } = req.body;

    if (!name || !customerId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newEngagement = await prisma.engagement.create({
            data: {
                name,
                description,
                customerId,
                status: status || "PLANNED",
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
            include: {
                customer: {
                    select: { id: true, name: true },
                },
            },
        });

        // Return the engagement in the same format as GET
        res.status(201).json({
            id: newEngagement.id,
            name: newEngagement.name,
            status: newEngagement.status,
            startDate: newEngagement.startDate,
            endDate: newEngagement.endDate,
            customerId: newEngagement.customerId,
            customer: newEngagement.customer?.name || "Unknown",
        });
    } catch (err) {
        console.error("Failed to create engagement:", err.message);
        res.status(500).json({ error: "Failed to create engagement" });
    }
});

// PUT /engagement/:id - Update an engagement
router.put("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    const { name, description, customerId, status, startDate, endDate } = req.body;

    try {
        const updatedEngagement = await prisma.engagement.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(customerId !== undefined && { customerId }),
                ...(status !== undefined && { status }),
                ...(startDate !== undefined && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: new Date(endDate) }),
            },
            include: {
                customer: {
                    select: { id: true, name: true },
                },
            },
        });

        // Return the engagement in the same format as GET
        res.json({
            id: updatedEngagement.id,
            name: updatedEngagement.name,
            status: updatedEngagement.status,
            startDate: updatedEngagement.startDate,
            endDate: updatedEngagement.endDate,
            customerId: updatedEngagement.customerId,
            customer: updatedEngagement.customer?.name || "Unknown",
        });
    } catch (err) {
        console.error("Failed to update engagement:", err.message);
        res.status(500).json({ error: "Failed to update engagement" });
    }
});

// DELETE /engagement/:id - Delete an engagement
router.delete("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.engagement.delete({
            where: { id },
        });

        res.json({ message: "Engagement deleted successfully" });
    } catch (err) {
        console.error("Failed to delete engagement:", err.message);
        res.status(500).json({ error: "Failed to delete engagement" });
    }
});

export default router;
