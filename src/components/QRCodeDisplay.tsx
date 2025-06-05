import React, { useState, useEffect } from 'react';
import { ReservationDetails } from '../types';
import { generateQRCode, generateDetailedQRCode, generateICSFile } from '../utils/calendar';
import { formatPrice, formatDiscountRate } from '../utils/pricing';

interface QRCodeDisplayProps {
  reservation: ReservationDetails;
  shopName: string;
  shopAddress: string;
  onBack: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  reservation,
  shopName,
  shopAddress,
  onBack
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [detailedQrCodeUrl, setDetailedQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [qrMode, setQrMode] = useState<'simple' | 'detailed'>('simple');
  const [couponCode] = useState<string>(() => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // 両方のQRコードを生成
        const [simpleQR, detailedQR] = await Promise.all([
          generateQRCode(reservation, shopName, shopAddress),
          generateDetailedQRCode(reservation, shopName, shopAddress)
        ]);
        
        setQrCodeUrl(simpleQR);
        setDetailedQrCodeUrl(detailedQR);
      } catch (err) {
        console.error('QRコード生成エラー:', err);
        setError('QRコードの生成に失敗しました。もう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [reservation, shopName, shopAddress]);

  const menuNames = reservation.selectedMenus.map(menu => menu.name).join(', ');

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${shopName}_予約QR_${couponCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadICS = () => {
    try {
      const icsContent = generateICSFile(reservation, shopName, shopAddress);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${shopName}_予約_${couponCode}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ICSファイル生成エラー:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            QRコードを生成中...
          </h2>
          <p className="text-neutral-600 text-sm">
            しばらくお待ちください
          </p>
        </div>
        
        <div className="card text-center py-12">
          <div className="animate-pulse-soft">
            <div className="w-32 h-32 bg-neutral-200 rounded-lg mx-auto mb-4"></div>
            <p className="text-neutral-500">生成中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-neutral-600 text-sm">
            {error}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 btn-secondary"
          >
            戻る
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex-1 btn-primary"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 成功メッセージ */}
      <div className="text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-semibold text-green-600 mb-2">
          予約が完了しました！
        </h2>
        <p className="text-neutral-600 text-sm">
          下のQRコードをスキャンしてカレンダーに登録してください
        </p>
      </div>

      {/* QRコード */}
      <div className="card text-center bg-gradient-to-br from-white to-primary-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-800">
            📱 スマートフォンでスキャン
          </h3>
          
          {/* QRコード種類切り替え */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setQrMode('simple')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                qrMode === 'simple' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              読み取りやすい
            </button>
            <button
              onClick={() => setQrMode('detailed')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                qrMode === 'detailed' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              詳細情報付き
            </button>
          </div>
        </div>
        
        {/* QRコード表示 */}
        {(qrCodeUrl || detailedQrCodeUrl) && (
          <div className="inline-block p-6 bg-white rounded-xl shadow-sm mb-4">
            <img 
              src={qrMode === 'simple' ? qrCodeUrl : detailedQrCodeUrl} 
              alt="予約QRコード" 
              className="w-64 h-64 mx-auto block"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}
        
        {/* 読み取りガイド */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">📖 読み取りのコツ</h4>
          <div className="text-sm text-blue-700 space-y-1">
            {qrMode === 'simple' ? (
              <>
                <p>✅ <strong>読み取りやすい大きなQRコード</strong></p>
                <p>🎯 基本的な予約情報のみ（推奨）</p>
                <p>📱 古いスマートフォンでも確実に読み取れます</p>
              </>
            ) : (
              <>
                <p>📋 <strong>詳細情報付きQRコード</strong></p>
                <p>💰 料金・リマインダー設定案内付き</p>
                <p>📱 新しいスマートフォン推奨</p>
              </>
            )}
            <p className="mt-2 text-blue-600">
              💡 読み取れない場合は「読み取りやすい」に切り替えてください
            </p>
          </div>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4">
          QRコードをスキャンするとGoogle Calendarで予約が登録できます
        </p>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleDownloadQR}
            className="btn-secondary"
          >
            QRコードを保存
          </button>
          
          <button
            onClick={handleDownloadICS}
            className="btn-secondary text-sm"
          >
            カレンダーファイル(.ics)をダウンロード
          </button>
        </div>
      </div>

      {/* 予約詳細サマリー */}
      <div className="card bg-neutral-50">
        <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
          <span className="text-primary-600 mr-2">📋</span>
          予約詳細
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>施術内容:</span>
            <span className="font-medium">{menuNames}</span>
          </div>
          
          <div className="flex justify-between">
            <span>合計金額:</span>
            <span className="font-bold text-primary-600">
              {formatPrice(reservation.discountedAmount)}
            </span>
          </div>
          
          {reservation.discountRate > 0 && (
            <div className="flex justify-between text-primary-600">
              <span>適用割引:</span>
              <span>{formatDiscountRate(reservation.discountRate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* クーポン */}
      <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
          <span className="mr-2">🎫</span>
          次回来店特典クーポン
        </h3>
        
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-yellow-300">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600 mb-2">
              {couponCode}
            </p>
            <p className="text-sm text-yellow-700">
              次回来店時にご提示ください
            </p>
          </div>
        </div>
        
        <p className="text-xs text-yellow-600 mt-2 text-center">
          ※有効期限: 6ヶ月間
        </p>
      </div>

      {/* 使い方ガイド */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-800 mb-3 flex items-center">
          <span className="mr-2">📱</span>
          カレンダー登録方法
        </h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">方法1: QRコードスキャン</h4>
            <ol className="text-sm text-blue-700 space-y-1 ml-4">
              <li>1. 上のQRコードをスマートフォンのカメラでスキャン</li>
              <li>2. Google Calendarが開きます</li>
              <li>3. 「保存」をタップして完了</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-1">方法2: ファイルダウンロード</h4>
            <ol className="text-sm text-blue-700 space-y-1 ml-4">
              <li>1. 「カレンダーファイル(.ics)をダウンロード」をタップ</li>
              <li>2. ダウンロードしたファイルを開く</li>
              <li>3. カレンダーアプリで「追加」を選択</li>
            </ol>
          </div>
          
          <div className="bg-blue-100 p-2 rounded text-xs text-blue-600">
            ※リマインダーは手動で3日前に設定してください
          </div>
        </div>
      </div>

      {/* フッターボタン */}
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full btn-primary shadow-luxury"
        >
          新しい予約を作成
        </button>
        
        <button
          onClick={onBack}
          className="w-full btn-secondary"
        >
          予約内容を確認
        </button>
      </div>

      {/* 店舗情報 */}
      <div className="text-center text-sm text-neutral-500 pt-4 border-t border-neutral-200">
        <p className="font-medium">{shopName}</p>
        <p>{shopAddress}</p>
        <p className="mt-2">
          お問い合わせ・変更・キャンセルはお電話でお願いします
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay; 