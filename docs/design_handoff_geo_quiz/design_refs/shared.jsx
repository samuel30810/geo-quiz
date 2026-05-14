// shared.jsx — TopoProvider, map helpers, shared geo data
// Loads taiwan-atlas + world-atlas once via context; variants render maps using
// the helpers below with their own color/style tokens.

const TOPO_URLS = {
  taiwan: 'https://cdn.jsdelivr.net/npm/taiwan-atlas@2021.9.20/counties-10t.json',
  world: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
};

// ISO numeric → Chinese name. Pulled from the planning doc whitelist.
const COUNTRY_NAMES = {
  '156': '中國', '392': '日本', '410': '韓國', '356': '印度', '764': '泰國',
  '704': '越南', '360': '印尼', '608': '菲律賓', '458': '馬來西亞',
  '682': '沙烏地阿拉伯', '792': '土耳其', '364': '伊朗', '376': '以色列',
  '826': '英國', '250': '法國', '276': '德國', '380': '義大利',
  '724': '西班牙', '620': '葡萄牙', '528': '荷蘭', '616': '波蘭',
  '804': '烏克蘭', '752': '瑞典', '578': '挪威', '756': '瑞士',
  '300': '希臘', '643': '俄羅斯',
  '818': '埃及', '566': '奈及利亞', '710': '南非', '231': '衣索比亞',
  '404': '肯亞', '834': '坦尚尼亞', '504': '摩洛哥', '180': '剛果民主共和國',
  '840': '美國', '124': '加拿大', '484': '墨西哥', '76': '巴西', '076': '巴西',
  '32': '阿根廷', '032': '阿根廷', '152': '智利', '170': '哥倫比亞',
  '604': '秘魯', '862': '委內瑞拉',
  '36': '澳洲', '036': '澳洲', '554': '紐西蘭'
};

const TopoContext = React.createContext({ taiwan: null, world: null, error: null });

function TopoProvider({ children }) {
  const [state, setState] = React.useState({ taiwan: null, world: null, error: null });
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [twTopo, wTopo] = await Promise.all([
          fetch(TOPO_URLS.taiwan).then(r => r.json()),
          fetch(TOPO_URLS.world).then(r => r.json())
        ]);
        const twKey = Object.keys(twTopo.objects)[0];
        const taiwan = topojson.feature(twTopo, twTopo.objects[twKey]);
        const wFC = topojson.feature(wTopo, wTopo.objects.countries);
        const worldFiltered = {
          type: 'FeatureCollection',
          features: wFC.features
            .filter(f => COUNTRY_NAMES[String(f.id)] || COUNTRY_NAMES[String(f.id).padStart(3,'0')])
            .map(f => {
              const key = COUNTRY_NAMES[String(f.id)] ? String(f.id) : String(f.id).padStart(3,'0');
              f.properties.cnName = COUNTRY_NAMES[key];
              return f;
            })
        };
        if (!cancelled) setState({ taiwan, world: worldFiltered, error: null });
      } catch (err) {
        if (!cancelled) setState({ taiwan: null, world: null, error: err.message });
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return <TopoContext.Provider value={state}>{children}</TopoContext.Provider>;
}

function useTopos() { return React.useContext(TopoContext); }

function nameOf(feature, kind) {
  if (!feature) return null;
  return kind === 'taiwan' ? feature.properties.COUNTYNAME : feature.properties.cnName;
}

function idOf(feature, kind) {
  if (!feature) return null;
  return kind === 'taiwan' ? feature.properties.COUNTYID : String(feature.id);
}

function findFeature(fc, kind, name) {
  if (!fc) return null;
  return fc.features.find(f => nameOf(f, kind) === name) || null;
}

// Deterministic shuffle for stable choice layout per artboard
function seededRng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function buildChoices(fc, kind, targetName, seed, n = 4) {
  if (!fc) return Array(n).fill('—');
  const rng = seededRng(seed);
  const all = fc.features.map(f => nameOf(f, kind));
  const others = all.filter(x => x !== targetName);
  // Fisher-Yates with seeded rng
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const out = [targetName, ...others.slice(0, n - 1)];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Compute projection + per-feature paths + a zoom-to-target transform.
// target: single Feature used to mark items with isTarget=true.
// opts.zoomFit: Feature or FeatureCollection to fit the zoom bbox to.
//               Defaults to target. Use a FC with multiple features when you
//               want to keep both the target and a wrong-choice in view.
// projType: 'mercator' | 'natural' (world wraps better with natural)
function computeMap(fc, kind, width, height, target, opts = {}) {
  if (!fc) return null;
  let zoomFit = opts.zoomFit !== undefined ? opts.zoomFit : target;
  if (zoomFit && zoomFit.type === 'FeatureCollection') {
    const features = (zoomFit.features || []).filter(Boolean);
    zoomFit = features.length ? { type: 'FeatureCollection', features } : null;
  }
  const projType = opts.projection || (kind === 'taiwan' ? 'mercator' : 'natural');
  const projFn = projType === 'mercator' ? d3.geoMercator : d3.geoNaturalEarth1;
  const padding = opts.padding ?? 12;
  const proj = projFn().fitExtent(
    [[padding, padding], [width - padding, height - padding]],
    fc
  );
  const pathGen = d3.geoPath(proj);
  let transform = { scale: 1, tx: 0, ty: 0 };
  if (zoomFit) {
    try {
      const b = pathGen.bounds(zoomFit);
      const dx = b[1][0] - b[0][0];
      const dy = b[1][1] - b[0][1];
      if (Number.isFinite(dx) && Number.isFinite(dy) && dx > 0 && dy > 0) {
        const cx = (b[0][0] + b[1][0]) / 2;
        const cy = (b[0][1] + b[1][1]) / 2;
        const maxScale = opts.maxScale ?? 6;
        const fill = opts.fill ?? 0.55;
        const scale = Math.min(maxScale, fill / Math.max(dx / width, dy / height));
        transform = { scale, tx: width / 2 - scale * cx, ty: height / 2 - scale * cy };
      }
    } catch (e) {
      console.warn('computeMap zoom failed:', e.message);
    }
  }
  const targetId = target ? idOf(target, kind) : null;
  const items = fc.features.map(f => ({
    feature: f,
    d: pathGen(f),
    name: nameOf(f, kind),
    id: idOf(f, kind),
    isTarget: targetId != null && idOf(f, kind) === targetId
  }));
  return { items, transform, projection: proj, pathGen };
}

// Tiny placeholder shown while topos are loading
function MapLoading({ width, height, color = '#cfc9bd', label = '載入地圖中…' }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <pattern id={`stripe-${width}-${height}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="rgba(0,0,0,0.02)" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#stripe-${width}-${height})`} />
      <text x={width/2} y={height/2} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="12" fill={color}>{label}</text>
    </svg>
  );
}

Object.assign(window, {
  TopoContext, TopoProvider, useTopos,
  nameOf, idOf, findFeature, buildChoices, computeMap, MapLoading
});
