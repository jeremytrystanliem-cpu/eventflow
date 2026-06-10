import prisma from "../prisma.js";

// ─── GET TASKS (by event or all) ──────────────────────────────────────────────
export const getTasks = async (req, res) => {
  const { eventId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(eventId && { eventId }),
        event: { userId: req.user.id },
      },
      include: { event: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil tasks." });
  }
};

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
export const createTask = async (req, res) => {
  const { title, priority, dueDate, eventId } = req.body;

  if (!title || !eventId) {
    return res.status(400).json({ error: "Judul dan event wajib diisi." });
  }

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: req.user.id },
    });
    if (!event) return res.status(404).json({ error: "Event tidak ditemukan." });

    const task = await prisma.task.create({
      data: {
        title,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        eventId,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Gagal membuat task." });
  }
};

// ─── TOGGLE TASK DONE ─────────────────────────────────────────────────────────
export const toggleTask = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, event: { userId: req.user.id } },
    });
    if (!task) return res.status(404).json({ error: "Task tidak ditemukan." });

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { done: !task.done },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengupdate task." });
  }
};

// ─── DELETE TASK ──────────────────────────────────────────────────────────────
export const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, event: { userId: req.user.id } },
    });
    if (!task) return res.status(404).json({ error: "Task tidak ditemukan." });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: "Task berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus task." });
  }
};