# SalonFlow - 美容院予約システム

🎯 **美容院向けの次回予約獲得システム** - お客様の施術後に次回予約をその場で作成し、リピート率向上を支援するPWAシステムです。

## 🌐 本番環境
**https://salonflow-80rsi.web.app**

## ✨ 主な機能

### 📱 予約作成システム
- **ステップ1/4**: メニュー選択（複数選択可能）
- **ステップ2/4**: 日時選択（自動推奨日付設定）
- **ステップ3/4**: 内容確認（料金・時間・詳細）
- **ステップ4/4**: QRコード生成（Google Calendar/ICS対応）

### 🏪 管理画面
- **店舗情報管理**: 住所・電話番号・営業時間等
- **メニュー管理**: 料金・時間・カテゴリ・並び順
- **利用分析**: Firebase Analytics連携

### 🔧 システム機能
- **PWA対応**: オフライン動作・ホーム画面追加可能
- **レスポンシブ**: モバイル・タブレット・PC対応
- **リアルタイム同期**: Firebase Firestore使用
- **認証システム**: Google認証統合

## 🚀 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (高速ビルド・HMR)
- **Tailwind CSS** (スタイリング)
- **PWA Vite Plugin** (Service Worker)

### バックエンド
- **Firebase Authentication** (Google認証)
- **Firebase Firestore** (リアルタイムDB)
- **Firebase Hosting** (静的サイトホスティング)
- **Firebase Analytics** (利用状況分析)

### 開発・デプロイ
- **GitHub Actions** (CI/CD)
- **自動デプロイ**: mainブランチpush時
- **プレビューデプロイ**: PR作成時

## 📦 ローカル開発

### 前提条件
- Node.js 18以上
- Firebase CLI
- Git

### セットアップ
```bash
# リポジトリクローン
git clone <repository-url>
cd reserve-system

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Firebase デプロイ
firebase deploy
```

### 環境設定
```bash
# Firebase プロジェクトと関連付け
firebase use salonflow-80rsi

# Firebase設定確認
firebase projects:list
```

## 🔄 自動デプロイ

### GitHub Actions 設定済み
- **mainブランチpush** → 本番環境自動デプロイ
- **PR作成** → プレビュー環境自動作成

### Firebase Service Account 設定
GitHubリポジトリに以下のSecretを設定：
- `FIREBASE_SERVICE_ACCOUNT_SALONFLOW_80RSI`

## 📊 システム管理

### 管理者機能 (greenroom51@gmail.com)
- **利用分析**: Firebase Console直接リンク
- **ユーザー管理**: 認証済みユーザー一覧
- **アクセス制御**: 許可制モード切り替え
- **デバッグ情報**: 詳細なシステム状態表示

### データ構造
```
/shops/{shopId}
- name: string
- address: string
- phone: string
- businessHours: string
- ownerId: string

/menus/{menuId}
- shopId: string
- name: string
- basePrice: number
- durationMin: number
- category: string
- sortOrder: number
- isActive: boolean
```

## 🔐 セキュリティ

### Firebase Rules
- **認証必須**: 管理機能は要ログイン
- **オーナー制限**: 自分の店舗データのみ編集可能
- **読み取り許可**: 予約システムは認証不要

### アクセス制御
- **一般公開モード**: Googleアカウントでログイン可能
- **許可制モード**: 事前登録メールアドレスのみ

## 🌟 特徴

### UX設計
- **ワンタップ操作**: 最小クリックで予約完了
- **自動計算**: 推奨来店日・終了時刻・割引適用
- **視覚的フィードバック**: プログレスバー・アニメーション

### 業務効率化
- **即座の予約**: 施術後その場で次回予約確保
- **メニュー連動**: 管理画面と予約画面完全同期
- **自動コピー**: 新規店舗にデフォルトメニュー設定

### 拡張性
- **マルチテナント**: 複数店舗対応設計
- **カスタマイズ**: メニュー・価格・時間自由設定
- **分析機能**: Firebase Analytics統合

## 📱 PWA機能

### インストール
- ホーム画面に追加可能
- アプリライクな操作感
- オフライン時基本機能利用可能

### パフォーマンス
- キャッシュ戦略最適化
- 高速初回読み込み
- バックグラウンド更新

## 🆕 最新アップデート

### v1.0 (2024年)
- ✅ 予約システム完全連動
- ✅ 自動メニューコピー機能
- ✅ GitHub Actions CI/CD
- ✅ システム管理者機能
- ✅ PWA対応完了

## 📞 サポート

### 開発者
- Email: greenroom51@gmail.com
- Firebase Project: salonflow-80rsi

### リソース
- [Firebase Console](https://console.firebase.google.com/project/salonflow-80rsi)
- [GitHub Repository](link-to-repo)
- [本番環境](https://salonflow-80rsi.web.app)

---

**© 2024 SalonFlow - 美容院向け次回予約獲得システム**

 