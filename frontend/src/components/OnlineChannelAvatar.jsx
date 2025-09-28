import React from "react";
import { ChannelAvatar, useChannelStateContext, useChatContext } from "stream-chat-react";

// Custom ChannelAvatar that adds 'avatar-online' when the other member in the channel is online
const OnlineChannelAvatar = (props) => {
  const { user: propUser, className } = props || {};

  // Access channel members and current user from Stream context
  const { members } = useChannelStateContext();
  const { client } = useChatContext();
  const currentUserId = client?.userID || client?.user?.id;

  // Determine which user's avatar we are showing: prefer the provided user prop,
  // otherwise use the "other" member in a 1:1 channel
  let otherUser = propUser;
  if (!otherUser && members) {
    const membersArr = Object.values(members);
    const candidate = membersArr.find((m) => m?.user?.id && m.user.id !== currentUserId);
    otherUser = candidate?.user || otherUser;
  }

  const isOnline = Boolean(otherUser?.online);

  const mergedClassName = [className, isOnline ? "avatar-online" : "avatar-offline"]
    .filter(Boolean)
    .join(" ");

  return <ChannelAvatar {...props} user={otherUser} className={mergedClassName} />;
};

export default OnlineChannelAvatar;
