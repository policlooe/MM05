import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { products } from "@/data/products";

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Если на главной странице, не показываем хлебные крошки
  if (pathnames.length === 0) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Главная", path: "/" },
  ];

  // Генерируем хлебные крошки на основе пути
  let currentPath = "";
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Определяем название для сегмента
    let label = segment;
    
    // Специальные случаи
    if (segment === "catalog") {
      label = "Каталог";
    } else if (segment === "about") {
      label = "О нас";
    } else if (segment === "contact") {
      label = "Контакты";
    } else if (segment === "checkout") {
      label = "Оформление заказа";
    } else if (segment === "favorites") {
      label = "Избранное";
    } else if (segment === "admin") {
      label = "Админ-панель";
    } else if (segment === "products") {
      label = "Товары";
    } else if (segment === "product") {
      // Следующий сегмент - это slug товара
      const nextSegment = pathnames[index + 1];
      if (nextSegment) {
        const product = products.find(p => p.slug === nextSegment);
        if (product) {
          label = product.name;
        }
      }
    } else if (segment === "payment") {
      label = "Оплата";
    } else if (segment === "success") {
      label = "Успешно";
    } else if (segment === "cancel") {
      label = "Отменено";
    } else if (segment === "login") {
      label = "Вход";
    } else if (segment === "register") {
      label = "Регистрация";
    }

    // Пропускаем slug товара, так как он уже обработан
    if (pathnames[index - 1] !== "product") {
      breadcrumbs.push({ label, path: currentPath });
    }
  });

  return (
    <nav aria-label="Breadcrumb" className="container-x py-3">
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  to={crumb.path}
                  className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">{crumb.label}</span>
                </Link>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  {isLast ? (
                    <span className="text-foreground font-medium line-clamp-1">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-muted-foreground hover:text-accent transition-colors line-clamp-1"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
