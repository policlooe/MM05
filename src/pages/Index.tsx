import { Suspense, lazy } from "react";
import { Navbar } from "@/components/Navbar";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ContactUs } from "@/components/ContactUs";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SEO } from "@/components/SEO";
import { ProductListSkeleton } from "@/components/skeletons";
import { Hero } from "@/components/Hero";

// Lazy load heavy components
const Promotions = lazy(() => import("@/components/Promotions").then(m => ({ default: m.Promotions })));
const Products = lazy(() => import("@/components/Products").then(m => ({ default: m.Products })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ChatLauncher = lazy(() => import("@/components/ChatLauncher").then(m => ({ default: m.ChatLauncher })));

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
        <Suspense fallback={<div className="py-8" />}>
          <Promotions />
        </Suspense>
        <Suspense fallback={
          <section className="bg-surface-alt py-8 md:py-12">
            <div className="container-x">
              <ProductListSkeleton count={8} />
            </div>
          </section>
        }>
          <Products />
        </Suspense>
        <RecentlyViewed />
        <ContactUs />
      </main>
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
      <CartSidebar />
      <CatalogSidebar />
      <MobileNav />
      <Suspense fallback={null}>
        <ChatLauncher />
      </Suspense>
    </div>
  );
}
