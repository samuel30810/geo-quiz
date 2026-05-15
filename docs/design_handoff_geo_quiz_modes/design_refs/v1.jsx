// v1.jsx — 清新教育版
// Warm cream bg · rounded cards · green accents · Noto Sans TC throughout.
// Friendly, like a textbook for kids — but no gamification chrome.

const v1 = {
  bg: '#fbf8f1',
  card: '#ffffff',
  ink: '#1f2b25',
  inkDim: '#6a7770',
  border: 'rgba(31, 43, 37, 0.10)',
  primary: '#1D9E75',
  primaryDark: '#147a59',
  primarySoft: '#e1f5ee',
  ocean: '#f1ead8',
  countyDefault: '#cfe9dc',
  countyDefaultStroke: '#ffffff',
  countyHighlight: '#1D9E75',
  countyHighlightStroke: '#0c5b41',
  countyCorrect: '#639922',
  countyWrong: '#E24B4A',
  countyDim: '#e3ddcc',
  countyDimStroke: '#d6cfbb',
  good: '#1D9E75',
  bad: '#d44141',
  badSoft: '#fdecec',
};

function V1Frame({ width, height, children }) {
  return (
    <div style={{
      width, height, background: v1.bg, color: v1.ink, position: 'relative',
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>{children}</div>
  );
}

function V1Header({ correctCount, total, transparent }) {
  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: transparent ? 'none' : `1px solid ${v1.border}`,
      background: transparent ? 'transparent' : v1.card,
    }}>
      <button style={{
        background: 'transparent', border: 'none', color: v1.inkDim, fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        fontFamily: 'inherit', padding: '6px 10px', borderRadius: 8,
      }}>
        <span style={{ fontSize: 16 }}>←</span>
        <span>返回首頁</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontSize: 14, color: v1.inkDim }}>
        <span>答對</span>
        <span style={{ color: v1.primaryDark, fontWeight: 700, fontSize: 16 }}>{correctCount}</span>
        <span>/</span>
        <span>共 {total} 題</span>
      </div>
    </div>
  );
}

function V1MapPanel({ kind, target, selected, mode, width, height }) {
  const t = useTopos();
  const fc = t[kind];
  if (!fc) return <MapLoading width={width} height={height} />;
  // zoom fit: for wrong mode, fit both regions
  let zoomFit = target;
  if (mode === 'wrong' && selected && selected !== target) {
    zoomFit = { type: 'FeatureCollection', features: [target, selected] };
  }
  const m = computeMap(fc, kind, width, height, target, {
    fill: kind === 'taiwan' ? 0.58 : 0.48,
    maxScale: kind === 'taiwan' ? 4 : 3.5,
    padding: 18,
    zoomFit,
  });
  if (!m) return <MapLoading width={width} height={height} />;
  const targetId = idOf(target, kind);
  const selectedId = selected ? idOf(selected, kind) : null;

  const fillFor = (item) => {
    if (mode === 'idle') return item.isTarget ? v1.countyHighlight : v1.countyDim;
    if (mode === 'correct') return item.isTarget ? v1.countyCorrect : v1.countyDim;
    if (mode === 'wrong') {
      if (item.id === selectedId) return v1.countyWrong;
      if (item.isTarget) return v1.countyCorrect;
      return v1.countyDim;
    }
    return v1.countyDefault;
  };
  const strokeFor = (item) => {
    if (item.isTarget && mode === 'idle') return v1.countyHighlightStroke;
    return v1.countyDefaultStroke;
  };

  return (
    <div style={{
      width, height, background: v1.ocean, borderRadius: 20,
      position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(31,43,37,0.06)',
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <g transform={`translate(${m.transform.tx}, ${m.transform.ty}) scale(${m.transform.scale})`}>
          {m.items.map((it) => (
            <path
              key={it.id}
              d={it.d}
              fill={fillFor(it)}
              stroke={strokeFor(it)}
              strokeWidth={1 / m.transform.scale}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
      {/* zoom indicator (decorative) */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        background: 'rgba(255,255,255,0.85)', borderRadius: 12,
        padding: '4px 10px', fontSize: 11, color: v1.inkDim,
        fontFamily: 'ui-monospace, monospace',
      }}>{m.transform.scale.toFixed(1)}×</div>
    </div>
  );
}

function V1Choice({ label, state, onClick }) {
  const styles = {
    base: {
      background: v1.card, border: `1.5px solid ${v1.border}`, color: v1.ink,
    },
    correct: {
      background: '#eaf6e3', border: `2px solid ${v1.countyCorrect}`, color: '#3d5e16',
    },
    wrong: {
      background: v1.badSoft, border: `2px solid ${v1.countyWrong}`, color: '#a82d2d',
    },
    other: {
      background: v1.card, border: `1.5px solid ${v1.border}`, color: v1.inkDim, opacity: 0.55,
    },
    target: {
      background: '#eaf6e3', border: `2px solid ${v1.countyCorrect}`, color: '#3d5e16',
    },
  };
  const s = styles[state] || styles.base;
  return (
    <button style={{
      ...s, borderRadius: 16, padding: '18px 16px', minHeight: 60,
      fontSize: 18, fontWeight: 600, fontFamily: 'inherit',
      cursor: 'pointer', transition: 'all .15s', textAlign: 'center',
      letterSpacing: '0.02em',
    }}>{label}</button>
  );
}

function V1Feedback({ mode, correctName, kind }) {
  if (mode === 'idle') return <div style={{ height: 56 }} />;
  const good = mode === 'correct';
  return (
    <div style={{
      background: good ? '#eaf6e3' : v1.badSoft,
      color: good ? v1.primaryDark : '#a82d2d',
      borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center',
      gap: 12, fontSize: 16, fontWeight: 600, minHeight: 56, boxSizing: 'border-box',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: '50%', background: good ? v1.primary : v1.bad,
        color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, flexShrink: 0,
      }}>{good ? '✓' : '✕'}</span>
      <span>
        {good
          ? <>答對了！這是「<strong>{correctName}</strong>」</>
          : <>答錯了，正確答案是「<strong>{correctName}</strong>」</>}
      </span>
    </div>
  );
}

function V1Quiz({ width, height, kind, targetName, mode, selectedName, choicesSeed, qNum, total, correctCount }) {
  const t = useTopos();
  const fc = t[kind];
  const target = findFeature(fc, kind, targetName);
  const selected = selectedName ? findFeature(fc, kind, selectedName) : null;
  const choices = buildChoices(fc, kind, targetName, choicesSeed);

  const mapW = Math.min(width - 80, kind === 'taiwan' ? 520 : 640);
  const mapH = kind === 'taiwan' ? 460 : 360;

  return (
    <V1Frame width={width} height={height}>
      <V1Header correctCount={correctCount} total={total} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            fontSize: 12, letterSpacing: '0.18em', color: v1.inkDim, fontWeight: 600,
            textTransform: 'uppercase', marginBottom: 6,
          }}>QUESTION {qNum}</div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-0.01em',
          }}>這是哪個{kind === 'taiwan' ? '縣市' : '國家'}？</h1>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <V1MapPanel kind={kind} target={target} selected={selected} mode={mode} width={mapW} height={mapH} />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16,
        }}>
          {choices.map((c, i) => {
            let state = 'base';
            if (mode === 'correct' && c === targetName) state = 'correct';
            else if (mode === 'wrong' && c === selectedName) state = 'wrong';
            else if (mode === 'wrong' && c === targetName) state = 'target';
            else if (mode !== 'idle') state = 'other';
            return <V1Choice key={i} label={c} state={state} />;
          })}
        </div>

        <V1Feedback mode={mode} correctName={targetName} kind={kind} />

        {mode !== 'idle' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <button style={{
              background: v1.primary, color: '#fff', border: 'none', borderRadius: 14,
              padding: '14px 36px', fontSize: 17, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(29,158,117,0.28)',
            }}>下一題 →</button>
          </div>
        )}
      </div>
    </V1Frame>
  );
}

function V1Home({ width, height }) {
  const t = useTopos();
  const twPreview = t.taiwan ? computeMap(t.taiwan, 'taiwan', 200, 220, null, { padding: 14 }) : null;
  const wPreview = t.world ? computeMap(t.world, 'world', 280, 200, null, { padding: 14 }) : null;

  return (
    <V1Frame width={width} height={height}>
      <V1Header correctCount={0} total={0} transparent />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 12px', borderRadius: 999, background: v1.primarySoft,
          color: v1.primaryDark, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
          marginTop: 24, marginBottom: 18,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: v1.primary }} />
          地圖練習工具
        </div>
        <h1 style={{
          fontSize: 44, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>看著地圖<br />認識每一個地方</h1>
        <p style={{
          color: v1.inkDim, fontSize: 17, lineHeight: 1.55, marginTop: 16, marginBottom: 38,
          maxWidth: 460, marginLeft: 'auto', marginRight: 'auto',
        }}>選一個地圖開始練習。題目會把一個地方放大給你看，從四個選項中找出它的名字。</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {[
            { kind: 'taiwan', title: '台灣縣市', count: 22, m: twPreview, sub: '練習認識本島與外島' },
            { kind: 'world',  title: '世界國家', count: 50, m: wPreview,  sub: '亞洲、歐洲、美洲、非洲、大洋洲' },
          ].map(card => (
            <button key={card.kind} style={{
              background: v1.card, border: `1.5px solid ${v1.border}`, borderRadius: 22,
              padding: '20px 22px', textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', color: v1.ink,
              display: 'flex', flexDirection: 'column', gap: 14,
              transition: 'transform .15s, box-shadow .15s',
              boxShadow: '0 1px 0 rgba(31,43,37,0.04)',
            }}>
              <div style={{
                height: 200, background: v1.ocean, borderRadius: 14,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.m ? (
                  <svg width={card.kind === 'taiwan' ? 200 : 280} height={card.kind === 'taiwan' ? 220 : 200}>
                    <g>
                      {card.m.items.map(it => (
                        <path key={it.id} d={it.d} fill={v1.countyDefault} stroke="#fff" strokeWidth="1" />
                      ))}
                    </g>
                  </svg>
                ) : <MapLoading width={200} height={180} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{card.title}</span>
                  <span style={{ fontSize: 13, color: v1.inkDim }}>{card.count} 題</span>
                </div>
                <div style={{ fontSize: 14, color: v1.inkDim, lineHeight: 1.5 }}>{card.sub}</div>
                <div style={{
                  marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: v1.primaryDark, fontSize: 14, fontWeight: 700,
                }}>開始練習 <span>→</span></div>
              </div>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 28, fontSize: 12, color: v1.inkDim, opacity: 0.8,
        }}>練習資料來源：taiwan-atlas · Natural Earth</div>
      </div>
    </V1Frame>
  );
}

Object.assign(window, { V1Home, V1Quiz, v1 });
