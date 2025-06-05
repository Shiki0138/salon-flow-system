// メニューの型定義
export interface Menu {
  id: string;
  name: string;
  basePrice: number;
  defaultDiscount: number; // 割引率（0-1）
  defaultIntervalMonth: number; // デフォルト来店目安（月）
  durationMin: number; // 所要時間（分）
  category: MenuCategory;
  sortOrder?: number; // 表示順序
}

export type MenuCategory = 'cut' | 'color' | 'treatment' | 'straight' | 'other';

// 選択されたメニューの型定義
export interface SelectedMenu {
  menu: Menu;
  selected: boolean;
}

// 予約詳細の型定義
export interface ReservationDetails {
  selectedMenus: Menu[];
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  discountedAmount: number;
  discountRate: number;
  notes?: string;
}

// ICS形式の予定データ
export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  reminder: number; // 通知時間（時間前）
}

// スタイリストの型定義
export interface Stylist {
  id: string;
  name: string;
  email: string;
  shopId: string;
}

// 店舗の型定義
export interface Shop {
  id: string;
  name: string;
  address: string;
  phone?: string;
  businessHours?: string;
  lastOrder?: string;
  holiday?: string;
}

// クーポンの型定義
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountRate: number;
  validUntil: Date;
}

// Firebase用の店舗データ型
export interface FirebaseShop {
  id?: string;
  ownerId: string; // 美容師のUID
  name: string;
  address: string;
  phone: string;
  businessHours?: string;
  lastOrder?: string;
  holiday?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Firebase用のメニューデータ型
export interface FirebaseMenu {
  id?: string;
  shopId: string;
  name: string;
  basePrice: number;
  defaultDiscount: number;
  defaultIntervalMonth: number;
  durationMin: number;
  category: 'cut' | 'color' | 'straight' | 'treatment' | 'other';
  isActive: boolean; // メニューの有効/無効
  sortOrder: number; // 表示順序
  createdAt?: Date;
  updatedAt?: Date;
} 