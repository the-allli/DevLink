import NoFriendsFound from "../components/NoFriendsFound";
import { Link } from "react-router";

const FriendsList = ({ friends, loadingFriends }) => {
  return (
    <div className="p-4">
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
            {friends.map((friend) => (
              <Link
                className=""
                to={`/messages/${friend._id}`}
                key={friend._id}
              >
                <div
                  className="relative pl-5 pt-2 flex items-center space-x-2"
                  key={friend._id}
                >
                  <div className="avatar size-12">
                    <img src={friend.profilePic} alt={friend.fullName} />
                  </div>
                  <p>{friend.fullName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ul>
    </div>
  );
};

export default FriendsList;
