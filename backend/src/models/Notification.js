import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // owner/recipient
    type: {
      type: String,
      enum: ["friend_request_received", "friend_request_accepted"],
      required: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the user who triggered the notification
    read: { type: Boolean, default: false },
    // optional linkage if needed later
    friendRequest: { type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
