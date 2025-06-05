import React from 'react';
import { FirebaseMenu } from '../../types';

interface MenuListProps {
  menus: FirebaseMenu[];
  onEdit: (menu: FirebaseMenu) => void;
  onDelete: (menuId: string) => Promise<void>;
  onMoveUp?: (menuId: string) => Promise<void>;
  onMoveDown?: (menuId: string) => Promise<void>;
}

const MenuList: React.FC<MenuListProps> = ({ menus, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  if (menus.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <p className="text-gray-500">まだメニューが登録されていません</p>
        <p className="text-gray-400 text-sm">上のフォームから新しいメニューを追加してください</p>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      cut: 'カット',
      color: 'カラー',
      straight: 'ストレート・矯正',
      treatment: 'トリートメント',
      other: 'その他'
    };
    return labels[category] || 'その他';
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}時間${mins}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else {
      return `${mins}分`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              順序
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              メニュー名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              カテゴリー
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              料金
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              所要時間
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              推奨間隔
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              割引率
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {menus.map((menu, index) => (
            <tr key={menu.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm font-medium text-gray-900">#{menu.sortOrder || index + 1}</span>
                  {onMoveUp && onMoveDown && (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => onMoveUp(menu.id!)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="上に移動"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => onMoveDown(menu.id!)}
                        disabled={index === menus.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="下に移動"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{menu.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getCategoryLabel(menu.category)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPrice(menu.basePrice)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDuration(menu.durationMin)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {menu.defaultIntervalMonth}ヶ月
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {menu.defaultDiscount}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(menu)}
                    className="text-purple-600 hover:text-purple-900 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => onDelete(menu.id!)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MenuList; 