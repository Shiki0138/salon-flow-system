import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useShop, useMenus, useSystemAdminMenus, copySystemAdminMenusToNewShop } from '../hooks/useFirestore';
import ShopForm from './admin/ShopForm';
import MenuForm from './admin/MenuForm';
import MenuList from './admin/MenuList';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { shop, loading: shopLoading, createShop, updateShop } = useShop(user?.uid || '');
  const { menus, loading: menusLoading, error: menusError, addMenu, updateMenu, deleteMenu, updateMenuOrder } = useMenus(shop?.id || '');
  const { menus: systemAdminMenus, loading: systemAdminMenusLoading } = useSystemAdminMenus();
  
  const [activeTab, setActiveTab] = useState<'shop' | 'menus' | 'analytics'>('shop');
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  // 新規ユーザー（shop未登録）の場合はシステム管理者のメニューを表示
  const isNewUser = !shop;
  const displayMenus = isNewUser ? systemAdminMenus : menus;

  // システム管理者の判定
  const isSystemAdmin = user?.email === 'greenroom51@gmail.com';

  // デバッグ情報
  useEffect(() => {
    console.log('🔍 AdminDashboard state:', {
      user: user?.uid,
      shop: shop,
      menusCount: menus.length,
      menusLoading,
      menusError
    });
  }, [user, shop, menus, menusLoading, menusError]);

  const handleAddMenu = async (menuData: any) => {
    console.log('🚀 handleAddMenu: Starting menu addition process');
    console.log('📥 handleAddMenu: Received data =', menuData);
    setSubmitResult(null);
    
    try {
      // より厳密な検証
      if (!user) {
        throw new Error('ユーザー認証が必要です。ログインし直してください。');
      }

      if (!shop) {
        throw new Error('店舗情報が見つかりません。先に店舗情報を登録してください。');
      }

      if (!shop.id) {
        throw new Error('店舗IDが取得できません。店舗情報を再登録してください。');
      }

      console.log('🔐 handleAddMenu: Authentication check passed');
      console.log('🏪 handleAddMenu: Shop ID =', shop.id);
      console.log('👤 handleAddMenu: User ID =', user.uid);
      console.log('📧 handleAddMenu: User email =', user.email);
      console.log('🔧 handleAddMenu: Original menu data =', menuData);
      
      // データの検証を強化
      if (!menuData.name || typeof menuData.name !== 'string' || menuData.name.trim() === '') {
        throw new Error('メニュー名が正しく入力されていません。');
      }
      
      if (!menuData.basePrice || typeof menuData.basePrice !== 'number' || menuData.basePrice <= 0) {
        throw new Error('基本料金が正しく入力されていません。正の数値を入力してください。');
      }

      if (!menuData.durationMin || typeof menuData.durationMin !== 'number' || menuData.durationMin <= 0) {
        throw new Error('所要時間が正しく入力されていません。正の数値を入力してください。');
      }

      if (!menuData.category || typeof menuData.category !== 'string') {
        throw new Error('カテゴリーが正しく選択されていません。');
      }

      if (typeof menuData.defaultDiscount !== 'number' || menuData.defaultDiscount < 0) {
        throw new Error('割引率が正しく入力されていません。0以上の数値を入力してください。');
      }

      if (!menuData.defaultIntervalMonth || typeof menuData.defaultIntervalMonth !== 'number' || menuData.defaultIntervalMonth <= 0) {
        throw new Error('推奨来店間隔が正しく入力されていません。正の数値を入力してください。');
      }

      console.log('✅ handleAddMenu: Data validation passed');

      // 最終的なメニューデータを構築
      const finalMenuData = {
        shopId: shop.id,
        name: menuData.name.trim(),
        basePrice: Number(menuData.basePrice),
        defaultDiscount: Number(menuData.defaultDiscount),
        defaultIntervalMonth: Number(menuData.defaultIntervalMonth),
        durationMin: Number(menuData.durationMin),
        category: menuData.category,
        isActive: true,
        sortOrder: 0 // addMenuで適切な値に設定される
      };
      
      console.log('📋 handleAddMenu: Final data to send =', finalMenuData);
      console.log('🔍 handleAddMenu: Data types check:');
      console.log('  - shopId:', typeof finalMenuData.shopId, finalMenuData.shopId);
      console.log('  - name:', typeof finalMenuData.name, finalMenuData.name);
      console.log('  - basePrice:', typeof finalMenuData.basePrice, finalMenuData.basePrice);
      console.log('  - category:', typeof finalMenuData.category, finalMenuData.category);
      
      setSubmitResult('⏳ メニューを追加中...');
      
      const newMenuId = await addMenu(finalMenuData);
      
      console.log('🎉 handleAddMenu: Menu addition successful! ID =', newMenuId);
      setSubmitResult('✅ メニューが正常に追加されました！（ID: ' + newMenuId + '）');
      
      // 5秒後にメッセージを消す
      setTimeout(() => setSubmitResult(null), 5000);
      
    } catch (error: any) {
      console.error('💥 handleAddMenu: Error occurred:', error);
      console.error('💥 handleAddMenu: Error name:', error.name);
      console.error('💥 handleAddMenu: Error message:', error.message);
      console.error('💥 handleAddMenu: Error code:', error.code);
      console.error('💥 handleAddMenu: Error stack:', error.stack);
      
      let errorMessage = error.message || 'メニュー追加中に不明なエラーが発生しました';
      
      // Firebase固有のエラーコードをチェック
      if (error.code === 'permission-denied') {
        errorMessage = '権限エラー: Firestoreへの書き込み権限がありません。ログインし直してください。';
      } else if (error.code === 'unavailable') {
        errorMessage = 'ネットワークエラー: インターネット接続を確認してください。';
      } else if (error.code === 'unauthenticated') {
        errorMessage = '認証エラー: ログインセッションが切れています。再ログインしてください。';
      }
      
      const finalErrorMessage = `❌ ${errorMessage}`;
      setSubmitResult(finalErrorMessage);
      console.error('📢 handleAddMenu: Showing error to user:', finalErrorMessage);
      
      // エラーアラートも表示
      alert(finalErrorMessage);
    }
  };

  const handleMoveUp = async (menuId: string) => {
    const currentIndex = menus.findIndex(m => m.id === menuId);
    if (currentIndex <= 0) return;

    const currentMenu = menus[currentIndex];
    const previousMenu = menus[currentIndex - 1];

    // sortOrderがundefinedの場合は0として扱う
    const currentSort = typeof currentMenu.sortOrder === 'number' ? currentMenu.sortOrder : 0;
    const prevSort = typeof previousMenu.sortOrder === 'number' ? previousMenu.sortOrder : 0;

    await updateMenuOrder(currentMenu.id!, prevSort);
    await updateMenuOrder(previousMenu.id!, currentSort);
  };

  const handleMoveDown = async (menuId: string) => {
    const currentIndex = menus.findIndex(m => m.id === menuId);
    if (currentIndex >= menus.length - 1) return;

    const currentMenu = menus[currentIndex];
    const nextMenu = menus[currentIndex + 1];

    // sortOrderがundefinedの場合は0として扱う
    const currentSort = typeof currentMenu.sortOrder === 'number' ? currentMenu.sortOrder : 0;
    const nextSort = typeof nextMenu.sortOrder === 'number' ? nextMenu.sortOrder : 0;

    await updateMenuOrder(currentMenu.id!, nextSort);
    await updateMenuOrder(nextMenu.id!, currentSort);
  };

  // sortOrder一括リセット用バッチ
  const resetSortOrder = async () => {
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      if (menu.id) {
        await updateMenu(menu.id, { sortOrder: i + 1 });
      }
    }
    alert('全メニューのsortOrderをリセットしました。画面をリロードしてください。');
  };

  // 店舗作成処理（メニューコピー付き）
  const handleCreateShop = async (shopData: any) => {
    try {
      setSubmitResult('⏳ 店舗情報を登録中...');
      
      // 店舗を作成
      const newShopId = await createShop(shopData);
      
      setSubmitResult('⏳ デフォルトメニューを設定中...');
      
      // システム管理者のメニューを新規店舗にコピー
      await copySystemAdminMenusToNewShop(newShopId);
      
      setSubmitResult('✅ 店舗情報とメニューが正常に登録されました！');
      
      // 5秒後にメッセージを消す
      setTimeout(() => setSubmitResult(null), 5000);
      
    } catch (error: any) {
      console.error('店舗作成エラー:', error);
      const errorMessage = `❌ 店舗作成に失敗しました: ${error.message}`;
      setSubmitResult(errorMessage);
    }
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理画面</h1>
          <p className="text-gray-600">店舗情報とメニューを管理できます</p>
          
          {/* デバッグ情報 */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 利用統計カード */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-xl">👤</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">ログインユーザー</p>
                    <p className="text-lg font-semibold text-gray-900">{user ? '1名' : '0名'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">🏪</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">登録店舗</p>
                    <p className="text-lg font-semibold text-gray-900">{shop ? '1店舗' : '0店舗'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">📋</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">登録メニュー</p>
                    <p className="text-lg font-semibold text-gray-900">{menus.length}件</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-yellow-600 text-xl">📊</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">システム状態</p>
                    <p className="text-lg font-semibold text-gray-900">{shop && menus.length > 0 ? '運用中' : '設定中'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 結果メッセージ */}
        {submitResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            submitResult.startsWith('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {submitResult}
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('shop')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'shop'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              店舗情報
            </button>
            <button
              onClick={() => setActiveTab('menus')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'menus'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              メニュー管理
            </button>
            {isSystemAdmin && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                利用分析
              </button>
            )}
          </nav>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'shop' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {shop ? '店舗情報の編集' : '店舗情報の登録'}
            </h2>
            <ShopForm
              shop={shop}
              onSubmit={shop ? updateShop : handleCreateShop}
              ownerId={user?.uid || ''}
            />
          </div>
        )}

        {activeTab === 'menus' && (
          <div className="space-y-6">
            {!shop ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  メニューを管理するには、まず店舗情報を登録してください。
                </p>
              </div>
            ) : (
              <>
                {/* メニュー追加/編集フォーム */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {editingMenu ? 'メニューの編集' : '新しいメニューの追加'}
                  </h2>
                  <MenuForm
                    menu={editingMenu}
                    shopId={shop.id!}
                    onSubmit={async (menuData) => {
                      if (editingMenu) {
                        await updateMenu(editingMenu.id, menuData);
                        setEditingMenu(null);
                        setSubmitResult('✅ メニューが正常に更新されました！');
                      } else {
                        await handleAddMenu(menuData);
                      }
                    }}
                    onCancel={() => setEditingMenu(null)}
                  />
                </div>

                {/* メニュー一覧 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    メニュー一覧
                  </h2>
                  {isNewUser && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-blue-900 font-medium mb-2">📋 デフォルトメニュー表示中</h3>
                      <p className="text-blue-700 text-sm">
                        システム管理者が設定した標準メニューを表示しています。<br/>
                        店舗情報を登録すると、これらのメニューが自動的にあなたの店舗用にコピーされ、<br/>
                        予約システムのステップ1/4と完全に一致したメニューとして管理・編集できるようになります。<br/>
                        先に「店舗情報」タブから店舗の登録を行ってください。
                      </p>
                    </div>
                  )}
                  {!isNewUser && (
                    <button onClick={resetSortOrder} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">並び替えリセット</button>
                  )}
                  {(menusLoading || (isNewUser && systemAdminMenusLoading)) ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">メニューを読み込み中...</p>
                    </div>
                  ) : menusError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600">{menusError}</p>
                    </div>
                  ) : (
                    <MenuList
                      menus={displayMenus}
                      onEdit={isNewUser ? () => alert('店舗情報を先に登録してください') : setEditingMenu}
                      onDelete={isNewUser ? async (_menuId: string) => {
                        alert('店舗情報を先に登録してください');
                      } : async (menuId) => {
                        await deleteMenu(menuId);
                        setSubmitResult('✅ メニューが正常に削除されました！');
                      }}
                      onMoveUp={isNewUser ? async (_menuId: string) => {
                        alert('店舗情報を先に登録してください');
                      } : handleMoveUp}
                      onMoveDown={isNewUser ? async (_menuId: string) => {
                        alert('店舗情報を先に登録してください');
                      } : handleMoveDown}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {isSystemAdmin ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 利用状況分析</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Firebase Console */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <span className="text-orange-500 mr-2">🔥</span>
                      Firebase Console
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Firebase管理画面で詳細な利用状況を確認できます
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://console.firebase.google.com/project/salonflow-80rsi/authentication/users"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        👤 ユーザー管理（認証済みユーザー一覧）
                      </a>
                      <a
                        href="https://console.firebase.google.com/project/salonflow-80rsi/firestore/databases/-default-/data"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        💾 データベース（店舗・メニューデータ）
                      </a>
                      <a
                        href="https://console.firebase.google.com/project/salonflow-80rsi/hosting"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        🌐 ホスティング（アクセス状況）
                      </a>
                    </div>
                  </div>

                  {/* Google Analytics */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <span className="text-blue-500 mr-2">📈</span>
                      Google Analytics
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      詳細なアクセス分析とユーザー行動を確認
                    </p>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-700 font-medium">Firebase Analytics が有効化されました</p>
                        <p className="text-xs text-blue-600 mt-1">
                          24時間後からFirebase Consoleで分析データが確認できます
                        </p>
                      </div>
                      <a
                        href="https://console.firebase.google.com/project/salonflow-80rsi/analytics"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        📊 Analytics Dashboard
                      </a>
                    </div>
                  </div>
                </div>

                {/* 利用状況サマリー */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">📋 現在の利用状況</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{user ? 1 : 0}</div>
                      <div className="text-sm text-gray-600">ログイン美容師</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{shop ? 1 : 0}</div>
                      <div className="text-sm text-gray-600">登録店舗</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{menus.length}</div>
                      <div className="text-sm text-gray-600">メニュー数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{shop && menus.length > 0 ? '◯' : '△'}</div>
                      <div className="text-sm text-gray-600">サービス状態</div>
                    </div>
                  </div>
                </div>

                {/* 取得可能な情報 */}
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">📈 取得可能な分析データ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">🔐 Firebase Authentication</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• ログインユーザー数</li>
                        <li>• 新規登録日時</li>
                        <li>• 最終ログイン日時</li>
                        <li>• 認証方法（Google）</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">💾 Firestore Database</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 店舗登録数</li>
                        <li>• メニュー作成数</li>
                        <li>• データ更新頻度</li>
                        <li>• データベース使用量</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">🌐 Hosting & Analytics</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• ページビュー数</li>
                        <li>• ユニークユーザー数</li>
                        <li>• 滞在時間</li>
                        <li>• 地域別アクセス</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">📱 User Behavior</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 予約フロー完了率</li>
                        <li>• QRコード生成数</li>
                        <li>• 人気メニューランキング</li>
                        <li>• デバイス種別</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ユーザー管理機能 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="text-red-500 mr-2">🔒</span>
                    ユーザー管理・アクセス制御
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ユーザーの削除やアクセス権限の管理
                  </p>
                  <div className="space-y-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ 現在の設定</h4>
                      <p className="text-sm text-yellow-700">
                        <strong>一般公開モード：</strong> Googleアカウントを持つ誰でもログイン可能
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <h4 className="font-medium text-red-800 mb-2">🔐 許可制モードに変更</h4>
                      <p className="text-sm text-red-700 mb-2">
                        特定のメールアドレスのみログイン許可する設定に変更できます
                      </p>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const confirmed = confirm('許可制モードに変更しますか？\n\n変更後は事前に登録されたメールアドレスのみがログイン可能になります。\n現在ログイン中の未許可ユーザーは自動的にログアウトされます。');
                            if (confirmed) {
                              alert('📋 実装手順:\n\n1. Firebase Console → Authentication → Settings\n2. "Authorized domains" で許可ドメインを制限\n3. または、Firestore rules で許可メールアドレスをホワイトリスト管理\n\n詳細は利用分析タブの「アクセス制御設定」をご確認ください。');
                            }
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          🔒 許可制モードに変更
                        </button>
                        <a
                          href="https://console.firebase.google.com/project/salonflow-80rsi/authentication/users"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                        >
                          🗑️ Firebase Console でユーザー削除
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* アクセス制御設定 */}
                <div className="mt-6 border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-900 mb-3">🔐 アクセス制御設定（許可制モード）</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-md p-3 border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">📋 許可制モード移行手順</h4>
                      <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                        <li><strong>ユーザー削除：</strong> Firebase Console → Authentication → Users で不要なユーザーを削除</li>
                        <li><strong>ルール変更：</strong> firestore.rules ファイルで許可メールアドレスを設定</li>
                        <li><strong>デプロイ：</strong> firebase deploy --only firestore:rules で設定を反映</li>
                        <li><strong>確認：</strong> 許可されていないユーザーのアクセスが拒否されることを確認</li>
                      </ol>
                    </div>

                    <div className="bg-white rounded-md p-3 border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">🛠️ 実装例</h4>
                      <div className="text-sm text-red-700">
                        <p className="mb-2"><strong>firestore.rules の変更：</strong></p>
                        <div className="bg-gray-100 p-2 rounded font-mono text-xs overflow-x-auto">
{`// 現在のルールをコメントアウト
/*
match /shops/{shopId} {
  allow read: if true;
  allow write: if request.auth != null;
}
*/

// 許可制ルールを有効化
match /shops/{shopId} {
  allow read, write: if isAuthorizedUser();
}`}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-md p-3 border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">📧 許可ユーザー追加方法</h4>
                      <div className="text-sm text-red-700 space-y-1">
                        <p>firestore.rules の isAuthorizedUser() 関数にメールアドレスを追加：</p>
                        <div className="bg-gray-100 p-2 rounded font-mono text-xs">
{`request.auth.token.email == 'user1@example.com' ||
request.auth.token.email == 'user2@example.com'`}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-md p-3 border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">⚡ 即座に実行可能な操作</h4>
                      <div className="space-y-2">
                        <a
                          href="https://console.firebase.google.com/project/salonflow-80rsi/authentication/users"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                        >
                          🗑️ ユーザー削除（Firebase Console）
                        </a>
                        <button
                          onClick={() => {
                            const email = prompt('許可するメールアドレスを入力してください:');
                            if (email) {
                              alert(`📝 以下を firestore.rules に追加してください:\n\nrequest.auth.token.email == '${email}' ||\n\n追加後、firebase deploy --only firestore:rules でデプロイしてください。`);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          ➕ 許可ユーザー追加
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-red-600 text-2xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">アクセス権限が必要です</h3>
                  <p className="text-gray-600 mb-4">
                    この機能はシステム管理者のみが利用できます。<br/>
                    greenroom51@gmail.com でログインしてください。
                  </p>
                  <p className="text-sm text-gray-500">
                    現在のアカウント: {user?.email}
                  </p>
                </div>
              </div>
            )}

            {/* システム管理者向け詳細情報 */}
            {isSystemAdmin && (
              <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">📈 利用状況詳細</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>ユーザー:</strong> {user?.email} ({user?.uid})</p>
                      <p><strong>認証状態:</strong> {user ? '✅ ログイン済み' : '❌ 未ログイン'}</p>
                      <p><strong>店舗:</strong> {shop ? `${shop.name} (ID: ${shop.id})` : '❌ 未登録'}</p>
                    </div>
                    <div>
                      <p><strong>メニュー数:</strong> {menus.length}件 {menusLoading ? '(読み込み中...)' : ''}</p>
                      <p><strong>メニュー読み込み状態:</strong> {menusLoading ? '🔄 読み込み中' : '✅ 完了'}</p>
                      <p><strong>サービス URL:</strong> <a href="https://salonflow-80rsi.web.app" target="_blank" className="text-blue-600 hover:underline">https://salonflow-80rsi.web.app</a></p>
                    </div>
                  </div>
                  {menusError && <p className="text-red-600 mt-2"><strong>メニューエラー:</strong> {menusError}</p>}
                  {!shop && <p className="text-yellow-600 mt-2"><strong>⚠️ メニュー追加には店舗情報の登録が必要です</strong></p>}
                  {shop && !user && <p className="text-red-600 mt-2"><strong>⚠️ メニュー追加にはログインが必要です</strong></p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 