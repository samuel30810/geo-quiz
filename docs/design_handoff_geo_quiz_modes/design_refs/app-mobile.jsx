// app-mobile.jsx — 方案 A 手機版的設計畫布

const { DesignCanvas, DCSection, DCArtboard, DCPostIt, IOSDevice } = window;

function MobileApp() {
  const scenarios = {
    home: null,
    twActive:  { kind: 'taiwan', targetName: '南投縣', mode: 'idle',    qNum: 3, total: 22, correctCount: 2, choicesSeed: 'tw-nantou-set' },
    twCorrect: { kind: 'taiwan', targetName: '南投縣', mode: 'correct', qNum: 3, total: 22, correctCount: 3, choicesSeed: 'tw-nantou-set', selectedName: '南投縣' },
    twWrong:   { kind: 'taiwan', targetName: '台東縣', mode: 'wrong',   qNum: 5, total: 22, correctCount: 3, choicesSeed: 'tw-taitung-set', selectedName: '花蓮縣' },
    wActive:   { kind: 'world',  targetName: '法國',   mode: 'idle',    qNum: 2, total: 50, correctCount: 1, choicesSeed: 'w-france-set' },
    wWrong:    { kind: 'world',  targetName: '巴西',   mode: 'wrong',   qNum: 7, total: 50, correctCount: 4, choicesSeed: 'w-brazil-set', selectedName: '阿根廷' },
  };

  // iOS frame is 402×874; pad slightly inside the artboard
  const AB_W = 442;
  const AB_H = 920;

  const frame = (content) => (
    <div style={{
      width: AB_W, height: AB_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, boxSizing: 'border-box', background: 'transparent',
    }}>
      <IOSDevice width={402} height={874}>{content}</IOSDevice>
    </div>
  );

  return (
    <DesignCanvas>
      <DCSection id="mobile-flow" title="方案 A · 手機版（iPhone）"
        subtitle="402×874 的 iOS 框內，內容以手機優先版面排列：4 選項 2×2、地圖縮小、內距收緊">
        <DCArtboard id="m-home" label="01 · 首頁" width={AB_W} height={AB_H}>
          {frame(<V1MobileHome />)}
        </DCArtboard>
        <DCArtboard id="m-tw-active" label="02 · 練習進行中（台灣）" width={AB_W} height={AB_H}>
          {frame(<V1MobileQuiz {...scenarios.twActive} />)}
        </DCArtboard>
        <DCArtboard id="m-tw-correct" label="03 · 答對（台灣）" width={AB_W} height={AB_H}>
          {frame(<V1MobileQuiz {...scenarios.twCorrect} />)}
        </DCArtboard>
        <DCArtboard id="m-tw-wrong" label="04 · 答錯（台灣）" width={AB_W} height={AB_H}>
          {frame(<V1MobileQuiz {...scenarios.twWrong} />)}
        </DCArtboard>
        <DCArtboard id="m-w-active" label="05 · 練習進行中（世界）" width={AB_W} height={AB_H}>
          {frame(<V1MobileQuiz {...scenarios.wActive} />)}
        </DCArtboard>
        <DCArtboard id="m-w-wrong" label="06 · 答錯（世界）" width={AB_W} height={AB_H}>
          {frame(<V1MobileQuiz {...scenarios.wWrong} />)}
        </DCArtboard>

        <DCPostIt x={0} y={0} width={240}>
          <strong>RWD 重點</strong><br/>
          · 選項從 4 欄改為 2×2 grid（規劃文件 6.5 RWD）<br/>
          · 觸控目標 ≥ 48px（這裡是 56px）<br/>
          · 答錯時地圖會 zoom out 同時顯示「我選的」與「正確答案」，這樣小朋友可以看到自己錯在哪裡<br/>
          · 「下一題」按鈕貼到底部、整寬，方便單手操作
        </DCPostIt>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <TopoProvider>
    <MobileApp />
  </TopoProvider>
);
