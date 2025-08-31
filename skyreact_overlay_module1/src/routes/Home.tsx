import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <motion.h1
        className="text-5xl font-extrabold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Selamat Datang di Sky3D
      </motion.h1>
      <motion.p
        className="text-lg max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Layanan sewa 3D printer dengan kemudahan upload desain, pilih filament, 
        dan pantau status print kamu. Mulai sekarang dan wujudkan ide menjadi nyata!
      </motion.p>
    </div>
  );
}
