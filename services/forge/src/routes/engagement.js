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
    const { name, customerId, status, startDate, endDate } = req.body;

    if (!name || !customerId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newEngagement = await prisma.engagement.create({
            data: {
                name,
                customerId,
                status: "PLANNED",
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });

        res.status(201).json(newEngagement);
    } catch (err) {
        console.error("Failed to create engagement:", err.message);
        res.status(500).json({ error: "Failed to create engagement" });
    }
});

export default router;
