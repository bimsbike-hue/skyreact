import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-white">
      <Navbar />
      <div className="pt-20">
        <Outlet />
      </div>
      <footer className="py-10 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} Sky3D — Print your ideas.
      </footer>
    </div>
  );
}
