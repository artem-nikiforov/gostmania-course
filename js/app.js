/* ═══════════════════════════════════════════════
   Router
═══════════════════════════════════════════════ */
const PAGES = ['home','block1','block2','block3','hub','section1','section2','section3','block8'];
const CHAPTER_NAMES = {
  home:     '',
  block1:   'Блок 1. Философия Гостемании',
  block2:   'Блок 2. Алгоритм ДОБРО',
  block3:   'Блок 3. Работа с инцидентами',
  hub:      'Блок 4. Инструменты',
  section1: '4.1 Замена + Комплемент',
  section2: '4.2 Комплемент',
  section3: '4.3 Особые случаи',
  block8:   'Блок 5. Заключение',
};
const CHAPTER_ORDER = ['block1','block2','block3','hub','block8'];
const hubDone = [false, false, false];
let currentPage = 'home';

function navigateTo(pageId) {
  PAGES.forEach(id => {
    const el = document.getElementById('page-' + id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById('page-' + pageId);
  if (!target) return;
  target.classList.add('active');
  currentPage = pageId;
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update nav
  document.getElementById('nav-chapter').textContent = CHAPTER_NAMES[pageId] || '';
  const idx = CHAPTER_ORDER.indexOf(pageId);
  if (idx !== -1) {
    document.getElementById('nav-progress').textContent = (idx + 1) + ' / ' + CHAPTER_ORDER.length;
    const pct = Math.round(((idx + 1) / CHAPTER_ORDER.length) * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
  } else if (['section1','section2','section3'].includes(pageId)) {
    const hubIdx = CHAPTER_ORDER.indexOf('hub');
    document.getElementById('nav-progress').textContent = (hubIdx + 1) + ' / ' + CHAPTER_ORDER.length;
    const pct = Math.round(((hubIdx + 1) / CHAPTER_ORDER.length) * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
  } else {
    document.getElementById('nav-progress').textContent = '';
    document.getElementById('progress-bar').style.width = '0%';
  }

  // Re-init fade-in for the now-active page
  setTimeout(initFadeIn, 50);

  // Page-specific inits
  if (pageId === 'block2') initGallery();
  if (pageId === 'block3') { initSortable(); initVideoQuiz(); }
  if (pageId === 'section1') initZoneSort('pool1','zone1a','zone1b');
  if (pageId === 'section3') initZoneSort('pool3','zone3a','zone3b');
}

/* ═══════════════════════════════════════════════
   Fade-in on scroll
═══════════════════════════════════════════════ */
function initFadeIn() {
  const els = document.querySelectorAll('.page.active .fade-in:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
  // Immediately reveal anything already visible
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('visible');
  });
}

/* ═══════════════════════════════════════════════
   Gallery – Block 2
═══════════════════════════════════════════════ */
let galleryIdx = 0;
const GALLERY_COUNT = 5;

function initGallery() {
  galleryIdx = 0;
  renderGallery();
}
function renderGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;
  track.style.transform = `translateX(-${galleryIdx * 100}%)`;
  document.querySelectorAll('.gallery-dot').forEach((d, i) => {
    d.classList.toggle('active', i === galleryIdx);
  });
}
function galleryMove(dir) {
  galleryIdx = (galleryIdx + dir + GALLERY_COUNT) % GALLERY_COUNT;
  renderGallery();
}

/* ═══════════════════════════════════════════════
   FAQ Accordion
═══════════════════════════════════════════════ */
function toggleFaq(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

/* ═══════════════════════════════════════════════
   Block 3 – Sortable order trainer
═══════════════════════════════════════════════ */
// Correct order (0-indexed positions): items are originally [0,1,2,3]
// correct sequence: item index 1, then 3, then 0, then 2  (= "2413" from 1-based)
const CORRECT_ORDER = [1, 3, 0, 2];

function initSortable() {
  const list = document.getElementById('sortable-list');
  if (!list) return;
  let dragEl = null;
  let touchY = 0;

  list.querySelectorAll('.sort-item').forEach(item => {
    // Mouse
    item.addEventListener('dragstart', e => {
      dragEl = item;
      setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      list.querySelectorAll('.sort-item').forEach(i => {
        i.classList.remove('drag-over-top','drag-over-bottom');
      });
      dragEl = null;
    });

    // Touch
    item.addEventListener('touchstart', e => {
      dragEl = item;
      touchY = e.touches[0].clientY;
      item.classList.add('dragging');
    }, { passive: true });
    item.addEventListener('touchmove', e => {
      if (!dragEl) return;
      const y = e.touches[0].clientY;
      const els = [...list.querySelectorAll('.sort-item:not(.dragging)')];
      let target = null;
      let before = true;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) { target = el; before = true; break; }
        target = el; before = false;
      }
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
      if (target) target.classList.add(before ? 'drag-over-top' : 'drag-over-bottom');
    }, { passive: true });
    item.addEventListener('touchend', e => {
      if (!dragEl) return;
      const y = e.changedTouches[0].clientY;
      const els = [...list.querySelectorAll('.sort-item:not(.dragging)')];
      let target = null;
      let before = true;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) { target = el; before = true; break; }
        target = el; before = false;
      }
      if (target) {
        if (before) list.insertBefore(dragEl, target);
        else target.insertAdjacentElement('afterend', dragEl);
      }
      dragEl.classList.remove('dragging');
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
      dragEl = null;
    });
  });

  list.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragEl) return;
    const after = getDragAfterEl(list, e.clientY);
    list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
    if (after) after.classList.add('drag-over-top');
    else {
      const last = list.querySelector('.sort-item:last-child');
      if (last && last !== dragEl) last.classList.add('drag-over-bottom');
    }
  });
  list.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragEl) return;
    const after = getDragAfterEl(list, e.clientY);
    if (after) list.insertBefore(dragEl, after);
    else list.appendChild(dragEl);
  });
}

function getDragAfterEl(container, y) {
  const items = [...container.querySelectorAll('.sort-item:not(.dragging)')];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, el: child };
    return closest;
  }, { offset: -Infinity, el: null }).el;
}

function checkSortOrder() {
  const list = document.getElementById('sortable-list');
  const items = [...list.querySelectorAll('.sort-item')];
  const indices = items.map(el => parseInt(el.dataset.idx));
  const isCorrect = CORRECT_ORDER.every((v, i) => v === indices[i]);

  const fb = document.getElementById('sort-feedback');
  const analysis = document.getElementById('sort-analysis');
  const nextBtn = document.getElementById('sort-next-btn');
  fb.className = 'feedback-box show ' + (isCorrect ? 'correct' : 'incorrect');
  fb.innerHTML = isCorrect
    ? '<strong>Верно!</strong> Это 4 шага по работе с инцидентом. Кто-то понимает алгоритм интуитивно, но чтобы ты владел им профессионально — давай запомним визуальный алгоритм.'
    : '<strong>Неверно.</strong> Давай разберём правильные шаги — чтобы ты владел алгоритмом профессионально. Смотри ниже 4 шага.';
  if (analysis) analysis.classList.toggle('hidden', false);
  if (nextBtn) nextBtn.style.display = 'block';
}

/* ═══════════════════════════════════════════════
   Block 3 – Video mood quiz
═══════════════════════════════════════════════ */
let videoStep = 0;
const VIDEO_ANSWERS = ['спокойный', 'расстроенный', 'злой'];

function initVideoQuiz() {
  videoStep = 0;
  showVideoStep(0);
}
function showVideoStep(n) {
  document.querySelectorAll('.video-quiz-step').forEach((el, i) => {
    el.classList.toggle('active', i === n);
  });
  if (n >= 3) {
    const done = document.getElementById('video-quiz-done');
    if (done) done.classList.remove('hidden');
  }
}
function answerVideo(btn, stepIdx, answer) {
  if (btn.classList.contains('correct')) return;
  const correct = VIDEO_ANSWERS[stepIdx];
  if (answer === correct) {
    btn.classList.add('correct');
    btn.disabled = true;
    // disable all other buttons in this step
    btn.closest('.answer-choices').querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    setTimeout(() => {
      videoStep++;
      showVideoStep(videoStep);
    }, 700);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

/* ═══════════════════════════════════════════════
   Two-zone drag-and-drop (Sections 1 & 3)
═══════════════════════════════════════════════ */
function initZoneSort(poolId, zone1Id, zone2Id) {
  const pool = document.getElementById(poolId);
  const z1   = document.getElementById(zone1Id);
  const z2   = document.getElementById(zone2Id);
  if (!pool || !z1 || !z2) return;

  [pool, z1, z2].forEach(container => {
    container.querySelectorAll('.drag-chip').forEach(chip => bindChip(chip, pool, z1, z2));
  });
  [pool, z1, z2].forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const chip = document.getElementById(id);
      if (chip) zone.appendChild(chip);
    });
  });
}

function bindChip(chip, pool, z1, z2) {
  chip.setAttribute('draggable', true);
  // Mouse
  chip.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', chip.id);
    chip.classList.add('dragging');
  });
  chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

  // Touch
  let touchClone = null;
  chip.addEventListener('touchstart', e => {
    chip.classList.add('dragging');
    touchClone = chip.cloneNode(true);
    touchClone.style.cssText = 'position:fixed;pointer-events:none;opacity:0.7;z-index:9999;transition:none;';
    document.body.appendChild(touchClone);
  }, { passive: true });
  chip.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (touchClone) {
      touchClone.style.left = (t.clientX - 40) + 'px';
      touchClone.style.top  = (t.clientY - 20) + 'px';
    }
    [pool, z1, z2].forEach(z => {
      const r = z.getBoundingClientRect();
      z.classList.toggle('drag-over',
        t.clientX >= r.left && t.clientX <= r.right &&
        t.clientY >= r.top  && t.clientY <= r.bottom
      );
    });
  }, { passive: true });
  chip.addEventListener('touchend', e => {
    chip.classList.remove('dragging');
    if (touchClone) { touchClone.remove(); touchClone = null; }
    const t = e.changedTouches[0];
    [pool, z1, z2].forEach(z => {
      z.classList.remove('drag-over');
      const r = z.getBoundingClientRect();
      if (t.clientX >= r.left && t.clientX <= r.right &&
          t.clientY >= r.top  && t.clientY <= r.bottom) {
        z.appendChild(chip);
      }
    });
  });
}

const ZONE_FEEDBACK = {
  'zone1-feedback': {
    correct: '<strong>Верно!</strong> Ты уже чувствуешь разницу: проблемы с едой требуют замены + комплемента, а проблемы сервиса — только комплемента. А теперь разберём замену подробнее.',
    incorrect: '<strong>Неверно.</strong> Когда проблема в еде (холодная, не тот вкус, пересол) → <strong>замена + комплемент</strong>. Проблема в сервисе (ожидание, чистота, грубость) → <strong>комплемент</strong>.',
  },
  'zone3-feedback': {
    correct: '<strong>Верно!</strong> Именно так: сохраняй спокойствие, ссылайся на правила и при необходимости зови руководителя.',
    incorrect: '<strong>Неверно.</strong> Сохраняй спокойный тон, ссылайся на правила учёта, предлагай позвать руководителя, фиксируй инцидент — а обвинения, споры и игнорирование недопустимы.',
  },
};

/* check zone sorting results */
function checkZone(poolId, zone1Id, zone2Id, correctZ1, correctZ2, feedbackId, nextId) {
  const z1Chips = [...document.getElementById(zone1Id).querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const z2Chips = [...document.getElementById(zone2Id).querySelectorAll('.drag-chip')].map(c => c.dataset.key);

  const setEq = (a, b) => a.length === b.length && a.every(v => b.includes(v));
  const ok = setEq(z1Chips, correctZ1) && setEq(z2Chips, correctZ2);

  const fb = document.getElementById(feedbackId);
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'incorrect');
  const msgs = ZONE_FEEDBACK[feedbackId];
  if (msgs) fb.innerHTML = msgs[ok ? 'correct' : 'incorrect'];

  // Always reveal rest of content so they can continue
  if (nextId) {
    const next = document.getElementById(nextId);
    if (next) next.classList.remove('hidden');
  }
}

/* ═══════════════════════════════════════════════
   Section 2 – Matching quiz
═══════════════════════════════════════════════ */
const MATCH_ANSWERS = ['десерт', 'напиток-десерт', 'бургер-сет'];
let matchSolved = [false, false, false];

function pickMatch(btn, qIdx, answer) {
  if (matchSolved[qIdx]) return;
  if (answer === MATCH_ANSWERS[qIdx]) {
    btn.classList.add('correct-pick');
    matchSolved[qIdx] = true;
    btn.closest('.match-question').classList.add('solved');
    btn.closest('.match-question').querySelectorAll('.match-btn').forEach(b => b.disabled = true);
    if (matchSolved.every(Boolean)) {
      const fb = document.getElementById('match-feedback');
      if (fb) {
        fb.className = 'feedback-box show correct';
        fb.innerHTML = '<strong>Верно!</strong> Дальше разберём комплементы подробнее.';
      }
      const next = document.getElementById('match-next');
      if (next) next.classList.remove('hidden');
    }
  } else {
    btn.classList.add('wrong-pick');
    setTimeout(() => btn.classList.remove('wrong-pick'), 600);
  }
}

/* ═══════════════════════════════════════════════
   Hub section management
═══════════════════════════════════════════════ */
function goToSection(n) {
  navigateTo('section' + n);
}

function completeSection(n) {
  hubDone[n - 1] = true;
  // unlock next
  const cards = document.querySelectorAll('.hub-card');
  if (cards[n - 1]) cards[n - 1].classList.add('done');
  if (n < 3 && cards[n]) cards[n].classList.remove('locked');
  navigateTo('hub');
  setTimeout(() => {
    if (hubDone.every(Boolean)) {
      document.getElementById('hub-next-row').classList.add('show');
    }
  }, 100);
}

/* ═══════════════════════════════════════════════
   Init on load
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('home');
});
