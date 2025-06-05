#!/bin/bash

# 🚀 SalonFlow クイックデプロイスクリプト

echo "🔥 SalonFlow デプロイ開始"
echo "========================"

# 変更をコミット
echo "📝 変更をコミット中..."
if [ -n "$(git status --porcelain)" ]; then
    read -p "コミットメッセージを入力してください: " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="🚀 アップデート: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git add .
    git commit -m "$commit_message"
    echo "✅ コミット完了: $commit_message"
else
    echo "📄 変更なし - 既存のコミットをデプロイ"
fi

# mainブランチにプッシュ
echo "⬆️ GitHub にプッシュ中..."
git push origin main

echo ""
echo "🎉 プッシュ完了!"
echo "📊 GitHub Actions の実行状況:"
echo "   👉 https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/.git$//')/actions"
echo ""
echo "⏱️ 2-3分後に本番環境が更新されます:"
echo "   👉 https://salonflow-80rsi.web.app"
echo ""
echo "🔥 Firebase Console:"
echo "   👉 https://console.firebase.google.com/project/salonflow-80rsi/hosting" 