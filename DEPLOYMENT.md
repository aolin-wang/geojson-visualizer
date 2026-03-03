# 🚀 部署到 GitHub Pages - 完整指南

## 当前状态
- ✅ 代码已准备好
- ✅ GitHub 仓库已创建：https://github.com/aolin-wang/geojson-visualizer
- ⏳ 需要上传文件到 GitHub

---

## 方式 1：使用上传脚本（推荐 - 自动化）

### 步骤 1：获取 GitHub Token

1. 访问：https://github.com/settings/tokens/new
2. 填写：
   - **Note**: `geojson-upload`
   - **Expiration**: 7 days
   - **勾选权限**: `repo` (Full control of private repositories)
3. 点击绿色按钮 **"Generate token"**
4. **复制 token**（格式：`ghp_xxxxxxxxxxxx`）

### 步骤 2：运行上传脚本

在终端执行：

```bash
cd /Users/almomenta/Documents/05_tools/geojson
./upload-to-github.sh YOUR_TOKEN_HERE
```

将 `YOUR_TOKEN_HERE` 替换为你刚才复制的 token。

### 步骤 3：开启 GitHub Pages

1. 访问：https://github.com/aolin-wang/geojson-visualizer/settings/pages
2. 在 **"Source"** 下拉菜单选择：`main` 分支
3. 点击 **"Save"**
4. 等待 1-2 分钟，刷新页面
5. 你会看到网址：`https://aolin-wang.github.io/geojson-visualizer/`

---

## 方式 2：手动上传（最简单 - 无需 token）

### 步骤 1：上传文件

1. 访问：https://github.com/aolin-wang/geojson-visualizer
2. 点击 **"uploading an existing file"** 或 **"Add file" → "Upload files"**
3. 拖拽以下文件到页面：
   ```
   /Users/almomenta/Documents/05_tools/geojson/index.html
   /Users/almomenta/Documents/05_tools/geojson/app.js
   /Users/almomenta/Documents/05_tools/geojson/ocm_2026_03_03_14_42_02_segment.json
   /Users/almomenta/Documents/05_tools/geojson/README.md
   /Users/almomenta/Documents/05_tools/geojson/package.json
   ```
4. 在页面底部填写提交信息：`Add GeoJSON visualization files`
5. 点击 **"Commit changes"**

### 步骤 2：开启 GitHub Pages

1. 访问：https://github.com/aolin-wang/geojson-visualizer/settings/pages
2. 在 **"Source"** 下拉菜单选择：`main` 分支
3. 点击 **"Save"**
4. 等待 1-2 分钟，刷新页面
5. 你会看到网址：`https://aolin-wang.github.io/geojson-visualizer/`

---

## 最终访问地址

部署成功后，网站地址：

```
https://aolin-wang.github.io/geojson-visualizer/
```

分享这个链接给任何人，他们都可以直接访问！

---

## 文件位置

所有文件都在：
```
/Users/almomenta/Documents/05_tools/geojson/
```

- `index.html` - 主页面
- `app.js` - 应用逻辑
- `ocm_2026_03_03_14_42_02_segment.json` - 数据文件（2.3MB）
- `README.md` - 项目说明
- `package.json` - 项目配置
- `upload-to-github.sh` - 上传脚本（方式 1 使用）

---

## 故障排查

### 网站显示 404
- 检查 GitHub Pages 是否已开启
- 确认分支选择的是 `main`
- 等待 2-3 分钟让 GitHub 完成部署

### 地图不显示
- 打开浏览器开发者工具（F12）
- 查看 Console 是否有错误
- 确认所有文件都已上传

### 交通标志不显示
- 确认 `ocm_2026_03_03_14_42_02_segment.json` 已上传完整（2.3MB）
- 检查浏览器 Network 标签，看文件是否加载成功

---

选择一个方式完成上传，然后开启 GitHub Pages，就大功告成了！🎉
