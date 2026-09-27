import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AppLayout = () => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Navbar />
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AppLayout;