// app.jsx — composes the three variants into a DesignCanvas.

const { DesignCanvas, DCSection, DCArtboard, DCPostIt } = window;

function App() {
  // Quiz scenarios used across variants (same seeds → identical 4 choices in
  // each variant so the cross-variant comparison is fair).
  const scenarios = {
    twActive:  { kind: 'taiwan', targetName: '南投縣', mode: 'idle',    qNum: 3, total: 22, correctCount: 2, choicesSeed: 'tw-nantou-set' },
    twCorrect: { kind: 'taiwan', targetName: '南投縣', mode: 'correct', qNum: 3, total: 22, correctCount: 3, choicesSeed: 'tw-nantou-set', selectedName: '南投縣' },
    twWrong:   { kind: 'taiwan', targetName: '台東縣', mode: 'wrong',   qNum: 5, total: 22, correctCount: 3, choicesSeed: 'tw-taitung-set', selectedName: '花蓮縣' },
    wActive:   { kind: 'world',  targetName: '法國',   mode: 'idle',    qNum: 2, total: 50, correctCount: 1, choicesSeed: 'w-france-set' },
    wWrong:    { kind: 'world',  targetName: '巴西',   mode: 'wrong',   qNum: 7, total: 50, correctCount: 4, choicesSeed: 'w-brazil-set', selectedName: '阿根廷' },
  };

  const QUIZ_W = 1000;
  const QUIZ_H = 920;
  const HOME_W = 1000;
  const HOME_H = 720;

  return (
    <DesignCanvas>
      <DCSection id="v1" title="方案 A · 清新教育版"
        subtitle="柔和米白底 · 圓潤卡片 · Noto Sans TC · 像為國小設計的教科書">
        <DCArtboard id="v1-home" label="首頁" width={HOME_W} height={HOME_H}>
          <V1Home width={HOME_W} height={HOME_H} />
        </DCArtboard>
        <DCArtboard id="v1-tw-active" label="練習 · 進行中（台灣）" width={QUIZ_W} height={QUIZ_H}>
          <V1Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.twActive} />
        </DCArtboard>
        <DCArtboard id="v1-tw-correct" label="練習 · 答對（台灣）" width={QUIZ_W} height={QUIZ_H}>
          <V1Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.twCorrect} />
        </DCArtboard>
        <DCArtboard id="v1-w-wrong" label="練習 · 答錯（世界）" width={QUIZ_W} height={QUIZ_H}>
          <V1Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.wWrong} />
        </DCArtboard>
        <DCPostIt x={0} y={0} width={220}>
          綠色仍是主色，但配上溫暖米白底色與圓角，整體像一本給小朋友的練習簿。
          答題回饋用彩色 pill 配勾叉 icon — 不喧鬧、但有溫度。
        </DCPostIt>
      </DCSection>

      <DCSection id="v2" title="方案 B · 現代編輯版"
        subtitle="留白 · 細線 · 大號 serif 數字 · 像雜誌或學術期刊的清爽版面">
        <DCArtboard id="v2-home" label="首頁" width={HOME_W} height={HOME_H}>
          <V2Home width={HOME_W} height={HOME_H} />
        </DCArtboard>
        <DCArtboard id="v2-tw-active" label="練習 · 進行中（台灣）" width={QUIZ_W} height={QUIZ_H}>
          <V2Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.twActive} />
        </DCArtboard>
        <DCArtboard id="v2-tw-correct" label="練習 · 答對（台灣）" width={QUIZ_W} height={QUIZ_H}>
          <V2Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.twCorrect} />
        </DCArtboard>
        <DCArtboard id="v2-w-wrong" label="練習 · 答錯（世界）" width={QUIZ_W} height={QUIZ_H}>
          <V2Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.wWrong} />
        </DCArtboard>
        <DCPostIt x={0} y={0} width={220}>
          地圖只用輪廓線，只有題目目標填色，視覺非常乾淨。
          大號 serif 題號 + 等寬狀態列強化「在閱讀」的感覺。
          答對／答錯只靠細色框 + 文字標記。
        </DCPostIt>
      </DCSection>

      <DCSection id="v3" title="方案 C · 復古地圖手冊版"
        subtitle="羊皮紙底 · 海面斜紋 · 羅盤 · 像探險手冊或老地圖集">
        <DCArtboard id="v3-home" label="首頁" width={HOME_W} height={HOME_H}>
          <V3Home width={HOME_W} height={HOME_H} />
        </DCArtboard>
        <DCArtboard id="v3-tw-active" label="練習 · 進行中（台灣）" width={QUIZ_W} height={QUIZ_H}>
          <V3Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.twActive} />
        </DCArtboard>
        <DCArtboard id="v3-tw-correct" label="練習 · 答對（台灣）" width={QUIZ_W} height={QUIZ_H}>
          <V3Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.twCorrect} />
        </DCArtboard>
        <DCArtboard id="v3-w-wrong" label="練習 · 答錯（世界）" width={QUIZ_W} height={QUIZ_H}>
          <V3Quiz width={QUIZ_W} height={QUIZ_H} {...scenarios.wWrong} />
        </DCArtboard>
        <DCPostIt x={0} y={0} width={220}>
          海洋用斜紋 pattern、選項卡片有立體陰影、答題回饋是傾斜的印章 —
          整體偏成人向，但小朋友也會被「探險手冊」氛圍吸引。
          綠色保留但深化、加入褐色作為次色。
        </DCPostIt>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <TopoProvider>
    <App />
  </TopoProvider>
);
