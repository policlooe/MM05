// Единый источник контактов и утилит для ссылок (карты, телефон, мессенджеры).
// Никаких секретов — всё публичное.

export const CONTACTS = {
  phone: "+7 928 833-15-32",
  phoneFormatted: "+7 (928) 833-15-32",
  phoneTel: "+79288331532",
  whatsapp: "https://wa.me/79288331532",
  telegram: "https://t.me/mebel_Muhammad_05",
  vk: "https://vk.ru/mmuhammad05",
  address: "Дагестан, г. Махачкала, п. Шамхал, ул. Сулеймана Стальского, 1",
  addressShort: "п. Шамхал, ул. Сулеймана Стальского, 1",
  workingHours: "Пн–Сб: 9:00–19:00",
  // Координаты склада (точные координаты)
  geo: { lat: 43.055698, lng: 47.329950 },
  schedule: "Пн–Сб: 9:00–19:00",
} as const;

/**
 * Возвращает ссылку на нативное приложение карт пользователя.
 * iOS → Apple Maps, Android → geo:, иначе → Яндекс.Карты в браузере.
 */
export function buildMapsUrl(): string {
  if (typeof navigator === "undefined") {
    return `https://yandex.ru/maps/?text=${encodeURIComponent(CONTACTS.address)}`;
  }
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const q = encodeURIComponent(CONTACTS.address);
  const { lat, lng } = CONTACTS.geo;

  if (isIOS) {
    // Apple Maps; если у пользователя стоят сторонние карты, iOS обычно сам предложит выбор
    return `maps://?q=${q}&ll=${lat},${lng}`;
  }
  if (isAndroid) {
    // geo: триггерит системный диалог выбора приложения карт (Google/Яндекс/2ГИС)
    return `geo:${lat},${lng}?q=${lat},${lng}(${q})`;
  }
  return `https://yandex.ru/maps/?text=${q}&z=15`;
}
