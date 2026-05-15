const TAIWAN_MAP_CONFIG = {
  topoUrl: 'https://cdn.jsdelivr.net/npm/taiwan-atlas@2021.9.20/counties-10t.json',

  _islands: [
    { name: '蘭嶼', id: 'ISL_LANYU', parentName: '台東縣', lonRange: [121.45, 121.70], latRange: [21.90, 22.12] },
    { name: '綠島', id: 'ISL_GREEN', parentName: '台東縣', lonRange: [121.44, 121.55], latRange: [22.60, 22.75] },
    { name: '小琉球', id: 'ISL_LIUQIU', parentName: '屏東縣', lonRange: [120.33, 120.40], latRange: [22.30, 22.38] },
    { name: '龜山島', id: 'ISL_GUISHAN', parentName: '宜蘭縣', lonRange: [121.91, 121.99], latRange: [24.82, 24.88] },
    { name: '基隆嶼', id: 'ISL_KEELUNG', parentName: '基隆市', lonRange: [121.77, 121.80], latRange: [25.18, 25.21] },
  ],

  processFeatures(topo) {
    const key = Object.keys(topo.objects)[0];
    const countyFeatures = topojson.feature(topo, topo.objects[key]).features;
    const islandFeatures = [];

    function polyCentroid(ring) {
      let sx = 0, sy = 0;
      for (let i = 0; i < ring.length; i++) { sx += ring[i][0]; sy += ring[i][1]; }
      return [sx / ring.length, sy / ring.length];
    }

    function inRange(val, range) { return val >= range[0] && val <= range[1]; }

    for (const county of countyFeatures) {
      const cName = county.properties.COUNTYNAME;
      const matchingIslands = this._islands.filter(isl => isl.parentName === cName);
      if (!matchingIslands.length) continue;
      if (county.geometry.type !== 'MultiPolygon') continue;

      const keepPolygons = [];
      const islandPolyMap = {};
      for (const polyCoords of county.geometry.coordinates) {
        const c = polyCentroid(polyCoords[0]);
        const matched = matchingIslands.find(isl => inRange(c[0], isl.lonRange) && inRange(c[1], isl.latRange));
        if (matched) {
          if (!islandPolyMap[matched.id]) islandPolyMap[matched.id] = { def: matched, polys: [] };
          islandPolyMap[matched.id].polys.push(polyCoords);
        } else {
          keepPolygons.push(polyCoords);
        }
      }
      county.geometry.coordinates = keepPolygons;

      for (const entry of Object.values(islandPolyMap)) {
        islandFeatures.push({
          type: 'Feature',
          properties: { COUNTYNAME: entry.def.name, COUNTYID: entry.def.id },
          geometry: entry.polys.length === 1
            ? { type: 'Polygon', coordinates: entry.polys[0] }
            : { type: 'MultiPolygon', coordinates: entry.polys },
        });
      }
    }

    return countyFeatures.concat(islandFeatures);
  },

  getName(feature) { return feature.properties.COUNTYNAME; },
  getId(feature)   { return feature.properties.COUNTYID; },
  mapKind: 'taiwan',
  questionText: '這是哪個縣市／離島？',
  mapContainerHeight: 340,
  previewInternalW: 140,
  previewInternalH: 160,
  projection: 'mercator',
  maxScale: 8,
  fillRatio: 0.6,
  totalCount: 27,
  subtitle: '練習認識本島與外島',
};
