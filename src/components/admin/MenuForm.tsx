import React, { useState, useEffect } from 'react';
import { FirebaseMenu } from '../../types';

interface MenuFormProps {
  menu: FirebaseMenu | null;
  shopId: string;
  onSubmit: (menuData: any) => Promise<void>;
  onCancel?: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ menu, shopId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    basePrice: 0,
    defaultDiscount: 0,
    defaultIntervalMonth: 1,
    durationMin: 30,
    category: 'other' as 'cut' | 'color' | 'straight' | 'treatment' | 'other'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既存メニューデータがある場合はフォームに設定
  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        basePrice: menu.basePrice,
        defaultDiscount: menu.defaultDiscount,
        defaultIntervalMonth: menu.defaultIntervalMonth,
        durationMin: menu.durationMin,
        category: menu.category
      });
    }
  }, [menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 MenuForm: Form submission started');
    console.log('📋 MenuForm: Current form data =', formData);
    console.log('🏪 MenuForm: Shop ID =', shopId);
    console.log('✏️ MenuForm: Is editing =', !!menu);
    
    setLoading(true);
    setError(null);

    try {
      // フォームデータの検証
      if (!formData.name.trim()) {
        throw new Error('メニュー名を入力してください');
      }
      
      if (formData.basePrice <= 0) {
        throw new Error('基本料金は0より大きい値を入力してください');
      }
      
      if (formData.durationMin <= 0) {
        throw new Error('所要時間は0より大きい値を入力してください');
      }
      
      console.log('✅ MenuForm: Validation passed');
      
      const submitData = {
        ...formData,
        shopId,
        isActive: true
      };
      
      console.log('🚀 MenuForm: Calling onSubmit with data =', submitData);
      
      await onSubmit(submitData);
      
      console.log('🎉 MenuForm: onSubmit completed successfully');
      
      if (!menu) {
        // 新規作成時はフォームをリセット
        console.log('🔄 MenuForm: Resetting form for new entry');
        setFormData({
          name: '',
          basePrice: 0,
          defaultDiscount: 0,
          defaultIntervalMonth: 1,
          durationMin: 30,
          category: 'other'
        });
      }
    } catch (error: any) {
      console.error('💥 MenuForm: Error during submission:', error);
      console.error('💥 MenuForm: Error message:', error.message);
      console.error('💥 MenuForm: Error code:', error.code);
      
      setError(error.message || '保存中にエラーが発生しました');
    } finally {
      setLoading(false);
      console.log('🏁 MenuForm: Form submission completed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const categoryOptions = [
    { value: 'cut', label: 'カット' },
    { value: 'color', label: 'カラー' },
    { value: 'straight', label: 'ストレート・矯正' },
    { value: 'treatment', label: 'トリートメント' },
    { value: 'other', label: 'その他' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            メニュー名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="例: カット"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリー <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            id="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
            基本料金（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="basePrice"
            id="basePrice"
            required
            min="0"
            value={formData.basePrice}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="例: 5500"
          />
        </div>

        <div>
          <label htmlFor="durationMin" className="block text-sm font-medium text-gray-700 mb-1">
            所要時間（分） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="durationMin"
            id="durationMin"
            required
            min="10"
            step="10"
            value={formData.durationMin}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="例: 60"
          />
        </div>

        <div>
          <label htmlFor="defaultDiscount" className="block text-sm font-medium text-gray-700 mb-1">
            デフォルト割引率（%）
          </label>
          <input
            type="number"
            name="defaultDiscount"
            id="defaultDiscount"
            min="0"
            max="50"
            value={formData.defaultDiscount}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="例: 10"
          />
        </div>

        <div>
          <label htmlFor="defaultIntervalMonth" className="block text-sm font-medium text-gray-700 mb-1">
            推奨来店間隔（月） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="defaultIntervalMonth"
            id="defaultIntervalMonth"
            required
            min="1"
            max="12"
            value={formData.defaultIntervalMonth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="例: 2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : (menu ? '更新する' : '追加する')}
        </button>
      </div>
    </form>
  );
};

export default MenuForm; 