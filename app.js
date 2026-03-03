(async function() {
    'use strict';

    const stats = {
        segments: 0,
        totalSigns: 0,
        prioritySigns: 0,
        otherSigns: 0
    };

    let mapLayers = L.layerGroup();
    const map = L.map('map').setView([48.775, 9.17], 3);
    
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    });
    
    let currentBaseLayer = streetLayer;
    currentBaseLayer.addTo(map);
    mapLayers.addTo(map);
    
    window.toggleMapLayer = function() {
        if (map.hasLayer(streetLayer)) {
            map.removeLayer(streetLayer);
            satelliteLayer.addTo(map);
            currentBaseLayer = satelliteLayer;
            document.getElementById('layer-toggle-btn').textContent = '🗺️ 街道地图';
        } else {
            map.removeLayer(satelliteLayer);
            streetLayer.addTo(map);
            currentBaseLayer = streetLayer;
            document.getElementById('layer-toggle-btn').textContent = '🛰️ 卫星地图';
        }
    };

    /**
     * Calculate point coordinates at specified offset along LineString
     * Uses Haversine distance and linear interpolation
     * @param {Array} coordinates - [[lng, lat, alt], ...]
     * @param {number} offset - Distance from start in meters
     * @returns {Array|null} - [lng, lat] or null
     */
    function getPointAtOffset(coordinates, offset) {
        if (!coordinates || coordinates.length < 2) return null;
        if (offset === 0) return [coordinates[0][0], coordinates[0][1]];

        let accumulatedDistance = 0;

        for (let i = 0; i < coordinates.length - 1; i++) {
            const [lon1, lat1] = coordinates[i];
            const [lon2, lat2] = coordinates[i + 1];

            const segmentDistance = haversineDistance(lat1, lon1, lat2, lon2);
            
            if (accumulatedDistance + segmentDistance >= offset) {
                const remainingDistance = offset - accumulatedDistance;
                const ratio = remainingDistance / segmentDistance;
                
                const lng = lon1 + (lon2 - lon1) * ratio;
                const lat = lat1 + (lat2 - lat1) * ratio;
                
                return [lng, lat];
            }

            accumulatedDistance += segmentDistance;
        }

        const lastPoint = coordinates[coordinates.length - 1];
        return [lastPoint[0], lastPoint[1]];
    }

    /**
     * Haversine formula - calculate distance between two points on Earth surface
     */
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function showLoading(message = '加载中...') {
        const loading = document.getElementById('loading');
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = message;
        loading.style.display = 'flex';
    }

    function hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    function showError(message) {
        alert('错误: ' + message);
        hideLoading();
    }

    function resetStats() {
        stats.segments = 0;
        stats.totalSigns = 0;
        stats.prioritySigns = 0;
        stats.otherSigns = 0;
        updateStats();
    }

    function clearMap() {
        mapLayers.clearLayers();
        resetStats();
    }

    async function loadAndRenderGeoJSON(dataSource) {
        try {
            showLoading('解析 GeoJSON 数据...');
            
            let data;
            if (typeof dataSource === 'string') {
                const response = await fetch(dataSource);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                data = await response.json();
            } else {
                data = dataSource;
            }
            
            if (!data.layers || !data.layers[0] || !data.layers[0].data) {
                throw new Error('Invalid GeoJSON structure: 缺少 layers[0].data');
            }

            clearMap();
            showLoading('渲染地图...');

            const features = data.layers[0].data.features;
            stats.segments = features.length;

            const bounds = L.latLngBounds();

            features.forEach(feature => {
                const { geometry, properties } = feature;
                
                if (geometry.type === 'LineString') {
                    const coordinates = geometry.coordinates;
                    
                    const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
                    
                    const polyline = L.polyline(latLngs, {
                        color: '#00ffff',
                        weight: 5,
                        opacity: 0.7
                    }).addTo(mapLayers);

                    latLngs.forEach(latLng => bounds.extend(latLng));

                    polyline.bindPopup(`
                        <strong>路段 ID:</strong> ${properties.segment_id || 'N/A'}<br>
                        <strong>长度:</strong> ${properties.length || 'N/A'}m<br>
                        <strong>本地 ID:</strong> ${properties.segment_local_id || 'N/A'}
                    `);

                    if (properties.traffic_signs && properties.traffic_signs.length > 0) {
                        properties.traffic_signs.forEach(sign => {
                            const signPosition = getPointAtOffset(coordinates, sign.offset);
                            
                            if (signPosition) {
                                const isPriority = sign.traffic_sign_type === 'CROSSING_WITH_PRIORITY_FROM_THE_RIGHT';
                                const color = isPriority ? '#ff0000' : '#0066ff';
                                
                                stats.totalSigns++;
                                if (isPriority) {
                                    stats.prioritySigns++;
                                } else {
                                    stats.otherSigns++;
                                }

                                const marker = L.circleMarker([signPosition[1], signPosition[0]], {
                                    radius: 6,
                                    fillColor: color,
                                    color: '#333',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.9
                                }).addTo(mapLayers);

                                marker.bindPopup(`
                                    <strong>标志类型:</strong> ${sign.traffic_sign_type}<br>
                                    <strong>偏移量:</strong> ${sign.offset}m<br>
                                    <strong>所属路段:</strong> ${properties.segment_id || 'N/A'}
                                `);
                            }
                        });
                    }
                }
            });

            updateStats();

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }

            hideLoading();

            console.log('✓ GeoJSON 加载完成');
            console.log(`  - 路段数量: ${stats.segments}`);
            console.log(`  - 交通标志: ${stats.totalSigns}`);
            console.log(`  - 优先通行: ${stats.prioritySigns}`);
            console.log(`  - 其他标志: ${stats.otherSigns}`);

        } catch (error) {
            console.error('加载 GeoJSON 失败:', error);
            showError(error.message);
        }
    }

    function updateStats() {
        document.getElementById('segment-count').textContent = stats.segments;
        document.getElementById('sign-count').textContent = stats.totalSigns;
        document.getElementById('priority-count').textContent = stats.prioritySigns;
        document.getElementById('other-count').textContent = stats.otherSigns;
    }

    document.getElementById('url-load-btn').addEventListener('click', () => {
        const url = document.getElementById('geojson-url').value.trim();
        if (!url) {
            alert('请输入 GeoJSON URL');
            return;
        }
        loadAndRenderGeoJSON(url);
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showLoading('读取文件...');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                loadAndRenderGeoJSON(data);
            } catch (error) {
                showError('文件解析失败: ' + error.message);
            }
        };
        reader.onerror = () => {
            showError('文件读取失败');
        };
        reader.readAsText(file);
    });

    const dropZone = document.getElementById('map');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.opacity = '0.5';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.opacity = '1';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.opacity = '1';

        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json') && !file.name.endsWith('.geojson')) {
            alert('请上传 .json 或 .geojson 文件');
            return;
        }

        showLoading('读取文件...');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                loadAndRenderGeoJSON(data);
            } catch (error) {
                showError('文件解析失败: ' + error.message);
            }
        };
        reader.onerror = () => {
            showError('文件读取失败');
        };
        reader.readAsText(file);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    
    if (urlParam) {
        document.getElementById('geojson-url').value = urlParam;
        loadAndRenderGeoJSON(urlParam);
    }

})();
