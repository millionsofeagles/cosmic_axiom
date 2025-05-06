import axios from "axios";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

const router = express.Router();
const SINGULARITY_URL = process.env.SINGULARITY_URL;

// POST /sections - Create a new section
router.post("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${SINGULARITY_URL}/sections`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating section:", error.message);
        res.status(500).json({ error: "Failed to create section" });
    }
});

// PUT /sections/:id - Update section data
router.put("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/sections/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error updating section:", error.message);
        res.status(500).json({ error: "Failed to update section" });
    }
});

export default router;
