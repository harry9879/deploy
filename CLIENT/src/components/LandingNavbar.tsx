import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, FileUp } from "lucide-react";

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background when scrolled
      setIsScrolled(currentScrollY > 50);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      } ${
        isScrolled
          ? "bg-[#FEFCF8]/95 backdrop-blur-lg shadow-xl border-b-2 border-[#7ADAA5]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#7ADAA5] to-[#98D8C8] shadow-md shadow-[#7ADAA5]/50">
              <FileUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent">
              SendIT
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-linear-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] transition-all hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#7ADAA5]/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#98D8C8]/50"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-200/50 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t-2 border-[#7ADAA5] bg-[#FEFCF8]/95 backdrop-blur-sm pb-6 pt-4 md:hidden">
            <div className="space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#7ADAA5]/20 hover:text-gray-900"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-[#7ADAA5]/30" />
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#7ADAA5]/20 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] px-4 py-2 text-center text-sm font-bold text-white shadow-lg shadow-[#7ADAA5]/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;
