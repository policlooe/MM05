import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const files = {
  "src/components/ContactUs.tsx": "src/components/ContactUs.tsx",
  "src/pages/Contact.tsx": "src/pages/Contact.tsx",
  "src/pages/ProductPage.tsx": "src/pages/ProductPage.tsx",
  "src/pages/Checkout.tsx": "src/pages/Checkout.tsx",
  "src/pages/admin/Products.tsx": "src/pages/admin/Products.tsx",
  "src/store/cart.tsx": "src/store/cart.tsx",
  "src/components/CartSidebar.tsx": "src/components/CartSidebar.tsx",
  "src/data/products.ts": "src/data/products.ts",
  "src/types/product-config.ts": "src/types/product-config.ts",
};

const out = {
  generatedAt: new Date().toISOString(),
  summary: {
    changed: [
      "src/components/ContactUs.tsx",
      "src/pages/Contact.tsx",
      "src/pages/ProductPage.tsx",
      "src/pages/Checkout.tsx",
      "src/pages/admin/Products.tsx",
    ],
    unchangedButReferenced: [
      "src/store/cart.tsx",
      "src/components/CartSidebar.tsx",
      "src/data/products.ts",
      "src/types/product-config.ts",
    ],
  },
  changes: {
    "src/components/ContactUs.tsx":
      "Карточка 'Выберите удобный мессенджер' скрыта на мобильных (hidden md:flex).",
    "src/pages/Contact.tsx":
      "Полностью переписана страница: единый layout без дублирующихся заголовков 'Контакты'. Карта + адрес/телефон/график слева, мессенджеры (только на md+) и форма обратного звонка справа.",
    "src/pages/ProductPage.tsx":
      "Добавлен toggle 'Сборка' с persist в localStorage (mm05_assembly_<id>). Цена пересчитывается мгновенно. При добавлении в корзину передаётся синтетическая конфигурация {options:{assembly:true}}, чтобы корзина и оформление заказа учитывали сборку.",
    "src/pages/Checkout.tsx":
      "В сводке заказа явно показывается стоимость сборки: '+ Сборка: 3 500 ₽'.",
    "src/pages/admin/Products.tsx":
      "Добавлена колонка 'Сборка' для управления и контроля цены сборки админом (поле product.assemblyPrice).",
  },
  notes: [
    "Цена сборки задаётся на товаре полем Product.assemblyPrice (см. src/data/products.ts) — это значение редактирует админ через админ-панель/CMS, не статический хардкод в логике.",
    "Состояние toggle 'Сборка' сохраняется в localStorage и восстанавливается при возврате на страницу товара.",
    "Корзина уже хранит assemblySelected/assemblyPrice на уровне CartItem; оформление заказа (Checkout) передаёт options.assembly и options.assemblyPrice в orderService.createOrder.",
  ],
  files: {},
};

for (const [outKey, relPath] of Object.entries(files)) {
  out.files[outKey] = readFileSync(resolve(root, relPath), "utf8");
}

writeFileSync(
  resolve(root, "FRONTEND_FIXES.json"),
  JSON.stringify(out, null, 2),
  "utf8"
);

console.log("Wrote FRONTEND_FIXES.json with", Object.keys(out.files).length, "files");
