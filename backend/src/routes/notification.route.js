import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getNotifications, markAllAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.put("/mark-seen", markAllAsRead);

export default router;
