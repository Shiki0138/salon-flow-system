import { Shop, Stylist, FirebaseMenu } from '../types';

// サンプルメニューデータ（新規ユーザー向けデフォルト表示）
export const sampleMenus: FirebaseMenu[] = [
  {
    id: '1',
    shopId: 'sample-shop',
    name: 'カット',
    basePrice: 5500,
    defaultDiscount: 0,
    defaultIntervalMonth: 1,
    durationMin: 30,
    category: 'cut',
    isActive: true,
    sortOrder: 1
  },
  {
    id: '3',
    shopId: 'sample-shop',
    name: 'カラー',
    basePrice: 7700,
    defaultDiscount: 0,
    defaultIntervalMonth: 2,
    durationMin: 60, // 1時間
    category: 'color',
    isActive: true,
    sortOrder: 3
  },
  {
    id: '4',
    shopId: 'sample-shop',
    name: 'プレミアム美髪矯正',
    basePrice: 28000,
    defaultDiscount: 0,
    defaultIntervalMonth: 6,
    durationMin: 180, // 3時間
    category: 'straight',
    isActive: true,
    sortOrder: 4
  },
  {
    id: '5',
    shopId: 'sample-shop',
    name: 'プレミアム美髪トリートメント',
    basePrice: 12100,
    defaultDiscount: 0,
    defaultIntervalMonth: 2,
    durationMin: 120, // 2時間
    category: 'treatment',
    isActive: true,
    sortOrder: 5
  },
  {
    id: '6',
    shopId: 'sample-shop',
    name: 'シャンプー',
    basePrice: 1650,
    defaultDiscount: 0,
    defaultIntervalMonth: 1,
    durationMin: 10,
    category: 'other',
    isActive: true,
    sortOrder: 6
  },
  {
    id: '7',
    shopId: 'sample-shop',
    name: 'シャンプーブロー',
    basePrice: 2750,
    defaultDiscount: 0,
    defaultIntervalMonth: 1,
    durationMin: 20,
    category: 'other',
    isActive: true,
    sortOrder: 7
  }
];

// サンプル店舗データ（新規ユーザー用は空）
export const sampleShop: Shop = {
  id: '1',
  name: 'サロン',
  address: '東京都渋谷区神宮前1-1-1',
  phone: '03-1234-5678'
};

// サンプルスタイリストデータ
export const sampleStylist: Stylist = {
  id: '1',
  name: '田中 美咲',
  email: 'tanaka@salon-luxe.com',
  shopId: '1'
}; 