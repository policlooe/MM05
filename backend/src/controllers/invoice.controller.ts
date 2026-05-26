import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

export class InvoiceController {
  /**
   * Генерация HTML накладной
   * GET /api/orders/:id/invoice
   */
  static async generateInvoiceHTML(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Получаем заказ с позициями
      const order = await prisma.order.findUnique({
        where: { id: id as string },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Заказ не найден',
        });
        return;
      }

      const isOwner = req.user?.userId && order.userId === req.user.userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Доступ запрещен',
        });
        return;
      }

      // Генерируем HTML
      const html = InvoiceController.generateHTML(order);

      // Возвращаем HTML для отображения или печати
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error: unknown) {
      console.error('Invoice generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Не удалось создать накладную',
      });
    }
  }

  /**
   * Генерация HTML шаблона накладной
   */
  private static generateHTML(order: any): string {
    const escapeHtml = (value: unknown): string => {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price) + ' ₽';
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const statusLabels: Record<string, string> = {
      NEW: 'Новый',
      RESERVED: 'Зарезервирован',
      CONFIRMED: 'Подтвержден',
      PROCESSING: 'В обработке',
      SHIPPED: 'Отправлен',
      DELIVERED: 'Доставлен',
      COMPLETED: 'Завершен',
      CANCELLED: 'Отменен',
    };

    const invoiceNumber = escapeHtml(order.orderNumber);
    const orderStatus = escapeHtml(statusLabels[order.status] || order.status);
    const customerName = escapeHtml(order.customerName);
    const customerPhone = escapeHtml(order.customerPhone);
    const customerEmail = escapeHtml(order.customerEmail);
    const deliveryAddress = escapeHtml(order.deliveryAddress);
    const customerNote = escapeHtml(order.customerNote);
    const adminNote = escapeHtml(order.adminNote);

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Накладная №${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0f8b4f;
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #0f8b4f;
      margin-bottom: 10px;
    }
    
    .company-details {
      font-size: 12px;
      color: #666;
      line-height: 1.8;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    
    .invoice-date {
      font-size: 12px;
      color: #666;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #0f8b4f;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .customer-info {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    
    .info-label {
      font-weight: 600;
      min-width: 150px;
      color: #666;
    }
    
    .info-value {
      flex: 1;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    thead {
      background-color: #0f8b4f;
      color: white;
    }
    
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    tbody tr:hover {
      background-color: #f5f5f5;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .totals {
      margin-top: 30px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }
    
    .total-row.grand-total {
      font-size: 20px;
      font-weight: bold;
      color: #0f8b4f;
      padding-top: 15px;
      border-top: 2px solid #0f8b4f;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    
    .note {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .note-title {
      font-weight: bold;
      margin-bottom: 5px;
      color: #856404;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .no-print {
        display: none;
      }
    }
    
    @media (max-width: 768px) {
      body {
        padding: 20px;
      }
      
      .header {
        flex-direction: column;
      }
      
      .invoice-info {
        text-align: left;
        margin-top: 20px;
      }
      
      table {
        font-size: 12px;
      }
      
      th, td {
        padding: 8px 4px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">MM05</div>
      <div class="company-details">
        Мебельный магазин<br>
        📍 Дагестан, г. Махачкала, п. Шамхал<br>
        ул. Сулеймана Стальского, 1<br>
        📞 +7 928 833-15-32<br>
        Пн–Сб: 9:00–19:00
      </div>
    </div>
    <div class="invoice-info">
      <div class="invoice-number">Накладная №${invoiceNumber}</div>
      <div class="invoice-date">от ${formatDate(order.createdAt)}</div>
      <div class="status-badge">${orderStatus}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Информация о клиенте</div>
    <div class="customer-info">
      <div class="info-row">
        <div class="info-label">ФИО:</div>
        <div class="info-value">${customerName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Телефон:</div>
        <div class="info-value">${customerPhone}</div>
      </div>
      ${order.customerEmail ? `
      <div class="info-row">
        <div class="info-label">Email:</div>
        <div class="info-value">${customerEmail}</div>
      </div>
      ` : ''}
      <div class="info-row">
        <div class="info-label">Адрес доставки:</div>
        <div class="info-value">${deliveryAddress}</div>
      </div>
    </div>
  </div>

  ${order.customerNote ? `
  <div class="note">
    <div class="note-title">Комментарий клиента:</div>
    <div>${customerNote}</div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Товары</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;" class="text-center">№</th>
          <th>Наименование</th>
          <th style="width: 100px;" class="text-center">Кол-во</th>
          <th style="width: 120px;" class="text-right">Цена</th>
          <th style="width: 120px;" class="text-right">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((item: any, index: number) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>
            <strong>${escapeHtml(item.product?.name || 'Товар')}</strong>
            ${item.options && Object.keys(item.options).length > 0 ? `
              <br><small style="color: #666;">
                ${Object.entries(item.options).map(([key, value]) => 
                  `${escapeHtml(key)}: ${escapeHtml(value)}`
                ).join(', ')}
              </small>
            ` : ''}
          </td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${formatPrice(Number(item.price))}</td>
          <td class="text-right"><strong>${formatPrice(Number(item.total))}</strong></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="total-row">
      <span>Подытог:</span>
      <span>${formatPrice(Number(order.subtotal))}</span>
    </div>
    ${Number(order.deliveryCost) > 0 ? `
    <div class="total-row">
      <span>Доставка:</span>
      <span>${formatPrice(Number(order.deliveryCost))}</span>
    </div>
    ` : ''}
    ${Number(order.discount) > 0 ? `
    <div class="total-row">
      <span>Скидка:</span>
      <span>-${formatPrice(Number(order.discount))}</span>
    </div>
    ` : ''}
    <div class="total-row grand-total">
      <span>ИТОГО К ОПЛАТЕ:</span>
      <span>${formatPrice(Number(order.total))}</span>
    </div>
  </div>

  ${order.adminNote ? `
  <div class="note">
    <div class="note-title">Примечание менеджера:</div>
    <div>${adminNote}</div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Спасибо за покупку!</p>
    <p>При возникновении вопросов свяжитесь с нами: +7 928 833-15-32</p>
  </div>

  <script>
    // Автоматическая печать при открытии (опционально)
    // window.onload = () => window.print();
  </script>
</body>
</html>
    `.trim();
  }
}
