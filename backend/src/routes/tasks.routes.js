import express from "express";
import { getTasks, createTask, toggleTask, deleteTask } from "../controllers/tasks.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id/toggle", toggleTask);
router.delete("/:id", deleteTask);

export default router;