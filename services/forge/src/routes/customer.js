import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
dotenv.config();

const router = Router();
const prisma = new PrismaClient();

// GET /customers - List all customers
router.get("/", authenticateRequest, async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            include: { contacts: true },
        });
        res.json(customers);
    } catch (err) {
        console.error("Error listing customers:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /customers/:id - Get specific customer
router.get("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: { contacts: true },
        });
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json(customer);
    } catch (err) {
        console.error("Error fetching customer:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /customers - Create a customer
router.post("/", authenticateRequest, async (req, res) => {
    const { name, industry, contacts = [] } = req.body;
    try {
        const customer = await prisma.customer.create({
            data: {
                name,
                industry,
                contacts: {
                    create: contacts,
                },
            },
            include: { contacts: true },
        });
        res.status(201).json(customer);
    } catch (err) {
        console.error("Error creating customer:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /customers/update - Update a customer
router.post("/update", authenticateRequest, async (req, res) => {
    const { id, name, industry } = req.body;
    try {
        const updated = await prisma.customer.update({
            where: { id },
            data: { name, industry },
        });
        res.json(updated);
    } catch (err) {
        console.error("Error updating customer:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /customers/:id - Delete customer
router.delete("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.customer.delete({ where: { id } });
        res.json({ message: "Customer deleted" });
    } catch (err) {
        console.error("Error deleting customer:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /customers/:customerId/contacts - Add a contact
router.post("/:customerId/contacts", authenticateRequest, async (req, res) => {
    const { customerId } = req.params;
    const { name, email, phone, isPrimary = false } = req.body;
    try {
        const contact = await prisma.contact.create({
            data: { customerId, name, email, phone, isPrimary },
        });
        res.status(201).json(contact);
    } catch (err) {
        console.error("Error creating contact:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /contacts/update - Update a contact
router.post("/contacts/update", authenticateRequest, async (req, res) => {
    const { id, name, email, phone } = req.body;
    try {
        const contact = await prisma.contact.update({
            where: { id },
            data: { name, email, phone },
        });
        res.json(contact);
    } catch (err) {
        console.error("Error updating contact:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /contacts/set-primary - Set a contact as primary
router.post("/contacts/set-primary", authenticateRequest, async (req, res) => {
    const { contactId } = req.body;
    try {
        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact) return res.status(404).json({ error: "Contact not found" });

        // Set all others to false
        await prisma.contact.updateMany({
            where: { customerId: contact.customerId },
            data: { isPrimary: false },
        });

        // Set this one to true
        const updated = await prisma.contact.update({
            where: { id: contactId },
            data: { isPrimary: true },
        });

        res.json(updated);
    } catch (err) {
        console.error("Error setting primary contact:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /contacts/:id - Delete a contact
router.delete("/contacts/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.contact.delete({ where: { id } });
        res.json({ message: "Contact deleted" });
    } catch (err) {
        console.error("Error deleting contact:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
