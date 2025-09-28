import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import OnlineChannelAvatar from "../components/OnlineChannelAvatar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatContainer = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        // expose client globally so other components (e.g., FriendsList) can access presence
        if (typeof window !== "undefined") {
          window.streamClient = client;
          try {
            window.dispatchEvent(new Event("stream-client-ready"));
          } catch (e) {}
        }

        setChatClient(client);

        if (targetUserId) {
          const channelId = [authUser._id, targetUserId].sort().join("-");
          const currChannel = client.channel("messaging", channelId, {
            members: [authUser._id, targetUserId],
          });
          await currChannel.watch();
          setChannel(currChannel);
        } else {
          setChannel(null);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  // case 1: no chat selected
  if (!targetUserId) {
    return (
      <div className="flex h-full items-center justify-center text-white text-lg">
        Select a chat to start messaging
      </div>
    );
  }

  // case 2: chat loading
  if (loading || !chatClient || !channel) return <ChatLoader />;

  // case 3: chat ready
  return (
    <div className="h-full">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader Avatar={OnlineChannelAvatar} />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatContainer;
