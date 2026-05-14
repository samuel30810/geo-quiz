// v3.jsx — 復古地圖手冊版
// Parchment paper, hatched ocean, sepia greens, compass rose. Stamped feedback.
// Serif heads (Noto Serif TC) + monospace coordinates. Brand green still in play
// but desaturated and deepened for the vintage palette.

const v3 = {
  bg: '#f3e8cf',
  bgDeep: '#ebdfb8',
  ink: '#2a2417',
  inkSoft: '#6b5f48',
  inkVery: '#a8997a',
  rule: '#8b7b58',
  ruleSoft: '#c4b48c',
  primary: '#1D9E75',
  primaryDeep: '#0f5a40',
  primarySoft: '#c8d9b8',
  countyDefault: '#dccfa8',
  countyDefaultStroke: '#8b7b58',
  countyHighlight: '#3f8a64',
  countyCorrect: '#5a7b2a',
  countyWrong: '#9c3a2a',
  countyDim: '#d3c7a3',
  countyDimStroke: '#a89875',
  oceanFill: '#e8dcbb',
  oceanHatch: '#bba874',
  stampGreen: '#3f6b48',
  stampRed: '#9c3a2a',
};

function V3Frame({ width, height, children }) {
  return (
    <div style={{
      width, height, background: v3.bg, color: v3.ink, position: 'relative',
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden', boxSizing: 'border-box',
      backgroundImage: [
        'radial-gradient(circle at 12% 22%, rgba(139,107,55,0.05) 0%, transparent 35%)',
        'radial-gradient(circle at 88% 78%, rgba(139,107,55,0.06) 0%, transparent 40%)',
        'radial-gradient(circle at 50% 50%, rgba(139,107,55,0.02) 0%, transparent 70%)',
      ].join(','),
    }}>{children}</div>
  );
}

// Reusable double-rule decorator
function V3DoubleRule({ style }) {
  return (
    <div style={{
      borderTop: `2px solid ${v3.rule}`,
      borderBottom: `1px solid ${v3.rule}`,
      height: 3, ...style,
    }} />
  );
}

function V3Meta({ children, style }) {
  return <span style={{
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11, letterSpacing: '0.18em', color: v3.inkSoft, textTransform: 'uppercase',
    ...style,
  }}>{children}</span>;
}

function V3Header({ correctCount, total, kind }) {
  return (
    <div style={{
      padding: '14px 32px 10px', borderBottom: `1px solid ${v3.ruleSoft}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          fontFamily: '"Noto Serif TC", serif', fontSize: 13, color: v3.inkSoft,
          fontStyle: 'italic', cursor: 'pointer',
        }}>‹ 回到目錄</span>
        <span style={{ color: v3.inkVery }}>·</span>
        <V3Meta>{kind === 'taiwan' ? 'FORMOSA · 22 COUNTIES' : 'MUNDUS · 50 NATIONES'}</V3Meta>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <V3Meta>記分</V3Meta>
        <span style={{
          fontFamily: '"Noto Serif TC", serif', fontSize: 18, fontWeight: 600,
        }}>{correctCount}<span style={{ color: v3.inkVery }}> ⁄ {total}</span></span>
      </div>
    </div>
  );
}

// Compass rose SVG — simple geometric only (no hand-drawn complex art)
function V3Compass({ size = 60 }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 4} fill="rgba(255,255,255,0.6)" stroke={v3.rule} strokeWidth="0.8" />
      <circle cx={c} cy={c} r={c - 10} fill="none" stroke={v3.ruleSoft} strokeWidth="0.5" />
      {/* N S E W spokes as long diamonds */}
      <polygon points={`${c},4 ${c+4},${c} ${c},${c-2} ${c-4},${c}`} fill={v3.ink} />
      <polygon points={`${c},${size-4} ${c+4},${c} ${c},${c+2} ${c-4},${c}`} fill={v3.inkSoft} />
      <polygon points={`${size-4},${c} ${c},${c+4} ${c+2},${c} ${c},${c-4}`} fill={v3.inkSoft} />
      <polygon points={`4,${c} ${c},${c+4} ${c-2},${c} ${c},${c-4}`} fill={v3.inkSoft} />
      <circle cx={c} cy={c} r={1.5} fill={v3.ink} />
      <text x={c} y={c - size*0.36} textAnchor="middle" fontSize="8"
        fontFamily="'Noto Serif TC', serif" fontWeight="700" fill={v3.ink}>N</text>
    </svg>
  );
}

function V3MapPanel({ kind, target, selected, mode, width, height }) {
  const t = useTopos();
  const fc = t[kind];
  if (!fc) return <MapLoading width={width} height={height} color={v3.inkSoft} />;

  let zoomFit = target;
  if (mode === 'wrong' && selected && selected !== target) {
    zoomFit = { type: 'FeatureCollection', features: [target, selected] };
  }
  const m = computeMap(fc, kind, width, height, target, {
    fill: kind === 'taiwan' ? 0.55 : 0.5, maxScale: kind === 'taiwan' ? 4 : 3.2, padding: 30,
    zoomFit,
  });
  if (!m) return <MapLoading width={width} height={height} color={v3.inkSoft} />;

  const selectedId = selected ? idOf(selected, kind) : null;
  const fillFor = (it) => {
    if (mode === 'idle') {
      if (it.isTarget) return v3.countyHighlight;
      return v3.countyDim;
    }
    if (mode === 'correct') return it.isTarget ? v3.countyCorrect : v3.countyDim;
    if (mode === 'wrong') {
      if (it.id === selectedId) return v3.countyWrong;
      if (it.isTarget) return v3.countyCorrect;
      return v3.countyDim;
    }
    return v3.countyDefault;
  };

  const patId = `v3-hatch-${width}-${height}`;
  return (
    <div style={{
      width, height, position: 'relative',
      border: `2px solid ${v3.rule}`, padding: 4, boxSizing: 'content-box',
      background: 'rgba(255,255,255,0.3)',
    }}>
      <div style={{
        width, height, border: `0.5px solid ${v3.ruleSoft}`, position: 'relative', overflow: 'hidden',
      }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          <defs>
            <pattern id={patId} width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill={v3.oceanFill} />
              <path d="M 0,8 L 8,0" stroke={v3.oceanHatch} strokeWidth="0.4" opacity="0.55" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill={`url(#${patId})`} />
          <g transform={`translate(${m.transform.tx}, ${m.transform.ty}) scale(${m.transform.scale})`}>
            {m.items.map(it => (
              <path key={it.id} d={it.d}
                fill={fillFor(it)}
                stroke={it.isTarget ? v3.ink : v3.countyDefaultStroke}
                strokeWidth={(it.isTarget ? 1.2 : 0.6) / m.transform.scale}
                strokeLinejoin="round" />
            ))}
            {/* Re-stroke selected/wrong choice on top */}
            {mode === 'wrong' && selected && m.items.find(it => it.id === selectedId) && (
              <path d={m.items.find(it => it.id === selectedId).d}
                fill="none" stroke={v3.stampRed} strokeWidth={1.6 / m.transform.scale} strokeLinejoin="round" />
            )}
          </g>
        </svg>
        {/* compass + scale */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <V3Compass size={54} />
        </div>
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(243,232,207,0.92)', padding: '6px 10px',
          border: `0.5px solid ${v3.rule}`,
        }}>
          <V3Meta>SCALA · 1 : {Math.round(1500 / m.transform.scale)}</V3Meta>
        </div>
      </div>
    </div>
  );
}

function V3Choice({ label, state, roman }) {
  const variants = {
    base: { bg: 'rgba(255,255,255,0.55)', color: v3.ink, border: v3.rule },
    correct: { bg: '#dde8c4', color: v3.primaryDeep, border: v3.stampGreen },
    wrong: { bg: '#e8cfc5', color: v3.stampRed, border: v3.stampRed },
    target: { bg: '#dde8c4', color: v3.primaryDeep, border: v3.stampGreen },
    other: { bg: 'rgba(255,255,255,0.3)', color: v3.inkVery, border: v3.ruleSoft },
  };
  const s = variants[state] || variants.base;
  return (
    <div style={{
      background: s.bg, border: `1.5px solid ${s.border}`, color: s.color,
      padding: '14px 14px 12px', position: 'relative', cursor: 'pointer',
      boxShadow: '2px 2px 0 rgba(139,107,55,0.18)',
      transition: 'all .15s', minHeight: 70, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: v3.inkSoft,
        letterSpacing: '0.16em', marginBottom: 6, display: 'flex', justifyContent: 'space-between',
      }}>
        <span>{roman}</span>
        {state === 'correct' && <span style={{ color: v3.stampGreen, fontWeight: 700 }}>✓ 正解</span>}
        {state === 'wrong' && <span style={{ color: v3.stampRed, fontWeight: 700 }}>✕ 誤</span>}
        {state === 'target' && <span style={{ color: v3.stampGreen, fontWeight: 700 }}>↑ 正解</span>}
      </div>
      <div style={{
        fontFamily: '"Noto Serif TC", serif', fontSize: 19, fontWeight: 600,
        textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{label}</div>
    </div>
  );
}

function V3Stamp({ mode, targetName }) {
  if (mode === 'idle') return null;
  const good = mode === 'correct';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px',
      background: 'rgba(255,255,255,0.4)', border: `1px solid ${v3.ruleSoft}`,
    }}>
      <div style={{
        transform: 'rotate(-6deg)',
        border: `2.5px solid ${good ? v3.stampGreen : v3.stampRed}`,
        color: good ? v3.stampGreen : v3.stampRed,
        padding: '6px 14px',
        fontFamily: '"Noto Serif TC", serif', fontSize: 16, fontWeight: 800,
        letterSpacing: '0.1em', flexShrink: 0,
        opacity: 0.85,
      }}>
        {good ? 'CORRECT · 正確' : 'INCORRECT · 錯誤'}
      </div>
      <div style={{
        fontFamily: '"Noto Serif TC", serif', fontSize: 17, lineHeight: 1.4,
      }}>
        {good
          ? <>沒錯！這是 <strong style={{ color: v3.primaryDeep, borderBottom: `1px solid ${v3.primaryDeep}` }}>「{targetName}」</strong>。</>
          : <>差一點。正確答案是 <strong style={{ color: v3.stampRed, borderBottom: `1px solid ${v3.stampRed}` }}>「{targetName}」</strong>。</>}
      </div>
    </div>
  );
}

function V3Quiz({ width, height, kind, targetName, mode, selectedName, choicesSeed, qNum, total, correctCount }) {
  const t = useTopos();
  const fc = t[kind];
  const target = findFeature(fc, kind, targetName);
  const selected = selectedName ? findFeature(fc, kind, selectedName) : null;
  const choices = buildChoices(fc, kind, targetName, choicesSeed);
  const romans = ['I', 'II', 'III', 'IV'];

  const mapW = Math.min(width - 80, 640);
  const mapH = kind === 'taiwan' ? 400 : 320;

  return (
    <V3Frame width={width} height={height}>
      <V3Header correctCount={correctCount} total={total} kind={kind} />
      <div style={{ padding: '20px 40px 28px', maxWidth: 820, margin: '0 auto' }}>
        {/* title block */}
        <div style={{ textAlign: 'center', marginBottom: 16, paddingBottom: 14 }}>
          <V3Meta>CARTE No. {String(qNum).padStart(2,'0')} · 題目</V3Meta>
          <h1 style={{
            fontFamily: '"Noto Serif TC", serif', fontSize: 32, fontWeight: 700,
            margin: '8px 0 0', letterSpacing: '0.02em', color: v3.ink,
          }}>這是哪個{kind === 'taiwan' ? '縣市' : '國家'}？</h1>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 14, marginTop: 10, color: v3.inkVery,
          }}>
            <span style={{ width: 60, height: 1, background: v3.ruleSoft }} />
            <span style={{ fontFamily: '"Noto Serif TC", serif', fontStyle: 'italic', fontSize: 14, color: v3.inkSoft }}>
              quaeso, regionem identificare
            </span>
            <span style={{ width: 60, height: 1, background: v3.ruleSoft }} />
          </div>
        </div>

        {/* map */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <V3MapPanel kind={kind} target={target} selected={selected} mode={mode} width={mapW} height={mapH} />
        </div>

        {/* choices */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18,
        }}>
          {choices.map((c, i) => {
            let state = 'base';
            if (mode === 'correct' && c === targetName) state = 'correct';
            else if (mode === 'wrong' && c === selectedName) state = 'wrong';
            else if (mode === 'wrong' && c === targetName) state = 'target';
            else if (mode !== 'idle') state = 'other';
            return <V3Choice key={i} label={c} state={state} roman={romans[i]} />;
          })}
        </div>

        <V3Stamp mode={mode} targetName={targetName} />

        {mode !== 'idle' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <button style={{
              background: v3.ink, color: v3.bg, border: `2px solid ${v3.ink}`,
              padding: '12px 32px', fontFamily: '"Noto Serif TC", serif',
              fontSize: 16, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.06em',
              boxShadow: '3px 3px 0 rgba(42,36,23,0.25)',
            }}>下一題 →</button>
          </div>
        )}
      </div>
    </V3Frame>
  );
}

function V3Home({ width, height }) {
  const t = useTopos();
  const twP = t.taiwan ? computeMap(t.taiwan, 'taiwan', 220, 260, null, { padding: 16 }) : null;
  const wP = t.world ? computeMap(t.world, 'world', 360, 220, null, { padding: 16 }) : null;
  const patId = 'v3-home-hatch';

  return (
    <V3Frame width={width} height={height}>
      {/* masthead with double rule */}
      <div style={{ padding: '36px 48px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <V3Meta>Anno MMXXVI · 春</V3Meta>
          <V3Meta>Atlas Studii · 學習地圖</V3Meta>
        </div>
        <V3DoubleRule />
        <div style={{
          textAlign: 'center', padding: '24px 0 18px',
          borderBottom: `1px solid ${v3.ruleSoft}`,
        }}>
          <div style={{ fontFamily: '"Noto Serif TC", serif', fontSize: 14, fontStyle: 'italic', color: v3.inkSoft }}>
            ─ 一本給少年的 ─
          </div>
          <h1 style={{
            fontFamily: '"Noto Serif TC", serif', fontSize: 54, fontWeight: 700,
            margin: '8px 0 6px', letterSpacing: '0.04em', color: v3.ink,
          }}>地 圖 練 習 手 冊</h1>
          <div style={{ fontFamily: '"Noto Serif TC", serif', fontSize: 15, fontStyle: 'italic', color: v3.inkSoft }}>
            Manualis Geographicus · 共四十題練習
          </div>
        </div>
      </div>

      {/* two volumes */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
        padding: '28px 48px',
      }}>
        {[
          { kind: 'taiwan', vol: 'VOLUMEN · I', title: '台灣縣市', count: 22, m: twP, mapW: 220, mapH: 260,
            sub: '本島十六縣市，外島六縣市。' },
          { kind: 'world', vol: 'VOLUMEN · II', title: '世界國家', count: 50, m: wP, mapW: 360, mapH: 220,
            sub: '五大洲，五十國代表。' },
        ].map((card, i) => (
          <div key={card.kind} style={{
            border: `2px solid ${v3.rule}`, padding: 18,
            background: 'rgba(255,255,255,0.4)',
            position: 'relative', cursor: 'pointer',
            boxShadow: '4px 4px 0 rgba(139,107,55,0.18)',
          }}>
            <V3Meta>{card.vol}</V3Meta>
            <h2 style={{
              fontFamily: '"Noto Serif TC", serif', fontSize: 28, fontWeight: 700,
              margin: '4px 0 12px', letterSpacing: '0.04em',
            }}>{card.title}</h2>
            <div style={{
              height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `0.5px solid ${v3.ruleSoft}`,
              background: v3.oceanFill,
              position: 'relative', overflow: 'hidden', marginBottom: 14,
            }}>
              {card.m ? (
                <svg width={card.mapW} height={card.mapH}>
                  <defs>
                    <pattern id={`${patId}-${i}`} width="8" height="8" patternUnits="userSpaceOnUse">
                      <rect width="8" height="8" fill={v3.oceanFill} />
                      <path d="M 0,8 L 8,0" stroke={v3.oceanHatch} strokeWidth="0.4" opacity="0.55" />
                    </pattern>
                  </defs>
                  <rect width={card.mapW} height={card.mapH} fill={`url(#${patId}-${i})`} />
                  {card.m.items.map(it => (
                    <path key={it.id} d={it.d}
                      fill={v3.countyDefault} stroke={v3.countyDefaultStroke} strokeWidth="0.6" />
                  ))}
                </svg>
              ) : <MapLoading width={card.mapW} height={card.mapH} color={v3.inkSoft} />}
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <V3Compass size={42} />
              </div>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            }}>
              <div>
                <div style={{
                  fontFamily: '"Noto Serif TC", serif', fontSize: 14, fontStyle: 'italic',
                  color: v3.inkSoft,
                }}>{card.sub}</div>
                <V3Meta style={{ marginTop: 4 }}>{card.count} 題</V3Meta>
              </div>
              <div style={{
                fontFamily: '"Noto Serif TC", serif', fontSize: 15, fontWeight: 700,
                color: v3.primaryDeep, borderBottom: `1px solid ${v3.primaryDeep}`,
              }}>翻 開 →</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 18, left: 48, right: 48,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${v3.ruleSoft}`, paddingTop: 10,
      }}>
        <V3Meta>SOURCE · TAIWAN-ATLAS · NATURAL EARTH</V3Meta>
        <V3Meta>FOLIO · 001</V3Meta>
      </div>
    </V3Frame>
  );
}

Object.assign(window, { V3Home, V3Quiz });
