import React, { useState, useEffect } from 'react';
import { Menu } from '../types';
import { calculateTotalAmount, calculateDiscountedAmount, formatPrice, formatDiscountRate } from '../utils/pricing';

interface MenuSelectionProps {
  menus: Menu[];
  onSelectionChange: (selectedMenus: Menu[], discountRate: number) => void;
  onNext: () => void;
}

const MenuSelection: React.FC<MenuSelectionProps> = ({ menus, onSelectionChange, onNext }) => {
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  const [customDiscountRate, setCustomDiscountRate] = useState<number>(0);

  const selectedMenus = menus.filter(menu => selectedMenuIds.has(menu.id));
  const totalAmount = calculateTotalAmount(selectedMenus);
  const discountedAmount = calculateDiscountedAmount(totalAmount, customDiscountRate);

  useEffect(() => {
    onSelectionChange(selectedMenus, customDiscountRate);
  }, [selectedMenus, customDiscountRate, onSelectionChange]);

  const handleMenuToggle = (menuId: string) => {
    const newSelection = new Set(selectedMenuIds);
    if (newSelection.has(menuId)) {
      newSelection.delete(menuId);
    } else {
      newSelection.add(menuId);
    }
    setSelectedMenuIds(newSelection);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    // 0%から30%の範囲で制限
    const clampedValue = Math.max(0, Math.min(30, value));
    setCustomDiscountRate(clampedValue / 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cut': return '✂️';
      case 'color': return '🎨';
      case 'treatment': return '💆‍♀️';
      case 'straight': return '✨';
      default: return '💇‍♀️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">
          メニューを選択してください
        </h2>
        <p className="text-neutral-600 text-sm">
          複数選択可能です
        </p>
      </div>

      <div className="space-y-3">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className={`card cursor-pointer transition-all duration-200 hover:shadow-luxury ${
              selectedMenuIds.has(menu.id) 
                ? 'ring-2 ring-primary-500 bg-primary-50' 
                : 'hover:bg-neutral-50'
            }`}
            onClick={() => handleMenuToggle(menu.id)}
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedMenuIds.has(menu.id)}
                onChange={() => handleMenuToggle(menu.id)}
                className="checkbox-field"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(menu.category)}</span>
                    <h3 className="font-medium text-neutral-800">{menu.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800">
                      {formatPrice(menu.basePrice)}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>所要時間: {menu.durationMin}分</span>
                  <span>目安: {menu.defaultIntervalMonth}ヶ月後</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 割引率設定エリア */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <span className="text-blue-600 mr-2">💰</span>
          次回予約特典割引設定
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm text-blue-700">
            「今次回予約のお客様には○％割引させていただいています」
          </p>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">割引率:</span>
              <input
                type="number"
                min="0"
                max="30"
                step="1"
                value={Math.round(customDiscountRate * 100)}
                onChange={handleDiscountChange}
                className="w-20 px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center"
                placeholder="0"
              />
              <span className="text-sm text-blue-800">%</span>
            </label>
          </div>
          
          {customDiscountRate > 0 && (
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>お客様への説明:</strong><br />
                「今次回予約のお客様には{formatDiscountRate(customDiscountRate)}割引させていただいています」
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedMenus.length > 0 && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-800 flex items-center">
              <span className="text-primary-600 mr-2">📋</span>
              選択内容
            </h3>
            
            <div className="space-y-2">
              {selectedMenus.map(menu => (
                <div key={menu.id} className="flex justify-between text-sm">
                  <span>{menu.name}</span>
                  <span>{formatPrice(menu.basePrice)}</span>
                </div>
              ))}
            </div>
            
            <hr className="border-primary-200" />
            
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>小計</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              
              {customDiscountRate > 0 && (
                <>
                  <div className="flex justify-between text-sm text-primary-600">
                    <span>次回予約割引 ({formatDiscountRate(customDiscountRate)})</span>
                    <span>-{formatPrice(totalAmount - discountedAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary-700">
                    <span>合計</span>
                    <span>{formatPrice(discountedAmount)}</span>
                  </div>
                </>
              )}
              
              {customDiscountRate === 0 && (
                <div className="flex justify-between font-bold text-lg">
                  <span>合計</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={selectedMenus.length === 0}
        className={`w-full py-4 rounded-xl font-medium text-white transition-all duration-200 ${
          selectedMenus.length > 0
            ? 'btn-primary shadow-luxury'
            : 'bg-neutral-300 cursor-not-allowed'
        }`}
      >
        {selectedMenus.length > 0 ? '日時を選択する' : 'メニューを選択してください'}
      </button>
    </div>
  );
};

export default MenuSelection; 