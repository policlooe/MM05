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
  assemblyPrice?: number;
  configuration?: OldProductConfiguration;
  advancedConfiguration?: ProductConfiguration;
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "krovat-almak",
    name: "Кровать «Альмак»",
    category: "Кровати",
    price: 46500,
    oldPrice: 56000,
    image: bed1,
    gallery: [bed1, bed1, bed1, bed1],
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
    assemblyPrice: 3500,
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер спального места",
          required: true,
          options: [
            { value: "140x200", label: "140×200 см (полуторная)", priceModifier: -5000, default: false },
            { value: "160x200", label: "160×200 см (двуспальная)", priceModifier: 0, default: true },
            { value: "180x200", label: "180×200 см (king size)", priceModifier: 8000 },
          ],
        },
        color: {
          label: "Цвет покрытия",
          required: true,
          options: [
            { value: "natural", label: "Натуральный дуб", priceModifier: 0, image: bed1, default: true },
            { value: "dark", label: "Темный орех", priceModifier: 2000, image: bed2 }, // Пример замены
            { value: "white", label: "Белый", priceModifier: 3000, image: bed2 }, // Пример замены
          ],
        },
      },
      options: {
        headboard: {
          label: "Изголовье",
          type: "select",
          required: true,
          options: [
            { value: "standard", label: "Стандартное", priceModifier: 0, default: true },
            { value: "soft-fabric", label: "Мягкое (ткань)", priceModifier: 5000 },
            { value: "soft-leather", label: "Мягкое (кожа)", priceModifier: 12000 },
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
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 2000 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 3500 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 5000 },
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
    assemblyPrice: 4500,
    gallery: [wardrobe, wardrobe, wardrobe],
    shortDescription: "Распашной шкаф с минималистичными фасадами и доводчиками.",
    description: "Распашной шкаф «Терек» — на 3 секции с штангой, полками и ящиками. Фасады без ручек, открытие push-to-open. Петли BLUM с доводчиками soft-close. Внутри LED-подсветка с датчиком движения.",
    specs: [
      { label: "Размеры (Ш×В×Г)", value: "180×220×60 см" },
      { label: "Материал корпуса", value: "ЛДСП Egger 18 мм" },
      { label: "Фасады", value: "МДФ, эмаль" },
      { label: "Фурнитура", value: "BLUM (Австрия)" },
      { label: "Гарантия", value: "36 месяцев" },
    ],
    leadTime: "14–21 день",
    inStock: true,
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер шкафа",
          required: true,
          options: [
            { value: "150x220", label: "150×220 см (компактный)", priceModifier: -8000, default: false },
            { value: "180x220", label: "180×220 см (стандарт)", priceModifier: 0, default: true },
            { value: "200x220", label: "200×220 см (большой)", priceModifier: 12000 },
          ],
        },
        color: {
          label: "Цвет фасада",
          required: true,
          options: [
            { value: "white", label: "Белый", priceModifier: 0, image: wardrobe, default: true },
            { value: "gray", label: "Серый", priceModifier: 2000, image: wardrobe },
            { value: "black", label: "Черный", priceModifier: 3000, image: wardrobe },
          ],
        },
      },
      options: {
        lighting: {
          label: "LED-подсветка",
          type: "toggle",
          price: 4500,
          description: "Автоматическая подсветка с датчиком движения",
          default: false,
        },
        mirror: {
          label: "Зеркало на дверце",
          type: "toggle",
          price: 6000,
          description: "Зеркало во весь рост",
          default: false,
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 4500,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 2500 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 4000 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 6000 },
          ],
        },
      },
    },
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
    description: "Обеденный стол «Сулак» рассчитан на 6 персон. Цельная столешница толщиной 40 мм из массива бука с естественным рисунком. Ножки на стяжках — стол не шатается, легко собирается за 15 минут.",
    specs: [
      { label: "Размер", value: "180×90 см, высота 75 см" },
      { label: "Материал", value: "Массив бука" },
      { label: "Толщина столешницы", value: "40 мм" },
      { label: "Покрытие", value: "Натуральное масло" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    leadTime: "7–10 дней",
    inStock: true,
    assemblyPrice: 2000,
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер стола",
          required: true,
          options: [
            { value: "160x80", label: "160×80 см (на 4 персоны)", priceModifier: -5000, default: false },
            { value: "180x90", label: "180×90 см (на 6 персон)", priceModifier: 0, default: true },
            { value: "200x100", label: "200×100 см (на 8 персон)", priceModifier: 8000 },
          ],
        },
        color: {
          label: "Цвет покрытия",
          required: true,
          options: [
            { value: "natural", label: "Натуральный бук", priceModifier: 0, image: table, default: true },
            { value: "walnut", label: "Темный орех", priceModifier: 2000, image: table },
            { value: "white", label: "Белый", priceModifier: 2500, image: table },
          ],
        },
      },
      options: {
        chairs: {
          label: "Добавить стулья",
          type: "select",
          required: false,
          options: [
            { value: "none", label: "Без стульев", priceModifier: 0, default: true },
            { value: "4chairs", label: "4 стула", priceModifier: 16000 },
            { value: "6chairs", label: "6 стульев", priceModifier: 24000 },
            { value: "8chairs", label: "8 стульев", priceModifier: 32000 },
          ],
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 2000,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 2000 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 3000 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 4500 },
          ],
        },
      },
    },
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
    description: "Кресло-качалка «Каспий» из массива ясеня. Полозья отшлифованы и покрыты лаком — мягкий ход без скрипа. Анатомическая спинка снижает нагрузку на поясницу. Выдерживает до 130 кг.",
    specs: [
      { label: "Размеры", value: "70×110×95 см" },
      { label: "Материал", value: "Массив ясеня" },
      { label: "Нагрузка", value: "до 130 кг" },
      { label: "Покрытие", value: "Полиуретановый лак" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    leadTime: "5–7 дней",
    inStock: true,
    assemblyPrice: 1500,
    advancedConfiguration: {
      variants: {
        color: {
          label: "Цвет покрытия",
          required: true,
          options: [
            { value: "natural", label: "Натуральный ясень", priceModifier: 0, image: rocking, default: true },
            { value: "walnut", label: "Темный орех", priceModifier: 2000, image: rocking },
            { value: "white", label: "Белый", priceModifier: 2500, image: rocking },
          ],
        },
      },
      options: {
        cushion: {
          label: "Мягкая подушка",
          type: "toggle",
          price: 3500,
          description: "Съемная подушка с наполнителем холлофайбер",
          default: false,
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 1500,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 1500 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 2500 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 3500 },
          ],
        },
      },
    },
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
    description: "Беседка «Хунзах» — шестигранная конструкция из массива сибирской лиственницы. Кровля из мягкой битумной черепицы. В стоимость включён монтаж на участке заказчика в радиусе 100 км от Махачкалы.",
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
    assemblyPrice: 15000,
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер беседки",
          required: true,
          options: [
            { value: "3m", label: "Диаметр 3 м (компактная)", priceModifier: -25000, default: false },
            { value: "4m", label: "Диаметр 4 м (стандарт)", priceModifier: 0, default: true },
            { value: "5m", label: "Диаметр 5 м (большая)", priceModifier: 35000 },
          ],
        },
        roof: {
          label: "Тип кровли",
          required: true,
          options: [
            { value: "shingles", label: "Битумная черепица", priceModifier: 0, image: gazebo, default: true },
            { value: "metal", label: "Металлочерепица", priceModifier: 8000, image: gazebo },
            { value: "wood", label: "Деревянная дранка", priceModifier: 15000, image: gazebo },
          ],
        },
      },
      options: {
        floor: {
          label: "Деревянный пол",
          type: "toggle",
          price: 18000,
          description: "Пол из террасной доски",
          default: false,
        },
        lighting: {
          label: "Освещение",
          type: "toggle",
          price: 12000,
          description: "Светодиодные светильники с выключателем",
          default: false,
        },
        furniture: {
          label: "Мебель для беседки",
          type: "select",
          required: false,
          options: [
            { value: "none", label: "Без мебели", priceModifier: 0, default: true },
            { value: "table", label: "Стол + 6 лавок", priceModifier: 28000 },
            { value: "premium", label: "Стол + 6 кресел", priceModifier: 45000 },
          ],
        },
        delivery: {
          label: "Доставка и монтаж",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз (без монтажа)", priceModifier: -15000, default: false },
            { value: "city", label: "Монтаж в городе", priceModifier: 0, default: true },
            { value: "region", label: "Монтаж за городом (до 50 км)", priceModifier: 8000 },
            { value: "far", label: "Монтаж за городом (50-100 км)", priceModifier: 15000 },
          ],
        },
      },
    },
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
    description: "Прикроватная тумба «Гуниб» с двумя ящиками на скрытых направляющих с доводчиком. Тонкая столешница 18 мм из массива дуба. Идеально подходит к кровати «Альмак».",
    specs: [
      { label: "Размеры", value: "45×55×40 см" },
      { label: "Материал", value: "Массив дуба" },
      { label: "Ящики", value: "2 шт., доводчик" },
      { label: "Покрытие", value: "Масло-воск" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    leadTime: "7–10 дней",
    inStock: true,
    assemblyPrice: 1000,
    advancedConfiguration: {
      variants: {
        color: {
          label: "Цвет покрытия",
          required: true,
          options: [
            { value: "natural", label: "Натуральный дуб", priceModifier: 0, image: nightstand, default: true },
            { value: "walnut", label: "Темный орех", priceModifier: 1500, image: nightstand },
            { value: "white", label: "Белый", priceModifier: 2000, image: nightstand },
          ],
        },
      },
      options: {
        drawers: {
          label: "Количество ящиков",
          type: "select",
          required: true,
          options: [
            { value: "1drawer", label: "1 ящик", priceModifier: -3000, default: false },
            { value: "2drawers", label: "2 ящика", priceModifier: 0, default: true },
            { value: "3drawers", label: "3 ящика", priceModifier: 4000 },
          ],
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 1000,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 1000 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 1500 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 2500 },
          ],
        },
      },
    },
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
    description: "Полутораспальная кровать «Андийка» из массива сосны. Изголовье обтянуто рогожкой цвета «графит». Подходит для подростковой комнаты или гостевой спальни.",
    specs: [
      { label: "Спальное место", value: "140×200 см" },
      { label: "Материал", value: "Массив сосны" },
      { label: "Обивка изголовья", value: "Рогожка, цвет «графит»" },
      { label: "Основание", value: "Ламели берёза" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    leadTime: "10–14 дней",
    inStock: true,
    assemblyPrice: 3000,
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер спального места",
          required: true,
          options: [
            { value: "120x200", label: "120×200 см (односпальная)", priceModifier: -6000, default: false },
            { value: "140x200", label: "140×200 см (полуторная)", priceModifier: 0, default: true },
            { value: "160x200", label: "160×200 см (двуспальная)", priceModifier: 7000 },
          ],
        },
        color: {
          label: "Цвет обивки изголовья",
          required: true,
          options: [
            { value: "graphite", label: "Графит", priceModifier: 0, image: bed2, default: true },
            { value: "beige", label: "Бежевый", priceModifier: 0, image: bed2 },
            { value: "blue", label: "Синий", priceModifier: 1000, image: bed2 },
          ],
        },
      },
      options: {
        storage: {
          label: "Ящик для белья",
          type: "toggle",
          price: 5000,
          description: "Выдвижной ящик под кроватью",
          default: false,
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 3000,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        mattress: {
          label: "Добавить матрас",
          type: "toggle",
          price: 12000,
          description: "Ортопедический матрас",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 1800 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 3000 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 4500 },
          ],
        },
      },
    },
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
    description: "Письменный стол «Ахты» — компактное решение для домашнего офиса. Встроенный органайзер с отделениями под мелочи и кабель-канал. Высота столешницы оптимальна для роста 170–185 см.",
    specs: [
      { label: "Размеры", value: "120×60×75 см" },
      { label: "Материал", value: "ЛДСП + массив сосны" },
      { label: "Кабель-канал", value: "Есть" },
      { label: "Органайзер", value: "Встроенный" },
      { label: "Гарантия", value: "12 месяцев" },
    ],
    leadTime: "5–7 дней",
    assemblyPrice: 1500,
    inStock: true,
    advancedConfiguration: {
      variants: {
        size: {
          label: "Размер стола",
          required: true,
          options: [
            { value: "100x60", label: "100×60 см (компактный)", priceModifier: -3000, default: false },
            { value: "120x60", label: "120×60 см (стандарт)", priceModifier: 0, default: true },
            { value: "140x70", label: "140×70 см (большой)", priceModifier: 5000 },
          ],
        },
        color: {
          label: "Цвет столешницы",
          required: true,
          options: [
            { value: "oak", label: "Дуб сонома", priceModifier: 0, image: desk, default: true },
            { value: "walnut", label: "Орех", priceModifier: 1000, image: desk },
            { value: "white", label: "Белый", priceModifier: 1500, image: desk },
          ],
        },
      },
      options: {
        drawers: {
          label: "Тумба с ящиками",
          type: "toggle",
          price: 6000,
          description: "Тумба с 3 ящиками на колесиках",
          default: false,
        },
        shelf: {
          label: "Надстройка с полками",
          type: "toggle",
          price: 4500,
          description: "Полки над столом для книг и документов",
          default: false,
        },
        assembly: {
          label: "Сборка мебели",
          type: "toggle",
          price: 1500,
          description: "Профессиональная сборка на дому",
          default: false,
        },
        delivery: {
          label: "Доставка и подъем",
          type: "select",
          required: true,
          options: [
            { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
            { value: "city", label: "Доставка по городу", priceModifier: 1500 },
            { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 2500 },
            { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 3500 },
          ],
        },
      },
    },
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
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return undefined;
  }
  return products.find((p) => p.slug === slug);
}
