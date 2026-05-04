import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { ContactUs } from "@/components/ContactUs";
import { Contact as ContactForm } from "@/components/Contact";

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-24 md:pb-10">
        <div className="container-x pt-6">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Контакты</h1>
          <p className="text-muted-foreground max-w-2xl">
            Свяжитесь с нами любым удобным способом — ответим в рабочее время.
          </p>
        </div>

        <ContactUs />
        <ContactForm />
      </main>
      <Footer />
      <CartSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
};

export default ContactPage;
