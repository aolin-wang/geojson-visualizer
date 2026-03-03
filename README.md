# GeoJSON 可视化工具

交互式地图可视化工具，用于展示道路分段和交通标志数据。

## 功能

- 📍 加载并渲染 GeoJSON LineString 几何数据
- 🚦 根据 offset 精确定位交通标志
- 🎨 颜色区分标志类型（红色=优先通行，蓝色=其他）
- 📊 实时数据统计
- 💬 交互式信息弹窗

## 在线访问

🌐 **[点击访问在线版本](#)** _(部署后更新此链接)_

## 本地运行

```bash
# 启动服务器
npm start

# 访问
http://localhost:8080
```

## 技术栈

- Vanilla JavaScript (ES6+)
- Leaflet.js 地图库
- HTML5 / CSS3
- GeoJSON 数据格式

## 数据统计

- 路段数量：2484
- 交通标志：509
- 优先通行标志：10
- 其他标志类型：499

## License

MIT
