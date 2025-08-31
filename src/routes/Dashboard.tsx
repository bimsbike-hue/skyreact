import { motion } from "framer-motion";
import { Package, CreditCard, FileStack } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-4">
        <nav className="space-y-2">
          {["Overview", "My Orders", "Subscriptions", "Profile"].map((item) => (
            <button
              key={item}
              className="w-full text-left px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Active Orders", value: 3, icon: <Package className="w-6 h-6" /> },
            { title: "Subscriptions", value: 1, icon: <CreditCard className="w-6 h-6" /> },
            { title: "Files in Queue", value: 2, icon: <FileStack className="w-6 h-6" /> },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg flex items-center gap-4"
            >
              <div className="p-3 bg-gray-700 rounded-lg">{stat.icon}</div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-400">{stat.title}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <ul className="list-disc ml-6 text-gray-300 space-y-1">
            <li>Uploaded: gearbox_v2.3mf</li>
            <li>Order #SKY-103 queued</li>
            <li>Subscription renewed: Monthly</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
