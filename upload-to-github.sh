#!/bin/bash

# GitHub 文件上传脚本
# 使用说明：./upload-to-github.sh <GITHUB_TOKEN>

GITHUB_TOKEN="$1"
REPO="aolin-wang/geojson-visualizer"
BRANCH="main"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "错误：需要提供 GitHub Personal Access Token"
    echo "使用方法：./upload-to-github.sh YOUR_TOKEN"
    echo ""
    echo "如何获取 token："
    echo "1. 访问：https://github.com/settings/tokens/new"
    echo "2. Note: geojson-upload"
    echo "3. Expiration: 7 days"
    echo "4. 勾选：repo (Full control of private repositories)"
    echo "5. 点击 Generate token"
    echo "6. 复制 token 并运行：./upload-to-github.sh YOUR_TOKEN"
    exit 1
fi

echo "📦 准备上传文件到 GitHub..."

# 上传文件函数
upload_file() {
    local file="$1"
    local path="$2"
    
    echo "⬆️  上传: $file"
    
    # 读取文件内容并转为 base64
    content=$(base64 -i "$file" | tr -d '\n')
    
    # 创建 JSON payload
    json=$(cat <<EOF
{
  "message": "Add $file",
  "content": "$content",
  "branch": "$BRANCH"
}
EOF
)
    
    # 上传到 GitHub
    response=$(curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "$json" \
        "https://api.github.com/repos/$REPO/contents/$path")
    
    if echo "$response" | grep -q "content"; then
        echo "   ✅ 成功"
    else
        echo "   ❌ 失败"
        echo "$response" | grep "message"
    fi
}

# 上传所有文件
cd /Users/almomenta/Documents/05_tools/geojson

upload_file "index.html" "index.html"
upload_file "app.js" "app.js"
upload_file "README.md" "README.md"
upload_file "package.json" "package.json"
upload_file "ocm_2026_03_03_14_42_02_segment.json" "ocm_2026_03_03_14_42_02_segment.json"

echo ""
echo "✅ 上传完成！"
echo "🌐 访问仓库：https://github.com/$REPO"
