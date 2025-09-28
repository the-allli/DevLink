import { Link } from "react-router";
import { getLanguageFlag, getLanguageIcon } from "../constants/index.jsx";
import { useEffect, useState } from "react";

const FriendCard = ({ friend }) => {
  const [isOnline, setIsOnline] = useState(!!(friend?.online || friend?.isOnline));
  const [clientReadyVersion, setClientReadyVersion] = useState(0);

  // Listen for when ChatContainer exposes the connected Stream client
  useEffect(() => {
    const onReady = () => setClientReadyVersion((v) => v + 1);
    if (typeof window !== "undefined") {
      window.addEventListener("stream-client-ready", onReady);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("stream-client-ready", onReady);
      }
    };
  }, []);

  // Fetch and subscribe to presence for this friend only
  useEffect(() => {
    const client = typeof window !== "undefined" ? window.streamClient : null;
    const userId = friend?._id;
    if (!client || !userId) return;

    let unsub;

    const fetchPresence = async () => {
      try {
        const res = await client.queryUsers({ id: { $eq: userId } }, undefined, { presence: true });
        const u = res?.users?.[0];
        if (u) setIsOnline(!!u.online);
      } catch (e) {
        // ignore errors and keep fallback state
      }
    };

    fetchPresence();

    const handler = (event) => {
      const id = event?.user?.id;
      if (id !== userId) return;
      setIsOnline(!!event.user?.online);
    };

    try {
      unsub = client.on("user.presence.changed", handler);
    } catch (e) {}

    return () => {
      try {
        if (unsub && typeof unsub.unsubscribe === "function") unsub.unsubscribe();
      } catch (e) {}
    };
  }, [friend?._id, clientReadyVersion]);

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`avatar size-12 ${isOnline ? "avatar-online" : "avatar-offline"}`}>
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageIcon(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/messages/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;
