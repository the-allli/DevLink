import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Layout = ({ children, showSidebar = false }) => {
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const initClient = async () => {
      if (!authUser || !tokenData?.token || !STREAM_API_KEY) return;

      // If a client is already connected for this user, skip
      const existing = typeof window !== "undefined" ? window.streamClient : null;
      if (existing && existing?.user?.id === authUser._id) {
        return;
      }

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        if (client?.user?.id && client.user.id !== authUser._id) {
          try { await client.disconnectUser(); } catch (_) {}
        }
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
        if (typeof window !== "undefined") {
          window.streamClient = client;
          try { window.dispatchEvent(new Event("stream-client-ready")); } catch (_) {}
        }
      } catch (e) {
        // Silent fail; chat features just won't be available
        console.error("Stream client init failed:", e?.message || e);
      }
    };

    initClient();
    // we intentionally don't clean up; keep client for app lifetime
  }, [authUser, tokenData]);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
