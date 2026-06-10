import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

router.use(authenticate);

// GET all guests (with event relation)
router.get("/", async (req, res) => {
  const { eventId } = req.query;
  try {
    const guests = await prisma.guest.findMany({
      where: {
        ...(eventId && { eventId }),
        event: { userId: req.user.id },
      },
      include: { event: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
    res.json(guests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil guest list." });
  }
});

// ADD guest
router.post("/", async (req, res) => {
  const { name, email, eventId } = req.body;
  if (!name || !eventId) return res.status(400).json({ error: "Nama dan event wajib diisi." });
  try {
    const event = await prisma.event.findFirst({ where: { id: eventId, userId: req.user.id } });
    if (!event) return res.status(404).json({ error: "Event tidak ditemukan." });
    const guest = await prisma.guest.create({
      data: { name, email: email || "", eventId },
      include: { event: { select: { id: true, name: true } } },
    });
    res.status(201).json(guest);
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah guest." });
  }
});

// UPDATE RSVP
router.patch("/:id/rsvp", async (req, res) => {
  const { rsvp } = req.body;
  const valid = ["pending", "confirmed", "declined"];
  if (!valid.includes(rsvp)) return res.status(400).json({ error: "RSVP tidak valid." });
  try {
    const updated = await prisma.guest.update({ where: { id: req.params.id }, data: { rsvp } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal update RSVP." });
  }
});

// DELETE guest
router.delete("/:id", async (req, res) => {
  try {
    await prisma.guest.delete({ where: { id: req.params.id } });
    res.json({ message: "Guest berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus guest." });
  }
});

export default router;