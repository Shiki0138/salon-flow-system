import React from 'react';
import { ReservationDetails } from '../types';
import { formatPrice, formatDiscountRate } from '../utils/pricing';
import { formatDateJapanese } from '../utils/calendar';

interface PriceConfirmationProps {
  reservation: ReservationDetails;
  shopName: string;
  onConfirm: () => void;
  onBack: () => void;
}

const PriceConfirmation: React.FC<PriceConfirmationProps> = ({
  reservation,
  shopName,
  onConfirm,
  onBack
}) => {
  const {
    selectedMenus,
    appointmentDate,
    startTime,
    endTime,
    totalAmount,
    discountedAmount,
    discountRate
  } = reservation;

  const totalDuration = selectedMenus.reduce((total, menu) => total + menu.durationMin, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">
          予約内容を確認してください
        </h2>
        <p className="text-neutral-600 text-sm">
          内容に間違いがなければ確定してください
        </p>
      </div>

      {/* 店舗情報 */}
      <div className="card bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-800 mb-2 flex items-center">
          <span className="text-primary-600 mr-2">🏪</span>
          {shopName}
        </h3>
        <p className="text-sm text-primary-700">
          次回予約のご確認
        </p>
      </div>

      {/* 予約詳細 */}
      <div className="card space-y-4">
        {/* 日時 */}
        <div>
          <h4 className="font-medium text-neutral-800 mb-2 flex items-center">
            <span className="text-primary-600 mr-2">📅</span>
            来店日時
          </h4>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="font-medium text-neutral-800">
              {formatDateJapanese(appointmentDate)}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {startTime} - {endTime} （約{totalDuration}分）
            </p>
          </div>
        </div>

        {/* メニュー */}
        <div>
          <h4 className="font-medium text-neutral-800 mb-2 flex items-center">
            <span className="text-primary-600 mr-2">💇‍♀️</span>
            施術内容
          </h4>
          <div className="space-y-2">
            {selectedMenus.map((menu) => (
              <div key={menu.id} className="bg-neutral-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-neutral-800">{menu.name}</p>
                    <p className="text-sm text-neutral-600">
                      所要時間: {menu.durationMin}分
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-800">
                      {formatPrice(menu.basePrice)}
                    </p>
                    {menu.defaultDiscount > 0 && (
                      <p className="text-xs text-primary-600">
                        割引: {formatDiscountRate(menu.defaultDiscount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 料金詳細 */}
        <div>
          <h4 className="font-medium text-neutral-800 mb-2 flex items-center">
            <span className="text-primary-600 mr-2">💰</span>
            料金詳細
          </h4>
          <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>小計</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            
            {discountRate > 0 && (
              <>
                <div className="flex justify-between text-primary-600">
                  <span>次回予約割引 ({formatDiscountRate(discountRate)})</span>
                  <span>-{formatPrice(totalAmount - discountedAmount)}</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex justify-between font-bold text-lg text-primary-700">
                  <span>合計金額</span>
                  <span>{formatPrice(discountedAmount)}</span>
                </div>
              </>
            )}
            
            {discountRate === 0 && (
              <div className="flex justify-between font-bold text-lg">
                <span>合計金額</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 特典情報 */}
      {discountRate > 0 && (
        <div className="card bg-green-50 border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            <span className="mr-2">🎁</span>
            次回予約特典
          </h4>
          <p className="text-sm text-green-700">
            今回ご予約いただくと、{formatDiscountRate(discountRate)}の割引が適用されます！
          </p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
          <span className="mr-2">📝</span>
          ご確認事項
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• この後表示されるQRコードをスマートフォンでスキャンしてください</li>
          <li>• カレンダーに予約が自動で登録されます</li>
          <li>• 変更・キャンセルはお電話でお願いします</li>
        </ul>
      </div>

      {/* ボタン */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 btn-secondary"
        >
          日時を変更
        </button>
        
        <button
          onClick={onConfirm}
          className="flex-1 btn-primary shadow-luxury"
        >
          予約を確定する
        </button>
      </div>
    </div>
  );
};

export default PriceConfirmation; 