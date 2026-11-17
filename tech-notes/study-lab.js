(function () {
  'use strict';
  const KEY = 'skillshowcase-study-v1';
  const $ = id => document.getElementById(id);
  const PAGE_SIZE = 16;
  let lessons = [], filtered = [], current, page = 0, tab = 'learn';
  let state = { completed: {}, bookmarks: {}, notes: {}, last: '' };
  const normalize = s => String(s || '').normalize('NFKC').toLowerCase();
  function message(text, error) {
    $('study-message').textContent = text;
    $('study-message').hidden = !text;
    $('study-message').setAttribute('role', error ? 'alert' : 'status');
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (_) { message('このブラウザには保存できません。バックアップを書き出して内容を残してください。', true); return false; }
  }
  function validate(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('形式を確認してください。');
    const allowed = new Set(lessons.map(l => l.id));
    const clean = { completed: {}, bookmarks: {}, notes: {}, last: '' };
    for (const field of ['completed', 'bookmarks', 'notes']) {
      if (value[field] == null) continue;
      if (typeof value[field] !== 'object' || Array.isArray(value[field])) throw Error('保存データの形式が違います。');
      for (const [id, val] of Object.entries(value[field])) {
        if (!allowed.has(id)) continue;
        if (field === 'notes') {
          if (typeof val !== 'string' || val.length > 12000) throw Error('メモの形式または長さを確認してください。');
          clean.notes[id] = val;
        } else {
          if (typeof val !== 'boolean') throw Error('進捗データの形式が違います。');
          clean[field][id] = val;
        }
      }
    }
    if (typeof value.last === 'string' && allowed.has(value.last)) clean.last = value.last;
    return clean;
  }
  function progress() {
    const done = lessons.filter(l => state.completed[l.id]).length;
    $('completed-count').textContent = done;
    $('total-count').textContent = lessons.length;
    $('study-progress').max = lessons.length;
    $('study-progress').value = done;
    $('progress-label').textContent = '学習済み ' + done + ' / ' + lessons.length + ' テーマ';
  }
  function filter() {
    const words = normalize($('study-search').value).trim().split(/\s+/).filter(Boolean);
    const category = $('study-category').value;
    const status = $('study-status').value;
    filtered = lessons.filter(l => (!category || l.category === category) &&
      (status !== 'unfinished' || !state.completed[l.id]) &&
      (status !== 'completed' || state.completed[l.id]) &&
      (status !== 'bookmarked' || state.bookmarks[l.id]) &&
      words.every(w => l.searchText.includes(w)));
    page = 0;
    renderList();
  }
  function renderList() {
    const list = $('study-list');
    list.replaceChildren();
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    page = Math.min(page, pageCount - 1);
    for (const lesson of filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)) {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'study-item'; button.type = 'button';
      button.setAttribute('aria-current', String(lesson.id === current?.id));
      const category = document.createElement('span'); category.className = 'category'; category.textContent = lesson.categoryLabel;
      const title = document.createElement('span'); title.className = 'title'; title.textContent = lesson.title;
      button.append(category, title);
      const flags = [];
      if (state.completed[lesson.id]) flags.push('学習済み');
      if (state.bookmarks[lesson.id]) flags.push('あとで復習');
      if (flags.length) { const status = document.createElement('span'); status.className = 'flags'; status.textContent = flags.join(' / '); button.append(status); }
      button.addEventListener('click', () => {
        select(lesson.id);
        if (matchMedia('(max-width: 850px)').matches) $('study-reader').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        $('lesson-title').focus({ preventScroll: true });
      });
      li.append(button); list.append(li);
    }
    if (!filtered.length) { const li = document.createElement('li'); li.className = 'study-empty'; li.textContent = '条件に合うテーマがありません。検索語や分野を変えてください。'; list.append(li); }
    $('result-count').textContent = filtered.length + ' 件';
    $('page-count').textContent = (page + 1) + ' / ' + pageCount;
    $('catalog-prev').disabled = page === 0;
    $('catalog-next').disabled = page >= pageCount - 1;
  }
  function pointsInto(target, points) {
    target.replaceChildren();
    for (const point of points) { const li = document.createElement('li'); li.textContent = point; target.append(li); }
  }
  function renderGuide(guide) {
    const target = $('teaching-guide'); target.replaceChildren();
    if (!guide) return;
    function element(tag, text, className) { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; }
    target.append(element('h4', '土台から理解する：' + guide.title), element('p', guide.intro, 'guide-intro'));
    target.append(element('h4', '先に知っておく言葉'));
    const terms = element('dl', '', 'guide-terms');
    for (const term of guide.terms) { const row = element('div', '', 'guide-term'); row.append(element('dt', term.word), element('dd', term.meaning)); terms.append(row); }
    target.append(terms, element('h4', '仕組みを順に考える'));
    const steps = element('ol', '', 'guide-steps'); for (const step of guide.steps) steps.append(element('li', step)); target.append(steps);
    if (guide.diagram) {
      const figure = element('figure', '', 'guide-figure'); const flow = element('ol', '', 'guide-flow');
      for (const label of guide.diagram.nodes) flow.append(element('li', label));
      figure.append(flow, element('figcaption', guide.diagram.caption));
      if (guide.id === 'file-storage') {
        const allocation = element('div', '', 'guide-allocation');
        for (const [label, used, free] of [['区画1', 4, 0], ['区画2', 1, 3]]) {
          const block = element('div', '', 'guide-block'); block.append(element('strong', label + '（4KiB）'));
          const bar = element('div', '', 'guide-block-bar'); const occupied = element('span', '使用 ' + used + 'KiB', 'guide-used'); occupied.style.flexGrow = used; bar.append(occupied);
          if (free) { const empty = element('span', '空き ' + free + 'KiB', 'guide-free'); empty.style.flexGrow = free; bar.append(empty); }
          block.append(bar); allocation.append(block);
        }
        figure.append(allocation);
      }
      target.append(figure);
    }
    target.append(element('h4', '具体例で確かめる'));
    const example = element('div', '', 'guide-example'); example.append(element('p', guide.example.scenario));
    const exampleSteps = element('ol', '', 'guide-steps'); for (const step of guide.example.steps) exampleSteps.append(element('li', step));
    example.append(exampleSteps, element('p', guide.example.result, 'guide-result')); target.append(example);
    target.append(element('h4', '間違えやすいところ'));
    const pitfalls = element('ul', '', 'guide-pitfalls'); for (const text of guide.pitfalls) pitfalls.append(element('li', text)); target.append(pitfalls);
  }
  function renderTopicTerms(lesson) {
    const target = $('topic-terms'); target.replaceChildren();
    const relevant = (lesson.terms || []).filter(term => !lesson.teaching || !lesson.teaching.terms.some(base => base.word.toLowerCase().includes(term.word.toLowerCase())));
    if (!relevant.length) return;
    const heading = document.createElement('h4'); heading.textContent = 'このテーマに出てくる言葉'; target.append(heading);
    const list = document.createElement('dl'); list.className = 'guide-terms';
    for (const term of relevant) { const row = document.createElement('div'); row.className = 'guide-term'; const word = document.createElement('dt'); word.textContent = term.word; const meaning = document.createElement('dd'); meaning.textContent = term.meaning; row.append(word,meaning); list.append(row); }
    target.append(list);
  }
  function setTab(next) {
    tab = next;
    for (const name of ['learn', 'recall', 'memo']) {
      $('tab-' + name).setAttribute('aria-selected', String(name === tab));
      $('tab-' + name).tabIndex = name === tab ? 0 : -1;
      $('panel-' + name).hidden = name !== tab;
    }
  }
  function select(id, updateURL = true) {
    current = lessons.find(l => l.id === id) || lessons[0];
    state.last = current.id; save();
    $('lesson-title').textContent = current.title;
    $('lesson-category').textContent = current.categoryLabel;
    $('lesson-position').textContent = 'THEME ' + String(lessons.indexOf(current) + 1).padStart(3, '0');
    pointsInto($('lesson-points'), current.points);
    let topicFlow = $('topic-flow');
    if (!topicFlow) { topicFlow = document.createElement('figure'); topicFlow.id = 'topic-flow'; topicFlow.className = 'guide-figure'; $('lesson-points').after(topicFlow); }
    topicFlow.replaceChildren(); topicFlow.hidden = !current.flow;
    if (current.flow) {
      const flow = document.createElement('ol'); flow.className = 'guide-flow';
      for (const label of current.flow.nodes) { const node = document.createElement('li'); node.textContent = label; flow.append(node); }
      const caption = document.createElement('figcaption'); caption.textContent = current.flow.caption;
      topicFlow.append(flow, caption);
    }
    renderGuide(current.teaching);
    renderTopicTerms(current);
    pointsInto($('recall-points'), current.teaching ? [current.teaching.answer] : current.points);
    $('lesson-exercise').textContent = current.exercise;
    $('recall-question').textContent = current.teaching ? current.teaching.question : current.question;
    $('topic-recall-question').textContent = current.question;
    pointsInto($('topic-recall-points'), current.points);
    $('recall-answer').hidden = true;
    $('reveal-answer').textContent = '答えを確認する';
    $('reveal-answer').setAttribute('aria-expanded', 'false');
    $('lesson-memo').value = state.notes[current.id] || '';
    $('memo-status').textContent = '';
    updateButtons();
    const refs = $('lesson-references'); refs.replaceChildren();
    for (const ref of current.references) {
      try {
        const url = new URL(ref.url); if (!['http:', 'https:'].includes(url.protocol)) continue;
        const li = document.createElement('li'); const a = document.createElement('a');
        a.href = url.href; a.textContent = ref.title; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); refs.append(li);
      } catch (_) { /* Ignore invalid reference URLs. */ }
    }
    $('reference-section').hidden = !refs.children.length;
    const idx = lessons.indexOf(current); $('lesson-prev').disabled = idx === 0; $('lesson-next').disabled = idx === lessons.length - 1;
    if (updateURL) { const url = new URL(location.href); url.searchParams.set('lesson', current.id); history.replaceState(null, '', url); }
    setTab('learn'); renderList();
  }
  function updateButtons() {
    const done = !!state.completed[current.id], marked = !!state.bookmarks[current.id];
    $('complete-lesson').textContent = done ? '学習済み ✓' : '学習済みにする';
    $('complete-lesson').setAttribute('aria-pressed', String(done));
    $('bookmark-lesson').textContent = marked ? '復習リストに追加済み' : 'あとで復習';
    $('bookmark-lesson').setAttribute('aria-pressed', String(marked));
    progress();
  }
  function move(offset) {
    const idx = lessons.indexOf(current) + offset;
    if (idx < 0 || idx >= lessons.length) return;
    select(lessons[idx].id); $('lesson-title').focus({ preventScroll: true });
  }
  async function init() {
    try {
      const response = await fetch('study-lessons.json?v=20261117-guide2', { cache: 'no-cache' });
      if (!response.ok) throw Error('教材データを取得できませんでした。');
      const data = await response.json();
      if (!Array.isArray(data.lessons) || !data.lessons.length) throw Error('教材データが空です。');
      lessons = data.lessons.map(l => ({ ...l, teaching: data.guides?.[l.teachingId], searchText: normalize([l.title, l.categoryLabel, ...l.tags, ...l.points, ...(l.terms || []).map(t => t.word)].join(' ')) }));
      try { const saved = localStorage.getItem(KEY); if (saved) state = validate(JSON.parse(saved)); }
      catch (_) { message('保存済みデータを読み込めませんでした。バックアップがあれば取り込んでください。', true); }
      const categories = new Map(lessons.map(l => [l.category, l.categoryLabel]));
      for (const [value, label] of categories) { const option = document.createElement('option'); option.value = value; option.textContent = label; $('study-category').append(option); }
      $('study-search').addEventListener('input', filter); $('study-category').addEventListener('change', filter); $('study-status').addEventListener('change', filter);
      $('catalog-prev').addEventListener('click', () => { page--; renderList(); });
      $('catalog-next').addEventListener('click', () => { page++; renderList(); });
      $('lesson-prev').addEventListener('click', () => move(-1)); $('lesson-next').addEventListener('click', () => move(1));
      $('random-lesson').addEventListener('click', () => select((filtered.length ? filtered : lessons)[Math.floor(Math.random() * (filtered.length || lessons.length))].id));
      $('complete-lesson').addEventListener('click', () => { state.completed[current.id] = !state.completed[current.id]; save(); updateButtons(); filter(); });
      $('bookmark-lesson').addEventListener('click', () => { state.bookmarks[current.id] = !state.bookmarks[current.id]; save(); updateButtons(); filter(); });
      $('lesson-memo').addEventListener('input', () => { state.notes[current.id] = $('lesson-memo').value; $('memo-status').textContent = save() ? 'このブラウザに保存しました' : 'バックアップを書き出して保存してください'; });
      $('reveal-answer').addEventListener('click', () => { const visible = $('recall-answer').hidden; $('recall-answer').hidden = !visible; $('reveal-answer').textContent = visible ? '答えを閉じる' : '答えを確認する'; $('reveal-answer').setAttribute('aria-expanded', String(visible)); });
      const tabs = ['learn', 'recall', 'memo'];
      for (const name of tabs) {
        $('tab-' + name).addEventListener('click', () => setTab(name));
        $('tab-' + name).addEventListener('keydown', e => { let idx = tabs.indexOf(name); if (e.key === 'ArrowRight') idx = (idx + 1) % 3; else if (e.key === 'ArrowLeft') idx = (idx + 2) % 3; else if (e.key === 'Home') idx = 0; else if (e.key === 'End') idx = 2; else return; e.preventDefault(); setTab(tabs[idx]); $('tab-' + tabs[idx]).focus(); });
      }
      $('export-progress').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'it-study-progress-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      });
      $('import-progress').addEventListener('click', () => $('import-file').click());
      $('import-file').addEventListener('change', async e => {
        const file = e.target.files[0]; if (!file) return;
        try {
          if (file.size > 8 * 1024 * 1024) throw Error('ファイルが大きすぎます。');
          const data = JSON.parse(await file.text()); if (data.version !== 1) throw Error('対応していないバックアップ形式です。');
          const incoming = validate(data.state);
          state = { completed: { ...state.completed, ...incoming.completed }, bookmarks: { ...state.bookmarks, ...incoming.bookmarks }, notes: { ...state.notes, ...incoming.notes }, last: incoming.last || state.last };
          const stored = save(); select(state.last || current.id); filter();
          message(stored ? 'バックアップを取り込みました。既存の記録と合わせて保存しました。' : '取り込めましたが、このブラウザには保存できません。再度バックアップを書き出してください。', !stored);
        } catch (err) { message('取り込めませんでした。' + err.message, true); }
        e.target.value = '';
      });
      filter();
      select(new URL(location.href).searchParams.get('lesson') || state.last || lessons[0].id, false);
      $('study-loading').hidden = true; $('study-app').hidden = false;
    } catch (err) { $('study-loading').textContent = '教材を読み込めませんでした。再読み込みしてください。'; message(err.message, true); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
