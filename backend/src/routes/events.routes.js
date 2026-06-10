import express from "express";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/events.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate); // semua route events butuh login

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;