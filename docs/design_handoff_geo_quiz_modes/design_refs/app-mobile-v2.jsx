// app-mobile-v2.jsx — 新流程（模式選擇 + 結束畫面）

const { DesignCanvas, DCSection, DCArtboard, DCPostIt } = window;

function MobileAppV2() {
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
      <DCSection id="new-home" title="① 首頁新流程（兩步驟）"
        subtitle="Step 1 選擇模式 → Step 2 選擇地圖。同頁狀態切換，不換頁。">
        <DCArtboard id="step1" label="01 · Step 1 · 選擇模式" width={AB_W} height={AB_H}>
          {frame(<V2HomeStep1 />)}
        </DCArtboard>
        <DCArtboard id="step2-practice" label="02 · Step 2 · 選擇地圖（練習模式）" width={AB_W} height={AB_H}>
          {frame(<V2HomeStep2 mode="practice" />)}
        </DCArtboard>
        <DCArtboard id="step2-random" label="03 · Step 2 · 選擇地圖（隨機模式）" width={AB_W} height={AB_H}>
          {frame(<V2HomeStep2 mode="random" />)}
        </DCArtboard>
        <DCPostIt x={0} y={0} width={240}>
          <strong>新增的視覺元素</strong><br/>
          · 模式卡片用 SVG glyph（無 emoji），左圖右文，整列卡片<br/>
          · 步驟指示器（1 ─ 2）固定 letter-spacing 設計感<br/>
          · 模式卡上加小 tag「完整題庫 / 挑戰計分」幫助選擇<br/>
          · Step 2 顶部把「返回」改成「重新選擇」更明確
        </DCPostIt>
      </DCSection>

      <DCSection id="end-screens" title="② 結束畫面"
        subtitle="練習：正確率 + 圓環。隨機：分數 + 進度條。底部 CTA：再來一次（主）/ 返回首頁（次）">
        <DCArtboard id="end-practice-good" label="04 · 練習結束（台灣 22/27 = 81%）" width={AB_W} height={AB_H}>
          {frame(<V2EndPractice correct={22} total={27} kind="taiwan" />)}
        </DCArtboard>
        <DCArtboard id="end-practice-meh" label="05 · 練習結束（世界 32/50 = 64%）" width={AB_W} height={AB_H}>
          {frame(<V2EndPractice correct={32} total={50} kind="world" />)}
        </DCArtboard>
        <DCArtboard id="end-random-great" label="06 · 隨機結束（85 分）" width={AB_W} height={AB_H}>
          {frame(<V2EndRandom score={85} kind="taiwan" />)}
        </DCArtboard>
        <DCArtboard id="end-random-meh" label="07 · 隨機結束（55 分）" width={AB_W} height={AB_H}>
          {frame(<V2EndRandom score={55} kind="world" />)}
        </DCArtboard>
        <DCPostIt x={0} y={0} width={240}>
          <strong>結束畫面設計考量</strong><br/>
          · 不過度遊戲化（無煙火、無 emoji）<br/>
          · 練習用「圓環 + %」強調正確率<br/>
          · 隨機用大數字「分」強調分數<br/>
          · 細節欄位（答對/答錯/正確率）放卡片中段，符合視覺重心<br/>
          · 文案隨成績 tone 變化（great/good/try）
        </DCPostIt>
      </DCSection>

      <DCSection id="quiz-tweaks" title="③ 作答中的微調"
        subtitle="Topbar 從「答對 X / Y」改為「第 N / Y 題」顯示進度。最後一題按鈕變「查看結果」。">
        <DCArtboard id="quiz-progress" label="08 · 作答中（topbar 顯示「第 5 / 27 題」）" width={AB_W} height={AB_H}>
          {frame(<V2Quiz
            kind="taiwan" targetName="南投縣" mode="idle"
            qNum={5} total={27} choicesSeed="tw-nantou-v2"
          />)}
        </DCArtboard>
        <DCArtboard id="quiz-last" label="09 · 隨機模式最後一題（按鈕「查看結果」）" width={AB_W} height={AB_H}>
          {frame(<V2Quiz
            kind="world" targetName="法國" mode="correct" selectedName="法國"
            qNum={20} total={20} choicesSeed="w-france-v2" isLast
          />)}
        </DCArtboard>
        <DCPostIt x={0} y={0} width={240}>
          <strong>Topbar 變化</strong><br/>
          原本：「答對 2 / 22」（強調對的數量）<br/>
          現在：「第 5 / 27 題」（強調進度）<br/><br/>
          這樣使用者知道還有多少題，特別在練習模式（題數多）時更重要。<br/><br/>
          答對/答錯數字結算畫面有，作答中不再露出。
        </DCPostIt>
      </DCSection>

      <DCSection id="rwd" title="④ RWD 適配（平板 / 桌面）"
        subtitle="斷點 768 / 1024。內容置中，max-width 隨斷點切換。Step 1 改為左右兩欄。">
        <DCArtboard id="step1-tablet" label="10 · 平板版 Step 1（max 640）" width={780} height={920}>
          <V2HomeStep1Desktop width={780} height={920} breakpoint="tablet" />
        </DCArtboard>
        <DCArtboard id="step1-desktop" label="11 · 桌面版 Step 1（max 720）" width={1100} height={920}>
          <V2HomeStep1Desktop width={1100} height={920} breakpoint="desktop" />
        </DCArtboard>
        <DCPostIt x={0} y={0} width={240}>
          <strong>RWD 規格</strong><br/>
          · 手機 (&lt; 480)：max-w 100% / 卡片直列<br/>
          · 平板 (&gt;= 768)：max-w 640 / 卡片左右兩欄<br/>
          · 桌面 (&gt;= 1024)：max-w 720 / 卡片左右兩欄<br/><br/>
          Step 2 在所有斷點都維持 縱向卡片（地圖預覽 + 文字），只是 max-width 變寬。<br/><br/>
          結束畫面同上：max-width 跟著切，但內容垂直堆疊不變。
        </DCPostIt>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <TopoProvider>
    <MobileAppV2 />
  </TopoProvider>
);
