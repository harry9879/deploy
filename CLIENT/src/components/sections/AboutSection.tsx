import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Clock, TrendingUp } from "lucide-react";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="relative min-h-screen w-full bg-gradient-to-b from-[#F0FFF4] to-[#F7FEF9] px-4 py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-5xl font-bold text-gray-900 md:text-6xl">
            About{" "}
            <span className="bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
              SendIT
            </span>
          </h2>
          <div className="mx-auto h-1 w-24 bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994]" />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={
            isInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 50, scale: 0.95 }
          }
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16 rounded-3xl border-2 border-[#7ADAA5] bg-white/60 p-8 backdrop-blur-sm shadow-2xl md:p-12"
        >
          <p className="text-center text-xl leading-relaxed text-gray-700 md:text-2xl">
            <span className="font-bold text-gray-900">SendIT</span> is a{" "}
            <span className="font-semibold text-[#7ADAA5]">secure</span>,{" "}
            <span className="font-semibold text-[#98D8C8]">fast</span>, and{" "}
            <span className="font-semibold text-[#B8E994]">user-friendly</span> file-sharing
            platform designed to eliminate the hassle of email attachments,
            privacy risks, and expired links. Share files with confidence,
            knowing they're protected every step of the way.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={
              isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }
            }
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group rounded-2xl border-2 border-[#7ADAA5] bg-white/60 p-6 backdrop-blur-sm shadow-lg transition-all hover:bg-white/80 hover:shadow-2xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#7ADAA5]/10">
              <Shield className="h-8 w-8 text-[#7ADAA5]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">
              Military-Grade Security
            </h3>
            <p className="text-gray-700">
              Your files are encrypted end-to-end with industry-standard AES-256
              encryption. Only you and your recipient can access them.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group rounded-2xl border-2 border-[#98D8C8] bg-white/60 p-6 backdrop-blur-sm shadow-lg transition-all hover:bg-white/80 hover:shadow-2xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#98D8C8]/10">
              <Clock className="h-8 w-8 text-[#98D8C8]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">
              Smart Expiration
            </h3>
            <p className="text-gray-700">
              Set custom expiry dates for your shared files. Links automatically
              expire, ensuring your content doesn't linger forever.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={
              isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
            }
            transition={{ duration: 0.6, delay: 0.5 }}
            className="group rounded-2xl border-2 border-[#B8E994] bg-white/60 p-6 backdrop-blur-sm shadow-lg transition-all hover:bg-white/80 hover:shadow-2xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#B8E994]/10">
              <TrendingUp className="h-8 w-8 text-[#B8E994]" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">
              Real-Time Analytics
            </h3>
            <p className="text-gray-700">
              Track downloads, monitor access patterns, and get instant
              notifications when someone downloads your files.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
