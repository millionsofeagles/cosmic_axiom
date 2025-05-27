// satalite/src/routes/customers.js
import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const FORGE_URL = process.env.FORGE_URL; // Adjust port as needed

// GET /customers - List all customers
router.get("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${FORGE_URL}/customer`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (err) {
        console.error("Failed to fetch customers:", err.message);
        res.status(500).json({ error: "Failed to retrieve customers" });
    }
});

// POST /customers - Create new customer
router.post("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${FORGE_URL}/customer`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(201).json(response.data);
    } catch (err) {
        console.error("Failed to create customer:", err.message);
        res.status(500).json({ error: "Failed to create customer" });
    }
});

// PUT /customers/:id - Update customer
router.put("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${FORGE_URL}/customer/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (err) {
        console.error("Failed to update customer:", err.message);
        res.status(500).json({ error: "Failed to update customer" });
    }
});

// DELETE /customers/:id - Delete customer
router.delete("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${FORGE_URL}/customer/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (err) {
        console.error("Failed to delete customer:", err.message);
        res.status(500).json({ error: "Failed to delete customer" });
    }
});

export default router;
