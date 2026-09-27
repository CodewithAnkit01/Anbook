// Builds the sentence and the link for one notification, based on its type.
export const describeNotification = (notification) => {
  const name = notification.sender?.username ?? "Someone";
  const profileLink = `/profile/${encodeURIComponent(name)}`;

  switch (notification.type) {
    case "LIKE":
      return { text: `${name} liked your post.`, link: notification.postId ? `/post/${notification.postId}` : profileLink };
    case "COMMENT":
      return { text: `${name} commented on your post.`, link: notification.postId ? `/post/${notification.postId}` : profileLink };
    case "REPLY":
      return { text: `${name} replied to your comment.`, link: notification.postId ? `/post/${notification.postId}` : profileLink };
    case "FOLLOW":
      return { text: `${name} started following you.`, link: profileLink };
    default:
      return { text: `${name} sent a notification.`, link: profileLink };
  }
};