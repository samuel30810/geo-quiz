/* ── data-world.js ────────────────────────────────────
 * 職責：宣告世界國家中英文名稱對照表與世界地圖設定物件，含 MultiPolygon 保留清單
 * 函式：processFeatures(), getName(), getId(), getEnName()
 * 依賴：topojson-client（將 TopoJSON 解析為 GeoJSON features）
 * ──────────────────────────────────────────────────── */

const COUNTRY_NAMES = {
  // 亞洲
  '156': '中國', '392': '日本', '410': '韓國', '356': '印度', '764': '泰國',
  '704': '越南', '360': '印尼', '608': '菲律賓', '458': '馬來西亞',
  '682': '沙烏地阿拉伯', '792': '土耳其', '364': '伊朗', '376': '以色列',
  // 中亞
  '398': '哈薩克', '860': '烏茲別克',
  // 亞洲新增
  '784': '阿拉伯聯合大公國', '702': '新加坡', '50': '孟加拉', '586': '巴基斯坦',
  '368': '伊拉克', '634': '卡達', '414': '科威特', '512': '阿曼',
  '144': '斯里蘭卡', '31': '亞塞拜然', '104': '緬甸', '48': '巴林',
  '400': '約旦', '422': '黎巴嫩', '524': '尼泊爾', '116': '柬埔寨',
  // 歐洲
  '826': '英國', '250': '法國', '276': '德國', '380': '義大利',
  '724': '西班牙', '620': '葡萄牙', '528': '荷蘭', '616': '波蘭',
  '804': '烏克蘭', '752': '瑞典', '578': '挪威', '756': '瑞士',
  '300': '希臘', '643': '俄羅斯',
  // 歐洲新增
  '56': '比利時', '372': '愛爾蘭', '40': '奧地利', '208': '丹麥',
  '642': '羅馬尼亞', '203': '捷克', '246': '芬蘭', '348': '匈牙利',
  '703': '斯洛伐克', '100': '保加利亞', '191': '克羅埃西亞', '688': '塞爾維亞',
  '440': '立陶宛', '705': '斯洛維尼亞', '112': '白俄羅斯', '428': '拉脫維亞',
  '233': '愛沙尼亞', '352': '冰島', '196': '賽普勒斯',
  // 非洲
  '818': '埃及', '566': '奈及利亞', '710': '南非', '231': '衣索比亞',
  '404': '肯亞', '834': '坦尚尼亞', '504': '摩洛哥', '180': '民主剛果',
  // 非洲新增
  '12': '阿爾及利亞', '24': '安哥拉', '288': '迦納', '384': '象牙海岸',
  '800': '烏干達', '788': '突尼西亞',
  // 美洲
  '840': '美國', '124': '加拿大', '484': '墨西哥', '076': '巴西',
  '032': '阿根廷', '152': '智利', '170': '哥倫比亞',
  '604': '秘魯', '862': '委內瑞拉',
  // 美洲新增
  '218': '厄瓜多', '214': '多明尼加', '320': '瓜地馬拉', '188': '哥斯大黎加',
  '591': '巴拿馬', '858': '烏拉圭', '222': '薩爾瓦多', '68': '玻利維亞',
  '600': '巴拉圭', '340': '宏都拉斯', '388': '牙買加',
  // 大洋洲
  '036': '澳洲', '554': '紐西蘭',
  // 大洋洲新增
  '598': '巴布亞紐幾內亞',
};

const COUNTRY_EN_NAMES = {
  // 亞洲（現有）
  '156': 'China', '392': 'Japan', '410': 'South Korea', '356': 'India',
  '764': 'Thailand', '704': 'Vietnam', '360': 'Indonesia', '608': 'Philippines',
  '458': 'Malaysia', '682': 'Saudi Arabia', '792': 'Türkiye', '364': 'Iran',
  '376': 'Israel', '398': 'Kazakhstan', '860': 'Uzbekistan',
  // 亞洲（新增）
  '784': 'United Arab Emirates', '702': 'Singapore', '50': 'Bangladesh',
  '586': 'Pakistan', '368': 'Iraq', '634': 'Qatar', '414': 'Kuwait',
  '512': 'Oman', '144': 'Sri Lanka', '31': 'Azerbaijan', '104': 'Myanmar',
  '48': 'Bahrain', '400': 'Jordan', '422': 'Lebanon', '524': 'Nepal',
  '116': 'Cambodia',
  // 歐洲（現有）
  '826': 'United Kingdom', '250': 'France', '276': 'Germany', '380': 'Italy',
  '724': 'Spain', '620': 'Portugal', '528': 'Netherlands', '616': 'Poland',
  '804': 'Ukraine', '752': 'Sweden', '578': 'Norway', '756': 'Switzerland',
  '300': 'Greece', '643': 'Russia',
  // 歐洲（新增）
  '56': 'Belgium', '372': 'Ireland', '40': 'Austria', '208': 'Denmark',
  '642': 'Romania', '203': 'Czechia', '246': 'Finland', '348': 'Hungary',
  '703': 'Slovakia', '100': 'Bulgaria', '191': 'Croatia', '688': 'Serbia',
  '440': 'Lithuania', '705': 'Slovenia', '112': 'Belarus', '428': 'Latvia',
  '233': 'Estonia', '352': 'Iceland', '196': 'Cyprus',
  // 非洲（現有）
  '818': 'Egypt', '566': 'Nigeria', '710': 'South Africa', '231': 'Ethiopia',
  '404': 'Kenya', '834': 'Tanzania', '504': 'Morocco', '180': 'Democratic Republic of the Congo',
  // 非洲（新增）
  '12': 'Algeria', '24': 'Angola', '288': 'Ghana', '384': "Côte d'Ivoire",
  '800': 'Uganda', '788': 'Tunisia',
  // 美洲（現有）
  '840': 'United States', '124': 'Canada', '484': 'Mexico', '076': 'Brazil',
  '032': 'Argentina', '152': 'Chile', '170': 'Colombia', '604': 'Peru',
  '862': 'Venezuela',
  // 美洲（新增）
  '218': 'Ecuador', '214': 'Dominican Republic', '320': 'Guatemala',
  '188': 'Costa Rica', '591': 'Panama', '858': 'Uruguay', '222': 'El Salvador',
  '68': 'Bolivia', '600': 'Paraguay', '340': 'Honduras', '388': 'Jamaica',
  // 大洋洲（現有）
  '036': 'Australia', '554': 'New Zealand',
  // 大洋洲（新增）
  '598': 'Papua New Guinea',
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
        const keepMulti = new Set(['360', '608', '392', '458', '554', '598']);
        if (f.geometry && f.geometry.type === 'MultiPolygon' && !keepMulti.has(key)) {
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
  getEnName(feature) {
    const id = String(feature.id || feature.properties._id || '');
    return COUNTRY_EN_NAMES[id] || COUNTRY_EN_NAMES[id.padStart(3, '0')] || '';
  },
  mapKind: 'world',
  questionText: '這是哪個國家？',
  questionTextEn: 'Which country is this?',
  mapContainerHeight: 240,
  previewInternalW: 280,
  previewInternalH: 160,
  projection: 'naturalEarth',
  maxScale: 3.5,
  fillRatio: 0.5,
  totalCount: 101,
  subtitle: '五大洲約 100 個國家',
};
