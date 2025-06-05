import React, { useState, useEffect } from 'react';
import { FirebaseShop } from '../../types';

interface ShopFormProps {
  shop: FirebaseShop | null;
  onSubmit: (shopData: any) => Promise<any>;
  ownerId: string;
}

const ShopForm: React.FC<ShopFormProps> = ({ shop, onSubmit, ownerId }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    businessHours: '',
    lastOrder: '',
    holiday: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既存店舗データがある場合のみフォームに設定（新規の場合は空のまま）
  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || '',
        address: shop.address || '',
        phone: shop.phone || '',
        businessHours: shop.businessHours || '',
        lastOrder: shop.lastOrder || '',
        holiday: shop.holiday || ''
      });
    } else {
      // 新規ユーザーの場合は空のまま（placeholderでサンプル表示）
      setFormData({
        name: '',
        address: '',
        phone: '',
        businessHours: '',
        lastOrder: '',
        holiday: ''
      });
    }
  }, [shop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        ownerId
      });
      
      if (!shop) {
        // 新規作成時はフォームをリセット
        setFormData({ name: '', address: '', phone: '', businessHours: '', lastOrder: '', holiday: '' });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          店舗名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="例: サロン"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          住所 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          id="address"
          required
          value={formData.address}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="例: 東京都渋谷区神宮前1-1-1"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          required
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="例: 03-1234-5678"
        />
      </div>

      <div>
        <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700 mb-1">
          営業時間
        </label>
        <input
          type="text"
          name="businessHours"
          id="businessHours"
          value={formData.businessHours}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="例: 9:00-20:00"
        />
      </div>

      <div>
        <label htmlFor="lastOrder" className="block text-sm font-medium text-gray-700 mb-1">
          最終受付
        </label>
        <input
          type="text"
          name="lastOrder"
          id="lastOrder"
          value={formData.lastOrder}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="例: 19:00"
        />
      </div>

      <div>
        <label htmlFor="holiday" className="block text-sm font-medium text-gray-700 mb-1">
          定休日
        </label>
        <input
          type="text"
          name="holiday"
          id="holiday"
          value={formData.holiday}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="例: 毎週月曜日"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : (shop ? '更新する' : '登録する')}
        </button>
      </div>
    </form>
  );
};

export default ShopForm; 