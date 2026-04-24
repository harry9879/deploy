import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Upload, Lock, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full bg-gradient-to-b from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] flex items-center justify-center px-4"
    >

      <div className="relative z-10 mx-auto max-w-5xl text-center py-20">
        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-6xl font-bold leading-tight tracking-tight text-gray-900 md:text-7xl lg:text-8xl"
        >
          Send Files.{" "}
          <span className="bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] bg-clip-text text-transparent">
            Fast.
          </span>{" "}
          <br />
          <span className="bg-gradient-to-r from-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
            Secure.
          </span>{" "}
          Effortless.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mb-12 max-w-2xl text-lg text-gray-700 md:text-xl"
        >
          Share encrypted files with PIN, expiry, and real-time tracking. No
          email attachments, no privacy risks.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12 flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 rounded-full border-2 border-[#7ADAA5] bg-white/80 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm shadow-sm">
            <Lock className="h-4 w-4 text-[#7ADAA5]" />
            End-to-End Encrypted
          </div>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#98D8C8] bg-white/80 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm shadow-sm">
            <Zap className="h-4 w-4 text-[#98D8C8]" />
            Lightning Fast
          </div>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#B8E994] bg-white/80 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm shadow-sm">
            <Upload className="h-4 w-4 text-[#B8E994]" />
            500MB Free Storage
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/register"
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#7ADAA5]/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#98D8C8]/50"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#98D8C8] to-[#B8E994] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <a
            href="#about"
            className="rounded-lg border-2 border-[#7ADAA5] bg-white/50 px-8 py-4 text-lg font-bold text-gray-800 backdrop-blur-sm transition-all hover:bg-white/80"
          >
            Learn More
          </a>
        </motion.div>

        {/* 3D Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16"
        >
          <div className="mx-auto flex max-w-md items-center justify-center gap-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#7ADAA5]/10 backdrop-blur-sm shadow-lg border-2 border-[#7ADAA5]/20">
              <Upload className="h-12 w-12 text-[#7ADAA5]" />
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#98D8C8]/10 backdrop-blur-sm shadow-lg border-2 border-[#98D8C8]/20">
              <Lock className="h-12 w-12 text-[#98D8C8]" />
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#B8E994]/10 backdrop-blur-sm shadow-lg border-2 border-[#B8E994]/20">
              <Zap className="h-12 w-12 text-[#B8E994]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
