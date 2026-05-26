import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildMapsUrl, CONTACTS } from '../contacts';

describe('Contacts', () => {
  describe('CONTACTS constant', () => {
    it('should have all required fields', () => {
      expect(CONTACTS.phone).toBeDefined();
      expect(CONTACTS.address).toBeDefined();
      expect(CONTACTS.geo).toBeDefined();
      expect(CONTACTS.geo.lat).toBe(43.055698);
      expect(CONTACTS.geo.lng).toBe(47.329950);
    });

    it('should have valid phone formats', () => {
      expect(CONTACTS.phoneTel).toMatch(/^\+?\d+$/);
      expect(CONTACTS.whatsapp).toContain('wa.me');
      expect(CONTACTS.telegram).toContain('t.me');
    });
  });

  describe('buildMapsUrl', () => {
    beforeEach(() => {
      // Reset navigator mock
      vi.stubGlobal('navigator', {
        userAgent: '',
      });
    });

    it('should return Yandex Maps URL for desktop', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      });

      const url = buildMapsUrl();

      expect(url).toContain('yandex.ru/maps');
      expect(url).toContain(encodeURIComponent(CONTACTS.address));
    });

    it('should return Apple Maps URL for iOS', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });

      const url = buildMapsUrl();

      expect(url).toContain('maps://?q=');
      expect(url).toContain(`ll=${CONTACTS.geo.lat},${CONTACTS.geo.lng}`);
    });

    it('should return geo: URL for Android', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      });

      const url = buildMapsUrl();

      expect(url).toContain('geo:');
      expect(url).toContain(`${CONTACTS.geo.lat},${CONTACTS.geo.lng}`);
    });

    it('should handle iPad as iOS device', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      });

      const url = buildMapsUrl();

      expect(url).toContain('maps://?q=');
    });

    it('should return Yandex Maps when navigator is undefined', () => {
      // @ts-expect-error - testing server-side scenario
      vi.stubGlobal('navigator', undefined);

      const url = buildMapsUrl();

      expect(url).toContain('yandex.ru/maps');
    });
  });
});
