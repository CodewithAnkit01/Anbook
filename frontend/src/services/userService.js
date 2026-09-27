import api from "./api";

// GET /users/:username -> { success, user: { ..., followerCount, followingCount } }
export const fetchProfile = async (username) => {
  const { data } = await api.get(`/users/${encodeURIComponent(username)}`);
  return data;
};

// PUT /users/profile { username?, bio?, website?, location? } -> { success, message, user }
export const updateProfile = async (changes) => {
  const { data } = await api.put("/users/profile", changes);
  return data;
};

const uploadImage = async (path, fieldName, file) => {
  const formData = new FormData();
  formData.append(fieldName, file); // field names must match the backend: profileImage / coverImage
  const { data } = await api.put(path, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60 * 1000,
  });
  return data;
};

// PUT /users/profile/image -> { success, message, profileImage }
export const uploadProfileImage = (file) => uploadImage("/users/profile/image", "profileImage", file);

// PUT /users/cover/image -> { success, message, coverImage }
export const uploadCoverImage = (file) => uploadImage("/users/cover/image", "coverImage", file);