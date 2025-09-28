import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const [items, unreadCount] = await Promise.all([
      Notification.find({ user: userId })
        .populate("actor", "fullName profilePic")
        .sort({ createdAt: -1 })
        .limit(100),
      Notification.countDocuments({ user: userId, read: false }),
    ]);

    res.status(200).json({ items, unreadCount });
  } catch (error) {
    console.error("Error in getNotifications:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    console.error("Error in markAllAsRead:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
