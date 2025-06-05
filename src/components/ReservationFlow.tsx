import React, { useState, useEffect } from 'react';
import { Menu, ReservationDetails } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useShop, useMenus, usePublicShop, usePublicMenus } from '../hooks/useFirestore';
import { 
  calculateTotalAmount, 
  calculateDiscountedAmount 
} from '../utils/pricing';
import { 
  calculateDefaultAppointmentDate, 
  calculateTotalDuration, 
  calculateEndTime 
} from '../utils/calendar';
import MenuSelection from './MenuSelection';
import AppointmentScheduler from './AppointmentScheduler';
import PriceConfirmation from './PriceConfirmation';
import QRCodeDisplay from './QRCodeDisplay';

type Step = 'menu' | 'schedule' | 'confirm' | 'qr';

const ReservationFlow: React.FC = () => {
  const { user } = useAuth();
  
  // 認証されたユーザーの場合は自分の店舗情報とメニューを使用
  const { shop: userShop, loading: userShopLoading } = useShop(user?.uid || '');
  const { menus: userMenus, loading: userMenusLoading } = useMenus(userShop?.id || '');
  
  // 未ログインまたは店舗未登録の場合はシステム管理者の情報を使用
  const { shop: publicShop, loading: publicShopLoading } = usePublicShop();
  const { menus: publicMenus, loading: publicMenusLoading } = usePublicMenus(publicShop?.id || '');
  
  // ユーザーがログイン済みで店舗を持っている場合はユーザーのデータ、そうでなければシステム管理者のデータ
  const shop = user && userShop ? userShop : publicShop;
  const firebaseMenus = user && userShop ? userMenus : publicMenus;
  const loading = user && userShop ? (userShopLoading || userMenusLoading) : (publicShopLoading || publicMenusLoading);
  
  // 新規ユーザー判定（ログイン済みだが店舗未登録）
  const isLoggedInNewUser = user && !userShop;
  
  // FirebaseMenuからMenuに変換
  const menus: Menu[] = firebaseMenus.map(menu => ({
    id: menu.id!,
    name: menu.name,
    basePrice: menu.basePrice,
    defaultDiscount: menu.defaultDiscount,
    defaultIntervalMonth: menu.defaultIntervalMonth,
    durationMin: menu.durationMin,
    category: menu.category,
    sortOrder: menu.sortOrder
  })).sort((a, b) => {
    // sortOrderで並び替え（管理画面と完全に一致）
    if (a.sortOrder !== b.sortOrder) {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    }
    // sortOrderが同じ場合は名前順
    return a.name.localeCompare(b.name);
  });
  
  const [currentStep, setCurrentStep] = useState<Step>('menu');
  const [selectedMenus, setSelectedMenus] = useState<Menu[]>([]);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('11:00');

  // 価格計算
  const totalAmount = calculateTotalAmount(selectedMenus);
  const discountedAmount = calculateDiscountedAmount(totalAmount, discountRate);

  // デフォルト来店日の設定
  useEffect(() => {
    if (selectedMenus.length > 0) {
      const defaultDate = calculateDefaultAppointmentDate(selectedMenus);
      setAppointmentDate(defaultDate);
    }
  }, [selectedMenus]);

  // 終了時刻の自動計算
  useEffect(() => {
    if (selectedMenus.length > 0) {
      const duration = calculateTotalDuration(selectedMenus);
      const calculatedEndTime = calculateEndTime(startTime, duration);
      setEndTime(calculatedEndTime);
    }
  }, [selectedMenus, startTime]);

  const reservationDetails: ReservationDetails = {
    selectedMenus,
    appointmentDate,
    startTime,
    endTime,
    totalAmount,
    discountedAmount,
    discountRate
  };

  const handleMenuSelection = (menus: Menu[], rate: number) => {
    setSelectedMenus(menus);
    setDiscountRate(rate);
  };

  const handleScheduleConfirm = (date: Date, start: string) => {
    setAppointmentDate(date);
    setStartTime(start);
    setCurrentStep('confirm');
  };

  const handlePriceConfirm = () => {
    setCurrentStep('qr');
  };

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 店舗情報がない場合
  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">店舗情報が登録されていません</h2>
          <p className="text-gray-600 mb-4">先に管理画面で店舗情報を登録してください。</p>
          <a 
            href="/admin" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            管理画面へ
          </a>
        </div>
      </div>
    );
  }

  // メニューがない場合
  if (menus.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">メニューが登録されていません</h2>
          <p className="text-gray-600 mb-4">先に管理画面でメニューを登録してください。</p>
          <a 
            href="/admin" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            管理画面へ
          </a>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'menu':
        return (
          <MenuSelection
            menus={menus}
            onSelectionChange={handleMenuSelection}
            onNext={() => selectedMenus.length > 0 && setCurrentStep('schedule')}
          />
        );
      
      case 'schedule':
        return (
          <AppointmentScheduler
            defaultDate={appointmentDate}
            selectedMenus={selectedMenus}
            onConfirm={handleScheduleConfirm}
            onBack={() => setCurrentStep('menu')}
            shopInfo={{
              businessHours: shop.businessHours,
              lastOrder: shop.lastOrder,
              holiday: shop.holiday
            }}
          />
        );
      
      case 'confirm':
        return (
          <PriceConfirmation
            reservation={reservationDetails}
            shopName={shop.name}
            onConfirm={handlePriceConfirm}
            onBack={() => setCurrentStep('schedule')}
          />
        );
      
      case 'qr':
        return (
          <QRCodeDisplay
            reservation={reservationDetails}
            shopName={shop.name}
            shopAddress={shop.address}
            onBack={() => setCurrentStep('confirm')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gradient mb-2">
            予約作成システム
          </h1>
          <p className="text-neutral-600">次回予約システム</p>
          
          {/* 新規ユーザー向けメッセージ */}
          {isLoggedInNewUser && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-900 font-medium mb-2">📋 プレビュー表示中</h3>
              <p className="text-blue-700 text-sm">
                システム管理者のメニューをプレビュー表示しています。<br/>
                管理画面で店舗情報を登録すると、これらのメニューがあなたの店舗用にコピーされます。
              </p>
            </div>
          )}
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-500">
              ステップ {currentStep === 'menu' ? 1 : currentStep === 'schedule' ? 2 : currentStep === 'confirm' ? 3 : 4} / 4
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${
                  currentStep === 'menu' ? 25 : 
                  currentStep === 'schedule' ? 50 : 
                  currentStep === 'confirm' ? 75 : 100
                }%` 
              }}
            />
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="animate-fade-in">
          {renderStep()}
        </div>

        {/* フッター */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <h3 className="font-semibold text-gray-800 mb-2">{shop.name}</h3>
            <p className="mb-1">{shop.address}</p>
            <p>TEL: {shop.phone}</p>
            {shop.businessHours && <p>営業時間: {shop.businessHours}</p>}
            {shop.lastOrder && <p>最終受付: {shop.lastOrder}</p>}
            {shop.holiday && <p>定休日: {shop.holiday}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationFlow; 