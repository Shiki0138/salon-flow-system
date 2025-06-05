import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseShop, FirebaseMenu } from '../types';

export const useShop = (ownerId: string) => {
  const [shop, setShop] = useState<FirebaseShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) return;

    const q = query(
      collection(db, 'shops'),
      where('ownerId', '==', ownerId)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        if (!snapshot.empty) {
          const shopData = snapshot.docs[0];
          setShop({
            id: shopData.id,
            ...shopData.data(),
            createdAt: shopData.data().createdAt?.toDate(),
            updatedAt: shopData.data().updatedAt?.toDate()
          } as FirebaseShop);
        } else {
          setShop(null);
        }
        setLoading(false);
      },
      (error) => {
        setError('店舗データの取得に失敗しました: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ownerId]);

  const createShop = async (shopData: Omit<FirebaseShop, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'shops'), {
        ...shopData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error: any) {
      setError('店舗の作成に失敗しました: ' + error.message);
      throw error;
    }
  };

  const updateShop = async (shopData: Partial<FirebaseShop>) => {
    if (!shop?.id) return;
    
    try {
      await updateDoc(doc(db, 'shops', shop.id), {
        ...shopData,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      setError('店舗の更新に失敗しました: ' + error.message);
      throw error;
    }
  };

  return {
    shop,
    loading,
    error,
    createShop,
    updateShop
  };
};

export const useMenus = (shopId: string) => {
  const [menus, setMenus] = useState<FirebaseMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useMenus: Effect triggered, shopId =', shopId);
    
    if (!shopId) {
      console.log('❌ useMenus: No shopId provided, setting loading to false');
      setLoading(false);
      return;
    }

    console.log('🔍 useMenus: Setting up Firestore query for shopId =', shopId);
    setLoading(true);
    setError(null);

    // より詳細なクエリログ
    const q = query(
      collection(db, 'menus'),
      where('shopId', '==', shopId),
      where('isActive', '==', true),
      orderBy('createdAt', 'asc')
    );
    
    console.log('📊 useMenus: Query created, starting onSnapshot listener');

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('📥 useMenus: Snapshot received');
        console.log('📊 useMenus: Snapshot size =', snapshot.size);
        console.log('📊 useMenus: Snapshot empty =', snapshot.empty);
        console.log('📊 useMenus: Snapshot metadata =', snapshot.metadata);
        
        const menuData = snapshot.docs.map(doc => {
          const data = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          } as FirebaseMenu;
          
          console.log('📄 useMenus: Processing document =', doc.id, data);
          return data;
        });
        
        // クライアントサイドでソート
        menuData.sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return (a.sortOrder || 0) - (b.sortOrder || 0);
          }
          return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
        });
        
        console.log('📋 useMenus: Final menu data after sorting =', menuData);
        console.log('🔢 useMenus: Total menus count =', menuData.length);
        
        setMenus(menuData);
        setLoading(false);
        setError(null);
        
        console.log('✅ useMenus: State updated successfully');
      },
      (error) => {
        console.error('❌ useMenus: Firestore error occurred:', error);
        console.error('❌ useMenus: Error code:', error.code);
        console.error('❌ useMenus: Error message:', error.message);
        console.error('❌ useMenus: Full error object:', error);
        
        let errorMessage = 'メニューデータの取得に失敗しました';
        if (error.code === 'permission-denied') {
          errorMessage += ': 読み取り権限がありません';
        } else if (error.code === 'unavailable') {
          errorMessage += ': ネットワークエラーです';
        } else {
          errorMessage += ': ' + error.message;
        }
        
        setError(errorMessage);
        setLoading(false);
        console.error('📢 useMenus: Error state set:', errorMessage);
      }
    );

    console.log('👂 useMenus: onSnapshot listener established');
    
    return () => {
      console.log('🔚 useMenus: Unsubscribing from Firestore listener');
      unsubscribe();
    };
  }, [shopId]);

  const addMenu = async (menuData: Omit<FirebaseMenu, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔥 addMenu: Starting with data =', menuData);
      
      // より詳細なバリデーション
      if (!menuData.shopId) {
        throw new Error('shopIdが必要です');
      }
      
      if (!menuData.name || menuData.name.trim() === '') {
        throw new Error('メニュー名が必要です');
      }
      
      if (!menuData.basePrice || menuData.basePrice <= 0) {
        throw new Error('基本料金は0より大きい値が必要です');
      }
      
      if (!menuData.durationMin || menuData.durationMin <= 0) {
        throw new Error('所要時間は0より大きい値が必要です');
      }
      
      if (!menuData.category) {
        throw new Error('カテゴリーが必要です');
      }
      
      console.log('🔍 addMenu: Validation passed');
      
      // 次のソート順を取得（メニューがない場合は1から開始）
      const maxSortOrder = menus.length > 0 ? Math.max(...menus.map(m => m.sortOrder || 0)) : 0;
      
      const newMenuData = {
        ...menuData,
        sortOrder: maxSortOrder + 1,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('📝 addMenu: Creating menu with final data =', newMenuData);
      console.log('🏪 addMenu: shopId =', newMenuData.shopId);
      console.log('📊 addMenu: sortOrder =', newMenuData.sortOrder);
      
      // Firestoreへの追加を実行
      const docRef = await addDoc(collection(db, 'menus'), newMenuData);
      
      console.log('✅ addMenu: Successfully created with ID =', docRef.id);
      console.log('🔄 addMenu: Current menus count =', menus.length);
      
      return docRef.id;
    } catch (error: any) {
      console.error('❌ addMenu: Error occurred:', error);
      console.error('❌ addMenu: Error code:', error.code);
      console.error('❌ addMenu: Error message:', error.message);
      console.error('❌ addMenu: Full error object:', error);
      
      // より詳細なエラーメッセージ
      let errorMessage = 'メニューの追加に失敗しました';
      if (error.code === 'permission-denied') {
        errorMessage += ': 権限がありません。ログインし直してください。';
      } else if (error.code === 'unavailable') {
        errorMessage += ': ネットワークエラーです。接続を確認してください。';
      } else {
        errorMessage += ': ' + error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateMenu = async (menuId: string, menuData: Partial<FirebaseMenu>) => {
    try {
      await updateDoc(doc(db, 'menus', menuId), {
        ...menuData,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      setError('メニューの更新に失敗しました: ' + error.message);
      throw error;
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
      // 論理削除（isActiveをfalseに）
      await updateDoc(doc(db, 'menus', menuId), {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      setError('メニューの削除に失敗しました: ' + error.message);
      throw error;
    }
  };

  const updateMenuOrder = async (menuId: string, newSortOrder: number) => {
    try {
      await updateDoc(doc(db, 'menus', menuId), {
        sortOrder: newSortOrder,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      setError('メニューの順序更新に失敗しました: ' + error.message);
      throw error;
    }
  };

  return {
    menus,
    loading,
    error,
    addMenu,
    updateMenu,
    deleteMenu,
    updateMenuOrder
  };
};

// 公開用メニューデータ取得（認証不要）
export const usePublicMenus = (shopId: string) => {
  const [menus, setMenus] = useState<FirebaseMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    // シンプルなクエリに変更
    const q = query(
      collection(db, 'menus'),
      where('shopId', '==', shopId),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const menuData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as FirebaseMenu[];
        
        // クライアントサイドでソート
        menuData.sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return (a.sortOrder || 0) - (b.sortOrder || 0);
          }
          return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
        });
        
        setMenus(menuData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError('メニューデータの取得に失敗しました: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [shopId]);

  return {
    menus,
    loading,
    error
  };
};

// 公開用店舗データ取得（認証不要）
export const usePublicShop = () => {
  const [shop, setShop] = useState<FirebaseShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 最初の店舗データを取得（通常は1つの店舗のみ想定）
    const q = query(
      collection(db, 'shops'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        if (!snapshot.empty) {
          const shopData = snapshot.docs[0]; // 最初の店舗を取得
          setShop({
            id: shopData.id,
            ...shopData.data(),
            createdAt: shopData.data().createdAt?.toDate(),
            updatedAt: shopData.data().updatedAt?.toDate()
          } as FirebaseShop);
        } else {
          setShop(null);
        }
        setLoading(false);
      },
      (error) => {
        setError('店舗データの取得に失敗しました: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    shop,
    loading,
    error
  };
};

// システム管理者のメニューデータ取得（新規ユーザー向けデフォルト表示用）
export const useSystemAdminMenus = () => {
  const [menus, setMenus] = useState<FirebaseMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 最初の店舗のメニューを取得（システム管理者の店舗と仮定）
    const shopsQuery = query(
      collection(db, 'shops'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(shopsQuery, 
      (shopsSnapshot) => {
        if (!shopsSnapshot.empty) {
          const systemShop = shopsSnapshot.docs[0];
          const systemShopId = systemShop.id;
          
          // システム管理者の店舗のメニューを取得
          const menusQuery = query(
            collection(db, 'menus'),
            where('shopId', '==', systemShopId),
            where('isActive', '==', true),
            orderBy('sortOrder', 'asc')
          );

          const menusUnsubscribe = onSnapshot(menusQuery,
            (menusSnapshot) => {
              const menuData = menusSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
              })) as FirebaseMenu[];
              
              setMenus(menuData);
              setLoading(false);
              setError(null);
            },
            (error) => {
              setError('システム管理者のメニューデータの取得に失敗しました: ' + error.message);
              setLoading(false);
            }
          );

          return menusUnsubscribe;
        } else {
          setMenus([]);
          setLoading(false);
        }
      },
      (error) => {
        setError('システム管理者の店舗データの取得に失敗しました: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    menus,
    loading,
    error
  };
};

// システム管理者のメニューを新規店舗用にコピーする関数
export const copySystemAdminMenusToNewShop = async (newShopId: string): Promise<void> => {
  try {
    // システム管理者の店舗（最初の店舗）を取得
    const shopsQuery = query(
      collection(db, 'shops'),
      orderBy('createdAt', 'asc')
    );
    
    const shopsSnapshot = await getDocs(shopsQuery);

    if (shopsSnapshot.empty) {
      console.log('システム管理者の店舗が見つかりません');
      return;
    }

    const systemShop = shopsSnapshot.docs[0];
    const systemShopId = systemShop.id;

    // システム管理者のメニューを取得
    const menusQuery = query(
      collection(db, 'menus'),
      where('shopId', '==', systemShopId),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    );

    const menusSnapshot = await getDocs(menusQuery);

    if (menusSnapshot.empty) {
      console.log('システム管理者のメニューが見つかりません');
      return;
    }

    // システム管理者のメニューを新規店舗用にコピー
    const copyPromises = menusSnapshot.docs.map(async (doc: any) => {
      const originalMenu = doc.data();
      const newMenuData = {
        shopId: newShopId, // 新しい店舗IDに変更
        name: originalMenu.name,
        basePrice: originalMenu.basePrice,
        defaultDiscount: originalMenu.defaultDiscount,
        defaultIntervalMonth: originalMenu.defaultIntervalMonth,
        durationMin: originalMenu.durationMin,
        category: originalMenu.category,
        isActive: true,
        sortOrder: originalMenu.sortOrder,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      return addDoc(collection(db, 'menus'), newMenuData);
    });

    await Promise.all(copyPromises);
    console.log(`${copyPromises.length}件のメニューを新規店舗にコピーしました`);

  } catch (error: any) {
    console.error('システム管理者メニューのコピーに失敗:', error);
    throw new Error('デフォルトメニューの設定に失敗しました: ' + error.message);
  }
}; 