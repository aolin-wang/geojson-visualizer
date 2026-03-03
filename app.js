(async function() {
    'use strict';

    const stats = {
        segments: 0,
        totalSigns: 0,
        prioritySigns: 0,
        otherSigns: 0
    };

    const map = L.map('map').setView([48.775, 9.17], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

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

    async function loadAndRenderGeoJSON() {
        try {
            const response = await fetch('ocm_2026_03_03_14_42_02_segment.json');
            const data = await response.json();
            
            if (!data.layers || !data.layers[0] || !data.layers[0].data) {
                throw new Error('Invalid GeoJSON structure');
            }

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
                    }).addTo(map);

                    latLngs.forEach(latLng => bounds.extend(latLng));

                    polyline.bindPopup(`
                        <strong>路段 ID:</strong> ${properties.segment_id}<br>
                        <strong>长度:</strong> ${properties.length}m<br>
                        <strong>本地 ID:</strong> ${properties.segment_local_id}
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
                                }).addTo(map);

                                marker.bindPopup(`
                                    <strong>标志类型:</strong> ${sign.traffic_sign_type}<br>
                                    <strong>偏移量:</strong> ${sign.offset}m<br>
                                    <strong>所属路段:</strong> ${properties.segment_id}
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

            console.log('✓ GeoJSON 加载完成');
            console.log(`  - 路段数量: ${stats.segments}`);
            console.log(`  - 交通标志: ${stats.totalSigns}`);
            console.log(`  - 优先通行: ${stats.prioritySigns}`);
            console.log(`  - 其他标志: ${stats.otherSigns}`);

        } catch (error) {
            console.error('加载 GeoJSON 失败:', error);
            alert('加载数据失败: ' + error.message);
        }
    }

    function updateStats() {
        document.getElementById('segment-count').textContent = stats.segments;
        document.getElementById('sign-count').textContent = stats.totalSigns;
        document.getElementById('priority-count').textContent = stats.prioritySigns;
        document.getElementById('other-count').textContent = stats.otherSigns;
    }

    loadAndRenderGeoJSON();

})();
