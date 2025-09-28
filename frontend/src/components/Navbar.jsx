import { Link, useLocation } from "react-router";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../lib/api";

const Navbar = () => {
  const { logoutMutation } = useLogout();
  const location = useLocation();
  const onNotificationsPage = location?.pathname?.startsWith("/notifications");

  // Fetch notifications for badge counter (server-side persisted)
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: onNotificationsPage ? false : 5000,
    refetchOnWindowFocus: false,
    staleTime: 2000,
  });

  const totalNotifications = notificationsData?.unreadCount || 0;

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          <div className="pl-5 lg:hidden md:block">
            <Link to="/" className=" flex items-center gap-2.5">
              <ShipWheelIcon className="size-9 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                DevLink
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <div className="indicator">
                {totalNotifications > 0 && (
                  <span className="indicator-item badge badge-primary text-xs">
                    {totalNotifications}
                  </span>
                )}
                <button className="btn btn-ghost btn-circle">
                  <BellIcon className=" h-6 w-6 text-base-content opacity-70" />
                </button>
              </div>
            </Link>
          </div>

          <ThemeSelector />

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
