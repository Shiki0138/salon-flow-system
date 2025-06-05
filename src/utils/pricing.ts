import { Menu } from '../types';

// 合計金額を計算
export const calculateTotalAmount = (menus: Menu[]): number => {
  return menus.reduce((total, menu) => total + menu.basePrice, 0);
};

// 最大割引率を取得
export const getMaxDiscountRate = (menus: Menu[]): number => {
  if (menus.length === 0) return 0;
  return Math.max(...menus.map(menu => menu.defaultDiscount));
};

// 割引後金額を計算
export const calculateDiscountedAmount = (totalAmount: number, discountRate: number): number => {
  const discounted = totalAmount * (1 - discountRate);
  return Math.round(discounted); // 四捨五入
};

// 割引額を計算
export const calculateDiscountAmount = (totalAmount: number, discountRate: number): number => {
  return totalAmount - calculateDiscountedAmount(totalAmount, discountRate);
};

// 価格をフォーマット（カンマ区切り）
export const formatPrice = (amount: number): string => {
  return `¥${amount.toLocaleString()}`;
};

// 割引率をパーセント表記でフォーマット
export const formatDiscountRate = (rate: number): string => {
  return `${Math.round(rate * 100)}%`;
}; 