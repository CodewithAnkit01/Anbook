import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;