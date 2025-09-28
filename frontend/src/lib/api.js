import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  try {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
  } catch (error) {
    console.log("Error in SignUpUser:", error);
    return null;
  }
};

export const login = async (loginData) => {
  try {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    console.log("Error in LoginUser:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.log("Error in LogoutUser:", error);
    return null;
  }
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/onboarding", userData);
    return response.data;
  } catch (error) {
    console.log("Error in completeOnboarding:", error);
    return null;
  }
};

export async function getUserFriends() {
  try {
    const response = await axiosInstance.get("/users/friends");
    return response.data;
  } catch (error) {
    console.log("Error in getUserFriends:", error);
    return null;
  }
}

export async function getRecommendedUsers() {
  try {
    const response = await axiosInstance.get("/users");
    return response.data;
  } catch (error) {
    console.log("Error in getRecommendedUsers:", error);
    return null;
  }
}

export async function getOutgoingFriendReqs() {
  try {
    const response = await axiosInstance.get("/users/outgoing-friend-requests");
    return response.data;
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs:", error);
    return null;
  }
}

export async function sendFriendRequest(userId) {
  try {
    const response = await axiosInstance.post(
      `/users/friend-request/${userId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error in sendFriendRequest:", error);
    return null;
  }
}

export async function getFriendRequests() {
  try {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
  } catch (error) {
    console.log("Error in getFriendRequests:", error);
    return null;
  }
}

export async function acceptFriendRequest(requestId) {
  try {
    const response = await axiosInstance.put(
      `/users/friend-request/${requestId}/accept`
    );
    return response.data;
  } catch (error) {
    console.log("Error in acceptFriendRequest:", error);
    return null;
  }
}

export async function getStreamToken() {
  try {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
  } catch (error) {
    console.log("Error in getStreamToken:", error);
    return null;
  }
}

// Notifications API (server-side persisted)
export async function getNotifications() {
  try {
    const response = await axiosInstance.get("/notifications");
    return response.data; // { items, unreadCount }
  } catch (error) {
    console.log("Error in getNotifications:", error);
    return { items: [], unreadCount: 0 };
  }
}

export async function markAllNotificationsSeen() {
  try {
    const response = await axiosInstance.put("/notifications/mark-seen");
    return response.data; // { updated }
  } catch (error) {
    console.log("Error in markAllNotificationsSeen:", error);
    return null;
  }
}
