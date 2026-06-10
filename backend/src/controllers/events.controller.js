import prisma from "../prisma.js";

// ─── GET ALL EVENTS ───────────────────────────────────────────────────────────
export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user.id },
      include: {
        tasks: { select: { id: true, done: true } },
        guests: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add computed fields
    const enriched = events.map((e) => ({
      ...e,
      taskCount: e.tasks.length,
      taskDone: e.tasks.filter((t) => t.done).length,
      guestCount: e.guests.length,
      progress: e.tasks.length > 0
        ? Math.round((e.tasks.filter((t) => t.done).length / e.tasks.length) * 100)
        : 0,
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data events." });
  }
};

// ─── GET SINGLE EVENT ─────────────────────────────────────────────────────────
export const getEvent = async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { tasks: true, guests: true },
    });

    if (!event) return res.status(404).json({ error: "Event tidak ditemukan." });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data event." });
  }
};

// ─── CREATE EVENT ─────────────────────────────────────────────────────────────
export const createEvent = async (req, res) => {
  const { name, description, date, budget, status } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: "Nama dan tanggal event wajib diisi." });
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        date: new Date(date),
        budget: parseFloat(budget) || 0,
        status: status || "planned",
        userId: req.user.id,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat event." });
  }
};

// ─── UPDATE EVENT ─────────────────────────────────────────────────────────────
export const updateEvent = async (req, res) => {
  const { name, description, date, budget, budgetUsed, status } = req.body;

  try {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Event tidak ditemukan." });

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(budget !== undefined && { budget: parseFloat(budget) }),
        ...(budgetUsed !== undefined && { budgetUsed: parseFloat(budgetUsed) }),
        ...(status && { status }),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengupdate event." });
  }
};

// ─── DELETE EVENT ─────────────────────────────────────────────────────────────
export const deleteEvent = async (req, res) => {
  try {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Event tidak ditemukan." });

    // Delete related tasks and guests first
    await prisma.task.deleteMany({ where: { eventId: req.params.id } });
    await prisma.guest.deleteMany({ where: { eventId: req.params.id } });
    await prisma.event.delete({ where: { id: req.params.id } });

    res.json({ message: "Event berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus event." });
  }
};