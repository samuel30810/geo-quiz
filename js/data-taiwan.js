const TAIWAN_MAP_CONFIG = {
  topoUrl: 'https://cdn.jsdelivr.net/npm/taiwan-atlas@2021.9.20/counties-10t.json',
  processFeatures(topo) {
    const key = Object.keys(topo.objects)[0];
    return topojson.feature(topo, topo.objects[key]).features;
  },
  getName(feature) { return feature.properties.COUNTYNAME; },
  getId(feature)   { return feature.properties.COUNTYID; },
  mapKind: 'taiwan',
  questionText: '這是哪個縣市？',
  mapContainerHeight: 340,
  previewInternalW: 140,
  previewInternalH: 160,
  projection: 'mercator',
  maxScale: 4,
  fillRatio: 0.6,
  totalCount: 22,
  subtitle: '練習認識本島與外島',
};
