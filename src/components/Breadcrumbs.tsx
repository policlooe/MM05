import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { products } from "@/data/products";

const ROUTE_LABELS: Record<string, string> = {
  catalog: "Каталог",
  about: "О нас",
  contact: "Контакты",
  checkout: "Оформление заказа",
  favorites: "Избранное",
  admin: "Админ-панель",
  products: "Товары",
  payment: "Оплата",
  success: "Успешно",
  cancel: "Отменено",
  login: "Вход",
  register: "Регистрация",
  orders: "Заказы",
  users: "Пользователи",
  settings: "Настройки",
  analytics: "Аналитика",
  new: "Создание",
  edit: "Редактирование",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) return null;

  const breadcrumbs: { label: string; path: string }[] = [{ label: "Главная", path: "/" }];
  let currentPath = "";

  for (let i = 0; i < pathnames.length; i++) {
    const segment = pathnames[i];
    currentPath += `/${segment}`;

    if (segment === "product") continue;

    let label = ROUTE_LABELS[segment] ?? segment;

    if (i > 0 && pathnames[i - 1] === "product") {
      const product = products.find((p) => p.slug === segment);
      if (product) label = product.name;
    }

    breadcrumbs.push({ label, path: currentPath });
  }

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
                  <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden />
                  {isLast ? (
                    <span className="text-foreground font-medium line-clamp-1" aria-current="page">
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
