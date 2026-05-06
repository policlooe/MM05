import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Save, Store, Truck, CreditCard, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface Settings {
  store: {
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
  };
  delivery: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expressShippingCost: number;
    estimatedDeliveryDays: string;
  };
  payment: {
    acceptedMethods: string[];
    currency: string;
    taxRate: number;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    store: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
    },
    delivery: {
      freeShippingThreshold: 0,
      standardShippingCost: 0,
      expressShippingCost: 0,
      estimatedDeliveryDays: '',
    },
    payment: {
      acceptedMethods: [],
      currency: 'RUB',
      taxRate: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data.data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      toast({
        title: 'Успешно',
        description: 'Настройки сохранены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground mt-1">
            Управление настройками магазина
          </p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store">Магазин</TabsTrigger>
            <TabsTrigger value="delivery">Доставка</TabsTrigger>
            <TabsTrigger value="payment">Оплата</TabsTrigger>
          </TabsList>

          {/* Настройки магазина */}
          <TabsContent value="store">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Информация о магазине</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Название магазина</Label>
                  <Input
                    id="storeName"
                    value={settings.store.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, name: e.target.value },
                      })
                    }
                    placeholder="MM05"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Описание</Label>
                  <Textarea
                    id="storeDescription"
                    value={settings.store.description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, description: e.target.value },
                      })
                    }
                    placeholder="Интернет-магазин мебели из массива дерева"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={settings.store.email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store: { ...settings.store, email: e.target.value },
                        })
                      }
                      placeholder="info@mm05.ru"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storePhone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Телефон
                    </Label>
                    <Input
                      id="storePhone"
                      type="tel"
                      value={settings.store.phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store: { ...settings.store, phone: e.target.value },
                        })
                      }
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Адрес
                  </Label>
                  <Textarea
                    id="storeAddress"
                    value={settings.store.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, address: e.target.value },
                      })
                    }
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Настройки доставки */}
          <TabsContent value="delivery">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Настройки доставки</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="freeShipping">
                    Бесплатная доставка от (₽)
                  </Label>
                  <Input
                    id="freeShipping"
                    type="number"
                    value={settings.delivery.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        delivery: {
                          ...settings.delivery,
                          freeShippingThreshold: Number(e.target.value),
                        },
                      })
                    }
                    placeholder="5000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Минимальная сумма заказа для бесплатной доставки
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="standardShipping">
                      Стандартная доставка (₽)
                    </Label>
                    <Input
                      id="standardShipping"
                      type="number"
                      value={settings.delivery.standardShippingCost}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          delivery: {
                            ...settings.delivery,
                            standardShippingCost: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expressShipping">
                      Экспресс доставка (₽)
                    </Label>
                    <Input
                      id="expressShipping"
                      type="number"
                      value={settings.delivery.expressShippingCost}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          delivery: {
                            ...settings.delivery,
                            expressShippingCost: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">
                    Срок доставки
                  </Label>
                  <Input
                    id="deliveryDays"
                    value={settings.delivery.estimatedDeliveryDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        delivery: {
                          ...settings.delivery,
                          estimatedDeliveryDays: e.target.value,
                        },
                      })
                    }
                    placeholder="3-5 рабочих дней"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Настройки оплаты */}
          <TabsContent value="payment">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Настройки оплаты</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <Input
                    id="currency"
                    value={settings.payment.currency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, currency: e.target.value },
                      })
                    }
                    placeholder="RUB"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Основная валюта магазина
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Ставка НДС (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={settings.payment.taxRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          taxRate: Number(e.target.value),
                        },
                      })
                    }
                    placeholder="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Принимаемые методы оплаты</Label>
                  <div className="space-y-2">
                    {['Банковская карта', 'Наличные', 'Перевод', 'Онлайн-оплата'].map(
                      (method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={settings.payment.acceptedMethods.includes(method)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...settings.payment.acceptedMethods, method]
                                : settings.payment.acceptedMethods.filter(
                                    (m) => m !== method
                                  );
                              setSettings({
                                ...settings,
                                payment: { ...settings.payment, acceptedMethods: methods },
                              });
                            }}
                            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                          />
                          <span>{method}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Кнопка сохранения */}
        <div className="flex items-center gap-4 mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
