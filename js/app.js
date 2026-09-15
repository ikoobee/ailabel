/**
 * Tool page interaction: label presets + metadata toggle + three upload
 * channels + generate/download/copy. The engine (engine.js) and metadata
 * module (metadata.js) are both pure-function modules.
 */
import * as engine from './engine.js';
import * as metadata from './metadata.js';
import { t, setLang, initLang } from './i18n.js';
import { initAnalytics, track } from './analytics.js';

const $ = id => document.getElementById(id);
const MAX_FILES = 20;

// The XMP packet only depends on the tool name; build once per session
const AI_XMP = metadata.buildAiXmp({ tool: 'AI Labeler' });

const state = {
  files: [],
  rotations: [],
  thumbUrls: [],
  results: [],
  metadata: true,                       // implicit metadata label toggle (on by default)
  color: engine.DEFAULTS.color,
  previewSrc: null,      // live-preview source (downscaled canvas)
  previewFileRef: null,
};

/* ---------- Toast ---------- */

function toast(msg, type = 'info') {
  let root = $('toastRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toastRoot';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

/* ---------- Label text ---------- */

function labelText() {
  const v = $('label').value;
  if (v === '__custom') return ($('customLabel').value || '').trim() || t('labels')[0];
  return v || t('labels')[0];
}

/* ---------- Upload: click / drag / paste ---------- */

function addFiles(fileList) {
  const imgs = Array.from(fileList).filter(f => f.type && f.type.startsWith('image/'));
  if (!imgs.length) return;
  const room = MAX_FILES - state.files.length;
  if (room <= 0) { toast(t('errMaxFiles'), 'warn'); return; }
  const take = imgs.slice(0, room);
  state.files = state.files.concat(take);
  state.rotations = state.rotations.concat(take.map(() => 0));
  if (imgs.length > room) toast(t('errMaxFiles'), 'warn');
  renderThumbs();
  updatePreviewSource();
}

function renderThumbs() {
  state.thumbUrls.forEach(u => URL.revokeObjectURL(u));
  state.thumbUrls = [];
  const box = $('thumbs');
  box.innerHTML = '';
  state.files.forEach((f, i) => {
    const url = URL.createObjectURL(f);
    state.thumbUrls.push(url);
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
    const img = document.createElement('img');
    img.src = url;
    img.alt = f.name;
    img.loading = 'lazy';
    if (state.rotations[i]) img.style.transform = `rotate(${state.rotations[i]}deg)`;

    const rot = document.createElement('button');
    rot.className = 'thumb-rot';
    rot.innerHTML = '&#10227;';
    rot.title = t('rotate');
    rot.addEventListener('click', e => {
      e.stopPropagation();
      state.rotations[i] = ((state.rotations[i] || 0) + 90) % 360;
      img.style.transform = `rotate(${state.rotations[i]}deg)`;
    });

    const del = document.createElement('button');
    del.className = 'thumb-del';
    del.innerHTML = '&times;';
    del.title = f.name;
    del.addEventListener('click', e => {
      e.stopPropagation();
      state.files.splice(i, 1);
      state.rotations.splice(i, 1);
      renderThumbs();
      updatePreviewSource();
    });
    wrap.appendChild(img);
    wrap.appendChild(rot);
    wrap.appendChild(del);
    box.appendChild(wrap);
  });
  box.hidden = state.files.length === 0;
}

/* ---------- Live preview (shows the visible label only; metadata never alters pixels) ---------- */

let previewTimer = null;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderLivePreview, 250);
}

async function updatePreviewSource() {
  const first = state.files[0] || null;
  if (first === state.previewFileRef) return;
  state.previewFileRef = first;
  state.previewSrc = null;
  if (!first) {
    $('livePreviewWrap').hidden = true;
    return;
  }
  try {
    const src = await engine.decodeImageFile(first);
    const S = { w: src.naturalWidth || src.width, h: src.naturalHeight || src.height };
    const f = Math.min(1, 480 / Math.max(S.w, S.h));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(S.w * f));
    c.height = Math.max(1, Math.round(S.h * f));
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    if (src.close) src.close();
    state.previewSrc = c;
    renderLivePreview();
  } catch (_) {
    $('livePreviewWrap').hidden = true;
  }
}

function renderLivePreview() {
  if (!state.previewSrc) return;
  try {
    const canvas = engine.applyWatermark(state.previewSrc, { ...readCfg(), rotate: state.rotations[0] || 0 });
    $('livePreview').replaceChildren(canvas);
    $('livePreviewWrap').hidden = false;
  } catch (err) {
    console.error(err);
  }
}

/* ---------- AI-style sample image (procedurally drawn — no copyright/compliance issues) ---------- */

async function makeSampleFile() {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 520;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 800, 520);
  g.addColorStop(0, '#312e81');
  g.addColorStop(0.5, '#7c3aed');
  g.addColorStop(1, '#db2777');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 800, 520);
  const blobs = [[160, 130, 90, '#a78bfa55'], [640, 380, 130, '#f0abfc44'], [420, 200, 60, '#67e8f944'], [250, 420, 75, '#fde68a33']];
  for (const [x, y, r, col] of blobs) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, '#00000000');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const blob = await engine.canvasToBlob(c, 'image/png');
  c.width = c.height = 0;
  return new File([blob], 'sample-ai.png', { type: 'image/png' });
}

/* ---------- Generate ---------- */

function readCfg() {
  const D = engine.DEFAULTS;
  const densityRaw = parseInt($('density').value, 10);
  return {
    text: labelText(),
    mode: $('position').value,
    density: Math.min(10, Math.max(2, Number.isFinite(densityRaw) ? densityRaw : D.density)),
    color: state.color,
    opacity: (parseInt($('opacity').value, 10) || D.opacityPct) / 100,
    sizePct: (parseFloat($('sizePct').value) || D.sizePct) / 100,
    angle: 45,
    strokeWidth: $('strokeToggle').checked ? 1 : 0,
  };
}

async function processFile(file, rotate = 0) {
  const src = await engine.decodeImageFile(file);
  const w = src.width || src.naturalWidth || 0;
  const h = src.height || src.naturalHeight || 0;
  const downscaled = engine.downscaleFactor(w, h) < 1;
  const canvas = engine.applyWatermark(src, { ...readCfg(), rotate });
  if (src.close) src.close();
  const type = engine.outputTypeFor(file);
  let blob = await engine.canvasToBlob(canvas, type, 0.92);
  canvas.width = canvas.height = 0;

  // Implicit metadata label: inject XMP into the output bytes
  // (re-encoding already wiped the original EXIF; only this XMP remains)
  let metaNote = 'off';
  if (state.metadata) {
    const u8 = new Uint8Array(await blob.arrayBuffer());
    const res = metadata.injectAiMetadata(u8, type, AI_XMP);
    if (res.injected) {
      blob = new Blob([res.bytes], { type });
      metaNote = 'ok';
    } else {
      metaNote = res.reason; // exists | unsupported | not-png/jpeg
    }
  }
  return {
    blob,
    url: URL.createObjectURL(blob),
    name: engine.makeWatermarkedName(file.name, 'ai-labeled'),
    downscaled,
    metaNote,
  };
}

function renderResult(entry) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const img = document.createElement('img');
  img.src = entry.url;
  img.alt = entry.name;
  img.loading = 'lazy';
  card.appendChild(img);

  const row = document.createElement('div');
  row.className = 'result-actions';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'name-input';
  nameInput.value = entry.name;
  nameInput.spellcheck = false;
  nameInput.setAttribute('aria-label', t('fileNameLabel'));
  row.appendChild(nameInput);

  const dl = document.createElement('button');
  dl.className = 'btn primary';
  dl.textContent = t('download');
  dl.addEventListener('click', () => {
    track('download');
    engine.downloadBlob(entry.blob, engine.ensureExt(nameInput.value.trim() || entry.name, entry.blob.type));
  });
  row.appendChild(dl);

  if (navigator.clipboard && window.ClipboardItem) {
    const cp = document.createElement('button');
    cp.className = 'btn ghost';
    cp.textContent = t('copy');
    cp.addEventListener('click', async () => {
      try {
        await engine.copyBlobToClipboard(entry.blob);
        track('copy');
        toast(t('copied'));
      } catch (err) {
        toast(err.message === 'UNSUPPORTED' ? t('copyUnsupported') : t('copyFailed'), 'warn');
      }
    });
    row.appendChild(cp);
  }

  card.appendChild(row);
  $('resultList').appendChild(card);
}

async function generate() {
  if (!state.files.length) {
    toast(t('errNoFile'), 'warn');
    $('dropZone').classList.add('warn');
    setTimeout(() => $('dropZone').classList.remove('warn'), 1500);
    return;
  }
  clearResults();
  const btn = $('generateBtn');
  btn.disabled = true;
  btn.dataset.origText = btn.textContent;
  btn.textContent = t('processing');
  let downscaledCount = 0;
  let metaOk = 0;
  let metaSkipped = 0;
  try {
    for (let i = 0; i < state.files.length; i++) {
      const file = state.files[i];
      try {
        const entry = await processFile(file, state.rotations[i] || 0);
        if (entry.downscaled) downscaledCount++;
        if (entry.metaNote === 'ok') metaOk++;
        else if (entry.metaNote !== 'off') metaSkipped++;
        state.results.push(entry);
        renderResult(entry);
      } catch (err) {
        console.error(err);
        toast(`${file.name}: ${t('errProcess')}`, 'error');
      }
    }
    if (state.results.length) {
      $('results').hidden = false;
      $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
      track('generate', { images: state.results.length, mode: readCfg().mode, metadata: state.metadata });
    }
    if (downscaledCount > 0) toast(t('downscaled'));
    if (metaOk > 0) toast(t('metaInjected'));
    else if (metaSkipped > 0 && state.metadata) toast(t('metaUnsupported'), 'warn');
  } finally {
    btn.disabled = false;
    btn.textContent = btn.dataset.origText || t('generate');
  }
}

function clearResults() {
  state.results.forEach(r => URL.revokeObjectURL(r.url));
  state.results = [];
  $('resultList').innerHTML = '';
  $('results').hidden = true;
}

async function downloadAll() {
  for (const r of state.results) {
    engine.downloadBlob(r.blob, engine.ensureExt(r.name, r.blob.type));
    await new Promise(res => setTimeout(res, 350));
  }
}

/* ---------- Apply defaults (single source) ---------- */

function applyDefaultsToUI() {
  const D = engine.DEFAULTS;
  $('label').selectedIndex = 0;
  $('customLabel').value = '';
  $('customLabel').hidden = true;
  $('metadataToggle').checked = state.metadata = true;
  $('strokeToggle').checked = engine.DEFAULT_CONFIG.strokeWidth > 0;
  $('position').value = D.mode;
  $('density').value = String(D.density);
  $('density').disabled = D.mode !== 'tile';
  $('sizePct').value = String(D.sizePct);
  $('sizeVal').textContent = `${D.sizePct}%`;
  $('opacity').value = String(D.opacityPct);
  $('opacityVal').textContent = `${D.opacityPct}%`;
  setColor(D.color);
}

function resetAll() {
  state.files = [];
  state.rotations = [];
  renderThumbs();
  updatePreviewSource();
  clearResults();
  applyDefaultsToUI();
}

/* ---------- Color swatches ---------- */

function setColor(hex) {
  state.color = hex;
  $('colorPicker').value = hex;
  document.querySelectorAll('.swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.color === hex));
}

/* ---------- Init ---------- */

function wireEvents() {
  $('dropZone').addEventListener('click', () => $('fileInput').click());
  $('dropZone').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fileInput').click(); }
  });
  $('fileInput').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });

  const dz = $('dropZone');
  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); dz.classList.add('drag-over');
  }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); dz.classList.remove('drag-over');
  }));
  dz.addEventListener('drop', e => addFiles(e.dataTransfer.files));
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => e.preventDefault());

  document.addEventListener('paste', e => {
    const el = e.target;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
    const files = [];
    for (const it of e.clipboardData.items) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  });

  $('label').addEventListener('change', () => {
    const custom = $('label').value === '__custom';
    $('customLabel').hidden = !custom;
    if (custom) $('customLabel').focus();
  });
  $('metadataToggle').addEventListener('change', e => { state.metadata = e.target.checked; });
  $('position').addEventListener('change', () => {
    $('density').disabled = $('position').value !== 'tile';
  });
  $('sizePct').addEventListener('input', () => { $('sizeVal').textContent = `${$('sizePct').value}%`; });
  $('opacity').addEventListener('input', () => { $('opacityVal').textContent = `${$('opacity').value}%`; });

  document.querySelectorAll('.swatch').forEach(s =>
    s.addEventListener('click', () => setColor(s.dataset.color)));
  $('colorPicker').addEventListener('input', e => setColor(e.target.value));

  $('generateBtn').addEventListener('click', generate);
  $('resetBtn').addEventListener('click', resetAll);
  $('downloadAllBtn').addEventListener('click', downloadAll);

  $('langSelector').addEventListener('change', e => {
    setLang(e.target.value); // i18n internally rebuilds the label-preset dropdown
    track('lang_change', { lang: e.target.value });
    ['generateBtn', 'downloadAllBtn'].forEach(id => { const b = $(id); if (b) b.textContent = t(b.dataset.i18nKey); });
    schedulePreview();
  });

  // Sample image
  $('sampleBtn').addEventListener('click', async () => {
    addFiles([await makeSampleFile()]);
    track('sample_use');
  });

  // Live-preview wiring (metadata toggle doesn't affect pixels, excluded)
  ['label', 'customLabel', 'position', 'density', 'colorPicker', 'sizePct', 'opacity', 'strokeToggle']
    .forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', schedulePreview);
      el.addEventListener('change', schedulePreview);
    });
  document.querySelectorAll('.swatch').forEach(s => s.addEventListener('click', schedulePreview));
}

function init() {
  initAnalytics();
  initLang();
  wireEvents();
  applyDefaultsToUI();
  $('generateBtn').dataset.i18nKey = 'generate';
  $('downloadAllBtn').dataset.i18nKey = 'downloadAll';
}

document.addEventListener('DOMContentLoaded', init);
