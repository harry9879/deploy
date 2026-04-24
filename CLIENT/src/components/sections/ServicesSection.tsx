import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Lock,
  Key,
  Clock,
  Eye,
  Bell,
  Upload,
} from "lucide-react";

const services = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Your files are encrypted with military-grade AES-256 encryption before leaving your device.",
    color: "from-[#5A4FCF] to-[#7C3AED]",
    delay: 0.1,
  },
  {
    icon: Key,
    title: "PIN Protection",
    description:
      "Add an extra layer of security with custom PIN codes that recipients must enter to access files.",
    color: "from-[#00D4FF] to-[#0EA5E9]",
    delay: 0.2,
  },
  {
    icon: Clock,
    title: "Auto-Expiry Links",
    description:
      "Set custom expiration dates for your shared links. Files automatically delete after expiry.",
    color: "from-[#7C3AED] to-[#A855F7]",
    delay: 0.3,
  },
  {
    icon: Eye,
    title: "Download Tracking",
    description:
      "Monitor who accessed your files, when they downloaded them, and from which location.",
    color: "from-[#EC4899] to-[#F472B6]",
    delay: 0.4,
  },
  {
    icon: Bell,
    title: "Email Notifications",
    description:
      "Get instant email alerts whenever someone downloads your shared files.",
    color: "from-[#10B981] to-[#34D399]",
    delay: 0.5,
  },
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    description:
      "Simply drag and drop your files for instant upload. Supports files up to 200MB.",
    color: "from-[#F59E0B] to-[#FBBF24]",
    delay: 0.6,
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="services"
      ref={ref}
      className="relative min-h-screen w-full bg-gradient-to-b from-[#F7FEF9] to-[#FEFCF8] px-4 py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-5xl font-bold text-gray-900 md:text-6xl">
            Powerful{" "}
            <span className="bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-700">
            Everything you need to share files securely and efficiently
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994]" />
        </motion.div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const colors = ["#7ADAA5", "#98D8C8", "#B8E994"];
            const cardColor = colors[index % 3];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={
                  isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
                }
                transition={{ duration: 0.6, delay: service.delay }}
                className="group relative overflow-hidden rounded-2xl border-2 bg-white/60 p-8 backdrop-blur-sm shadow-lg transition-all hover:bg-white/80 hover:shadow-2xl"
                style={{
                  borderColor: cardColor,
                }}
              >
                {/* Gradient Overlay on Hover */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: `${cardColor}10` }}
                />

                {/* Icon */}
                <div
                  className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${cardColor}20` }}
                >
                  <service.icon className="h-8 w-8" style={{ color: cardColor }} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-gray-700">{service.description}</p>
                </div>

                {/* Decorative Corner */}
                <div
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: `${cardColor}20` }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <a
            href="#contact"
            className="inline-block rounded-lg bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-[#7ADAA5]/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#98D8C8]/50"
          >
            Get Started Today
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
