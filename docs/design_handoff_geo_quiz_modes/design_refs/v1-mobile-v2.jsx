// v1-mobile-v2.jsx
// 方案 A 手機版的新流程畫面：
//   - HomeStep1（選擇模式）
//   - HomeStep2（選擇地圖，含返回上一步）
//   - EndPractice（練習模式結束）
//   - EndRandom（隨機模式結束）
//   - QuizV2（更新後的 topbar + 最後一題的按鈕變化）
// 沿用 v1 / v1-mobile 的色票與排版語彙。

const M_W_V2 = 402;
const STATUS_PAD = 56;
const HOME_PAD = 38;

function V2Frame({ children, bg }) {
  return (
    <div style={{
      width: M_W_V2, height: 874, background: bg || v1.bg, color: v1.ink,
      paddingTop: STATUS_PAD, paddingBottom: HOME_PAD,
      boxSizing: 'border-box',
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>{children}</div>
  );
}

function V2TopHeader({ correctCount, total, hideBack, transparent, onBack }) {
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px', borderBottom: transparent ? 'none' : `1px solid ${v1.border}`,
      background: transparent ? 'transparent' : v1.card,
    }}>
      {hideBack ? <span /> : (
        <button style={{
          background: 'transparent', border: 'none', color: v1.inkDim, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6,
        }}>
          <span style={{ fontSize: 14 }}>←</span>
          <span>{onBack || '返回'}</span>
        </button>
      )}
      {total > 0 ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, fontSize: 13, color: v1.inkDim }}>
          <span>第</span>
          <span style={{ color: v1.primaryDark, fontWeight: 700, fontSize: 15 }}>{correctCount}</span>
          <span>/ {total} 題</span>
        </div>
      ) : <span />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 模式圖示（純 SVG，無 emoji）
// ─────────────────────────────────────────────────────────────
function ModeGlyphPractice({ size = 56, color = v1.primary, soft = v1.primarySoft }) {
  // checklist-like progression
  return (
    <div style={{
      width: size, height: size, background: soft, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="6" height="3" rx="1.5" fill={color} />
        <rect x="11" y="5.5" width="10" height="2" rx="1" fill={color} opacity="0.35" />
        <rect x="3" y="11" width="6" height="3" rx="1.5" fill={color} />
        <rect x="11" y="11.5" width="10" height="2" rx="1" fill={color} opacity="0.35" />
        <rect x="3" y="17" width="6" height="3" rx="1.5" fill={color} opacity="0.4" />
        <rect x="11" y="17.5" width="10" height="2" rx="1" fill={color} opacity="0.2" />
      </svg>
    </div>
  );
}

function ModeGlyphRandom({ size = 56, color = v1.primary, soft = v1.primarySoft }) {
  // shuffle / dice-like glyph (3 small squares offset)
  return (
    <div style={{
      width: size, height: size, background: soft, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        {/* shuffle arrows */}
        <path d="M3 7 L9 7 C12 7 13 10 14 13 C15 16 16 17 19 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M3 17 L9 17 C12 17 13 14 14 11 C15 8 16 7 19 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
        <path d="M17 5 L21 7 L17 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M17 15 L21 17 L17 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 首頁 Step 1 — 選擇模式
// ─────────────────────────────────────────────────────────────
function V2HomeStep1() {
  return (
    <V2Frame>
      <V2TopHeader correctCount={0} total={0} hideBack transparent />
      <div style={{ padding: '6px 22px 22px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 999, background: v1.primarySoft,
          color: v1.primaryDark, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          marginTop: 12, marginBottom: 14,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: v1.primary }} />
          地圖練習工具
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15,
        }}>看著地圖<br />認識每一個地方</h1>
        <p style={{
          color: v1.inkDim, fontSize: 14, lineHeight: 1.55, marginTop: 12, marginBottom: 8,
        }}>選擇一種練習方式開始。</p>

        {/* step indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: v1.inkDim, fontWeight: 600, letterSpacing: '0.12em',
          marginTop: 6, marginBottom: 18, textTransform: 'uppercase',
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%', background: v1.primary,
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>1</span>
          <span style={{ color: v1.primaryDark }}>選擇模式</span>
          <span style={{ width: 14, height: 1, background: v1.border }} />
          <span style={{ color: v1.inkDim, opacity: 0.6 }}>2 選擇地圖</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { id: 'practice', title: '練習', sub: '所有題目各出一次', tag: '完整題庫', glyph: <ModeGlyphPractice /> },
            { id: 'random', title: '隨機', sub: '隨機 20 題，滿分 100', tag: '挑戰計分', glyph: <ModeGlyphRandom /> },
          ].map(card => (
            <button key={card.id} style={{
              background: v1.card, border: `1.5px solid ${v1.border}`, borderRadius: 18,
              padding: 14, textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', color: v1.ink,
              display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'center',
              boxShadow: '0 1px 0 rgba(31,43,37,0.04)',
            }}>
              {card.glyph}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 19, fontWeight: 800 }}>{card.title}</span>
                  <span style={{
                    fontSize: 10, color: v1.primaryDark, background: v1.primarySoft,
                    padding: '2px 7px', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em',
                  }}>{card.tag}</span>
                </div>
                <div style={{ fontSize: 13, color: v1.inkDim, lineHeight: 1.4 }}>{card.sub}</div>
              </div>
              <span style={{
                color: v1.primaryDark, fontSize: 18, fontWeight: 700, flexShrink: 0,
              }}>→</span>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 22, padding: '10px 14px',
          background: 'rgba(31, 43, 37, 0.025)',
          borderRadius: 12, fontSize: 12, color: v1.inkDim, lineHeight: 1.55, textAlign: 'left',
        }}>
          <div style={{ fontWeight: 700, color: v1.ink, marginBottom: 2 }}>怎麼選？</div>
          <span><strong style={{ color: v1.primaryDark }}>練習</strong>會把每個地方都出一次，適合認識；</span><br/>
          <span><strong style={{ color: v1.primaryDark }}>隨機</strong>是 20 題小測驗，可以看到分數。</span>
        </div>
      </div>
    </V2Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 首頁 Step 2 — 選擇地圖（含返回 step 1）
// ─────────────────────────────────────────────────────────────
function V2HomeStep2({ mode }) {
  const t = useTopos();
  const twPreview = t.taiwan ? computeMap(t.taiwan, 'taiwan', 140, 160, null, { padding: 10 }) : null;
  const wPreview  = t.world  ? computeMap(t.world,  'world',  280, 160, null, { padding: 12 }) : null;
  const isPractice = mode === 'practice';
  const cta = isPractice ? '開始練習 →' : '開始挑戰 →';

  return (
    <V2Frame>
      {/* top bar with 重新選擇 */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
      }}>
        <button style={{
          background: 'transparent', border: 'none', color: v1.inkDim, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6,
        }}>
          <span style={{ fontSize: 14 }}>←</span>
          <span>重新選擇</span>
        </button>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12,
          color: v1.inkDim,
        }}>
          {isPractice
            ? <><ModeGlyphPractice size={20} /> 練習模式</>
            : <><ModeGlyphRandom size={20} /> 隨機模式</>}
        </span>
      </div>

      <div style={{ padding: '4px 22px 22px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>選擇要練習的地圖</h1>
        <p style={{
          color: v1.inkDim, fontSize: 13, lineHeight: 1.5, marginTop: 4, marginBottom: 6,
        }}>{isPractice ? '依模式不同，題數會跟著變。' : '每個地圖隨機抽 20 題，每題 5 分。'}</p>

        {/* step indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: v1.inkDim, fontWeight: 600, letterSpacing: '0.12em',
          marginTop: 10, marginBottom: 18, textTransform: 'uppercase',
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%', background: v1.primarySoft,
            color: v1.primaryDark, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>✓</span>
          <span style={{ color: v1.inkDim }}>1 {isPractice ? '練習' : '隨機'}</span>
          <span style={{ width: 14, height: 1, background: v1.border }} />
          <span style={{
            width: 18, height: 18, borderRadius: '50%', background: v1.primary,
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>2</span>
          <span style={{ color: v1.primaryDark }}>選擇地圖</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { kind: 'taiwan', title: '台灣縣市', count: isPractice ? 27 : 20, m: twPreview, mapW: 140, mapH: 160, sub: '練習認識本島與外島' },
            { kind: 'world',  title: '世界國家', count: isPractice ? 50 : 20, m: wPreview,  mapW: 280, mapH: 160, sub: '五大洲的代表國家' },
          ].map(card => (
            <button key={card.kind} style={{
              background: v1.card, border: `1.5px solid ${v1.border}`, borderRadius: 18,
              padding: 14, textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', color: v1.ink,
              display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center',
              boxShadow: '0 1px 0 rgba(31,43,37,0.04)',
            }}>
              <div style={{
                width: 96, height: 96, background: v1.ocean, borderRadius: 12,
                overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.m ? (
                  <svg width={96} height={96} viewBox={`0 0 ${card.mapW} ${card.mapH}`} preserveAspectRatio="xMidYMid meet">
                    {card.m.items.map(it => (
                      <path key={it.id} d={it.d} fill={v1.countyDefault} stroke="#fff" strokeWidth="0.6" />
                    ))}
                  </svg>
                ) : <MapLoading width={96} height={96} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{card.title}</span>
                  <span style={{
                    fontSize: 11, color: v1.primaryDark, background: v1.primarySoft,
                    padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                  }}>{card.count} 題</span>
                </div>
                <div style={{ fontSize: 13, color: v1.inkDim, lineHeight: 1.4, marginBottom: 8 }}>{card.sub}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: v1.primaryDark, fontSize: 13, fontWeight: 700,
                }}>{cta}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </V2Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 結束畫面 — 練習模式
// ─────────────────────────────────────────────────────────────
function V2EndPractice({ correct, total, kind }) {
  const pct = Math.round(correct / total * 100);
  // tone based on percentage
  const tone = pct >= 85 ? 'great' : pct >= 60 ? 'good' : 'try';
  const msg = {
    great: { headline: '答得超棒！', sub: '你對這個地圖已經非常熟悉了。' },
    good:  { headline: '不錯哦！', sub: '繼續練習，你會越來越熟。' },
    try:   { headline: '再試一次看看', sub: '多看幾次就會記起來的。' },
  }[tone];

  return (
    <V2Frame>
      <V2TopHeader correctCount={total} total={total} hideBack onBack={null} />
      <div style={{ padding: '24px 22px 22px', textAlign: 'center', height: 'calc(100% - 44px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'center',
          padding: '3px 10px', borderRadius: 999, background: v1.primarySoft,
          color: v1.primaryDark, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          marginBottom: 24,
        }}>
          <ModeGlyphPractice size={16} />
          練習結束 · {kind === 'taiwan' ? '台灣縣市' : '世界國家'}
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>{msg.headline}</h1>
        <p style={{ color: v1.inkDim, fontSize: 14, marginTop: 8, marginBottom: 28 }}>{msg.sub}</p>

        {/* progress ring */}
        <div style={{ alignSelf: 'center', position: 'relative', width: 200, height: 200, marginBottom: 22 }}>
          <svg width={200} height={200} viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="86" fill="none" stroke={v1.ocean} strokeWidth="14" />
            <circle cx="100" cy="100" r="86"
              fill="none" stroke={v1.primary} strokeWidth="14"
              strokeDasharray={`${(86 * 2 * Math.PI) * pct / 100} ${86 * 2 * Math.PI}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontSize: 56, fontWeight: 900, color: v1.ink, letterSpacing: '-0.04em', lineHeight: 1,
            }}>{pct}<span style={{ fontSize: 24, fontWeight: 700, color: v1.inkDim, marginLeft: 2 }}>%</span></div>
            <div style={{ marginTop: 6, fontSize: 14, color: v1.inkDim, fontWeight: 600 }}>
              答對 <span style={{ color: v1.primaryDark, fontWeight: 800 }}>{correct}</span> / {total} 題
            </div>
          </div>
        </div>

        {/* breakdown */}
        <div style={{
          background: v1.card, border: `1.5px solid ${v1.border}`, borderRadius: 14,
          padding: '12px 14px', display: 'flex', justifyContent: 'space-around', marginBottom: 22,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: v1.inkDim, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>答對</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: v1.primaryDark, marginTop: 2 }}>{correct}</div>
          </div>
          <div style={{ width: 1, background: v1.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: v1.inkDim, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>答錯</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#d44141', marginTop: 2 }}>{total - correct}</div>
          </div>
          <div style={{ width: 1, background: v1.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: v1.inkDim, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>總題數</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: v1.ink, marginTop: 2 }}>{total}</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            background: v1.primary, color: '#fff', border: 'none', borderRadius: 14,
            padding: 14, fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(29,158,117,0.28)',
          }}>再來一次</button>
          <button style={{
            background: 'transparent', color: v1.inkDim, border: 'none', borderRadius: 14,
            padding: '12px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer',
          }}>返回首頁</button>
        </div>
      </div>
    </V2Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 結束畫面 — 隨機模式
// ─────────────────────────────────────────────────────────────
function V2EndRandom({ score, kind }) {
  const correct = score / 5;
  const tone = score >= 85 ? 'great' : score >= 60 ? 'good' : 'try';
  const msg = {
    great: { headline: '太強了！', sub: '幾乎全對，挑戰大成功。' },
    good:  { headline: '表現不錯！', sub: '再來幾次能拿更高分。' },
    try:   { headline: '再挑戰一次', sub: '多練習，分數會慢慢爬上來。' },
  }[tone];

  return (
    <V2Frame>
      <V2TopHeader correctCount={20} total={20} hideBack />
      <div style={{ padding: '24px 22px 22px', textAlign: 'center', height: 'calc(100% - 44px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'center',
          padding: '3px 10px', borderRadius: 999, background: v1.primarySoft,
          color: v1.primaryDark, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          marginBottom: 24,
        }}>
          <ModeGlyphRandom size={16} />
          挑戰結束 · {kind === 'taiwan' ? '台灣縣市' : '世界國家'}
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>{msg.headline}</h1>
        <p style={{ color: v1.inkDim, fontSize: 14, marginTop: 8, marginBottom: 22 }}>{msg.sub}</p>

        {/* big score */}
        <div style={{
          alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: 22,
        }}>
          <div style={{
            fontSize: 12, color: v1.inkDim, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4,
          }}>YOUR SCORE</div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 6, lineHeight: 1,
          }}>
            <span style={{
              fontSize: 110, fontWeight: 900, color: v1.primary, letterSpacing: '-0.05em',
            }}>{score}</span>
            <span style={{ fontSize: 30, fontWeight: 800, color: v1.inkDim, letterSpacing: '-0.02em' }}>分</span>
          </div>
          <div style={{
            fontSize: 13, color: v1.inkDim, marginTop: 6,
          }}>滿分 100 · 共 20 題</div>
        </div>

        {/* progress bar */}
        <div style={{ padding: '0 4px', marginBottom: 18 }}>
          <div style={{
            height: 10, background: v1.ocean, borderRadius: 999, overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${score}%`, background: v1.primary, borderRadius: 999,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: v1.inkDim }}>
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>

        {/* breakdown */}
        <div style={{
          background: v1.card, border: `1.5px solid ${v1.border}`, borderRadius: 14,
          padding: '12px 14px', display: 'flex', justifyContent: 'space-around', marginBottom: 22,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: v1.inkDim, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>答對</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: v1.primaryDark, marginTop: 2 }}>{correct}</div>
          </div>
          <div style={{ width: 1, background: v1.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: v1.inkDim, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>答錯</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#d44141', marginTop: 2 }}>{20 - correct}</div>
          </div>
          <div style={{ width: 1, background: v1.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: v1.inkDim, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>正確率</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: v1.ink, marginTop: 2 }}>{correct * 5}%</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            background: v1.primary, color: '#fff', border: 'none', borderRadius: 14,
            padding: 14, fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(29,158,117,0.28)',
          }}>再來一次</button>
          <button style={{
            background: 'transparent', color: v1.inkDim, border: 'none', borderRadius: 14,
            padding: '12px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer',
          }}>返回首頁</button>
        </div>
      </div>
    </V2Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// Quiz V2 — 更新後的 topbar（顯示「第 N / 總 題」）+ 最後一題按鈕變化
// 沿用既有 V1MobileQuiz 的所有狀態邏輯與排版
// ─────────────────────────────────────────────────────────────
function V2Quiz({ kind, targetName, mode, selectedName, choicesSeed, qNum, total, isLast }) {
  const t = useTopos();
  const fc = t[kind];
  const target = findFeature(fc, kind, targetName);
  const selected = selectedName ? findFeature(fc, kind, selectedName) : null;
  const choices = buildChoices(fc, kind, targetName, choicesSeed);

  const mapW = M_W_V2 - 28;
  const mapH = kind === 'taiwan' ? 340 : 240;

  // local choice/feedback rendering — same tokens as v1-mobile
  return (
    <V2Frame>
      <V2TopHeader correctCount={qNum} total={total} />
      <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 44px)', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.16em', color: v1.inkDim, fontWeight: 600,
            textTransform: 'uppercase', marginBottom: 4,
          }}>QUESTION {qNum}{isLast ? ' · 最後一題' : ''}</div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.01em',
          }}>這是哪個{kind === 'taiwan' ? '縣市' : '國家'}？</h1>
        </div>

        {/* simplified map for this preview — reuse V1MobileMapPanel */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <V1MobileMapPanel kind={kind} target={target} selected={selected} mode={mode} width={mapW} height={mapH} />
        </div>

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

        <V1MobileFeedback mode={mode} correctName={targetName} />

        {mode !== 'idle' && (
          <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex' }}>
            <button style={{
              flex: 1, background: v1.primary, color: '#fff', border: 'none', borderRadius: 14,
              padding: '14px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(29,158,117,0.28)',
            }}>{isLast ? '查看結果 →' : '下一題 →'}</button>
          </div>
        )}
      </div>
    </V2Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// 桌面/平板響應式範例（>= 768px）
// 內容居中，max-width 跟著斷點調整
// ─────────────────────────────────────────────────────────────
function V2HomeStep1Desktop({ width, height, breakpoint }) {
  // breakpoint: 'tablet' 768 / 'desktop' 1024
  const maxW = breakpoint === 'tablet' ? 640 : 720;
  return (
    <div style={{
      width, height, background: v1.bg, color: v1.ink,
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      overflow: 'hidden', position: 'relative', boxSizing: 'border-box',
    }}>
      {/* top bar (no status bar since this is web) */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: `1px solid ${v1.border}`, background: v1.card,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 14, fontWeight: 700, color: v1.ink,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: v1.primary }} />
          地圖練習工具
        </span>
        <span style={{ fontSize: 13, color: v1.inkDim }}>{breakpoint === 'tablet' ? '平板版' : '桌面版'} · max {maxW}px</span>
      </div>

      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 12px', borderRadius: 999, background: v1.primarySoft,
          color: v1.primaryDark, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
          marginBottom: 18,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: v1.primary }} />
          地圖練習工具
        </div>
        <h1 style={{
          fontSize: breakpoint === 'tablet' ? 40 : 44, fontWeight: 800, margin: 0,
          letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>看著地圖<br />認識每一個地方</h1>
        <p style={{
          color: v1.inkDim, fontSize: 16, lineHeight: 1.55, marginTop: 14, marginBottom: 8,
          maxWidth: 460, marginLeft: 'auto', marginRight: 'auto',
        }}>選擇一種練習方式開始。</p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: v1.inkDim, fontWeight: 600, letterSpacing: '0.12em',
          marginTop: 12, marginBottom: 28, textTransform: 'uppercase',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: v1.primary,
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>1</span>
          <span style={{ color: v1.primaryDark }}>選擇模式</span>
          <span style={{ width: 20, height: 1, background: v1.border }} />
          <span style={{ color: v1.inkDim, opacity: 0.6 }}>2 選擇地圖</span>
        </div>

        {/* on tablet+ side by side */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left',
        }}>
          {[
            { id: 'practice', title: '練習', sub: '所有題目各出一次', tag: '完整題庫', desc: '依地圖題庫順序，每個地方都會出現一次。', glyph: <ModeGlyphPractice size={64} /> },
            { id: 'random', title: '隨機', sub: '隨機 20 題，滿分 100', tag: '挑戰計分', desc: '從題庫中隨機抽 20 題，每題 5 分，看你能拿多少。', glyph: <ModeGlyphRandom size={64} /> },
          ].map(card => (
            <button key={card.id} style={{
              background: v1.card, border: `1.5px solid ${v1.border}`, borderRadius: 22,
              padding: 22, textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', color: v1.ink,
              display: 'flex', flexDirection: 'column', gap: 14,
              boxShadow: '0 1px 0 rgba(31,43,37,0.04)',
            }}>
              {card.glyph}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>{card.title}</span>
                  <span style={{
                    fontSize: 11, color: v1.primaryDark, background: v1.primarySoft,
                    padding: '2px 8px', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em',
                  }}>{card.tag}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: v1.ink, marginBottom: 6 }}>{card.sub}</div>
                <div style={{ fontSize: 13, color: v1.inkDim, lineHeight: 1.55 }}>{card.desc}</div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 'auto',
                color: v1.primaryDark, fontSize: 14, fontWeight: 700,
              }}>選擇此模式 →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  V2HomeStep1, V2HomeStep2, V2EndPractice, V2EndRandom, V2Quiz, V2HomeStep1Desktop,
  ModeGlyphPractice, ModeGlyphRandom,
});
