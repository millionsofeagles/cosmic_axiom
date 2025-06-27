import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const FORGE_URL = process.env.FORGE_URL;

// GET /testing-parameters/:engagementId - Get testing parameters for an engagement
router.get("/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;

    try {
        const response = await axios.get(`${FORGE_URL}/testing-parameters/${engagementId}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (err) {
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            console.error(`Failed to get testing parameters for engagement ${engagementId}:`, err.message);
            res.status(500).json({ error: "Failed to fetch testing parameters" });
        }
    }
});

// POST /testing-parameters - Create testing parameters for an engagement
router.post("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${FORGE_URL}/testing-parameters`, req.body, {
            headers: { 
                Authorization: req.headers.authorization,
                "Content-Type": "application/json"
            },
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            console.error("Failed to create testing parameters:", err.message);
            res.status(500).json({ error: "Failed to create testing parameters" });
        }
    }
});

// PUT /testing-parameters/:engagementId - Update testing parameters
router.put("/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;

    try {
        const response = await axios.put(`${FORGE_URL}/testing-parameters/${engagementId}`, req.body, {
            headers: { 
                Authorization: req.headers.authorization,
                "Content-Type": "application/json"
            },
        });
        res.json(response.data);
    } catch (err) {
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            console.error("Failed to update testing parameters:", err.message);
            res.status(500).json({ error: "Failed to update testing parameters" });
        }
    }
});

// DELETE /testing-parameters/:engagementId - Delete testing parameters
router.delete("/:engagementId", authenticateRequest, async (req, res) => {
    const { engagementId } = req.params;

    try {
        const response = await axios.delete(`${FORGE_URL}/testing-parameters/${engagementId}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (err) {
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            console.error("Failed to delete testing parameters:", err.message);
            res.status(500).json({ error: "Failed to delete testing parameters" });
        }
    }
});

export default router;