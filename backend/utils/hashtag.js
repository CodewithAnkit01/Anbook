import prisma from "../utils/prisma.js";


// =====================================
// EXTRACT HASHTAGS
// =====================================

export const extractHashtags = (text = "") => {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);

  if (!matches) {
    return [];
  }

  const hashtags = matches.map((tag) =>
    tag.slice(1).toLowerCase()
  );

  // Remove duplicates
  return [...new Set(hashtags)];
};


// =====================================
// CREATE / CONNECT HASHTAGS
// =====================================

export const connectHashtags = async (
  postId,
  text
) => {
  const hashtags = extractHashtags(text);

  if (hashtags.length === 0) {
    return;
  }

  for (const name of hashtags) {
    const hashtag =
      await prisma.hashtag.upsert({
        where: {
          name,
        },

        update: {},

        create: {
          name,
        },
      });

    await prisma.postHashtag.create({
      data: {
        postId,
        hashtagId: hashtag.id,
      },
    });
  }
};