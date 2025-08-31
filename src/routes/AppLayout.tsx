import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../ui/Navbar";
import { AnimatePresence, motion } from "framer-motion";


export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <Navbar />

      {/* Page transition */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="text-center text-slate-400 py-8">
        © {new Date().getFullYear()} Sky3D — Print your ideas.
      </footer>
    </div>
  );
}
