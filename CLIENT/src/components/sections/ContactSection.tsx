import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Mail, User, MessageSquare } from "lucide-react";
import { MouseFollowingEyes } from "../UI/Ce/mouse-following-eyes";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative min-h-screen w-full bg-gradient-to-b from-[#FEFCF8] to-[#FFF5F7] px-4 py-32"
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
            Get in{" "}
            <span className="bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-700">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994]" />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:min-h-[600px]">
          {/* Mouse Following Eyes */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full h-full min-h-[600px]">
              <div className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-sm border-2 border-[#7ADAA5] shadow-2xl shadow-[#7ADAA5]/20">
                <div className="absolute top-8 left-0 right-0 text-center">
                  <h3 className="text-4xl font-bold text-gray-900 md:text-5xl">
                    Contact{" "}
                    <span className="bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
                      Us
                    </span>
                  </h3>
                </div>
                <MouseFollowingEyes />
              </div>
              <p className="absolute bottom-8 left-0 right-0 text-center text-sm font-medium text-gray-700">
                Give your feedback to us
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full rounded-3xl border-2 border-[#98D8C8] bg-white/60 p-10 backdrop-blur-sm shadow-2xl shadow-[#98D8C8]/20"
            >
              {/* Name Field */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"
                >
                  <User className="h-5 w-5 text-[#7ADAA5]" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-2 border-[#7ADAA5]/30 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-[#7ADAA5] focus:outline-none focus:ring-2 focus:ring-[#7ADAA5]/30"
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"
                >
                  <Mail className="h-5 w-5 text-[#98D8C8]" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-2 border-[#98D8C8]/30 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-[#98D8C8] focus:outline-none focus:ring-2 focus:ring-[#98D8C8]/30"
                  placeholder="john@example.com"
                />
              </div>

              {/* Message Field */}
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"
                >
                  <MessageSquare className="h-5 w-5 text-[#B8E994]" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full resize-none rounded-lg border-2 border-[#B8E994]/30 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-[#B8E994] focus:outline-none focus:ring-2 focus:ring-[#B8E994]/30"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] px-6 py-4 text-lg font-bold text-white shadow-xl shadow-[#7ADAA5]/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#98D8C8]/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : submitStatus === "success" ? (
                    <>
                      ✓ Message Sent!
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#B8E994] via-[#98D8C8] to-[#7ADAA5] opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              {submitStatus === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-sm font-medium text-[#98D8C8]"
                >
                  Thank you! We'll get back to you soon.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
