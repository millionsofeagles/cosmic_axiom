import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const FORGE_URL = process.env.FORGE_URL;

// GET /scope/engagement/:engagementId - Get scopes for engagement
router.get("/engagement/:engagementId", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${FORGE_URL}/scope/engagement/${req.params.engagementId}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching scopes:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to fetch scopes" });
        }
    }
});

// POST /scope - Create new scope
router.post("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${FORGE_URL}/scope`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating scope:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to create scope" });
        }
    }
});

// POST /scope/bulk - Bulk create scopes
router.post("/bulk", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${FORGE_URL}/scope/bulk`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error bulk creating scopes:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to bulk create scopes" });
        }
    }
});

// PUT /scope/:id - Update scope
router.put("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${FORGE_URL}/scope/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error updating scope:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to update scope" });
        }
    }
});

// DELETE /scope/:id - Delete scope
router.delete("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${FORGE_URL}/scope/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error deleting scope:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to delete scope" });
        }
    }
});

export default router;