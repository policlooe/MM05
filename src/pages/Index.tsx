import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Promotions } from "@/components/Promotions";
import { Products } from "@/components/Products";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ContactUs } from "@/components/ContactUs";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { SEO } from "@/components/SEO";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Главная"
        description="Качественная мебель из массива дерева в Махачкале. Кровати, шкафы, столы, кресла, беседки. Доставка по Дагестану."
        keywords={['мебель', 'массив', 'Махачкала', 'Дагестан', 'кровати', 'шкафы']}
        url="/"
      />
      <Navbar />
      <main id="main-content">
        <Hero />
        <Promotions />
        <Products />
        <RecentlyViewed />
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
