(() => {
  const $ = (id) => document.getElementById(id);
  const input = $('numbers');
  const arrayView = $('arrayView');
  const message = $('message');
  const stepType = $('stepType');
  const stepCounter = $('stepCounter');
  const progress = $('progress');
  const error = $('error');
  let moduleInstance = null;
  let steps = [];
  let current = 0;
  let timer = null;
  let comparisons = 0;
  let swaps = 0;

  const labels = {
    start: 'START', pivot: 'PIVOT SELECTED', compare: 'COMPARISON',
    swap: 'SWAP', keep: 'PARTITION CHECK', 'pivot-placed': 'PIVOT PLACED',
    base: 'BASE CASE', done: 'COMPLETE'
  };

  const sourceLines = [
    { text: 'int partitionArray(std::vector<int>& a, int low, int high,', key: 'partition', explanation: 'Quick Sort enters the partition function for the current range.' },
    { text: '                    std::vector<Step>& steps) {', key: 'partition' },
    { text: '    int pivot = a[high]; // choose the last value as pivot', key: 'pivot', explanation: 'The last element in the active range is selected as the pivot.' },
    { text: '    int i = low - 1;', key: 'pivot' },
    { text: '    for (int j = low; j < high; ++j) {', key: 'compare', explanation: 'The loop visits each item before the pivot and compares it with the pivot.' },
    { text: '        if (a[j] <= pivot) {', key: 'compare', explanation: 'If the current value is less than or equal to the pivot, it belongs in the left partition.' },
    { text: '            ++i;', key: 'compare' },
    { text: '            if (i != j) {', key: 'swap' },
    { text: '                std::swap(a[i], a[j]);', key: 'swap', explanation: 'These two array values are swapped to move a smaller value left of the pivot.' },
    { text: '            } else {', key: 'keep' },
    { text: '                // value is already on the correct side', key: 'keep', explanation: 'No swap is needed when the value is already on the correct side.' },
    { text: '        } else {', key: 'keep' },
    { text: '            // value stays to the right for now', key: 'keep', explanation: 'A value greater than the pivot stays on the right side for now.' },
    { text: '    }', key: 'compare' },
    { text: '    int pivotPosition = i + 1;', key: 'pivot-placed', explanation: 'After scanning the range, this calculates the pivot’s final index.' },
    { text: '    std::swap(a[pivotPosition], a[high]);', key: 'pivot-placed', explanation: 'The pivot is moved into its final sorted position.' },
    { text: '    return pivotPosition;', key: 'pivot-placed' },
    { text: '}', key: 'partition' },
    { text: '', key: 'partition' },
    { text: 'void quickSort(std::vector<int>& a, int low, int high,', key: 'recurse', explanation: 'Quick Sort recursively processes the two ranges around the pivot.' },
    { text: '              std::vector<Step>& steps) {', key: 'recurse' },
    { text: '    if (low >= high) return;', key: 'base', explanation: 'A range with zero or one item is already sorted, so recursion stops.' },
    { text: '    int p = partitionArray(a, low, high, steps);', key: 'recurse' },
    { text: '    quickSort(a, low, p - 1, steps);', key: 'recurse', explanation: 'Sort the values to the left of the pivot.' },
    { text: '    quickSort(a, p + 1, high, steps);', key: 'recurse', explanation: 'Then sort the values to the right of the pivot.' },
    { text: '}', key: 'recurse' }
  ];
  const codeLinesByType = {
    start: [0, 19, 21], pivot: [2, 3], compare: [4, 5, 6],
    swap: [7, 8], keep: [9, 10, 11, 12],
    'pivot-placed': [14, 15, 16], base: [21], done: [23, 24]
  };
  function renderCode(step) {
    const codeView = $('codeView');
    const activeLines = codeLinesByType[step.type] || codeLinesByType.start;
    codeView.innerHTML = '';
    sourceLines.forEach((line, index) => {
      const row = document.createElement('div');
      row.className = 'code-line' + (activeLines.includes(index) ? ' is-highlighted' : '');
      const number = document.createElement('span');
      number.className = 'line-no';
      number.textContent = String(index + 1).padStart(2, '0');
      const code = document.createElement('code');
      code.textContent = line.text || ' ';
      row.append(number, code);
      codeView.appendChild(row);
    });
    const explanation = sourceLines.find((line, index) => activeLines.includes(index) && line.explanation);
    $('codeExplanation').textContent = explanation ? explanation.explanation : 'These lines support the current Quick Sort operation.';
  }

  function stopPlay() {
    if (timer) clearInterval(timer);
    timer = null;
    $('playBtn').textContent = '▶ Auto Play';
  }

  function render() {
    if (!steps.length) return;
    const s = steps[current];
    arrayView.innerHTML = '';
    const values = s.array;
    const maxAbs = Math.max(1, ...values.map(v => Math.abs(v)));
    values.forEach((value, index) => {
      const item = document.createElement('div');
      item.className = 'array-item';
      const inRange = index >= s.low && index <= s.high;
      const isPivot = index === s.pivotIndex && s.pivotIndex >= 0;
      const isCurrent = index === s.j && s.j >= 0 && s.type !== 'done';
      const isFinalPivot = ['pivot-placed', 'base'].includes(s.type) && index === s.pivotIndex;
      if (isPivot) item.classList.add('is-pivot');
      if (isCurrent && !isPivot) item.classList.add('is-current');
      if (isFinalPivot || s.type === 'done') item.classList.add('is-final');
      const barWrap = document.createElement('div');
      barWrap.className = 'bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${Math.max(12, 16 + (Math.abs(value) / maxAbs) * 52)}px`;
      barWrap.appendChild(bar);
      if (isPivot) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = 'PIVOT';
        item.appendChild(tag);
      }
      const val = document.createElement('span');
      val.className = 'value';
      val.textContent = value;
      const idx = document.createElement('span');
      idx.className = 'index';
      idx.textContent = index;
      item.append(barWrap, val, idx);
      if (!inRange && s.type !== 'start' && s.type !== 'done') item.style.opacity = '.35';
      arrayView.appendChild(item);
    });
    stepCounter.textContent = `Step ${current + 1} / ${steps.length}`;
    stepType.textContent = labels[s.type] || s.type.toUpperCase();
    message.textContent = s.message;
    renderCode(s);
    progress.style.width = `${steps.length <= 1 ? 100 : current / (steps.length - 1) * 100}%`;
    $('pivotStat').textContent = s.pivotIndex >= 0 ? s.array[s.pivotIndex] : '—';
    $('comparisonsStat').textContent = comparisons;
    $('swapsStat').textContent = swaps;
    $('prevBtn').disabled = current === 0;
    $('nextBtn').disabled = current === steps.length - 1;
    $('playBtn').disabled = current === steps.length - 1;
  }

  function recount() {
    comparisons = steps.slice(0, current + 1).filter(s => s.type === 'compare').length;
    swaps = steps.slice(0, current + 1).filter(s => s.type === 'swap').length;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    recount();
    render();
    if (current === steps.length - 1) stopPlay();
  }

  function runSort() {
    stopPlay();
    error.textContent = '';
    if (!moduleInstance) {
      error.textContent = 'The C++ WebAssembly module is still loading. Please try again in a moment.';
      return;
    }
    const raw = input.value.trim();
    if (!raw) {
      error.textContent = 'Please enter at least one integer.';
      return;
    }
    const tokens = raw.split(',');
    if (tokens.length > 40) {
      error.textContent = 'Please use 40 numbers or fewer so every step stays easy to follow.';
      return;
    }
    const valid = tokens.every(t => /^[-+]?\d+$/.test(t.trim()) &&
      Number.isSafeInteger(Number(t.trim())) && Math.abs(Number(t.trim())) <= 1000000000);
    if (!valid) {
      error.textContent = 'Use comma-separated whole numbers from -1,000,000,000 to 1,000,000,000.';
      return;
    }
    steps = JSON.parse(moduleInstance.quickSortSteps(raw));
    current = 0;
    recount();
    render();
  }

  $('runBtn').addEventListener('click', runSort);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') runSort(); });
  document.querySelectorAll('.example').forEach(button => {
    button.addEventListener('click', () => {
      input.value = button.dataset.values;
      runSort();
    });
  });
  $('prevBtn').addEventListener('click', () => { stopPlay(); goTo(current - 1); });
  $('nextBtn').addEventListener('click', () => { stopPlay(); goTo(current + 1); });
  $('resetBtn').addEventListener('click', () => { stopPlay(); goTo(0); });
  $('playBtn').addEventListener('click', () => {
    if (timer) { stopPlay(); return; }
    if (current >= steps.length - 1) goTo(0);
    $('playBtn').textContent = 'Ⅱ Pause';
    timer = setInterval(() => {
      if (current >= steps.length - 1) { stopPlay(); return; }
      goTo(current + 1);
    }, 950);
  });

  if (typeof createQuickSortModule !== 'function') {
    error.textContent = 'C++ module not found. Please open the deployed GitHub Pages site, or build quicksort.js with Emscripten.';
    $('message').textContent = 'The WebAssembly module could not be loaded.';
  } else {
    createQuickSortModule().then(instance => {
      moduleInstance = instance;
      runSort();
    }).catch(() => {
      error.textContent = 'Could not load the C++ WebAssembly module. Refresh the page and try again.';
      $('message').textContent = 'Module loading failed.';
    });
  }
})();
