# AGENTS.md

Agent guidelines for working with the GeoJSON Visualizer project.

---

## Project Overview

**Type**: Static web application for GeoJSON visualization  
**Tech Stack**: Vanilla JavaScript, Leaflet.js, HTML5, CSS3  
**Purpose**: Display road segments and traffic signs from GeoJSON data on an interactive map

**Key Features**:
- Load and render LineString geometries (road segments)
- Parse traffic_signs data and calculate point positions based on offset
- Color-coded traffic sign markers:
  - Red: `CROSSING_WITH_PRIORITY_FROM_THE_RIGHT`
  - Blue: All other sign types
- Real-time statistics display
- Interactive popups for segments and signs

---

## Project Structure

```
/
├── index.html                              # Main HTML page
├── app.js                                  # Application logic
├── package.json                            # Project metadata
├── ocm_2026_03_03_14_42_02_segment.json   # GeoJSON data source
├── .gitignore                              # Git ignore rules
└── AGENTS.md                               # This file
```

---

## Commands

### Development

```bash
# Start local development server (port 8080)
npm start
# or
npm run dev
# or
python3 -m http.server 8080
```

**Access**: Open `http://localhost:8080` in browser

### No Build Process

This is a static site with no build step. No transpilation, bundling, or compilation required.

---

## Code Style Guidelines

### General Principles

- **Zero dependencies**: Use vanilla JavaScript, no frameworks
- **Modern JS**: ES6+ features (async/await, arrow functions, destructuring)
- **Strict mode**: Always use `'use strict'`
- **Functional style**: Prefer pure functions, avoid side effects where possible

### JavaScript Conventions

**File Structure**:
- Wrap code in IIFE: `(async function() { ... })()`
- Top-level constants first, then function definitions, then execution

**Naming**:
- `camelCase` for variables and functions
- `UPPER_SNAKE_CASE` for constants (rare, only true constants)
- Descriptive names: `getPointAtOffset` not `getPt`

**Functions**:
- Keep functions small and focused
- Use JSDoc ONLY for complex algorithms (Haversine, geometric calculations)
- Arrow functions for callbacks: `features.forEach(feature => { ... })`
- Named functions for top-level logic: `function loadAndRenderGeoJSON() { ... }`

**Async/Await**:
- Prefer `async/await` over Promise chains
- Always use try-catch for async operations
- Use `fetch()` for loading JSON data

**Error Handling**:
- Try-catch blocks for async operations
- Log errors to console: `console.error('Message:', error)`
- Show user-friendly alerts for critical failures

**Comments**:
- **Minimize comments** - code should be self-explanatory
- ONLY comment for:
  - Complex algorithms (Haversine formula, interpolation)
  - Mathematical formulas
  - Non-obvious coordinate transformations
- Do NOT comment obvious operations ("initialize map", "loop through features")

### HTML/CSS Conventions

**HTML**:
- Semantic HTML5 tags
- `lang="zh-CN"` for Chinese interfaces
- External stylesheets via CDN for libraries (Leaflet)

**CSS**:
- Use CSS custom properties for colors (optional for small projects)
- BEM-like naming for custom classes: `.legend-item`, `.legend-color`
- Inline `<style>` tags acceptable for single-page apps
- Mobile-first: `box-sizing: border-box`, viewport meta tag

**Leaflet Integration**:
- Load Leaflet CSS before custom styles
- Use CDN: `unpkg.com/leaflet@1.9.4`
- Initialize map after DOM ready (or in async IIFE)

---

## GeoJSON Data Format

### Structure

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
              "segment_id": "377605259_4090_1_0_0",
              "segment_local_id": 4090,
              "length": 101,
              "traffic_signs": [
                {
                  "offset": 0,
                  "traffic_sign_type": "STOP_SIGN"
                }
              ],
              "segment_attrs": [...],
              "paint": {...}
            }
          }
        ]
      }
    }
  ],
  "meta": {...},
  "version": "..."
}
```

### Key Fields

- `geometry.coordinates`: Array of `[longitude, latitude, altitude]`
- `properties.traffic_signs`: Array of signs with `offset` (meters from segment start)
- `properties.length`: Segment length in meters
- `properties.segment_id`: Unique segment identifier

### Coordinate Systems

- **GeoJSON format**: `[longitude, latitude]` (x, y)
- **Leaflet format**: `[latitude, longitude]` (y, x)
- **Always convert** when passing to Leaflet: `[coord[1], coord[0]]`

---

## Core Algorithm: Offset Calculation

The `getPointAtOffset()` function calculates precise point coordinates along a LineString:

1. **Input**: LineString coordinates, offset in meters
2. **Process**:
   - Iterate through line segments
   - Calculate segment distances using Haversine formula
   - Find segment containing the offset point
   - Use linear interpolation to calculate exact coordinates
3. **Output**: `[longitude, latitude]` or `null`

**Haversine Distance**: Earth-surface distance between two lat/lng points (meters)

---

## Working with Traffic Signs

### Sign Rendering Logic

```javascript
if (properties.traffic_signs && properties.traffic_signs.length > 0) {
    properties.traffic_signs.forEach(sign => {
        const signPosition = getPointAtOffset(coordinates, sign.offset);
        const isPriority = sign.traffic_sign_type === 'CROSSING_WITH_PRIORITY_FROM_THE_RIGHT';
        const color = isPriority ? '#ff0000' : '#0066ff';
        
        L.circleMarker([signPosition[1], signPosition[0]], {
            radius: 6,
            fillColor: color,
            // ...
        }).addTo(map);
    });
}
```

### Sign Types Found in Data

- `YIELD`: 246 occurrences
- `PEDESTRIAN_CROSSING`: 82
- `SCHOOL_ZONE`: 76
- `STOP_SIGN`: 38
- `CROSSING_WITH_PRIORITY_FROM_THE_RIGHT`: 10 (render in red)
- Others: Various types (render in blue)

---

## Modification Guidelines

### Adding New Features

1. **Keep it simple**: No build tools, no npm packages
2. **Test in browser**: Use browser DevTools for debugging
3. **Maintain performance**: 2484 features with 509 traffic signs must load quickly
4. **Preserve existing patterns**: Follow the IIFE structure, functional style

### Common Tasks

**Add new sign type color**:
```javascript
const getSignColor = (type) => {
    if (type === 'CROSSING_WITH_PRIORITY_FROM_THE_RIGHT') return '#ff0000';
    if (type === 'STOP_SIGN') return '#ff9900'; // New color
    return '#0066ff'; // Default
};
```

**Add new data layer**:
```javascript
// Add to loadAndRenderGeoJSON after existing rendering
const additionalFeatures = data.layers[1].data.features;
additionalFeatures.forEach(feature => {
    // Render logic
});
```

**Modify map style**:
```javascript
// Change in L.tileLayer() call
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '...',
    maxZoom: 19
}).addTo(map);
```

---

## Testing

### Manual Testing Checklist

- [ ] Open `http://localhost:8080` - page loads without errors
- [ ] Map displays centered on data (Germany, around lat 48.77, lng 9.17)
- [ ] Cyan lines visible (road segments)
- [ ] Red and blue markers visible (traffic signs)
- [ ] Click segment → popup shows segment_id, length, local_id
- [ ] Click marker → popup shows sign type, offset, segment_id
- [ ] Statistics box shows correct counts
- [ ] Legend box displays color meanings
- [ ] Console logs show "✓ GeoJSON 加载完成"

### Browser DevTools

- Check Console for errors
- Network tab: Verify `ocm_2026_03_03_14_42_02_segment.json` loads (2.3MB)
- Performance: Page load should complete in < 2 seconds on modern hardware

---

## Troubleshooting

### Map doesn't display

- Verify Leaflet CSS and JS loaded from CDN
- Check `#map` element has width/height: 100vw/100vh
- Ensure fetch() URL is correct (`ocm_2026_03_03_14_42_02_segment.json`)

### Markers in wrong positions

- Verify coordinate conversion: Leaflet needs `[lat, lng]`, not `[lng, lat]`
- Check `getPointAtOffset()` logic for interpolation errors
- Validate Haversine distance calculation

### Performance issues

- Consider clustering for large datasets (> 1000 markers)
- Use `L.markerClusterGroup()` if adding Leaflet.markercluster plugin
- Limit initial zoom level to avoid rendering all features at once

---

## Dependencies

**External (CDN)**:
- Leaflet.js 1.9.4 (https://unpkg.com/leaflet@1.9.4)

**No npm dependencies**: This project runs entirely in-browser.

---

## License

MIT
