// v1-mobile.jsx — 方案 A 手機版（在 iOS 框內）
// 同一套色彩 / 型錄與桌機版，但版面為手機優先：
//   - 4 選項改成 2×2 grid
//   - 標題尺寸縮小
//   - 地圖縮小為 portrait-friendly
//   - 內距全部收緊

const v1m = {
  ...window.v1, // inherit tokens from desktop variant
};

// 402 (iOS frame width) — content is centered, with top padding for status bar,
// bottom padding for home indicator.
const M_W = 402;
const STATUS_BAR_PAD = 56;
const HOME_INDICATOR_PAD = 38;
// content area height = 874 - 56 - 38 = 780

function V1MobileFrame({ children }) {
  return (
    <div style={{
      width: M_W, height: 874, background: v1m.bg, color: v1m.ink,
      paddingTop: STATUS_BAR_PAD, paddingBottom: HOME_INDICATOR_PAD,
      boxSizing: 'border-box',
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>{children}</div>
  );
}

function V1MobileHeader({ correctCount, total, hideBack, transparent }) {
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px', borderBottom: transparent ? 'none' : `1px solid ${v1m.border}`,
      background: transparent ? 'transparent' : v1m.card,
    }}>
      {hideBack ? <span /> : (
        <button style={{
          background: 'transparent', border: 'none', color: v1m.inkDim, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6,
        }}>
          <span style={{ fontSize: 14 }}>←</span>
          <span>返回</span>
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, fontSize: 13, color: v1m.inkDim }}>
        <span>答對</span>
        <span style={{ color: v1m.primaryDark, fontWeight: 700, fontSize: 15 }}>{correctCount}</span>
        <span>/ {total}</span>
      </div>
    </div>
  );
}

function V1MobileMapPanel({ kind, target, selected, mode, width, height }) {
  const t = useTopos();
  const fc = t[kind];
  if (!fc) return <MapLoading width={width} height={height} />;

  let zoomFit = target;
  if (mode === 'wrong' && selected && selected !== target) {
    zoomFit = { type: 'FeatureCollection', features: [target, selected] };
  }
  const m = computeMap(fc, kind, width, height, target, {
    fill: kind === 'taiwan' ? 0.6 : 0.5, maxScale: kind === 'taiwan' ? 4 : 3.2, padding: 14,
    zoomFit,
  });
  if (!m) return <MapLoading width={width} height={height} />;

  const selectedId = selected ? idOf(selected, kind) : null;
  const fillFor = (it) => {
    if (mode === 'idle') return it.isTarget ? v1m.countyHighlight : v1m.countyDim;
    if (mode === 'correct') return it.isTarget ? v1m.countyCorrect : v1m.countyDim;
    if (mode === 'wrong') {
      if (it.id === selectedId) return v1m.countyWrong;
      if (it.isTarget) return v1m.countyCorrect;
      return v1m.countyDim;
    }
    return v1m.countyDefault;
  };

  return (
    <div style={{
      width, height, background: v1m.ocean, borderRadius: 16,
      position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(31,43,37,0.06)',
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <g transform={`translate(${m.transform.tx}, ${m.transform.ty}) scale(${m.transform.scale})`}>
          {m.items.map(it => (
            <path key={it.id} d={it.d}
              fill={fillFor(it)} stroke="#ffffff" strokeWidth={1 / m.transform.scale}
              strokeLinejoin="round" />
          ))}
        </g>
      </svg>
      <div style={{
        position: 'absolute', bottom: 8, right: 8,
        background: 'rgba(255,255,255,0.85)', borderRadius: 10,
        padding: '3px 8px', fontSize: 10, color: v1m.inkDim,
        fontFamily: 'ui-monospace, monospace',
      }}>{m.transform.scale.toFixed(1)}×</div>
    </div>
  );
}

function V1MobileChoice({ label, state }) {
  const variants = {
    base:    { background: v1m.card, border: `1.5px solid ${v1m.border}`, color: v1m.ink },
    correct: { background: '#eaf6e3', border: `2px solid ${v1m.countyCorrect}`, color: '#3d5e16' },
    wrong:   { background: v1m.badSoft, border: `2px solid ${v1m.countyWrong}`, color: '#a82d2d' },
    target:  { background: '#eaf6e3', border: `2px solid ${v1m.countyCorrect}`, color: '#3d5e16' },
    other:   { background: v1m.card, border: `1.5px solid ${v1m.border}`, color: v1m.inkDim, opacity: 0.5 },
  };
  const s = variants[state] || variants.base;
  return (
    <button style={{
      ...s, borderRadius: 14, padding: '14px 8px', minHeight: 56,
      fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
      cursor: 'pointer', transition: 'all .15s', textAlign: 'center',
      letterSpacing: '0.02em', width: '100%',
    }}>{label}</button>
  );
}

function V1MobileFeedback({ mode, correctName }) {
  if (mode === 'idle') return <div style={{ height: 48 }} />;
  const good = mode === 'correct';
  return (
    <div style={{
      background: good ? '#eaf6e3' : v1m.badSoft,
      color: good ? v1m.primaryDark : '#a82d2d',
      borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center',
      gap: 10, fontSize: 14, fontWeight: 600, minHeight: 48, boxSizing: 'border-box',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%', background: good ? v1m.primary : v1m.bad,
        color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, flexShrink: 0,
      }}>{good ? '✓' : '✕'}</span>
      <span style={{ lineHeight: 1.35 }}>
        {good
          ? <>答對了！這是「<strong>{correctName}</strong>」</>
          : <>正確答案是「<strong>{correctName}</strong>」</>}
      </span>
    </div>
  );
}

function V1MobileQuiz({ kind, targetName, mode, selectedName, choicesSeed, qNum, total, correctCount }) {
  const t = useTopos();
  const fc = t[kind];
  const target = findFeature(fc, kind, targetName);
  const selected = selectedName ? findFeature(fc, kind, selectedName) : null;
  const choices = buildChoices(fc, kind, targetName, choicesSeed);

  const mapW = M_W - 28;
  const mapH = kind === 'taiwan' ? 340 : 240;

  return (
    <V1MobileFrame>
      <V1MobileHeader correctCount={correctCount} total={total} />
      <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 44px)', boxSizing: 'border-box' }}>
        {/* title */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.16em', color: v1m.inkDim, fontWeight: 600,
            textTransform: 'uppercase', marginBottom: 4,
          }}>QUESTION {qNum}</div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.01em',
          }}>這是哪個{kind === 'taiwan' ? '縣市' : '國家'}？</h1>
        </div>

        {/* map */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <V1MobileMapPanel kind={kind} target={target} selected={selected} mode={mode} width={mapW} height={mapH} />
        </div>

        {/* choices 2x2 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12,
        }}>
          {choices.map((c, i) => {
            let state = 'base';
            if (mode === 'correct' && c === targetName) state = 'correct';
            else if (mode === 'wrong' && c === selectedName) state = 'wrong';
            else if (mode === 'wrong' && c === targetName) state = 'target';
            else if (mode !== 'idle') state = 'other';
            return <V1MobileChoice key={i} label={c} state={state} />;
          })}
        </div>

        {/* feedback */}
        <V1MobileFeedback mode={mode} correctName={targetName} />

        {/* next button — fills remaining space (sticks to bottom) */}
        {mode !== 'idle' && (
          <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', justifyContent: 'stretch' }}>
            <button style={{
              flex: 1, background: v1m.primary, color: '#fff', border: 'none', borderRadius: 14,
              padding: '14px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(29,158,117,0.28)',
            }}>下一題 →</button>
          </div>
        )}
      </div>
    </V1MobileFrame>
  );
}

function V1MobileHome() {
  const t = useTopos();
  const twPreview = t.taiwan ? computeMap(t.taiwan, 'taiwan', 140, 160, null, { padding: 10 }) : null;
  const wPreview  = t.world  ? computeMap(t.world,  'world',  280, 160, null, { padding: 12 }) : null;

  return (
    <V1MobileFrame>
      <V1MobileHeader correctCount={0} total={0} hideBack transparent />
      <div style={{ padding: '6px 22px 22px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 999, background: v1m.primarySoft,
          color: v1m.primaryDark, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          marginTop: 12, marginBottom: 14,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: v1m.primary }} />
          地圖練習工具
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15,
        }}>看著地圖<br />認識每一個地方</h1>
        <p style={{
          color: v1m.inkDim, fontSize: 14, lineHeight: 1.55, marginTop: 12, marginBottom: 22,
        }}>地圖會放大一個地方，從四個選項裡選出正確的名字。</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { kind: 'taiwan', title: '台灣縣市', count: 22, m: twPreview, mapW: 140, mapH: 160, sub: '練習認識本島與外島' },
            { kind: 'world',  title: '世界國家', count: 50, m: wPreview,  mapW: 280, mapH: 160, sub: '五大洲的代表國家' },
          ].map(card => (
            <button key={card.kind} style={{
              background: v1m.card, border: `1.5px solid ${v1m.border}`, borderRadius: 18,
              padding: 14, textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', color: v1m.ink,
              display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center',
              boxShadow: '0 1px 0 rgba(31,43,37,0.04)',
            }}>
              <div style={{
                width: 96, height: 96, background: v1m.ocean, borderRadius: 12,
                overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.m ? (
                  <svg width={96} height={96} viewBox={`0 0 ${card.mapW} ${card.mapH}`} preserveAspectRatio="xMidYMid meet">
                    {card.m.items.map(it => (
                      <path key={it.id} d={it.d} fill={v1m.countyDefault} stroke="#fff" strokeWidth="0.6" />
                    ))}
                  </svg>
                ) : <MapLoading width={96} height={96} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{card.title}</span>
                  <span style={{ fontSize: 12, color: v1m.inkDim }}>{card.count} 題</span>
                </div>
                <div style={{ fontSize: 13, color: v1m.inkDim, lineHeight: 1.4, marginBottom: 8 }}>{card.sub}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: v1m.primaryDark, fontSize: 13, fontWeight: 700,
                }}>開始練習 <span>→</span></div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 11, color: v1m.inkDim, opacity: 0.8 }}>
          taiwan-atlas · Natural Earth
        </div>
      </div>
    </V1MobileFrame>
  );
}

Object.assign(window, { V1MobileHome, V1MobileQuiz, V1MobileMapPanel, V1MobileChoice, V1MobileFeedback });
