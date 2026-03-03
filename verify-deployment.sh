#!/bin/bash

echo "🔍 GitHub Pages 部署验证工具"
echo "================================"
echo ""

SITE_URL="https://aolin-wang.github.io/geojson-visualizer/"
REPO_URL="https://github.com/aolin-wang/geojson-visualizer"

echo "📍 检查网站状态..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 网站已上线！"
    echo ""
    echo "🌐 访问地址："
    echo "   $SITE_URL"
    echo ""
    echo "📊 正在检查关键文件..."
    
    # 检查 HTML
    if curl -s "$SITE_URL" | grep -q "GeoJSON 可视化"; then
        echo "   ✅ index.html 加载正常"
    else
        echo "   ⚠️  index.html 可能有问题"
    fi
    
    # 检查 JS
    if curl -s "${SITE_URL}app.js" | grep -q "loadAndRenderGeoJSON"; then
        echo "   ✅ app.js 加载正常"
    else
        echo "   ⚠️  app.js 可能有问题"
    fi
    
    # 检查 GeoJSON
    JSON_SIZE=$(curl -s -I "${SITE_URL}ocm_2026_03_03_14_42_02_segment.json" | grep -i content-length | awk '{print $2}' | tr -d '\r')
    if [ -n "$JSON_SIZE" ] && [ "$JSON_SIZE" -gt 1000000 ]; then
        echo "   ✅ GeoJSON 数据文件加载正常 ($(echo "scale=1; $JSON_SIZE/1024/1024" | bc)MB)"
    else
        echo "   ⚠️  GeoJSON 数据文件可能有问题"
    fi
    
    echo ""
    echo "🎉 部署成功！分享这个链接给任何人："
    echo "   $SITE_URL"
    
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ 网站未上线 (404)"
    echo ""
    echo "📝 请完成以下步骤："
    echo ""
    echo "1. 访问设置页面："
    echo "   ${REPO_URL}/settings/pages"
    echo ""
    echo "2. 在 'Source' 下拉菜单："
    echo "   - Branch: main"
    echo "   - Folder: / (root)"
    echo ""
    echo "3. 点击 'Save' 按钮"
    echo ""
    echo "4. 等待 1-2 分钟后重新运行此脚本："
    echo "   ./verify-deployment.sh"
    echo ""
    
else
    echo "⚠️  未知状态 (HTTP $HTTP_CODE)"
    echo ""
    echo "可能原因："
    echo "- GitHub Pages 正在构建中（等待 1-2 分钟后重试）"
    echo "- 网络连接问题"
    echo "- GitHub 服务暂时不可用"
fi

echo ""
echo "================================"
