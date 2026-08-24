import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { Award, Heart, Hammer, TreePine, Users, TrendingUp } from "lucide-react";

const About = () => {
  // Прокрутка вверх при открытии страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main id="main-content" className="container-x py-10">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">О нас</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Качественная мебель из ЛДСП, МДФ и массива дерева. Работаем с проверенными поставщиками.
          </p>
        </div>

        {/* Наша история */}
        <section className="mb-12">
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold mb-4">Наша история</h2>
            <div className="prose prose-sm md:prose-base max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>MM05 (Мухаммад Мебель 05)</strong> — это магазин качественной мебели в Махачкале, Дагестан. 
                Мы работаем уже 5 лет и за это время наработали связи с надёжными поставщиками, 
                которые предлагают качественную продукцию по справедливым ценам.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                В нашем ассортименте представлена мебель из современных материалов — ЛДСП и МДФ, 
                а также эксклюзивные кровати из массива бука. Мы тщательно отбираем каждую модель, 
                проверяем качество материалов и сборки, чтобы ваш дом наполнялся уютом и комфортом.
              </p>
            </div>
          </div>
        </section>

        {/* Наши преимущества */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold mb-6 text-center">Почему выбирают нас</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Hammer className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Современное производство</h3>
              <p className="text-sm text-muted-foreground">
                Мебель изготавливается с использованием современных ЧПУ станков и ручной доработки мастерами
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TreePine className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Надёжные материалы</h3>
              <p className="text-sm text-muted-foreground">
                Используем проверенные ЛДСП и МДФ, а также эксклюзивные кровати из массива бука
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Гарантия качества</h3>
              <p className="text-sm text-muted-foreground">
                Предоставляем гарантию на всю продукцию и уверены в долговечности наших изделий
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Индивидуальный подход</h3>
              <p className="text-sm text-muted-foreground">
                Готовы изготовить мебель по вашим размерам и пожеланиям
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">5 лет на рынке</h3>
              <p className="text-sm text-muted-foreground">
                Работаем с 2021 года, накопили опыт и ответственно относимся к каждому клиенту
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Справедливые цены</h3>
              <p className="text-sm text-muted-foreground">
                Работаем напрямую с поставщиками, предлагаем конкурентные цены без лишних наценок
              </p>
            </div>
          </div>
        </section>

        {/* Наш ассортимент */}
        <section className="mb-12">
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold mb-4">Наш ассортимент</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Мебель для дома</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Кровати из массива дерева</li>
                  <li>• Шкафы и гардеробные системы</li>
                  <li>• Столы и стулья</li>
                  <li>• Комоды и тумбы</li>
                  <li>• Детская мебель</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Садовая мебель</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Беседки из дерева</li>
                  <li>• Садовые скамейки</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Наш магазин */}
        <section className="mb-12">
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold mb-4">Наш магазин</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Наш магазин находится в посёлке Шамхал, Махачкала, Дагестан. Здесь вы можете 
              посмотреть образцы мебели, пообщаться с менеджером и оформить заказ.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Основной ассортимент — мебель из ЛДСП и МДФ европейского качества. Также у нас есть 
              эксклюзивные кровати из массива бука. Мы поможем вам выбрать оптимальный вариант 
              для вашего дома с учётом бюджета и предпочтений.
            </p>
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-accent mb-1">Адрес магазина:</p>
              <p className="text-sm">Дагестан, г. Махачкала, п. Шамхал, ул. Сулеймана Стальского, 1</p>
              <p className="text-sm text-muted-foreground mt-2">Пн–Сб: 9:00–19:00</p>
            </div>
          </div>
        </section>

        {/* Призыв к действию */}
        <section className="text-center">
          <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-8">
            <h2 className="font-serif text-2xl font-semibold mb-3">Готовы заказать мебель?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Свяжитесь с нами любым удобным способом, и мы поможем воплотить ваши идеи в реальность
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="tel:+79288331532"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors"
              >
                Позвонить
              </a>
              <a
                href="https://wa.me/79288331532"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-surface border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-lg font-semibold transition"
              >
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartSidebar />
      <CatalogSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
};

export default About;
