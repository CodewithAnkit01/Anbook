import fs from "fs";
import prisma from "../utils/prisma.js";
import cloudinary from "../utils/cloudinary.js";

const MAX_BIO = 200;
const MAX_LOCATION = 100;
const MAX_WEBSITE = 200;

// What the owner sees about themselves
const myProfileSelect = {
  id: true,
  username: true,
  email: true,
  profileImage: true,
  coverImage: true,
  bio: true,
  website: true,
  location: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

// What everyone else sees: no email, no role
const publicProfileSelect = {
  id: true,
  username: true,
  profileImage: true,
  coverImage: true,
  bio: true,
  website: true,
  location: true,
  isVerified: true,
  isBanned: true, // used only to hide banned users, never sent to the client
  createdAt: true,
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: myProfileSelect,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({ success: false, message: "Failed to get profile." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: publicProfileSelect,
    });

    if (!user || user.isBanned) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

     const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
    ]);

     const viewerId = req.user?.id;

    const [isFollowing, isFollowedByThem] = await Promise.all([
      viewerId && viewerId !== user.id
        ? prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
          })
        : null,
      viewerId && viewerId !== user.id
        ? prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: user.id, followingId: viewerId } },
          })
        : null,
    ]);

    const { isBanned: _, ...publicUser } = user;

    res.status(200).json({
      success: true,
      user: {
        ...publicUser,
        followerCount,
        followingCount,
        isFollowing: Boolean(isFollowing),
        isFollowedByThem: Boolean(isFollowedByThem), // true = tyo user le timilai follow gareko chha
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ success: false, message: "Failed to get profile." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, website, location } = req.body;
    const fail = (message) => res.status(400).json({ success: false, message });

    for (const [name, value] of Object.entries({ username, bio, website, location })) {
      if (value !== undefined && typeof value !== "string") {
        return fail(`Invalid ${name}.`);
      }
    }

    // Only fields that were sent are changed
    const data = {};

    if (username !== undefined) {
      const trimmed = username.trim();
      if (trimmed.length < 3) return fail("Username must be at least 3 characters");
      data.username = trimmed;
    }

    if (bio !== undefined) {
      const trimmed = bio.trim();
      if (trimmed.length > MAX_BIO) return fail(`Bio cannot exceed ${MAX_BIO} characters.`);
      data.bio = trimmed || null; // empty text clears the field
    }

    if (location !== undefined) {
      const trimmed = location.trim();
      if (trimmed.length > MAX_LOCATION) {
        return fail(`Location cannot exceed ${MAX_LOCATION} characters.`);
      }
      data.location = trimmed || null;
    }

    if (website !== undefined) {
      const trimmed = website.trim();
      if (trimmed && (trimmed.length > MAX_WEBSITE || !isHttpUrl(trimmed))) {
        return fail("Website must be a valid http:// or https:// link.");
      }
      data.website = trimmed || null;
    }

    if (Object.keys(data).length === 0) return fail("Nothing to update.");

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: myProfileSelect,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    // Unique constraint: someone else has this username (also covers a race)
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Username already exists." });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// Basic version. Step 8 (Search) will revisit this.
export const searchUsers = async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: "insensitive" },
        isBanned: false,
      },
      select: { id: true, username: true, profileImage: true, bio: true },
      take: 10,
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ success: false, message: "Failed to search users." });
  }
};

// Shared by the profile image and cover image endpoints
const saveImage = (field, folder, successMessage) => async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ success: false, message: "Please upload an image." });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { [field]: result.secure_url },
      select: { [field]: true },
    });

    res.status(200).json({
      success: true,
      message: successMessage,
      [field]: user[field],
    });
  } catch (error) {
    console.error(`Update ${field} error:`, error);
    res.status(500).json({ success: false, message: "Failed to upload image." });
  } finally {
    // Delete the temp file whether the upload worked or not
    if (file) fs.promises.unlink(file.path).catch(() => {});
  }
};

export const updateProfileImage = saveImage("profileImage", "anbook/profile", "Profile image updated.");
export const updateCoverImage = saveImage("coverImage", "anbook/cover", "Cover image updated.");