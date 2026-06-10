import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);

// Update profile name
router.patch("/profile", authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Nama tidak boleh kosong." });
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui profil." });
  }
});

// Change password
router.patch("/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Semua field wajib diisi." });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password baru minimal 8 karakter." });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Password saat ini salah." });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengubah password." });
  }
});

export default router;