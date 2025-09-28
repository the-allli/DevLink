import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const [totalUnread, setTotalUnread] = useState(0);
  const [clientReadyVersion, setClientReadyVersion] = useState(0);

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

  useEffect(() => {
    const client = typeof window !== "undefined" ? window.streamClient : null;
    if (!client || !authUser) return;

    let unsub;
    let intervalId;

    const computeUnread = async () => {
      try {
        // Sum unread across the user's messaging channels
        const channels = await client.queryChannels(
          { type: "messaging", members: { $in: [authUser._id] } },
          { last_message_at: -1 },
          { state: true, watch: true }
        );
        let count = 0;
        channels.forEach((ch) => {
          try {
            const c = ch.countUnread ? ch.countUnread() : (ch?.state?.unread_count ?? 0);
            if (typeof c === "number" && c > 0) count += 1;
          } catch (e) {}
        });
        setTotalUnread(count);
      } catch (e) {
        // ignore
      }
    };

    // Initial compute
    computeUnread();

    // Recompute on relevant Stream events that affect unread counts
    const handler = (event) => {
      const types = new Set([
        "notification.message_new",
        "message.new",
        "notification.mark_read",
        "message.read",
        "notification.added_to_channel",
        "notification.removed_from_channel",
        "notification.invited",
        "notification.invite_accepted",
        "notification.channel_truncated",
      ]);
      if (!event || types.has(event.type)) computeUnread();
    };

    try {
      unsub = client.on(handler);
    } catch (e) {}

    // Fallback: periodic recompute in case events are missed by the client
    intervalId = setInterval(computeUnread, 7000);

    // Also recompute when window gains focus (user comes back to tab)
    const onFocus = () => computeUnread();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onFocus);
    }

    return () => {
      try {
        if (unsub && typeof unsub.unsubscribe === "function") unsub.unsubscribe();
      } catch (e) {}
      if (intervalId) clearInterval(intervalId);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onFocus);
      }
    };
  }, [authUser, clientReadyVersion]);

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            DevLink
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/messages"
          className={`relative btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/messages" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Messages</span>
          {totalUnread > 0 && (
            <span className="badge badge-primary ml-auto">{totalUnread}</span>
          )}
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-online">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
