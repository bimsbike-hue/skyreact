import { motion } from "framer-motion";
import { Package, CreditCard, FileStack } from "lucide-react";

function InfoCard({
  icon, value, label, delay = 0,
}: { icon: React.ReactNode; value: string | number; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl bg-slate-800/60 border border-slate-700/60 p-5"
    >
      {/* soft highlight */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="flex items-center gap-4">
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-slate-900/70 border border-slate-700/70">
          {icon}
        </div>
        <div>
          <div className="text-3xl font-semibold leading-none">{value}</div>
          <div className="text-slate-400">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="text-3xl font-semibold"
      >
        Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          icon={<Package className="w-6 h-6 text-slate-200" />}
          value={3}
          label="Active Orders"
          delay={0.05}
        />
        <InfoCard
          icon={<CreditCard className="w-6 h-6 text-slate-200" />}
          value={1}
          label="Subscriptions"
          delay={0.12}
        />
        <InfoCard
          icon={<FileStack className="w-6 h-6 text-slate-200" />}
          value={2}
          label="Files in Queue"
          delay={0.18}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-6"
      >
        <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300">
          <li>Uploaded: gearbox_v2.3mf</li>
          <li>Order #SKY-103 queued</li>
          <li>Subscription renewed: Monthly</li>
        </ul>
      </motion.div>
    </div>
  );
}
