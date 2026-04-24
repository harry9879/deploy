import { Component as GradientBars } from "../UI/Gbar/gradient-bars-background";
import { ArrowUp, Github, Twitter, Linkedin, Mail, Sparkles } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#F0FFF4] via-[#F7FEF9] to-[#FEFCF8]">
      {/* Gradient Bars Background */}
      <div className="relative">
        <GradientBars
          numBars={8}
          gradientFrom="rgba(122, 218, 165, 0.3)"
          gradientTo="rgba(152, 216, 200, 0.15)"
          animationDuration={4}
          backgroundColor="#FEFCF8"
        >
          <div className="relative z-20 w-full px-4 py-20">
            {/* Giant SendIT Text with Gradient */}
            <div className="relative mb-16 text-center">
              <h2
                className="select-none text-8xl font-black tracking-tighter bg-gradient-to-r from-[#7ADAA5]/10 via-[#98D8C8]/15 to-[#B8E994]/10 bg-clip-text text-transparent md:text-[10rem]"
                style={{ 
                  textShadow: "0 0 60px rgba(122, 218, 165, 0.3)",
                  WebkitTextStroke: "1px rgba(122, 218, 165, 0.1)"
                }}
              >
                SendIT
              </h2>
              <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-r from-[#7ADAA5]/20 via-[#98D8C8]/20 to-[#B8E994]/20" />
            </div>

            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 md:grid-cols-4">
                {/* About Column */}
                <div className="md:col-span-2">
                  <div className="mb-6 flex items-center gap-3 group">
                    <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">📦</span>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
                      SendIT
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    Secure, fast, and effortless file sharing for everyone.
                    Share files with confidence and ease.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="h-4 w-4 text-[#7ADAA5]" />
                    <span>Trusted by thousands of users worldwide</span>
                  </div>
                </div>

                {/* Quick Links Column */}
                <div>
                  <h4 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="h-1 w-8 bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] rounded-full" />
                    Quick Links
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="#home"
                        className="group flex items-center gap-2 text-gray-700 transition-all hover:text-[#7ADAA5] hover:translate-x-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7ADAA5] opacity-0 group-hover:opacity-100 transition-opacity" />
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#about"
                        className="group flex items-center gap-2 text-gray-700 transition-all hover:text-[#98D8C8] hover:translate-x-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#98D8C8] opacity-0 group-hover:opacity-100 transition-opacity" />
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#services"
                        className="group flex items-center gap-2 text-gray-700 transition-all hover:text-[#B8E994] hover:translate-x-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#B8E994] opacity-0 group-hover:opacity-100 transition-opacity" />
                        Services
                      </a>
                    </li>
                    <li>
                      <a
                        href="#contact"
                        className="group flex items-center gap-2 text-gray-700 transition-all hover:text-[#7ADAA5] hover:translate-x-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7ADAA5] opacity-0 group-hover:opacity-100 transition-opacity" />
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Social Media Column */}
                <div>
                  <h4 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="h-1 w-8 bg-gradient-to-r from-[#98D8C8] to-[#B8E994] rounded-full" />
                    Connect
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg border border-[#7ADAA5]/20 transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-[#7ADAA5] hover:to-[#98D8C8] hover:text-white hover:shadow-xl hover:shadow-[#7ADAA5]/30 hover:-translate-y-1"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg border border-[#98D8C8]/20 transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-[#98D8C8] hover:to-[#B8E994] hover:text-white hover:shadow-xl hover:shadow-[#98D8C8]/30 hover:-translate-y-1"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg border border-[#B8E994]/20 transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-[#B8E994] hover:to-[#7ADAA5] hover:text-white hover:shadow-xl hover:shadow-[#B8E994]/30 hover:-translate-y-1"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href="mailto:contact@sendit.com"
                      className="group flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg border border-[#7ADAA5]/20 transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-[#7ADAA5] hover:to-[#B8E994] hover:text-white hover:shadow-xl hover:shadow-[#7ADAA5]/30 hover:-translate-y-1"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                  <p className="mt-6 text-sm text-gray-600">
                    Get in touch with us for any questions or support.
                  </p>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="my-12 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-[#7ADAA5]/30 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <div className="bg-gradient-to-r from-[#F0FFF4] to-[#F7FEF9] px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#7ADAA5] animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-[#98D8C8] animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="h-2 w-2 rounded-full bg-[#B8E994] animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-700 flex items-center gap-2 justify-center sm:justify-start">
                    © {currentYear} SendIT. Made with pain..❤️‍🩹
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All Rights Reserved
                  </p>
                </div>

                {/* Back to Top Button */}
                <button
                  onClick={scrollToTop}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#7ADAA5]/40"
                >
                  <span>Back to Top</span>
                  <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:scale-110" />
                </button>
              </div>
            </div>
          </div>
        </GradientBars>
      </div>
    </footer>
  );
};

export default Footer;
