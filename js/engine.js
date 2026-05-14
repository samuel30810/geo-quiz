(async function () {
  const params = new URLSearchParams(location.search);
  const mapKind = params.get('map') || 'taiwan';
  const config = mapKind === 'world' ? WORLD_MAP_CONFIG : TAIWAN_MAP_CONFIG;

  let features = [];
  let current = null;
  let answered = false;
  let score = 0;
  let total = 0;
  let questionNum = 0;
  let nextQTimer = null;

  const mapContainer = document.getElementById('map-container');
  const svgEl        = document.getElementById('map-svg');
  const choicesEl    = document.getElementById('choices');
  const feedbackEl   = document.getElementById('feedback');
  const nextBtn      = document.getElementById('next-btn');
  const scoreDisplay = document.getElementById('score-display');
  const questionLabel = document.getElementById('question-label');
  const loadingEl    = document.getElementById('map-loading');
  const mapError     = document.getElementById('map-error');

  document.getElementById('question-text').textContent = config.questionText;
  document.getElementById('back-btn').addEventListener('click', () => { location.href = 'index.html'; });
  nextBtn.addEventListener('click', nextQ);

  document.addEventListener('keydown', e => {
    if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
      const btns = choicesEl.querySelectorAll('.choice-btn');
      const btn = btns[+e.key - 1];
      if (btn) btn.click();
    }
    if (answered && (e.key === ' ' || e.key === 'Enter')) nextQ();
    if (e.key === 'Escape') location.href = 'index.html';
  });

  try {
    const topo = await fetch(config.topoUrl).then(r => {
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
      const W = mapContainer.clientWidth;
      const H = config.mapContainerHeight;
      svgEl.setAttribute('width', W);
      svgEl.setAttribute('height', H);
      mapContainer.style.height = H + 'px';
      MapModule.init(svgEl, W, H, config, features);
      // Re-apply current question state after resize
      if (current) {
        MapModule.resetStyles();
        MapModule.highlight(current);
        if (answered) {
          const correctName = config.getName(current);
          const wrongBtn = choicesEl.querySelector('[data-state="wrong"]');
          if (wrongBtn) {
            const wrongFeat = features.find(f => config.getName(f) === wrongBtn.dataset.name) || null;
            if (wrongFeat) MapModule.markWrong(wrongFeat);
          }
          MapModule.markCorrect(current);
        }
      }
    }

    initMap();

    // Re-initialize map on container resize (handles device rotation)
    const resizeObserver = new ResizeObserver(function () {
      initMap();
    });
    resizeObserver.observe(mapContainer);

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
    choicesEl.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
  }

  function nextQ() {
    answered = false;
    questionNum++;
    feedbackEl.className = 'feedback-area';
    feedbackEl.innerHTML = '';
    nextBtn.style.display = 'none';
    scoreDisplay.innerHTML = '答對 <strong>' + score + '</strong> / ' + total;
    questionLabel.textContent = 'QUESTION ' + questionNum;

    MapModule.resetStyles();
    MapModule.resetZoom(400);

    current = features[Math.floor(Math.random() * features.length)];

    const choices = buildChoices(current);
    renderChoices(choices);

    // Wait for resetZoom (400ms) to complete before starting zoomTo
    // Clear any pending timer to prevent race conditions on rapid clicks
    clearTimeout(nextQTimer);
    nextQTimer = setTimeout(function () {
      MapModule.zoomTo(current, 600);
      MapModule.highlight(current);
    }, 420);
  }

  function buildChoices(target) {
    const name = config.getName(target);
    const others = features.map(f => config.getName(f)).filter(n => n !== name);
    shuffle(others);
    const arr = [name].concat(others.slice(0, 3));
    shuffle(arr);
    return arr;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function renderChoices(choices) {
    choicesEl.innerHTML = '';
    choices.forEach(function (name) {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = name;
      btn.dataset.name = name;
      btn.addEventListener('click', function () { onAnswer(name); });
      choicesEl.appendChild(btn);
    });
  }

  function onAnswer(chosen) {
    if (answered) return;
    answered = true;
    total++;

    const correctName = config.getName(current);
    const isCorrect = chosen === correctName;

    if (isCorrect) {
      score++;
      MapModule.markCorrect(current);
      showFeedback('correct', correctName);
    } else {
      const chosenFeat = features.find(f => config.getName(f) === chosen) || null;
      if (chosenFeat) {
        MapModule.zoomToFit([current, chosenFeat]);
        MapModule.markWrong(chosenFeat);
      }
      MapModule.markCorrect(current);
      showFeedback('wrong', correctName);
    }

    choicesEl.querySelectorAll('.choice-btn').forEach(function (btn) {
      const n = btn.dataset.name;
      btn.disabled = true;
      if (n === correctName && isCorrect) btn.dataset.state = 'correct';
      else if (n === chosen && !isCorrect) btn.dataset.state = 'wrong';
      else if (n === correctName) btn.dataset.state = 'target';
      else btn.dataset.state = 'other';
    });

    scoreDisplay.innerHTML = '答對 <strong>' + score + '</strong> / ' + total;
    nextBtn.style.display = 'block';
  }

  function showFeedback(mode, name) {
    const isGood = mode === 'correct';
    feedbackEl.className = 'feedback-area ' + mode;
    feedbackEl.innerHTML = '';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'fb-icon';
    iconSpan.textContent = isGood ? '✓' : '✕';

    const textSpan = document.createElement('span');
    textSpan.className = 'fb-text';

    const prefix = document.createTextNode(isGood ? '答對了！這是「' : '正確答案是「');
    const strong = document.createElement('strong');
    strong.textContent = name;
    const suffix = document.createTextNode('」');

    textSpan.appendChild(prefix);
    textSpan.appendChild(strong);
    textSpan.appendChild(suffix);

    feedbackEl.appendChild(iconSpan);
    feedbackEl.appendChild(textSpan);
  }
})();
