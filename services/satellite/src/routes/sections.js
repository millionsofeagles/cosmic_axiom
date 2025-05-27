import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const SINGULARITY_URL = process.env.SINGULARITY_URL;

// POST /sections - Create a new section
router.post("/", authenticateRequest, async (req, res) => {
    try {
        console.log("Satellite POST /sections - forwarding to singularity:", req.body);
        const response = await axios.post(`${SINGULARITY_URL}/sections`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating section:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to create section" });
        }
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

// PUT /sections/findings/:id - Update finding data
router.put("/findings/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/sections/findings/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error updating finding:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to update finding" });
        }
    }
});

// DELETE /sections/:id - Delete a section
router.delete("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${SINGULARITY_URL}/sections/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error deleting section:", error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to delete section" });
        }
    }
});

export default router;
