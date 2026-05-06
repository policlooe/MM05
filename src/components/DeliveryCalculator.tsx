import { useEffect, useMemo, useState, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import { CONTACTS } from "@/lib/contacts";

declare global {
  interface Window {
    ymaps: any;
  }
}

export function DeliveryCalculator() {
  const [toAddress, setToAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const deliveryMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const STORE_COORDS = [43.0495, 47.626];

  const deliveryPrice = useMemo(() => {
    if (distanceKm === null) return 0;
    if (distanceKm <= 5) return 0;
    if (distanceKm <= 20) return 500;
    return Math.round(distanceKm * 30);
  }, [distanceKm]);

  const tariffIndex = useMemo(() => {
    if (distanceKm === null) return -1;
    if (distanceKm <= 5) return 0;
    if (distanceKm <= 20) return 1;
    return 2;
  }, [distanceKm]);

  useEffect(() => {
    if (window.ymaps) {
      window.ymaps.ready(() => setMapLoaded(true));
      return;
    }

    const scriptId = 'yandex-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.async = true;
      document.head.appendChild(script);
    }

    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => setMapLoaded(true));
      }
    };

    script.onerror = () => {
      console.error('Не удалось загрузить Yandex Maps API');
      setError('Не удалось загрузить карту. Попробуйте обновить страницу.');
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      const map = new window.ymaps.Map(mapRef.current, {
        center: STORE_COORDS,
        zoom: 12,
        controls: ['zoomControl']
      }, {
        suppressMapOpenBlock: true
      });

      const storeMarker = new window.ymaps.Placemark(STORE_COORDS, {
        balloonContent: `<b>Наш магазин</b><br>${CONTACTS.address}`
      }, {
        preset: 'islands#redShoppingIcon'
      });

      map.geoObjects.add(storeMarker);
      mapInstanceRef.current = map;

      if (document.getElementById('delivery-address-input')) {
        const suggestView = new window.ymaps.SuggestView('delivery-address-input', {
          provider: { suggest: (req: string) => window.ymaps.suggest(req) },
          results: 5
        });

        suggestView.events.add('select', (e: any) => {
          setToAddress(e.get('item').value);
          setTimeout(() => calculateRoute(), 300);
        });
      }
    } catch (err) {
      console.error('Ошибка инициализации карты:', err);
      setError('Ошибка загрузки карты');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  const calculateRoute = async () => {
    if (!toAddress.trim()) {
      setError('Введите адрес доставки');
      return;
    }
    
    if (!window.ymaps || !mapInstanceRef.current) {
      setError('Карта еще загружается, подождите...');
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);

      const geoResult = await window.ymaps.geocode(toAddress, { results: 1 });
      const geoObj = geoResult.geoObjects.get(0);

      if (!geoObj) throw new Error('Адрес не найден. Уточните запрос.');

      const deliveryCoords = geoObj.geometry.getCoordinates();
      const deliveryAddress = geoObj.getAddressLine();

      const routeResult = await window.ymaps.route([STORE_COORDS, deliveryCoords], {
        routingMode: 'auto'
      });

      const route = routeResult.getPaths().get(0);
      const distanceMeters = route.getLength();
      const durationSec = route.getTime();

      const km = distanceMeters / 1000;
      setDistanceKm(Number(km.toFixed(1)));
      setDurationMinutes(Math.round(durationSec / 60));

      updateMap(deliveryCoords, deliveryAddress, routeResult);

    } catch (err: any) {
      console.error("Ошибка расчета маршрута:", err);
      setError(err.message || "Не удалось найти адрес. Проверьте правильность написания.");
      setDistanceKm(null);
      setDurationMinutes(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateMap = (deliveryCoords: number[], deliveryAddress: string, routeResult: any) => {
    if (!mapInstanceRef.current) return;

    if (deliveryMarkerRef.current) mapInstanceRef.current.geoObjects.remove(deliveryMarkerRef.current);
    if (routeLineRef.current) mapInstanceRef.current.geoObjects.remove(routeLineRef.current);

    const deliveryMarker = new window.ymaps.Placemark(deliveryCoords, {
      balloonContent: `<b>Адрес доставки</b><br>${deliveryAddress}`
    }, {
      preset: 'islands#blueDeliveryIcon'
    });

    mapInstanceRef.current.geoObjects.add(deliveryMarker);
    deliveryMarkerRef.current = deliveryMarker;

    routeResult.getPaths().each((path: any) => {
      path.options.set({ strokeColor: 'hsl(var(--accent))', strokeWidth: 4, strokeOpacity: 0.8 });
    });

    mapInstanceRef.current.geoObjects.add(routeResult);
    routeLineRef.current = routeResult;

    mapInstanceRef.current.setBounds(
      mapInstanceRef.current.geoObjects.getBounds(),
      { checkZoomRange: true, zoomMargin: 40 }
    );
  };

  const routeUrl = distanceKm
    ? `https://yandex.ru/maps/?rtext=${STORE_COORDS[0]},${STORE_COORDS[1]}~${toAddress}&rtt=auto`
    : '#';

  return (
    <section id="delivery" className="container-x py-4 md:py-5">
      <div className="bg-surface border border-border rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-semibold mb-1">Доставка и расчёт стоимости</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Укажите адрес — рассчитаем расстояние и стоимость в реальном времени
          </p>
        </div>

        {/* Магазин */}
        <div className="bg-card border border-border rounded-xl p-3 mb-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Магазин / точка отправки
            </p>
            <p className="text-xs font-medium leading-tight">
              {CONTACTS.address}
            </p>
          </div>
        </div>

        {/* Ввод адреса */}
        <div className="bg-card border border-border rounded-xl p-4 mb-3 shadow-sm">
          <label htmlFor="delivery-address-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Адрес доставки
          </label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex-1">
              <input
                id="delivery-address-input"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && calculateRoute()}
                placeholder="Например: ул. Ленина, 10, кв. 5"
                className="w-full h-10 px-3 rounded-lg border-2 border-border bg-background text-xs outline-none transition-colors focus:border-accent focus:bg-white"
                autoComplete="off"
              />
            </div>
            <button
              onClick={() => calculateRoute()}
              disabled={isCalculating || !toAddress.trim() || !mapLoaded}
              className="h-10 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold text-xs transition-all disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isCalculating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Считаем...
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  Рассчитать
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : isCalculating ? (
              <span className="text-accent">Прокладываем маршрут...</span>
            ) : !mapLoaded ? (
              <span className="text-muted-foreground">Загрузка карты...</span>
            ) : (
              'Начните вводить адрес — появятся подсказки'
            )}
          </p>
        </div>

        {/* Карта */}
        <div 
          ref={mapRef}
          className="rounded-xl overflow-hidden h-52 mb-3 border border-border shadow-sm bg-muted"
        />

        {/* Результаты */}
        <div className="grid md:grid-cols-2 gap-2 mb-3">
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              📍 Расстояние
            </p>
            <p className="text-lg font-bold">
              {isCalculating ? (
                <span className="text-muted-foreground">Считаем...</span>
              ) : distanceKm === null ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                `${distanceKm} км`
              )}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              ⏱ Примерное время
            </p>
            <p className="text-lg font-bold">
              {isCalculating ? (
                <span className="text-muted-foreground">Считаем...</span>
              ) : durationMinutes === null ? (
                <span className="text-muted-foreground">—</span>
              ) : durationMinutes < 60 ? (
                `~${durationMinutes} мин`
              ) : (
                `~${Math.floor(durationMinutes / 60)} ч ${durationMinutes % 60} мин`
              )}
            </p>
          </div>

          <div className="md:col-span-2 bg-accent/10 border-2 border-accent/30 rounded-xl p-3.5 shadow-sm">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              💳 Стоимость доставки
            </p>
            <p className="text-2xl font-bold text-accent">
              {isCalculating ? (
                <span>Считаем...</span>
              ) : distanceKm === null ? (
                <span>—</span>
              ) : deliveryPrice === 0 ? (
                'Бесплатно'
              ) : (
                `${deliveryPrice.toLocaleString('ru-RU')} ₽`
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {distanceKm === null ? 'Введите адрес для расчёта' : deliveryPrice === 0 ? '🎉 Бесплатная доставка!' : `Расстояние: ${distanceKm} км`}
            </p>
          </div>
        </div>

        {/* Тарифы */}
        <div className="bg-card border border-border rounded-xl p-4 mb-3 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Тарифы доставки
          </p>
          <div className="space-y-1.5">
            <div className={`flex items-center justify-between py-1.5 border-b border-border ${tariffIndex === 0 ? 'text-accent font-semibold' : ''}`}>
              <span className="text-xs">{tariffIndex === 0 && '▶ '}До 5 км</span>
              <span className="bg-success/10 text-success text-xs font-bold px-2 py-0.5 rounded-full">
                БЕСПЛАТНО
              </span>
            </div>
            <div className={`flex items-center justify-between py-1.5 border-b border-border ${tariffIndex === 1 ? 'text-accent font-semibold' : ''}`}>
              <span className="text-xs">{tariffIndex === 1 && '▶ '}5 — 20 км</span>
              <span className="text-xs font-semibold">500 ₽</span>
            </div>
            <div className={`flex items-center justify-between py-1.5 ${tariffIndex === 2 ? 'text-accent font-semibold' : ''}`}>
              <span className="text-xs">{tariffIndex === 2 && '▶ '}Более 20 км</span>
              <span className="text-xs font-semibold">30 ₽/км</span>
            </div>
          </div>
        </div>

        {/* Кнопка Яндекс.Карты */}
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-card border-2 border-border rounded-xl font-semibold text-xs transition-all shadow-sm ${
            distanceKm ? 'hover:border-[#fc3f1d] hover:bg-[#fff5f3]' : 'opacity-50 pointer-events-none'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#FC3F1D"/>
            <text x="5" y="18" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="white">Я</text>
          </svg>
          Построить маршрут в Яндекс Картах
        </a>
      </div>
    </section>
  );
}
