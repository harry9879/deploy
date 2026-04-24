import LandingNavbar from '../components/LandingNavbar';
import { SVGScrollWrapper } from '../components/UI/Thread/svg-follow-scroll';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import ContactSection from '../components/sections/ContactSection';
import Footer from '../components/sections/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FEFCF8]">
      <LandingNavbar />
      
      {/* SVG Follow Scroll Animation with Hero, About, and Services */}
      <SVGScrollWrapper>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
      </SVGScrollWrapper>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
