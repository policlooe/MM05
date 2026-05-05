import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Promotions } from "@/components/Promotions";
import { Products } from "@/components/Products";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Promotions />
        <Products />
        <ContactUs />
      </main>
      <Footer />
      <CartSidebar />
      <CatalogSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
