# GeoJSON 可视化工具

交互式地图可视化工具，支持动态加载和展示道路分段与交通标志数据。

## ✨ 功能特性

- 📍 加载并渲染 GeoJSON LineString 几何数据
- 🚦 根据 offset 精确定位交通标志位置
- 🎨 颜色区分标志类型（红色=优先通行，蓝色=其他）
- 📊 实时数据统计面板
- 💬 交互式信息弹窗
- 📂 **支持多种数据加载方式**：
  - URL 参数加载
  - 在线 URL 输入
  - 本地文件上传
  - 拖拽文件到地图

## 🌐 在线访问

访问：**https://aolin-wang.github.io/geojson-visualizer/**

## 📖 使用方法

### 方式 1：URL 参数加载

在 URL 后添加 `?url=` 参数：

```
https://aolin-wang.github.io/geojson-visualizer/?url=https://example.com/data.json
```

### 方式 2：网页输入 URL

1. 打开网站
2. 在左上角输入框粘贴 GeoJSON 文件的 URL
3. 点击 "加载" 按钮

### 方式 3：上传本地文件

1. 打开网站
2. 点击 "📁 点击选择文件" 按钮
3. 选择本地的 `.json` 或 `.geojson` 文件

### 方式 4：拖拽文件

直接将 `.json` 或 `.geojson` 文件拖拽到地图区域

## 📦 GeoJSON 数据格式

工具支持以下 GeoJSON 结构：

```json
{
  "layers": [
    {
      "data": {
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [[lng, lat, alt], ...]
            },
            "properties": {
              "segment_id": "xxx",
              "length": 100,
              "traffic_signs": [
                {
                  "offset": 0,
                  "traffic_sign_type": "STOP_SIGN"
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
```

### 关键字段说明

- `geometry.coordinates`: 路段坐标数组 `[longitude, latitude, altitude]`
- `properties.traffic_signs`: 交通标志数组
- `properties.traffic_signs[].offset`: 标志距离路段起点的偏移量（米）
- `properties.traffic_signs[].traffic_sign_type`: 标志类型

## 🚀 本地开发

```bash
# 克隆仓库
git clone https://github.com/aolin-wang/geojson-visualizer.git
cd geojson-visualizer

# 启动本地服务器
npm start
# 或
python3 -m http.server 8080

# 访问
http://localhost:8080
```

## 🛠 技术栈

- **前端**: Vanilla JavaScript (ES6+)
- **地图库**: Leaflet.js 1.9.4
- **样式**: HTML5 / CSS3
- **数据格式**: GeoJSON

## 📝 示例数据

原始测试数据统计（已从仓库移除，避免大文件）：
- 路段数量：2484
- 交通标志：509
- 优先通行标志：10
- 其他标志类型：499

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
