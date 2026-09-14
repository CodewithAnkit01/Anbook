import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import followRoutes from "./routes/follow.routes.js"
import postRoutes from "./routes/post.routes.js"
import feedRoutes from "./routes/feed.routes.js";
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import searchRoutes from "./routes/search.routes.js";
import hashtagRoutes from "./routes/hashtag.routes.js"
import reportRoutes from "./routes/report.routes.js";





app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes)
app.use("api/v1/follow", followRoutes )
app.use("/api/v1/post", postRoutes)
app.use("/api/v1/feed", feedRoutes);
app.use("/api/v1/likes", likeRoutes)
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/notifications",notificationRoutes);
app.use("/api/v1/bookmarks",bookmarkRoutes);
app.use("/api/v1/search",searchRoutes);
app.use("/api/v1/hashtags", hashtagRoutes);
app.use("/api/v1/reports", reportRoutes)





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 