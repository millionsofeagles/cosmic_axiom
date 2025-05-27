// routes/threatintel.js
import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.get("/cves", async (req, res) => {
    try {
        const response = await fetch("https://cve.circl.lu/api/last");
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error fetching CVEs:", err);
        res.status(500).json({ error: "Failed to fetch CVEs" });
    }
});

export default router;

