import React, { useState } from 'react';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { CartSidebar } from './CartSidebar';
import { CatalogSidebar } from './CatalogSidebar';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenCatalog={() => setIsCatalogOpen(true)}
      />

      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      <Footer />

      <MobileNavigation 
        onOpenCatalog={() => setIsCatalogOpen(true)} 
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      <CatalogSidebar 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
      />
    </div>
  );
}
