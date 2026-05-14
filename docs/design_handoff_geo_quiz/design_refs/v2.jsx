// v2.jsx — 現代編輯版
// Editorial type pairing (Noto Serif TC + JetBrains Mono for meta).
// Crisp white space, thin lines, large numbers. Map is outline-first —
// only the target carries fill.

const v2 = {
  bg: '#ffffff',
  ink: '#0d1310',
  ink2: '#5a625d',
  ink3: '#9aa19c',
  rule: '#dad6cc',
  ruleSoft: '#ece8de',
  primary: '#157857',
  primaryDeep: '#0b4a36',
  paper: '#faf8f2',
  countyStroke: '#cfcbbf',
  countyFill: '#ffffff',
  countyDim: '#ece8de',
  countyDimStroke: '#d8d4c7',
  countyHighlight: '#1D9E75',
  countyCorrect: '#157857',
  countyWrong: '#c43a1f',
  countyWrongSoft: '#f5d9d1',
};

function V2Frame({ width, height, children }) {
  return (
    <div style={{
      width, height, background: v2.bg, color: v2.ink, position: 'relative',
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>{children}</div>
  );
}

function V2Meta({ children }) {
  return <span style={{
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11, letterSpacing: '0.12em', color: v2.ink2, textTransform: 'uppercase',
  }}>{children}</span>;
}

function V2Header({ correctCount, total, kind }) {
  return (
    <div style={{
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', borderBottom: `1px solid ${v2.rule}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: v2.ink2, cursor: 'pointer',
        }}>← INDEX</span>
        <span style={{ color: v2.ink3 }}>·</span>
        <V2Meta>{kind === 'taiwan' ? 'TAIWAN / COUNTIES' : 'WORLD / NATIONS'}</V2Meta>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <V2Meta>SCORE</V2Meta>
        <span style={{
          fontFamily: '"Noto Serif TC", serif', fontSize: 18, fontWeight: 700, color: v2.ink,
        }}>{String(correctCount).padStart(2,'0')}<span style={{ color: v2.ink3 }}> / {String(total).padStart(2,'0')}</span></span>
      </div>
    </div>
  );
}

function V2MapPanel({ kind, target, selected, mode, width, height }) {
  const t = useTopos();
  const fc = t[kind];
  if (!fc) return <MapLoading width={width} height={height} color={v2.ink3} />;

  let zoomFit = target;
  if (mode === 'wrong' && selected && selected !== target) {
    zoomFit = { type: 'FeatureCollection', features: [target, selected] };
  }
  const m = computeMap(fc, kind, width, height, target, {
    fill: kind === 'taiwan' ? 0.6 : 0.5, maxScale: kind === 'taiwan' ? 4 : 3.2, padding: 24,
    zoomFit,
  });
  if (!m) return <MapLoading width={width} height={height} color={v2.ink3} />;

  const selectedId = selected ? idOf(selected, kind) : null;
  const fillFor = (it) => {
    if (mode === 'idle') return it.isTarget ? v2.countyHighlight : v2.countyFill;
    if (mode === 'correct') return it.isTarget ? v2.countyCorrect : v2.countyFill;
    if (mode === 'wrong') {
      if (it.id === selectedId) return v2.countyWrongSoft;
      if (it.isTarget) return v2.countyHighlight;
      return v2.countyFill;
    }
    return v2.countyFill;
  };
  const strokeFor = (it) => {
    if (it.isTarget && mode !== 'idle') return v2.primaryDeep;
    if (it.isTarget) return v2.primaryDeep;
    if (mode === 'wrong' && it.id === selectedId) return v2.countyWrong;
    return v2.countyStroke;
  };
  const strokeWFor = (it) => {
    if (it.isTarget) return 1.4 / m.transform.scale;
    if (mode === 'wrong' && it.id === selectedId) return 1.2 / m.transform.scale;
    return 0.5 / m.transform.scale;
  };

  return (
    <div style={{
      width, height, background: v2.paper, position: 'relative',
      borderTop: `1px solid ${v2.rule}`, borderBottom: `1px solid ${v2.rule}`,
    }}>
      {/* corner ticks for editorial feel */}
      {[[0,0],[width-12,0],[0,height-12],[width-12,height-12]].map(([x,y], i) => (
        <svg key={i} width="12" height="12" style={{ position: 'absolute', left: x, top: y }}>
          <path d={i===0?'M0,6L0,0L6,0':i===1?'M6,0L12,0L12,6':i===2?'M0,6L0,12L6,12':'M6,12L12,12L12,6'}
            fill="none" stroke={v2.ink} strokeWidth="1" />
        </svg>
      ))}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <g transform={`translate(${m.transform.tx}, ${m.transform.ty}) scale(${m.transform.scale})`}>
          {m.items.map(it => (
            <path key={it.id} d={it.d}
              fill={fillFor(it)} stroke={strokeFor(it)} strokeWidth={strokeWFor(it)}
              strokeLinejoin="round" />
          ))}
        </g>
      </svg>
      {/* meta strip */}
      <div style={{
        position: 'absolute', top: 14, left: 14, display: 'flex', gap: 14,
      }}>
        <V2Meta>FIG. {String(Math.floor(Math.random()*9)+3).padStart(2,'0')}</V2Meta>
      </div>
      <div style={{ position: 'absolute', top: 14, right: 14 }}>
        <V2Meta>SCALE ×{m.transform.scale.toFixed(2)}</V2Meta>
      </div>
    </div>
  );
}

function V2Choice({ label, state }) {
  const base = {
    background: v2.bg, color: v2.ink, border: `1px solid ${v2.rule}`,
    fontFamily: '"Noto Serif TC", serif',
  };
  const variants = {
    correct: { background: v2.bg, color: v2.primaryDeep, border: `1.5px solid ${v2.countyCorrect}` },
    wrong: { background: v2.bg, color: v2.countyWrong, border: `1.5px solid ${v2.countyWrong}` },
    target: { background: v2.bg, color: v2.primaryDeep, border: `1.5px solid ${v2.countyCorrect}` },
    other: { background: v2.bg, color: v2.ink3, border: `1px solid ${v2.ruleSoft}` },
  };
  const s = { ...base, ...(variants[state] || {}) };
  return (
    <button style={{
      ...s, borderRadius: 4, padding: '20px 12px', fontSize: 19, fontWeight: 600,
      cursor: 'pointer', transition: 'all .15s', textAlign: 'center', minHeight: 60,
      letterSpacing: '0.02em', position: 'relative',
    }}>
      {state === 'correct' && <span style={{
        position: 'absolute', top: 6, right: 8, fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, color: v2.primary, letterSpacing: '0.08em',
      }}>✓ CORRECT</span>}
      {state === 'wrong' && <span style={{
        position: 'absolute', top: 6, right: 8, fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, color: v2.countyWrong, letterSpacing: '0.08em',
      }}>✕ WRONG</span>}
      {state === 'target' && <span style={{
        position: 'absolute', top: 6, right: 8, fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, color: v2.primary, letterSpacing: '0.08em',
      }}>↑ ANSWER</span>}
      {label}
    </button>
  );
}

function V2Quiz({ width, height, kind, targetName, mode, selectedName, choicesSeed, qNum, total, correctCount }) {
  const t = useTopos();
  const fc = t[kind];
  const target = findFeature(fc, kind, targetName);
  const selected = selectedName ? findFeature(fc, kind, selectedName) : null;
  const choices = buildChoices(fc, kind, targetName, choicesSeed);

  const mapW = Math.min(width - 64, 680);
  const mapH = kind === 'taiwan' ? 420 : 320;

  return (
    <V2Frame width={width} height={height}>
      <V2Header correctCount={correctCount} total={total} kind={kind} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 32px 28px' }}>
        {/* big number + question */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 20,
          borderBottom: `1px solid ${v2.ruleSoft}`, paddingBottom: 18,
        }}>
          <div style={{
            fontFamily: '"Noto Serif TC", serif', fontSize: 80, lineHeight: 0.9,
            fontWeight: 700, letterSpacing: '-0.04em', color: v2.ink,
          }}>{String(qNum).padStart(2,'0')}</div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <V2Meta>第 {qNum} 題 / 共 {total} 題</V2Meta>
            <h1 style={{
              fontFamily: '"Noto Serif TC", serif',
              fontSize: 32, fontWeight: 600, margin: '8px 0 0', letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>這是哪個{kind === 'taiwan' ? '縣市' : '國家'}？</h1>
          </div>
          <div style={{ paddingBottom: 12, textAlign: 'right' }}>
            <V2Meta>STATUS</V2Meta>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 14, marginTop: 4,
              color: mode === 'correct' ? v2.primary : mode === 'wrong' ? v2.countyWrong : v2.ink2,
            }}>
              {mode === 'idle' && '— AWAITING —'}
              {mode === 'correct' && '✓ ANSWERED'}
              {mode === 'wrong' && '✕ ANSWERED'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <V2MapPanel kind={kind} target={target} selected={selected} mode={mode} width={mapW} height={mapH} />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          borderLeft: `1px solid ${v2.rule}`, borderTop: `1px solid ${v2.rule}`,
        }}>
          {choices.map((c, i) => {
            let state = 'base';
            if (mode === 'correct' && c === targetName) state = 'correct';
            else if (mode === 'wrong' && c === selectedName) state = 'wrong';
            else if (mode === 'wrong' && c === targetName) state = 'target';
            else if (mode !== 'idle') state = 'other';
            // override border radius to 0 for grid edges
            return (
              <div key={i} style={{ borderRight: `1px solid ${v2.rule}`, borderBottom: `1px solid ${v2.rule}` }}>
                <V2Choice label={c} state={state} />
              </div>
            );
          })}
        </div>

        {mode !== 'idle' && (
          <div style={{
            marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 18, borderTop: `1px solid ${v2.ruleSoft}`,
          }}>
            <div style={{
              fontFamily: '"Noto Serif TC", serif', fontSize: 19,
              color: mode === 'correct' ? v2.primaryDeep : v2.countyWrong,
            }}>
              {mode === 'correct'
                ? <>正確 — 這是<span style={{ borderBottom: `2px solid ${v2.primary}` }}>「{targetName}」</span></>
                : <>不正確 — 正確答案是<span style={{ borderBottom: `2px solid ${v2.countyWrong}` }}>「{targetName}」</span></>}
            </div>
            <button style={{
              background: v2.ink, color: v2.bg, border: 'none', borderRadius: 0,
              padding: '14px 28px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>NEXT &nbsp;→</button>
          </div>
        )}
        {mode === 'idle' && (
          <div style={{
            marginTop: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
            color: v2.ink3, textAlign: 'center', letterSpacing: '0.12em',
          }}>SELECT AN ANSWER ABOVE</div>
        )}
      </div>
    </V2Frame>
  );
}

function V2Home({ width, height }) {
  const t = useTopos();
  const twP = t.taiwan ? computeMap(t.taiwan, 'taiwan', 240, 280, null, { padding: 18 }) : null;
  const wP = t.world ? computeMap(t.world, 'world', 360, 220, null, { padding: 18 }) : null;

  return (
    <V2Frame width={width} height={height}>
      {/* masthead */}
      <div style={{
        padding: '32px 48px 18px', borderBottom: `1px solid ${v2.rule}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <V2Meta>VOL. 01 · 地理練習</V2Meta>
          <h1 style={{
            fontFamily: '"Noto Serif TC", serif', fontSize: 46, fontWeight: 700,
            margin: '6px 0 0', letterSpacing: '-0.02em', lineHeight: 1,
          }}>地圖練習工具</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <V2Meta>2026 / 春季學期</V2Meta>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 12,
            marginTop: 4, color: v2.ink2,
          }}>EDITION · WEB</div>
        </div>
      </div>

      <div style={{ padding: '24px 48px 0' }}>
        <p style={{
          fontFamily: '"Noto Serif TC", serif', fontSize: 18, lineHeight: 1.55,
          color: v2.ink, margin: 0, maxWidth: 560, fontStyle: 'italic',
        }}>地圖會放大顯示一個地方的輪廓，從四個選項中選出它的名字。連續練習，認識每一片土地。</p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
        padding: '28px 48px', gap: 0, alignItems: 'stretch',
      }}>
        {[
          { kind: 'taiwan', n: '01', title: '台灣縣市', count: 22, m: twP, mapW: 240, mapH: 280,
            desc: '從基隆到屏東，外島也算。' },
          null,
          { kind: 'world', n: '02', title: '世界國家', count: 50, m: wP, mapW: 360, mapH: 220,
            desc: '五大洲的代表國家。' },
        ].map((card, i) => {
          if (!card) return <div key="div" style={{ background: v2.rule, margin: '8px 24px' }} />;
          return (
            <div key={card.kind} style={{
              padding: i === 0 ? '0 24px 0 0' : '0 0 0 24px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{
                  fontFamily: '"Noto Serif TC", serif', fontSize: 36, fontWeight: 700,
                  color: v2.primary, letterSpacing: '-0.02em',
                }}>{card.n}</span>
                <span style={{
                  fontFamily: '"Noto Serif TC", serif', fontSize: 26, fontWeight: 600,
                }}>{card.title}</span>
                <V2Meta>{card.count} 題</V2Meta>
              </div>
              <div style={{
                height: 280, background: v2.paper, display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: `1px solid ${v2.rule}`,
              }}>
                {card.m ? (
                  <svg width={card.mapW} height={card.mapH}>
                    {card.m.items.map(it => (
                      <path key={it.id} d={it.d} fill="none" stroke={v2.ink} strokeWidth="0.6" />
                    ))}
                  </svg>
                ) : <MapLoading width={card.mapW} height={card.mapH} color={v2.ink3} />}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 6,
              }}>
                <span style={{
                  fontFamily: '"Noto Serif TC", serif', fontSize: 15, color: v2.ink2,
                }}>{card.desc}</span>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: v2.ink,
                  fontWeight: 700, letterSpacing: '0.08em',
                }}>BEGIN &nbsp;→</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 16, left: 48, right: 48,
        display: 'flex', justifyContent: 'space-between',
        borderTop: `1px solid ${v2.ruleSoft}`, paddingTop: 12,
      }}>
        <V2Meta>SOURCE · TAIWAN-ATLAS · NATURAL EARTH 110M</V2Meta>
        <V2Meta>P. 001</V2Meta>
      </div>
    </V2Frame>
  );
}

Object.assign(window, { V2Home, V2Quiz });
