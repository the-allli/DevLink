import NoFriendsFound from "../components/NoFriendsFound";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";

const FriendsList = ({ friends, loadingFriends }) => {
  const { authUser } = useAuthUser();
  const [onlineMap, setOnlineMap] = useState({});
  const [unreadMap, setUnreadMap] = useState({});
  const [clientReadyVersion, setClientReadyVersion] = useState(0);

  // Keep a stable list of friend IDs
  const friendIds = useMemo(
    () => friends.map((f) => f._id).filter(Boolean),
    [friends]
  );

  // Listen for when a connected Stream client is available
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

  // Presence map
  useEffect(() => {
    const client = typeof window !== "undefined" ? window.streamClient : null;
    if (!client || !friendIds.length) return;

    let unsub;

    const fetchPresence = async () => {
      try {
        const res = await client.queryUsers(
          { id: { $in: friendIds } },
          undefined,
          { presence: true }
        );
        const map = {};
        res.users.forEach((u) => {
          map[u.id] = !!u.online;
        });
        setOnlineMap(map);
      } catch (e) {
        // ignore
      }
    };

    fetchPresence();

    const handler = (event) => {
      const id = event?.user?.id;
      if (!id) return;
      if (!friendIds.includes(id)) return;
      setOnlineMap((prev) => ({ ...prev, [id]: !!event.user?.online }));
    };

    try {
      unsub = client.on("user.presence.changed", handler);
    } catch (e) {}

    return () => {
      try {
        if (unsub && typeof unsub.unsubscribe === "function")
          unsub.unsubscribe();
      } catch (e) {}
    };
  }, [friendIds, clientReadyVersion]);

  // Unread per-friend map
  useEffect(() => {
    const client = typeof window !== "undefined" ? window.streamClient : null;
    if (!client || !authUser) return;

    let unsub;

    const computeUnreadMap = async () => {
      try {
        const channels = await client.queryChannels(
          { type: "messaging", members: { $in: [authUser._id] } },
          { last_message_at: -1 },
          { state: true, watch: false }
        );
        const map = {};
        channels.forEach((ch) => {
          try {
            const members = Object.keys(ch?.state?.members || {});
            const other = members.find((m) => m !== authUser._id);
            if (!other) return;
            const cnt = ch.countUnread
              ? ch.countUnread()
              : ch?.state?.unread_count ?? 0;
            if (cnt > 0) map[other] = cnt;
          } catch (e) {}
        });
        setUnreadMap(map);
      } catch (e) {
        // ignore
      }
    };

    computeUnreadMap();

    try {
      unsub = client.on((event) => {
        const types = new Set([
          "notification.message_new",
          "message.new",
          "notification.mark_read",
          "message.read",
          "notification.added_to_channel",
          "notification.removed_from_channel",
        ]);
        if (types.has(event.type)) computeUnreadMap();
      });
    } catch (e) {}

    return () => {
      try {
        if (unsub && typeof unsub.unsubscribe === "function")
          unsub.unsubscribe();
      } catch (e) {}
    };
  }, [authUser, clientReadyVersion]);

  return (
    <div className="p-4 h-full">
      <ul className="space-y-2">
        {/* Map through friends data and display each friend */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="">
            {friends.map((friend) => {
              const isOnline =
                onlineMap[friend._id] || friend?.online || friend?.isOnline;
              const unread = unreadMap[friend._id] || 0;
              return (
                <Link
                  className=""
                  to={`/messages/${friend._id}`}
                  key={friend._id}
                >
                  <div
                    className="relative pl-5 pt-2 flex items-center space-x-2"
                    key={friend._id}
                  >
                    <div
                      className={`avatar size-12 ${
                        isOnline ? "avatar-online" : "avatar-offline"
                      }`}
                    >
                      <img src={friend.profilePic} alt={friend.fullName} />
                    </div>
                    <p>{friend.fullName}</p>
                    {unread > 0 && (
                      <span className="badge badge-primary ml-auto">
                        {unread}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ul>
    </div>
  );
};

export default FriendsList;
