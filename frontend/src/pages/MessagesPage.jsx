import FriendsList from "../components/FriendsList";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import ChatContainer from "../components/ChatContainer";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  return (
    <div className="flex h-full">
      <div className="w-1/4 bg-black text-white">
        <FriendsList friends={friends} loadingFriends={loadingFriends} />
      </div>
      <div className="w-3/4 ">
        <ChatContainer />
      </div>
    </div>
  );
};

export default FriendsPage;
