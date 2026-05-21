/* ── engine.js ────────────────────────────────────────
 * 職責：負責測驗流程控制，包含題庫建立、選項產生、答題判斷、分數計算與結果畫面渲染
 * 函式：（IIFE，無對外 export；內部關鍵函式：buildQueue, nextQ, onAnswer, showResult, retry）
 * 依賴：data-taiwan.js / data-world.js（地圖設定與題庫資料）、map.js（MapModule，地圖渲染與互動）
 * ──────────────────────────────────────────────────── */

(async function () {
  var params = new URLSearchParams(location.search);
  var mapKind = params.get('map') || 'taiwan';
  var mode = params.get('mode');
  if (mode !== 'practice' && mode !== 'random') mode = 'practice';
  var difficulty = params.get('difficulty') || '';
  var config = mapKind === 'world' ? WORLD_MAP_CONFIG : TAIWAN_MAP_CONFIG;

  var features = [];
  var current = null;
  var answered = false;
  var score = 0;
  var total = 0;
  var questionNum = 0;
  var nextQTimer = null;

  var questionQueue = [];
  var qIndex = 0;
  var finished = false;

  var mapContainer = document.getElementById('map-container');
  var svgEl        = document.getElementById('map-svg');
  var choicesEl    = document.getElementById('choices');
  var feedbackEl   = document.getElementById('feedback');
  var nextBtn      = document.getElementById('next-btn');
  var scoreDisplay = document.getElementById('score-display');
  var questionLabel = document.getElementById('question-label');
  var loadingEl    = document.getElementById('map-loading');
  var mapError     = document.getElementById('map-error');
  var quizMain     = document.getElementById('quiz-main');

  var resultScreen = document.getElementById('result-screen');
  var resultChip   = document.getElementById('result-chip');
  var resultHeadline = document.getElementById('result-headline');
  var resultSub    = document.getElementById('result-sub');
  var resultRingArea = document.getElementById('result-ring-area');
  var resultScoreArea = document.getElementById('result-score-area');
  var resultRingProgress = document.getElementById('result-ring-progress');
  var resultPctNum = document.getElementById('result-pct-num');
  var resultRingCorrect = document.getElementById('result-ring-correct');
  var resultRingTotal = document.getElementById('result-ring-total');
  var resultScoreNum = document.getElementById('result-score-num');
  var resultScoreSub = document.getElementById('result-score-sub');
  var resultBarFill = document.getElementById('result-bar-fill');
  var bdCorrect    = document.getElementById('bd-correct');
  var bdWrong      = document.getElementById('bd-wrong');
  var bdThirdLabel = document.getElementById('bd-third-label');
  var bdThirdVal   = document.getElementById('bd-third-val');
  var btnRetry     = document.getElementById('btn-retry');
  var btnHome      = document.getElementById('btn-home');
  var resultTopbarScore = document.getElementById('result-topbar-score');

  document.getElementById('question-text').textContent = config.questionText;
  document.getElementById('question-text-en').textContent = config.questionTextEn || '';
  document.getElementById('back-btn').addEventListener('click', function () { location.href = 'index.html'; });
  nextBtn.addEventListener('click', onNextClick);
  btnRetry.addEventListener('click', retry);
  btnHome.addEventListener('click', function () { location.href = 'index.html'; });

  document.addEventListener('keydown', function (e) {
    if (finished) {
      if (e.key === 'Enter') retry();
      if (e.key === 'Escape') location.href = 'index.html';
      return;
    }
    if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
      var btns = choicesEl.querySelectorAll('.choice-btn');
      var btn = btns[+e.key - 1];
      if (btn) btn.click();
    }
    if (answered && (e.key === ' ' || e.key === 'Enter')) onNextClick();
    if (e.key === 'Escape') location.href = 'index.html';
  });

  try {
    var topo = await fetch(config.topoUrl).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    features = config.processFeatures(topo);

    if (!features.length) {
      showMapError('題庫載入異常');
      return;
    }

    if (loadingEl) loadingEl.style.display = 'none';

    function initMap() {
      var W = mapContainer.clientWidth;
      var H = config.mapContainerHeight;
      svgEl.setAttribute('width', W);
      svgEl.setAttribute('height', H);
      mapContainer.style.height = H + 'px';
      MapModule.init(svgEl, W, H, config, features);
      if (current) {
        MapModule.resetStyles();
        MapModule.highlight(current);
        if (answered) {
          var correctName = config.getName(current);
          var wrongBtn = choicesEl.querySelector('[data-state="wrong"]');
          if (wrongBtn) {
            var wrongFeat = features.find(function (f) { return config.getName(f) === wrongBtn.dataset.name; }) || null;
            if (wrongFeat) MapModule.markWrong(wrongFeat);
          }
          MapModule.markCorrect(current);
        }
      }
    }

    initMap();

    var resizeObserver = new ResizeObserver(function () {
      initMap();
    });
    resizeObserver.observe(mapContainer);

    buildQueue();
    nextQ();
  } catch (err) {
    showMapError('地圖載入失敗，請檢查網路連線後重新整理');
  }

  function showMapError(msg) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (mapError) {
      mapError.textContent = msg;
      mapError.style.display = 'flex';
    }
    choicesEl.querySelectorAll('.choice-btn').forEach(function (b) { b.disabled = true; });
  }

  function buildQueue() {
    var diffConfigs = { easy: [20, 0, 0], medium: [10, 10, 0], hard: [7, 8, 5] };

    if (mode === 'random' && mapKind === 'world' && config.getRank && diffConfigs[difficulty]) {
      var needs = diffConfigs[difficulty];
      var tier1 = [], tier2 = [], tier3 = [];
      features.forEach(function (f) {
        var r = config.getRank(f);
        if (r <= 50) tier1.push(f);
        else if (r <= 100) tier2.push(f);
        else tier3.push(f);
      });
      shuffle(tier1); shuffle(tier2); shuffle(tier3);

      var tiers = [tier1, tier2, tier3];
      var picked = [[], [], []];
      var deficit = 0;
      for (var i = 0; i < 3; i++) {
        var take = Math.min(needs[i] + deficit, tiers[i].length);
        picked[i] = tiers[i].slice(0, take);
        deficit = needs[i] + deficit - take;
      }
      if (deficit > 0) {
        for (var j = 2; j >= 0; j--) {
          var extra = tiers[j].slice(picked[j].length, picked[j].length + deficit);
          picked[j] = picked[j].concat(extra);
          deficit -= extra.length;
          if (deficit <= 0) break;
        }
      }
      questionQueue = shuffle(picked[0].concat(picked[1]).concat(picked[2]));
    } else {
      questionQueue = shuffle(features.slice());
      if (mode === 'random') {
        questionQueue = questionQueue.slice(0, Math.min(20, questionQueue.length));
      }
    }
    total = questionQueue.length;
    qIndex = 0;
  }

  function nextQ() {
    if (qIndex >= total) {
      showResult();
      return;
    }

    answered = false;
    questionNum++;
    feedbackEl.className = 'feedback-area';
    feedbackEl.innerHTML = '';
    nextBtn.style.display = 'none';
    updateScoreDisplay();

    var isLast = (qIndex === total - 1);
    questionLabel.textContent = 'QUESTION ' + questionNum + (isLast ? ' · 最後一題' : '');

    MapModule.resetStyles();
    MapModule.resetZoom(400);

    current = questionQueue[qIndex];
    qIndex++;

    var choices = buildChoices(current);
    renderChoices(choices);

    clearTimeout(nextQTimer);
    nextQTimer = setTimeout(function () {
      MapModule.zoomTo(current, 600);
      MapModule.highlight(current);
    }, 420);
  }

  function onNextClick() {
    if (qIndex >= total) {
      showResult();
    } else {
      nextQ();
    }
  }

  function updateScoreDisplay() {
    var currentNum = answered ? questionNum : questionNum;
    scoreDisplay.innerHTML = '<span>第</span><strong>' + currentNum + '</strong><span>/ ' + total + ' 題</span>';
  }

  function buildChoices(target) {
    var targetCn = config.getName(target);
    var targetEn = config.getEnName(target);
    var others = features
      .filter(function (f) { return config.getName(f) !== targetCn; })
      .map(function (f) { return { cn: config.getName(f), en: config.getEnName(f) }; });
    shuffle(others);
    var arr = [{ cn: targetCn, en: targetEn }].concat(others.slice(0, 3));
    shuffle(arr);
    return arr;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function renderChoices(choices) {
    choicesEl.innerHTML = '';
    choices.forEach(function (pair) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.name = pair.cn;
      var cnSpan = document.createElement('span');
      cnSpan.className = 'choice-cn';
      cnSpan.textContent = pair.cn;
      btn.appendChild(cnSpan);
      if (pair.en) {
        var enSpan = document.createElement('span');
        enSpan.className = 'choice-en';
        enSpan.textContent = pair.en;
        btn.appendChild(enSpan);
      }
      btn.addEventListener('click', function () { onAnswer(pair.cn); });
      choicesEl.appendChild(btn);
    });
  }

  function onAnswer(chosen) {
    if (answered) return;
    answered = true;

    var correctName = config.getName(current);
    var isCorrect = chosen === correctName;

    var enName = config.getEnName(current);
    if (isCorrect) {
      score++;
      MapModule.markCorrect(current);
      showFeedback('correct', correctName, enName);
    } else {
      var chosenFeat = features.find(function (f) { return config.getName(f) === chosen; }) || null;
      if (chosenFeat) {
        MapModule.zoomToFit([current, chosenFeat]);
        MapModule.markWrong(chosenFeat);
      }
      MapModule.markCorrect(current);
      showFeedback('wrong', correctName, enName);
    }

    choicesEl.querySelectorAll('.choice-btn').forEach(function (btn) {
      var n = btn.dataset.name;
      btn.disabled = true;
      if (n === correctName && isCorrect) btn.dataset.state = 'correct';
      else if (n === chosen && !isCorrect) btn.dataset.state = 'wrong';
      else if (n === correctName) btn.dataset.state = 'target';
      else btn.dataset.state = 'other';
    });

    updateScoreDisplay();

    var isLast = (qIndex >= total);
    nextBtn.textContent = isLast ? '查看結果 →' : '下一題 →';
    nextBtn.style.display = 'block';
  }

  function showFeedback(feedbackMode, cnName, enName) {
    var isGood = feedbackMode === 'correct';
    feedbackEl.className = 'feedback-area ' + feedbackMode;
    feedbackEl.innerHTML = '';

    var mainDiv = document.createElement('div');
    mainDiv.className = 'fb-main';

    var iconSpan = document.createElement('span');
    iconSpan.className = 'fb-icon';
    iconSpan.textContent = isGood ? '✓' : '✕';

    var textSpan = document.createElement('span');
    textSpan.className = 'fb-text';

    var prefix = document.createTextNode(isGood ? '答對了！這是「' : '正確答案是「');
    var strong = document.createElement('strong');
    strong.textContent = enName ? cnName + ' (' + enName + ')' : cnName;
    var suffix = document.createTextNode('」');

    textSpan.appendChild(prefix);
    textSpan.appendChild(strong);
    textSpan.appendChild(suffix);

    mainDiv.appendChild(iconSpan);
    mainDiv.appendChild(textSpan);
    feedbackEl.appendChild(mainDiv);

    var desc = config.getDesc && config.getDesc(current);
    if (desc) {
      var descDiv = document.createElement('div');
      descDiv.className = 'fb-desc';
      descDiv.textContent = desc;
      feedbackEl.appendChild(descDiv);
    }
  }

  function showResult() {
    finished = true;
    quizMain.style.display = 'none';
    document.querySelector('.topbar').style.display = 'none';
    resultScreen.style.display = '';

    var wrong = total - score;
    var pct = Math.round(score / total * 100);
    var mapLabel = mapKind === 'taiwan' ? '台灣縣市' : '世界國家';

    resultTopbarScore.innerHTML = '<span>第</span><strong>' + total + '</strong><span>/ ' + total + ' 題</span>';

    bdCorrect.textContent = score;
    bdWrong.textContent = wrong;

    if (mode === 'practice') {
      var tone = pct >= 85 ? 'great' : pct >= 60 ? 'good' : 'try';
      var msgs = {
        great: { headline: '答得超棒！', sub: '你對這個地圖已經非常熟悉了。' },
        good:  { headline: '不錯哦！', sub: '繼續練習，你會越來越熟。' },
        try:   { headline: '再試一次看看', sub: '多看幾次就會記起來的。' },
      };

      resultChip.innerHTML = '<span class="result-chip-glyph result-chip-glyph--practice"></span>練習結束 · ' + mapLabel;
      resultHeadline.textContent = msgs[tone].headline;
      resultSub.textContent = msgs[tone].sub;

      resultRingArea.style.display = '';
      resultScoreArea.style.display = 'none';

      var circumference = 2 * Math.PI * 86;
      resultRingProgress.setAttribute('stroke-dasharray', (circumference * pct / 100) + ' ' + circumference);
      resultPctNum.textContent = pct;
      resultRingCorrect.textContent = score;
      resultRingTotal.textContent = total;

      bdThirdLabel.textContent = '總題數';
      bdThirdVal.textContent = total;
    } else {
      var scoreVal = score * 5;
      var tone = scoreVal >= 85 ? 'great' : scoreVal >= 60 ? 'good' : 'try';
      var msgs = {
        great: { headline: '太強了！', sub: '幾乎全對，挑戰大成功。' },
        good:  { headline: '表現不錯！', sub: '再來幾次能拿更高分。' },
        try:   { headline: '再挑戰一次', sub: '多練習，分數會慢慢爬上來。' },
      };

      var diffLabels = { easy: '簡單', medium: '進階', hard: '困難' };
      var diffSuffix = diffLabels[difficulty] ? ' · ' + diffLabels[difficulty] : '';
      resultChip.innerHTML = '<span class="result-chip-glyph result-chip-glyph--random"></span>挑戰結束 · ' + mapLabel + diffSuffix;
      resultHeadline.textContent = msgs[tone].headline;
      resultSub.textContent = msgs[tone].sub;

      resultRingArea.style.display = 'none';
      resultScoreArea.style.display = '';

      resultScoreNum.textContent = scoreVal;
      resultScoreSub.textContent = '滿分 100 · 共 ' + total + ' 題';
      resultBarFill.style.width = scoreVal + '%';

      bdThirdLabel.textContent = '正確率';
      bdThirdVal.textContent = Math.round(score / total * 100) + '%';
    }
  }

  function retry() {
    finished = false;
    score = 0;
    questionNum = 0;

    resultScreen.style.display = 'none';
    quizMain.style.display = '';
    document.querySelector('.topbar').style.display = '';

    buildQueue();
    nextQ();
  }
})();
