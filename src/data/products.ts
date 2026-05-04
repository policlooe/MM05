import bed1 from "@/assets/p-bed-1.jpg";
import bed2 from "@/assets/p-bed-2.jpg";
import wardrobe from "@/assets/p-wardrobe.jpg";
import table from "@/assets/p-table.jpg";
import desk from "@/assets/p-desk.jpg";
import rocking from "@/assets/p-rocking.jpg";
import gazebo from "@/assets/p-gazebo.jpg";
import nightstand from "@/assets/p-nightstand.jpg";
import { ProductConfiguration as OldProductConfiguration } from "@/types/product-config";
import { ProductConfiguration } from "@/types/product-configuration";

export type Category = "Кровати" | "Шкафы" | "Столы" | "Кресла" | "Беседки" | "Тумбы";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  badge?: string;
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  leadTime: string;
  inStock: boolean;
  assemblyPrice?: number; // Цена сборки (опционально, задается админом)
  configuration?: OldProductConfiguration; // Старая конфигурация (для совместимости)
  advancedConfiguration?: ProductConfiguration; // Новая расширенная конфигурация с изображениями
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "krovat-almak",
    name: "Кровать «Альмак»",
    category: "Кровати",
    price: 46500, // Базовая цена для размера 160x200
    oldPrice: 56000,
    image: bed1,
    gallery: [bed1, bed1, bed1, bed1], // Дополнительные фото товара
    badge: "Хит",
    shortDescription: "Двуспальная кровать из массива дуба с лаконичным изголовьем.",
    description:
      "Кровать «Альмак» — лаконичная двуспальная модель из массива дуба. Прочное реечное основание выдерживает нагрузку до 300 кг, сборка на металлических уголках без шатания. Поверхность обработана натуральным маслом-воском, безопасным для аллергиков и детей.",
    specs: [
      { label: "Спальное место", value: "160×200 см" },
      { label: "Материал", value: "Массив дуба" },
      { label: "Основание", value: "Ортопедическая рейка" },
      { label: "Покрытие", value: "Масло-воск Osmo" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    leadTime: "10–14 дней",
    inStock: true,
    assemblyPrice: 3500, // Цена сборки кровати
    // НОВАЯ РАСШИРЕННАЯ КОНФИГУРАЦИЯ с изображениями для цветов
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер спального места",
          required: true,
          options: [
            { 
              value: "140x200", 
              label: "140×200 см (полуторная)", 
              priceModifier: -5000,
              default: false
            },
            { 
              value: "160x200", 
              label: "160×200 см (двуспальная)", 
              priceModifier: 0,
              default: true // Базовый размер
            },
            { 
              value: "180x200", 
              label: "180×200 см (king size)", 
              priceModifier: 8000 
            },
          ],
        },
        color: {
          label: "Цвет покрытия",
          required: true,
          options: [
            { 
              value: "natural", 
              label: "Натуральный дуб", 
              priceModifier: 0,
              image: bed1, // Изображение для натурального цвета
              default: true
            },
            { 
              value: "dark", 
              label: "Темный орех", 
              priceModifier: 2000,
              image: bed1 // ЗАМЕНИТЬ на изображение темного цвета
            },
            { 
              value: "white", 
              label: "Белый", 
              priceModifier: 3000,
              image: bed1 // ЗАМЕНИТЬ на изображение белого цвета
            },
          ],
        },
      },
      options: {
        headboard: {
          label: "Изголовье",
          type: "select",
          required: true,
          options: [
            { 
              value: "standard", 
              label: "Стандартное", 
              priceModifier: 0,
              default: true
            },
            { 
              value: "soft-fabric", 
              label: "Мягкое (ткань)", 
              priceModifier: 5000 
            },
            { 
              value: "soft-leather", 
              label: "Мягкое (кожа)", 
              priceModifier: 12000 
            },
          ],
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 3500,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        mattress: {
          label: "Добавить матрас",
          type: "toggle",
          price: 15000,
          description: "Ортопедический матрас",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { 
              value: "pickup", 
              label: "Самовывоз", 
              priceModifier: 0,
              default: true
            },
            { 
              value: "city", 
              label: "Доставка по городу", 
              priceModifier: 2000 
            },
            { 
              value: "floor5", 
              label: "Доставка + подъем до 5 этажа", 
              priceModifier: 3500 
            },
            { 
              value: "floor5plus", 
              label: "Доставка + подъем выше 5 этажа", 
              priceModifier: 5000 
            },
          ],
        },
      },
    },
  },
  {
    id: "p2",
    slug: "shkaf-terek",
    name: "Шкаф «Терек»",
    category: "Шкафы",
    price: 62000,
    image: wardrobe,
    assemblyPrice: 4500, // Цена сборки шкафа
    gallery: [wardrobe, wardrobe, wardrobe],
    shortDescription: "Распашной шкаф с минималистичными фасадами и доводчиками.",
    description:
      "Распашной шкаф «Терек» — на 3 секции с штангой, полками и ящиками. Фасады без ручек, открытие push-to-open. Петли BLUM с доводчиками soft-close. Внутри LED-подсветка с датчиком движения.",
    specs: [
      { label: "Размеры (Ш×В×Г)", value: "180×220×60 см" },
      { label: "Материал корпуса", value: "ЛДСП Egger 18 мм" },
      { label: "Фасады", value: "МДФ, эмаль" },
      { label: "Фурнитура", value: "BLUM (Австрия)" },
      { label: "Гарантия", value: "36 месяцев" },
    ],
    leadTime: "14–21 день",
    inStock: true,
  },
  {
    id: "p3",
    slug: "stol-sulak",
    name: "Стол «Сулак»",
    category: "Столы",
    price: 32000,
    image: table,
    gallery: [table, table, table, table],
    badge: "Новинка",
    shortDescription: "Обеденный стол на 6 персон из массива бука.",
    description:
      "Обеденный стол «Сулак» рассчитан на 6 персон. Цельная столешница толщиной 40 мм из массива бука с естественным рисунком. Ножки на стяжках — стол не шатается, легко собирается за 15 минут.",
    specs: [
      { label: "Размер", value: "180×90 см, высота 75 см" },
      { label: "Материал", value: "Массив бука" },
      { label: "Толщина столешницы", value: "40 мм" },
      { label: "Покрытие", value: "Натуральное масло" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    leadTime: "7–10 дней",
    inStock: true,
    assemblyPrice: 2000, // Цена сборки стола
  },
  {
    id: "p4",
    slug: "kreslo-kachalka-kaspiy",
    name: "Кресло-качалка «Каспий»",
    category: "Кресла",
    price: 24000,
    image: rocking,
    gallery: [rocking, rocking, rocking],
    shortDescription: "Классическая качалка из ясеня с эргономичной спинкой.",
    description:
      "Кресло-качалка «Каспий» из массива ясеня. Полозья отшлифованы и покрыты лаком — мягкий ход без скрипа. Анатомическая спинка снижает нагрузку на поясницу. Выдерживает до 130 кг.",
    specs: [
      { label: "Размеры", value: "70×110×95 см" },
      { label: "Материал", value: "Массив ясеня" },
      { label: "Нагрузка", value: "до 130 кг" },
      { label: "Покрытие", value: "Полиуретановый лак" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    leadTime: "5–7 дней",
    inStock: true,
    assemblyPrice: 1500, // Цена сборки кресла
  },
  {
    id: "p5",
    slug: "besedka-hunzakh",
    name: "Беседка «Хунзах»",
    category: "Беседки",
    price: 145000,
    oldPrice: 165000,
    image: gazebo,
    gallery: [gazebo, gazebo, gazebo, gazebo, gazebo],
    badge: "−12%",
    shortDescription: "Шестигранная беседка из лиственницы под ключ.",
    description:
      "Беседка «Хунзах» — шестигранная конструкция из массива сибирской лиственницы. Кровля из мягкой битумной черепицы. В стоимость включён монтаж на участке заказчика в радиусе 100 км от Махачкалы.",
    specs: [
      { label: "Диаметр", value: "4 м" },
      { label: "Высота", value: "3,2 м" },
      { label: "Материал", value: "Лиственница" },
      { label: "Кровля", value: "Битумная черепица" },
      { label: "Монтаж", value: "Включён" },
      { label: "Гарантия", value: "60 месяцев" },
    ],
    leadTime: "21–30 дней",
    inStock: true,
    assemblyPrice: 15000, // Цена сборки беседки
  },
  {
    id: "p6",
    slug: "tumba-gunib",
    name: "Тумба «Гуниб»",
    category: "Тумбы",
    price: 18000,
    image: nightstand,
    gallery: [nightstand, nightstand, nightstand],
    shortDescription: "Прикроватная тумба с двумя ящиками.",
    description:
      "Прикроватная тумба «Гуниб» с двумя ящиками на скрытых направляющих с доводчиком. Тонкая столешница 18 мм из массива дуба. Идеально подходит к кровати «Альмак».",
    specs: [
      { label: "Размеры", value: "45×55×40 см" },
      { label: "Материал", value: "Массив дуба" },
      { label: "Ящики", value: "2 шт., доводчик" },
      { label: "Покрытие", value: "Масло-воск" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    leadTime: "7–10 дней",
    inStock: true,
    assemblyPrice: 1000, // Цена сборки тумбы
  },
  {
    id: "p7",
    slug: "krovat-andiyka",
    name: "Кровать «Андийка»",
    category: "Кровати",
    price: 39000,
    image: bed2,
    gallery: [bed2, bed2, bed2],
    shortDescription: "Полутораспальная кровать из массива сосны.",
    description:
      "Полутораспальная кровать «Андийка» из массива сосны. Изголовье обтянуто рогожкой цвета «графит». Подходит для подростковой комнаты или гостевой спальни.",
    specs: [
      { label: "Спальное место", value: "140×200 см" },
      { label: "Материал", value: "Массив сосны" },
      { label: "Обивка изголовья", value: "Рогожка, цвет «графит»" },
      { label: "Основание", value: "Ламели берёза" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    leadTime: "10–14 дней",
    inStock: true,
    assemblyPrice: 3000, // Цена сборки кровати
  },
  {
    id: "p8",
    slug: "stol-pismenny-akhty",
    name: "Стол письменный «Ахты»",
    category: "Столы",
    price: 21000,
    image: desk,
    gallery: [desk, desk, desk, desk],
    shortDescription: "Компактный рабочий стол с органайзером.",
    description:
      "Письменный стол «Ахты» — компактное решение для домашнего офиса. Встроенный органайзер с отделениями под мелочи и кабель-канал. Высота столешницы оптимальна для роста 170–185 см.",
    specs: [
      { label: "Размеры", value: "120×60×75 см" },
      { label: "Материал", value: "ЛДСП + массив сосны" },
      { label: "Кабель-канал", value: "Есть" },
      { label: "Органайзер", value: "Встроенный" },
      { label: "Гарантия", value: "12 месяцев" },
    ],
    leadTime: "5–7 дней",
    assemblyPrice: 1500, // Цена сборки письменного стола
    inStock: true,
  },
];

export const categories = [
  { name: "Кровати", icon: "🛏️", count: 12, image: bed1, bg: "bg-[hsl(80_30%_88%)]" },
  { name: "Шкафы", icon: "🚪", count: 8, image: wardrobe, bg: "bg-[hsl(40_30%_90%)]" },
  { name: "Столы", icon: "🪑", count: 14, image: table, bg: "bg-[hsl(150_20%_88%)]" },
  { name: "Кресла", icon: "🪵", count: 6, image: rocking, bg: "bg-[hsl(30_30%_90%)]" },
  { name: "Беседки", icon: "🏡", count: 5, image: gazebo, bg: "bg-[hsl(120_25%_85%)]" },
  { name: "Тумбы", icon: "🗄️", count: 9, image: nightstand, bg: "bg-[hsl(60_25%_90%)]" },
] as const;

export const allCategories: Category[] = ["Кровати", "Шкафы", "Столы", "Кресла", "Беседки", "Тумбы"];

export function getProductBySlug(slug: string): Product | undefined {
  // Защита от инъекций - только буквы, цифры и дефисы
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return undefined;
  }
  return products.find((p) => p.slug === slug);
}
