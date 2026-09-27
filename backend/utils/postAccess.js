import prisma from "./prisma.js";

export const canViewPost = async (post, viewerId) => {
  if (post.visibility === "PUBLIC") return true;
  if (!viewerId) return false;
  if (post.userId === viewerId) return true;
  if (post.visibility === "PRIVATE") return false;

  // FOLLOWERS: the viewer must follow the author
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: viewerId, followingId: post.userId },
    },
  });
  return Boolean(follow);
};
// Returns the post only if it exists AND the viewer may see it.
// It returns null in both cases, so a private post's existence is never revealed.
export const getViewablePost = async (postId, viewerId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;
  return (await canViewPost(post, viewerId)) ? post : null;
};