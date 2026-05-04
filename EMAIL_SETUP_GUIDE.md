# 📧 Настройка Email уведомлений для MM05

## 📋 Обзор

Email сервис MM05 отправляет автоматические уведомления клиентам:
- ✅ Подтверждение заказа (после создания)
- ✅ Обновление статуса заказа
- ✅ Подтверждение оплаты (через Stripe webhook)

Email уведомления **опциональны** - если SMTP не настроен, система будет работать без них.

---

## 🎯 Быстрый старт

### 1. Выберите email провайдера

#### Вариант A: Gmail (для тестирования)
**Плюсы:** Бесплатно, быстрая настройка  
**Минусы:** Лимит 500 писем/день, требует App Password

#### Вариант B: SendGrid (рекомендуется для production)
**Плюсы:** 100 писем/день бесплатно, надежная доставка  
**Минусы:** Требует регистрацию и верификацию домена

#### Вариант C: Mailgun
**Плюсы:** 5000 писем/месяц бесплатно  
**Минусы:** Требует регистрацию

#### Вариант D: AWS SES
**Плюсы:** Очень дешево ($0.10 за 1000 писем)  
**Минусы:** Сложная настройка

---

## 🔧 Настройка Gmail (для разработки)

### Шаг 1: Включите 2FA в Google аккаунте
1. Откройте https://myaccount.google.com/security
2. Включите "2-Step Verification"

### Шаг 2: Создайте App Password
1. Откройте https://myaccount.google.com/apppasswords
2. Выберите "Mail" и "Other (Custom name)"
3. Введите "MM05 Backend"
4. Скопируйте сгенерированный пароль (16 символов)

### Шаг 3: Настройте .env
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="MM05 Мебель <your-email@gmail.com>"
```

### Шаг 4: Перезапустите backend
```bash
cd backend
npm run dev
```

### Шаг 5: Проверьте логи
Вы должны увидеть:
```
✅ Email service initialized
```

---

## 🚀 Настройка SendGrid (для production)

### Шаг 1: Регистрация
1. Откройте https://signup.sendgrid.com/
2. Зарегистрируйтесь (бесплатный план)
3. Подтвердите email

### Шаг 2: Создайте API Key
1. Откройте https://app.sendgrid.com/settings/api_keys
2. Нажмите "Create API Key"
3. Выберите "Full Access"
4. Скопируйте API Key (начинается с `SG.`)

### Шаг 3: Верифицируйте отправителя
1. Откройте https://app.sendgrid.com/settings/sender_auth
2. Нажмите "Verify a Single Sender"
3. Заполните форму:
   - From Name: `MM05 Мебель`
   - From Email: `noreply@yourdomain.com`
   - Reply To: `info@yourdomain.com`
4. Подтвердите email

### Шаг 4: Настройте .env
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="SG.your-sendgrid-api-key"
SMTP_FROM="MM05 Мебель <noreply@yourdomain.com>"
```

### Шаг 5: Перезапустите backend
```bash
cd backend
npm run dev
```

---

## 📧 Настройка Mailgun

### Шаг 1: Регистрация
1. Откройте https://signup.mailgun.com/
2. Зарегистрируйтесь (бесплатный план)

### Шаг 2: Получите SMTP credentials
1. Откройте https://app.mailgun.com/app/sending/domains
2. Выберите ваш домен (или используйте sandbox)
3. Перейдите в "SMTP credentials"
4. Скопируйте:
   - SMTP hostname
   - Username
   - Password

### Шаг 3: Настройте .env
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_FROM="MM05 Мебель <noreply@your-domain.mailgun.org>"
```

---

## 🧪 Тестирование email

### Способ 1: Создайте тестовый заказ
1. Запустите frontend и backend
2. Добавьте товар в корзину
3. Оформите заказ с **вашим email**
4. Проверьте почту

### Способ 2: Используйте Mailtrap (для разработки)
Mailtrap - это fake SMTP сервер для тестирования

1. Откройте https://mailtrap.io/
2. Зарегистрируйтесь (бесплатно)
3. Создайте inbox
4. Скопируйте SMTP credentials

```env
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
SMTP_FROM="MM05 Мебель <test@mm05.ru>"
```

Все письма будут перехвачены Mailtrap и не отправлены реальным получателям.

---

## 📝 Шаблоны писем

### Подтверждение заказа
Отправляется автоматически после создания заказа.

**Содержит:**
- ✅ Номер заказа
- ✅ Дата заказа
- ✅ Контактная информация
- ✅ Адрес доставки
- ✅ Список товаров с ценами
- ✅ Итоговая сумма
- ✅ Контакты для связи

### Обновление статуса
Отправляется при изменении статуса заказа админом.

**Статусы:**
- 🆕 NEW - Новый заказ
- 📦 RESERVED - Товары зарезервированы
- ✅ CONFIRMED - Заказ подтвержден
- ⚙️ PROCESSING - Заказ в обработке
- 🚚 SHIPPED - Заказ отправлен
- 📍 DELIVERED - Заказ доставлен
- 🎉 COMPLETED - Заказ завершен
- ❌ CANCELLED - Заказ отменен

---

## 🔍 Troubleshooting

### Email не отправляются

**Проверьте логи backend:**
```bash
cd backend
npm run dev
```

**Возможные сообщения:**

#### ✅ Успех
```
✅ Email service initialized
✅ Order confirmation email sent to customer@example.com
```

#### ⚠️ Email не настроен
```
Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env
Email service not available, skipping email
```
**Решение:** Добавьте SMTP настройки в `.env`

#### ❌ Ошибка аутентификации
```
❌ Failed to initialize email service: Invalid login
```
**Решение:** 
- Проверьте SMTP_USER и SMTP_PASS
- Для Gmail: используйте App Password, не обычный пароль

#### ❌ Ошибка подключения
```
❌ Failed to send order confirmation email: Connection timeout
```
**Решение:**
- Проверьте SMTP_HOST и SMTP_PORT
- Проверьте firewall/антивирус

### Gmail блокирует отправку

**Ошибка:** "Less secure app access"

**Решение:**
1. Включите 2FA
2. Используйте App Password (не обычный пароль)
3. Или используйте другой провайдер (SendGrid, Mailgun)

### Email попадают в спам

**Решение:**
1. Верифицируйте домен (SPF, DKIM, DMARC)
2. Используйте профессиональный SMTP провайдер (SendGrid, Mailgun)
3. Не используйте Gmail для production

---

## 🌐 Production настройка

### Рекомендации

1. **Используйте профессиональный SMTP провайдер**
   - SendGrid, Mailgun, AWS SES
   - НЕ используйте Gmail для production

2. **Верифицируйте домен**
   - Настройте SPF, DKIM, DMARC записи
   - Это улучшит доставляемость

3. **Используйте отдельный email для отправки**
   - `noreply@yourdomain.com` для автоматических писем
   - `info@yourdomain.com` для Reply-To

4. **Мониторьте доставку**
   - Проверяйте bounce rate
   - Отслеживайте жалобы на спам

5. **Настройте переменные окружения на Railway**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=SG.your-api-key
   SMTP_FROM=MM05 Мебель <noreply@yourdomain.com>
   ```

---

## 📊 Лимиты провайдеров

| Провайдер | Бесплатный план | Цена платного |
|-----------|----------------|---------------|
| Gmail | 500/день | N/A |
| SendGrid | 100/день | $19.95/мес (50k) |
| Mailgun | 5000/месяц | $35/мес (50k) |
| AWS SES | 62000/месяц* | $0.10/1000 |
| Mailjet | 6000/месяц | €9/мес (30k) |

*При отправке из EC2

---

## 🎨 Кастомизация шаблонов

Шаблоны email находятся в:
```
backend/src/services/email.service.ts
```

### Изменить дизайн
Отредактируйте методы:
- `generateOrderConfirmationHTML()` - подтверждение заказа
- `generateStatusUpdateHTML()` - обновление статуса

### Изменить контакты
Найдите и замените:
```typescript
<a href="tel:+79288331532">+7 (928) 833-15-32</a>
<a href="mailto:info@mm05.ru">info@mm05.ru</a>
```

### Добавить логотип
Используйте inline base64 или URL:
```html
<img src="https://yourdomain.com/logo.png" alt="MM05" />
```

---

## ✅ Чеклист настройки

### Разработка
- [ ] Выбран email провайдер (Gmail/Mailtrap)
- [ ] Созданы SMTP credentials
- [ ] Добавлены переменные в `backend/.env`
- [ ] Backend перезапущен
- [ ] Проверены логи (✅ Email service initialized)
- [ ] Создан тестовый заказ
- [ ] Email получен

### Production
- [ ] Выбран профессиональный провайдер (SendGrid/Mailgun)
- [ ] Верифицирован домен
- [ ] Настроены SPF/DKIM/DMARC
- [ ] Добавлены переменные на Railway
- [ ] Backend перезапущен
- [ ] Протестирована отправка
- [ ] Email не попадают в спам
- [ ] Настроен мониторинг доставки

---

## 📞 Поддержка

**Если email не работает:**
1. Проверьте логи backend
2. Проверьте SMTP credentials
3. Попробуйте другой провайдер
4. Используйте Mailtrap для отладки

**Полезные ссылки:**
- SendGrid Docs: https://docs.sendgrid.com/
- Mailgun Docs: https://documentation.mailgun.com/
- Nodemailer Docs: https://nodemailer.com/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833

---

## 🎉 Готово!

После настройки email сервиса ваши клиенты будут получать:
- ✅ Красивые HTML письма
- ✅ Подтверждения заказов
- ✅ Обновления статусов
- ✅ Профессиональный опыт

**Следующие шаги:**
1. Настройте SMTP провайдера
2. Протестируйте отправку
3. Задеплойте на production
4. Мониторьте доставку

---

*Создано: 4 мая 2026*  
*Версия: 1.0.0*
