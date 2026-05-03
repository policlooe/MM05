import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Promotions } from "@/components/Promotions";
import { Products } from "@/components/Products";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";

const Index = () => {
  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}
      >
        <Hero />
        <Promotions />
        <Products />
        <ContactUs />
      </motion.main>
      <Footer />
      <CartSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
};

export default Index;
