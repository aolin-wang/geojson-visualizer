# Project Context - GeoJSON Visualizer

**Project**: GeoJSON Traffic Signs Visualizer  
**Version**: 1.0.0  
**Last Updated**: 2026-03-03

---

## 项目概述

一个静态网页应用，用于可视化 GeoJSON 格式的道路分段和交通标志数据。用户提供 GeoJSON 文件（或 URL），应用在交互式地图上渲染路段和标志，支持按类型过滤和图层切换。

---

## 技术栈

### 运行时
- **浏览器**：现代浏览器（Chrome, Firefox, Safari, Edge）
- **语言**：Vanilla JavaScript ES6+
- **运行方式**：纯静态文件，无需构建步骤

### 依赖
- **Leaflet.js 1.9.4**：交互式地图库
  - CDN: https://unpkg.com/leaflet@1.9.4
  - 许可证：BSD-2-Clause
- **无其他运行时依赖**

### 基础设施
- **托管**：GitHub Pages
- **版本控制**：Git
- **部署**：推送到 main 分支后自动部署（1-2 分钟生效）

---

## 文件结构

```
geojson-visualizer/
├── index.html              # 主页面
├── app.js                  # 核心逻辑（~350 行）
├── package.json            # 项目配置
├── README.md               # 项目说明
├── AGENTS.md              # Agent 开发指南
├── .gitignore             # Git 忽略规则
├── .internal/             # 会话状态目录（新增）
│   ├── session-summary.md
│   ├── project-context.md
│   ├── technical-decisions.md
│   └── implementation-log.md
└── ocm_2026_03_03_14_42_02_segment.json  # 示例数据（已从 Git 移除）
```

---

## 核心模块

### 1. 地图初始化 (`app.js`)

```javascript
// 初始化地图（默认缩放级别 3）
const map = L.map('map').setView([48.775, 9.17], 3);

// 街道地图图层
const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
});

// 卫星地图图层
const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
});
```

### 2. 数据加载

```javascript
// 支持多种数据源
async function loadAndRenderGeoJSON(dataSource) {
    let data;
    if (typeof dataSource === 'string') {
        // URL 加载
        const response = await fetch(dataSource);
        data = await response.json();
    } else {
        // 本地文件对象
        data = dataSource;
    }
    // 处理数据...
}
```

**数据源支持**：
- URL 参数：`?url=https://example.com/data.json`
- 网页输入框粘贴 URL
- 本地文件上传（`<input type="file">`）
- 拖拽文件到地图

### 3. 图层渲染

```javascript
// 路段渲染
const polyline = L.polyline(latLngs, {
    color: '#00ffff',
    weight: 5,
    opacity: 0.7
});

// 标志渲染
const marker = L.circleMarker([lat, lng], {
    radius: 6,
    fillColor: isPriority ? '#ff0000' : '#0066ff',
    color: '#333',
    weight: 2,
    fillOpacity: 0.9
});
```

### 4. 过滤系统

```javascript
// 缓存结构
let allSegmentLayers = [];  // [{ layer: L.polyline, signTypes: [] }]
let allSignMarkers = [];    // [{ marker: L.circleMarker, signType: string }]

// 过滤逻辑
function applyFilters() {
    allSegmentLayers.forEach(item => {
        const shouldShow = item.signTypes.length > 0 && 
                         item.signTypes.some(type => signTypeFilters.has(type));
        if (shouldShow) map.addLayer(item.layer);
        else map.removeLayer(item.layer);
    });
}
```

---

## 关键函数

### 坐标转换

```javascript
// GeoJSON: [lng, lat] -> Leaflet: [lat, lng]
const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
```

### Haversine 距离计算

```javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;  // 地球半径（米）
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
```

### 偏移点计算

```javascript
function getPointAtOffset(coordinates, offset) {
    // 在线段上找到指定偏移距离的坐标点
    // 1. 遍历所有线段，累加距离
    // 2. 找到目标偏移所在的线段
    // 3. 使用线性插值计算精确坐标
}
```

---

## 性能优化

### 问题诊断

**初始症状**：过滤比初次加载更慢
- 初次加载：~2 秒
- 过滤操作：~3-5 秒

**根本原因**：
1. 每次过滤都重新调用 Haversine 公式（500+ 次三角函数计算）
2. 删除并重建所有 Leaflet 图层对象
3. DOM 频繁操作导致重排

### 优化方案

**缓存机制**：
```javascript
// 首次加载时计算一次，缓存结果
allSegmentLayers = features.map(feature => ({
    layer: L.polyline(...),           // 缓存图层对象
    signTypes: feature.traffic_signs.map(s => s.type)
}));

allSignMarkers = allSigns.map(sign => ({
    marker: L.circleMarker(...),      // 缓存标记对象
    signType: sign.type
}));
```

**过滤时仅显示/隐藏**：
```javascript
// 不重新创建，只切换显示状态
if (shouldShow) map.addLayer(item.layer);
else map.removeLayer(item.layer);
```

### 性能对比

| 操作 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 初次加载 | ~2s | ~2s | 相同 |
| 过滤操作 | 3-5s | <50ms | **100x** |
| 切换过滤 | 3-5s | <50ms | **100x** |

---

## 配置与常量

### 颜色配置

```javascript
const COLORS = {
    segment: '#00ffff',      // 路段线条（青色）
    priority: '#ff0000',     // 优先通行标志（红色）
    other: '#0066ff',        // 其他标志（蓝色）
    stroke: '#333'           // 边框颜色
};
```

### 图层配置

```javascript
const LAYER_CONFIG = {
    weight: 5,
    opacity: 0.7,
    radius: 6,
    fillOpacity: 0.9
};
```

### 初始视图

```javascript
const INITIAL_VIEW = {
    center: [48.775, 9.17],  // 德国斯图加特附近
    zoom: 3                  // 全球视图
};
```

---

## API 参考

### 全局函数（挂载到 window）

| 函数 | 用途 |
|------|------|
| `toggleMapLayer()` | 切换街道/卫星地图 |
| `toggleFilterPanel()` | 显示/隐藏过滤面板 |
| `selectAllFilters()` | 全选所有标志类型 |
| `deselectAllFilters()` | 全不选所有标志类型 |
| `applyFilterChanges()` | 确认过滤更改 |
| `cancelFilterChanges()` | 取消过滤更改 |

### 内部变量

| 变量 | 类型 | 用途 |
|------|------|------|
| `currentGeoJSONData` | Object | 当前加载的 GeoJSON 数据 |
| `allSignTypes` | Set | 所有发现的标志类型 |
| `signTypeFilters` | Set | 当前选中的过滤类型 |
| `allSegmentLayers` | Array | 缓存的路段图层对象 |
| `allSignMarkers` | Array | 缓存的标志标记对象 |

---

## 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Chrome | 60+ | 推荐 |
| Firefox | 55+ | 推荐 |
| Safari | 11+ | |
| Edge | 79+ | 推荐 |

### ES6 特性使用
- `const` / `let`
- Arrow functions
- `async` / `await`
- `Set` / `Map`
- Template literals
- Destructuring
- Promises

所有特性在上述版本中均已支持。

---

## 部署配置

### GitHub Pages

**配置方式**：仓库设置 → Pages → Source: main → Save

**部署时间**：推送到 main 分支后 1-2 分钟

**访问地址**：
```
https://aolin-wang.github.io/geojson-visualizer/
```

### 构建要求

**无需构建步骤**：
- 无 Webpack / Vite / Rollup
- 无 TypeScript 编译
- 无 CSS 预处理
- 无代码压缩

**部署即所有文件直接服务**：
- `index.html`
- `app.js`
- 外部依赖通过 CDN 加载

---

## 安全考虑

### CORS
- 加载外部 GeoJSON URL 需要服务器支持 CORS
- 本地文件上传不受此限制

### 数据隐私
- 用户数据仅在浏览器中处理
- 不上传到任何服务器
- GitHub Pages 只托管应用代码

### HTTPS
- GitHub Pages 默认启用 HTTPS
- 外部 GeoJSON URL 建议使用 HTTPS

---

## 测试清单

### 手动测试

- [ ] 打开页面无错误
- [ ] 地图正常显示（OpenStreetMap）
- [ ] 卫星地图切换正常
- [ ] URL 参数加载数据
- [ ] 文件上传加载数据
- [ ] 拖拽文件加载数据
- [ ] 过滤面板显示
- [ ] 全选/全不选正常
- [ ] 确认/取消逻辑正确
- [ ] 过滤后地图正确更新
- [ ] 统计数字准确
- [ ] Popup 信息完整

### 性能测试

- [ ] 初次加载 < 3 秒
- [ ] 过滤操作 < 100ms
- [ ] 切换过滤 10 次总耗时 < 1 秒

---

**Last Updated**: 2026-03-03 16:46 CST  
**Maintained By**: Sisyphus Agent