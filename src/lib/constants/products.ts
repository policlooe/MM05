import { Product } from '@/types/product';

export const ALMAK_BED: Product = {
  id: 'almak-bed',
  name: 'Кровать Альмак',
  basePrice: 45000,
  variants: [
    { colorId: 'grey', colorName: 'Серый велюр', colorCode: '#808080', image: '/images/products/almak-grey.jpg' },
    { colorId: 'beige', colorName: 'Бежевый велюр', colorCode: '#F5F5DC', image: '/images/products/almak-beige.jpg' },
    { colorId: 'brown', colorName: 'Коричневая кожа', colorCode: '#5D4037', image: '/images/products/almak-brown.jpg' }
  ],
  additionalOptions: [
    {
      title: 'Тип основания',
      items: [
        { id: 'orthopedic', name: 'Ортопедическое', price: 0 },
        { id: 'lifting', name: 'С подъемным механизмом', price: 8500 }
      ]
    },
    {
      title: 'Размер спального места',
      items: [
        { id: '160x200', name: '160x200 см', price: 0 },
        { id: '180x200', name: '180x200 см', price: 5000 },
        { id: '200x200', name: '200x200 см', price: 12000 }
      ]
    }
  ]
};
