import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});