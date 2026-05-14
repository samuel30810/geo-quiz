const COUNTRY_NAMES = {
  // 亞洲
  '156': '中國', '392': '日本', '410': '韓國', '356': '印度', '764': '泰國',
  '704': '越南', '360': '印尼', '608': '菲律賓', '458': '馬來西亞',
  '682': '沙烏地阿拉伯', '792': '土耳其', '364': '伊朗', '376': '以色列',
  // 中亞
  '398': '哈薩克', '860': '烏茲別克',
  // 歐洲
  '826': '英國', '250': '法國', '276': '德國', '380': '義大利',
  '724': '西班牙', '620': '葡萄牙', '528': '荷蘭', '616': '波蘭',
  '804': '烏克蘭', '752': '瑞典', '578': '挪威', '756': '瑞士',
  '300': '希臘', '643': '俄羅斯',
  // 非洲
  '818': '埃及', '566': '奈及利亞', '710': '南非', '231': '衣索比亞',
  '404': '肯亞', '834': '坦尚尼亞', '504': '摩洛哥', '180': '剛果民主共和國',
  // 美洲
  '840': '美國', '124': '加拿大', '484': '墨西哥', '076': '巴西',
  '032': '阿根廷', '152': '智利', '170': '哥倫比亞',
  '604': '秘魯', '862': '委內瑞拉',
  // 大洋洲
  '036': '澳洲', '554': '紐西蘭',
};

const WORLD_MAP_CONFIG = {
  topoUrl: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
  processFeatures(topo) {
    const fc = topojson.feature(topo, topo.objects.countries);
    this.backgroundFeatures = fc.features;
    return fc.features
      .filter(f => {
        const id = String(f.id);
        return COUNTRY_NAMES[id] || COUNTRY_NAMES[id.padStart(3, '0')];
      })
      .map(f => {
        const id = String(f.id);
        const key = COUNTRY_NAMES[id] ? id : id.padStart(3, '0');
        f.properties = f.properties || {};
        f.properties.cnName = COUNTRY_NAMES[key];
        f.properties._id = id;
        if (f.geometry && f.geometry.type === 'MultiPolygon') {
          const largest = f.geometry.coordinates.reduce((a, b) =>
            b.reduce((s, r) => s + r.length, 0) > a.reduce((s, r) => s + r.length, 0) ? b : a
          );
          f.geometry = { type: 'Polygon', coordinates: largest };
        }
        return f;
      });
  },
  getName(feature) { return feature.properties.cnName; },
  getId(feature)   { return feature.properties._id || String(feature.id); },
  mapKind: 'world',
  questionText: '這是哪個國家？',
  mapContainerHeight: 240,
  previewInternalW: 280,
  previewInternalH: 160,
  projection: 'naturalEarth',
  maxScale: 3.5,
  fillRatio: 0.5,
  totalCount: 50,
  subtitle: '五大洲的代表國家',
};
