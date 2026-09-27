import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Feed from "./pages/Feed";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import Notifications from "./pages/Notifications";
import PostDetail from "./pages/PostDetail";
import Search from "./pages/Search";
import HashtagPage from "./pages/HashtagPage";
import Messages from "./pages/Messages";
import ChatWindow from "./pages/ChatWindow";
import MyReports from "./pages/MyReports";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminComments from "./pages/admin/AdminComments";
import BannedAccount from "./pages/BannedAccount";

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/feed" : "/login"} replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />

    {/* Public pages */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/banned" element={<BannedAccount />} />

    {/* Protected pages, wrapped in the navbar layout */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/hashtag/:name" element={<HashtagPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<ChatWindow />} />
        <Route path="/my-reports" element={<MyReports />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="comments" element={<AdminComments />} />
          </Route>
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<HomeRedirect />} />
  </Routes>
);

export default App;