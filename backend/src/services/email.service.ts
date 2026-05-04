import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryAddress: string;
  customerPhone: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return this.transporter !== null;
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Email service not available, skipping email');
      return false;
    }

    try {
      const html = this.generateOrderConfirmationHTML(data);

      await this.transporter!.sendMail({
        from: `"MM05 Мебель" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: data.customerEmail,
        subject: `Подтверждение заказа ${data.orderNumber}`,
        html,
      });

      console.log(`✅ Order confirmation email sent to ${data.customerEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return false;
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    status: string,
    statusMessage: string
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Email service not available, skipping email');
      return false;
    }

    try {
      const html = this.generateStatusUpdateHTML(customerName, orderNumber, status, statusMessage);

      await this.transporter!.sendMail({
        from: `"MM05 Мебель" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Обновление статуса заказа ${orderNumber}`,
        html,
      });

      console.log(`✅ Status update email sent to ${customerEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send status update email:', error);
      return false;
    }
  }

  /**
   * Generate order confirmation HTML
   */
  private generateOrderConfirmationHTML(data: OrderEmailData): string {
    const itemsHTML = data.items
      .map(
        item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price.toLocaleString('ru-RU')} ₽</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${item.total.toLocaleString('ru-RU')} ₽</td>
        </tr>
      `
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Подтверждение заказа ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">MM05</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Мебель для вашего дома</p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #d1fae5; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 600;">Заказ успешно оформлен!</h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px;">Спасибо за ваш заказ, ${data.customerName}!</p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #374151;">Номер заказа:</strong>
                    <span style="color: #10b981; font-weight: 600; margin-left: 10px;">${data.orderNumber}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #374151;">Дата заказа:</strong>
                    <span style="color: #6b7280; margin-left: 10px;">${data.orderDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #374151;">Телефон:</strong>
                    <span style="color: #6b7280; margin-left: 10px;">${data.customerPhone}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #374151;">Адрес доставки:</strong>
                    <span style="color: #6b7280; margin-left: 10px;">${data.deliveryAddress}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Состав заказа</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Товар</th>
                    <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Кол-во</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Цена</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Стоимость товаров:</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827;">${data.subtotal.toLocaleString('ru-RU')} ₽</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Доставка:</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827;">${data.deliveryCost > 0 ? data.deliveryCost.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно'}</td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0 0; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: 600; color: #111827;">Итого:</td>
                  <td style="padding: 16px 0 0 0; border-top: 2px solid #e5e7eb; text-align: right; font-size: 20px; font-weight: 700; color: #10b981;">${data.total.toLocaleString('ru-RU')} ₽</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 40px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">Что дальше?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8;">
                <li>Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа</li>
                <li>Мы согласуем удобное время доставки</li>
                <li>Вы получите уведомление о статусе заказа</li>
              </ul>
              
              <div style="margin-top: 30px; padding: 20px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600;">Есть вопросы?</p>
                <p style="margin: 0; color: #6b7280;">Свяжитесь с нами:</p>
                <p style="margin: 10px 0 0 0;">
                  <a href="tel:+79288331532" style="color: #10b981; text-decoration: none; font-weight: 600;">+7 (928) 833-15-32</a><br>
                  <a href="mailto:info@mm05.ru" style="color: #10b981; text-decoration: none;">info@mm05.ru</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; color: #9ca3af; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">© 2026 MM05. Все права защищены.</p>
              <p style="margin: 0;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate status update HTML
   */
  private generateStatusUpdateHTML(
    customerName: string,
    orderNumber: string,
    status: string,
    statusMessage: string
  ): string {
    const statusColors: Record<string, string> = {
      NEW: '#6b7280',
      RESERVED: '#3b82f6',
      CONFIRMED: '#10b981',
      PROCESSING: '#f59e0b',
      SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981',
      COMPLETED: '#059669',
      CANCELLED: '#ef4444',
    };

    const statusColor = statusColors[status] || '#6b7280';

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Обновление статуса заказа ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">MM05</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Мебель для вашего дома</p>
            </td>
          </tr>

          <!-- Status Update -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">Здравствуйте, ${customerName}!</h2>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Статус вашего заказа <strong style="color: #111827;">${orderNumber}</strong> изменился.
              </p>

              <div style="padding: 30px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid ${statusColor};">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Новый статус</p>
                <p style="margin: 0 0 15px 0; color: ${statusColor}; font-size: 20px; font-weight: 700;">${statusMessage}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  ${this.getStatusDescription(status)}
                </p>
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600;">Есть вопросы?</p>
                <p style="margin: 0; color: #6b7280;">Свяжитесь с нами:</p>
                <p style="margin: 10px 0 0 0;">
                  <a href="tel:+79288331532" style="color: #10b981; text-decoration: none; font-weight: 600;">+7 (928) 833-15-32</a><br>
                  <a href="mailto:info@mm05.ru" style="color: #10b981; text-decoration: none;">info@mm05.ru</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0;">© 2026 MM05. Все права защищены.</p>
              <p style="margin: 0;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Get status description
   */
  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      NEW: 'Ваш заказ получен и ожидает обработки.',
      RESERVED: 'Товары зарезервированы для вашего заказа.',
      CONFIRMED: 'Ваш заказ подтвержден и принят в работу.',
      PROCESSING: 'Мы готовим ваш заказ к отправке.',
      SHIPPED: 'Ваш заказ отправлен и находится в пути.',
      DELIVERED: 'Ваш заказ доставлен по указанному адресу.',
      COMPLETED: 'Заказ успешно завершен. Спасибо за покупку!',
      CANCELLED: 'Заказ отменен. Если у вас есть вопросы, свяжитесь с нами.',
    };

    return descriptions[status] || 'Статус заказа обновлен.';
  }
}

export const emailService = new EmailService();
