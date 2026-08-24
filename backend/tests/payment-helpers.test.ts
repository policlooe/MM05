import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isIpAllowed,
  ipToLong,
  amountsEqual,
  toYkAmount,
  ykStatusToPaymentStatus,
  DEFAULT_YOOKASSA_WEBHOOK_IPS,
} from '../src/utils/payment.helpers.js';
import { PaymentStatus } from '@prisma/client';

// ---------- ipToLong ----------
test('ipToLong: валидные адреса', () => {
  assert.equal(ipToLong('127.0.0.1'), 0x7f000001);
  assert.equal(ipToLong('0.0.0.0'), 0);
  assert.equal(ipToLong('255.255.255.255'), 0xffffffff);
  assert.equal(ipToLong('185.71.76.13'), ipToLong('185.71.76.13'));
});

test('ipToLong: невалидные входы', () => {
  for (const bad of ['999.1.1.1', '1.2.3', 'a.b.c.d', '1.2.3.4.5', '-1.0.0.0', '01.2.3.4x', '', '::ffff:1.2.3.4']) {
    assert.equal(ipToLong(bad), null, `expected null for ${bad}`);
  }
});

// ---------- isIpAllowed ----------
test('isIpAllowed: одиночный IP', () => {
  assert.equal(isIpAllowed('77.75.156.11', ['77.75.156.11']), true);
  assert.equal(isIpAllowed('77.75.156.12', ['77.75.156.11']), false);
});

test('isIpAllowed: CIDR /27', () => {
  // 185.71.76.0/27 → диапазон .0–.31
  assert.equal(isIpAllowed('185.71.76.0', ['185.71.76.0/27']), true);
  assert.equal(isIpAllowed('185.71.76.31', ['185.71.76.0/27']), true);
  assert.equal(isIpAllowed('185.71.76.32', ['185.71.76.0/27']), false);
});

test('isIpAllowed: CIDR /25 и /32', () => {
  assert.equal(isIpAllowed('77.75.154.200', ['77.75.154.128/25']), true);
  assert.equal(isIpAllowed('77.75.154.127', ['77.75.154.128/25']), false);
  assert.equal(isIpAllowed('77.75.156.35', ['77.75.156.35/32']), true);
  assert.equal(isIpAllowed('77.75.156.34', ['77.75.156.35/32']), false);
});

test('isIpAllowed: IPv6-адрес не пропускается', () => {
  assert.equal(isIpAllowed('::ffff:185.71.76.5', DEFAULT_YOOKASSA_WEBHOOK_IPS), false);
  assert.equal(isIpAllowed('::1', DEFAULT_YOOKASSA_WEBHOOK_IPS), false);
});

test('isIpAllowed: мусорные записи allowlist не роняют проверку', () => {
  assert.equal(isIpAllowed('1.2.3.4', ['garbage', '300.1.1.1/8', '1.2.3.4']), true);
  assert.equal(isIpAllowed('1.2.3.4', ['garbage']), false);
});

test('isIpAllowed: дефолтный allowlist ЮKassa принимает официальный адрес', () => {
  assert.equal(isIpAllowed('185.71.76.13', DEFAULT_YOOKASSA_WEBHOOK_IPS), true);
  assert.equal(isIpAllowed('8.8.8.8', DEFAULT_YOOKASSA_WEBHOOK_IPS), false);
});

// ---------- amountsEqual ----------
test('amountsEqual: строка vs число с копеечной точностью', () => {
  assert.equal(amountsEqual('14990.00', 14990), true);
  assert.equal(amountsEqual('0.10', 0.1), true);
  assert.equal(amountsEqual('0.1' , 0.100000001), true); // копейчное округление
  assert.equal(amountsEqual('14990.01', 14990), false);
  assert.equal(amountsEqual('', 0), false);
  assert.equal(amountsEqual('abc', 5), false);
});

// ---------- toYkAmount ----------
test('toYkAmount: формат ЮKassa', () => {
  assert.equal(toYkAmount(14990), '14990.00');
  assert.equal(toYkAmount(14990.5), '14990.50');
  assert.equal(toYkAmount(0.1 + 0.2), '0.30'); // без плавающей грязи
  assert.throws(() => toYkAmount(0));
  assert.throws(() => toYkAmount(-5));
  assert.throws(() => toYkAmount(NaN));
});

// ---------- ykStatusToPaymentStatus ----------
test('ykStatusToPaymentStatus: полный маппинг', () => {
  assert.equal(ykStatusToPaymentStatus('succeeded'), PaymentStatus.SUCCEEDED);
  assert.equal(ykStatusToPaymentStatus('canceled'), PaymentStatus.FAILED);
  assert.equal(ykStatusToPaymentStatus('pending'), PaymentStatus.PROCESSING);
  assert.equal(ykStatusToPaymentStatus('waiting_for_capture'), PaymentStatus.PROCESSING);
});
