#!/bin/bash

# GitHub リポジトリ連携セットアップスクリプト
echo "🚀 SalonFlow GitHub自動デプロイ設定"
echo "=================================="

# GitHubリポジトリURL入力
echo "📝 GitHubリポジトリのURLを入力してください:"
echo "例: https://github.com/username/salon-flow-system.git"
read -p "リポジトリURL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ リポジトリURLが入力されていません"
    exit 1
fi

echo "🔗 リモートリポジトリを設定中..."
git remote add origin "$REPO_URL"

echo "🌟 ブランチ名をmainに変更..."
git branch -M main

echo "⬆️ 初回プッシュを実行..."
git push -u origin main

echo ""
echo "✅ GitHubリポジトリ設定完了!"
echo ""
echo "🔑 次に必要な設定:"
echo "1. Firebase Console でService Accountキーをダウンロード"
echo "   👉 https://console.firebase.google.com/project/salonflow-80rsi/settings/serviceaccounts/adminsdk"
echo ""
echo "2. GitHubリポジトリのSecrets設定:"
echo "   - リポジトリ → Settings → Secrets and variables → Actions"
echo "   - New repository secret で以下を追加:"
echo "   - Name: FIREBASE_SERVICE_ACCOUNT_SALONFLOW_80RSI"
echo "   - Value: ダウンロードしたJSONファイルの内容全体"
echo ""
echo "3. 設定完了後、次回のgit pushで自動デプロイが開始されます 🎉"
echo "   👉 https://salonflow-80rsi.web.app" 