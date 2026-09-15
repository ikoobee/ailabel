/**
 * Lightweight i18n: dictionaries + data-i18n static replacement + ?lang= override, with persistence.
 */

export const translations = {
  'zh-CN': {
    pageTitle: 'AI 图片标识工具 - 一键添加"AI生成"显式标识与元数据隐式标识，本地处理',
    brand: 'AI 标识卫士',
    heroTitle: '给 AI 生成图片加标识，一键完成',
    heroSub: '显式标识（画面角标/平铺）+ 隐式标识（IPTC/XMP 标准元数据），本地处理不上传',
    badgeDual: '🏷️ 显式+隐式双标识',
    badgeLocal: '🔒 本地处理',
    badgeFree: '🆓 免费无注册',
    navHow: '使用步骤',
    navFaq: '常见问题',
    uploadTitle: '点击选择、拖拽或 Ctrl+V 粘贴 AI 生成的图片',
    uploadHint: '支持 JPG / PNG / WebP，最多 20 张',
    rotate: '旋转 90°',
    sampleBtn: '用 AI 风格示例图试用',
    previewHint: '实时预览显式标识 · 元数据标识不改变画面',
    labelLabel: '标识文字',
    labelPlaceholder: '输入自定义标识文字',
    metadataLabel: '元数据隐式标识（推荐开启）',
    metadataHint: '在图片元数据中写入 IPTC 标准 AI 生成标记（PNG/JPEG），文件层面的可追溯留痕',
    advTitle: '高级设置',
    advPosition: '位置',
    posTile: '整体平铺（防裁剪）',
    posCenter: '居中',
    posTL: '左上角', posTR: '右上角', posBL: '左下角', posBR: '右下角',
    advDensity: '平铺密度',
    advColor: '颜色',
    advSize: '字号（长边%）',
    advOpacity: '透明度',
    advStroke: '文字描边（任意底色可读）',
    generate: '添加标识',
    processing: '处理中…',
    reset: '重置',
    resultsTitle: '处理结果',
    downloadAll: '全部下载',
    download: '下载',
    copy: '复制到剪贴板',
    copied: '已复制到剪贴板',
    copyFailed: '复制失败，请改用下载',
    copyUnsupported: '当前环境不支持复制，请使用下载',
    fileNameLabel: '文件名',
    errNoFile: '请先添加至少一张图片',
    errNoText: '请输入或选择标识文字',
    errMaxFiles: '最多同时处理 20 张图片',
    errProcess: '处理失败，请换一张图片重试',
    downscaled: '部分图片过大，已自动压缩至安全分辨率',
    metaInjected: '已在图片元数据中写入 AI 生成标识 ✅',
    metaUnsupported: '部分格式（如 WebP）暂不支持元数据写入，已保留画面显式标识',
    disclaimer: '本工具为辅助标识工具：显式标识参考国内 AI 内容标识相关规定，隐式标识采用 IPTC 国际标准字段。具体合规要求请以法规文本与发布平台规则为准，本工具不构成法律意见。',
    howTitle: '如何给 AI 图片加标识？',
    how1Title: '1. 上传 AI 生成的图片',
    how1Body: 'Midjourney、即梦、豆包等工具生成的图片下载后通常不带标识，上传到这里补加。全部处理在浏览器本地完成，不上传。',
    how2Title: '2. 选择标识方式',
    how2Body: '默认右下角"AI 生成"角标（白字描边，任意底色清晰）；可选整体平铺防止角标被裁剪。推荐同时开启元数据隐式标识。',
    how3Title: '3. 下载发布',
    how3Body: '下载或复制到剪贴板后即可发布。元数据标识会随文件保留，供平台与工具链识别。',
    faqTitle: '常见问题',
    faq1q: '什么样的图片需要加 AI 标识？',
    faq1a: '一般而言，AI 生成或深度合成的图片在对外发布时需要标识。国内相关办法已施行，各平台对未标识内容可能限流或下架；具体范围以平台规则为准。',
    faq2q: '生成平台不是会自动加水印吗？',
    faq2a: '部分平台仅在站内展示时叠加标识，图片下载后标识即丢失；外发到其他平台就需要自行补加。本工具把标识烘焙进图片文件本身。',
    faq3q: '元数据隐式标识有什么用？',
    faq3a: '显式标识给人看，隐式标识给机器看。元数据中的 AI 生成标记（IPTC DigitalSourceType 国际标准字段）会随文件流转，便于平台审核、图库管理工具识别来源——它不改变画面，也不会被截图轻易去除。',
    privacy: '隐私政策',
    terms: '使用条款',
    footerNote: '本工具在您的浏览器本地处理图片，不上传任何数据。',
    langLabel: '语言',
    labels: ['AI 生成', '人工智能生成内容', '本图片由 AI 生成'],
  },

  en: {
    pageTitle: 'AI Image Labeler - Add "AI Generated" Mark & IPTC Metadata Locally',
    brand: 'AI Labeler',
    heroTitle: 'Label your AI-generated images in one click',
    heroSub: 'Explicit mark (corner badge / tiled) + implicit metadata (IPTC/XMP standard), 100% local',
    badgeDual: '🏷️ Explicit + implicit',
    badgeLocal: '🔒 100% local',
    badgeFree: '🆓 Free, no sign-up',
    navHow: 'How it works',
    navFaq: 'FAQ',
    uploadTitle: 'Click, drag, or paste (Ctrl+V) AI-generated images',
    uploadHint: 'JPG / PNG / WebP, up to 20 images',
    rotate: 'Rotate 90°',
    sampleBtn: 'Try an AI-style sample',
    previewHint: 'Live preview of the explicit mark · metadata does not alter the image',
    labelLabel: 'Label text',
    labelPlaceholder: 'Custom label text',
    metadataLabel: 'Implicit metadata label (recommended)',
    metadataHint: 'Writes the IPTC-standard AI-generated marker into image metadata (PNG/JPEG)',
    advTitle: 'Advanced',
    advPosition: 'Position',
    posTile: 'Tiled (crop-proof)',
    posCenter: 'Center',
    posTL: 'Top left', posTR: 'Top right', posBL: 'Bottom left', posBR: 'Bottom right',
    advDensity: 'Density',
    advColor: 'Color',
    advSize: 'Size (% of long side)',
    advOpacity: 'Opacity',
    advStroke: 'Text stroke (readable on any background)',
    generate: 'Add label',
    processing: 'Processing…',
    reset: 'Reset',
    resultsTitle: 'Results',
    downloadAll: 'Download all',
    download: 'Download',
    copy: 'Copy',
    copied: 'Copied!',
    copyFailed: 'Copy failed, please download instead',
    copyUnsupported: 'Copy not supported here, please download',
    fileNameLabel: 'Filename',
    errNoFile: 'Please add at least one image',
    errNoText: 'Please enter label text',
    errMaxFiles: 'Up to 20 images at a time',
    errProcess: 'Failed to process, try another image',
    downscaled: 'Some images were auto-compressed to a safe resolution',
    metaInjected: 'AI metadata marker written ✅',
    metaUnsupported: 'Some formats (e.g. WebP) do not support metadata writing yet; visible label applied',
    disclaimer: 'This is an assistive labeling tool: the explicit mark follows common AI-content labeling practice, the implicit marker uses the IPTC international standard field. Always follow your platform\'s rules; this tool is not legal advice.',
    howTitle: 'How to label AI images',
    how1Title: '1. Upload',
    how1Body: 'Images downloaded from Midjourney etc. usually carry no persistent mark. Everything is processed locally in your browser.',
    how2Title: '2. Pick a style',
    how2Body: 'Corner badge by default (white text with stroke); tiled mode prevents cropping. Keep the implicit metadata label on.',
    how3Title: '3. Download & publish',
    how3Body: 'Download or copy, then publish. The metadata marker stays with the file for platforms and tools to read.',
    faqTitle: 'FAQ',
    faq1q: 'Which images need an AI label?',
    faq1a: 'Generally, AI-generated or synthetically altered images should be labeled when published. Rules vary by platform and jurisdiction.',
    faq2q: "Doesn't the generator add a watermark?",
    faq2a: 'Some platforms overlay a mark only inside their site; downloads lose it. This tool bakes the mark into the image file itself.',
    faq3q: 'What is the implicit metadata label for?',
    faq3a: 'The visible mark is for humans; the metadata marker (IPTC DigitalSourceType) is for machines — it travels with the file and helps platforms and DAM tools identify provenance.',
    privacy: 'Privacy',
    terms: 'Terms',
    footerNote: 'Images are processed locally in your browser. Nothing is uploaded.',
    langLabel: 'Language',
    labels: ['AI Generated', 'Generated by AI', 'AI-generated image'],
  },
};

export let currentLang = 'zh-CN';

// Language persistence
const LANG_KEY = 'ailabel.lang';

export function t(key) {
  const dict = translations[currentLang] || translations['zh-CN'];
  return dict[key] ?? translations['zh-CN'][key] ?? key;
}

function applyStatic() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = translations[currentLang][el.dataset.i18n];
    if (v != null && typeof v !== 'object') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = translations[currentLang][el.dataset.i18nPlaceholder];
    if (v != null && typeof v !== 'object') el.placeholder = v;
  });
  document.title = t('pageTitle');
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', t('heroSub'));
  document.documentElement.lang = currentLang;
}

function rebuildLabels(sel) {
  const customInput = document.getElementById('customLabel');
  const keepCustom = sel.value === '__custom';
  const customText = (customInput && customInput.value) || '';
  sel.innerHTML = '';
  t('labels').forEach(label => {
    const o = document.createElement('option');
    o.value = label;
    o.textContent = label;
    sel.appendChild(o);
  });
  const o = document.createElement('option');
  o.value = '__custom';
  o.textContent = currentLang === 'en' ? 'Other (custom)' : '其他（自定义）';
  sel.appendChild(o);
  if (keepCustom) {
    sel.value = '__custom';
    if (customInput) customInput.value = customText;
  }
}

export function setLang(lang) {
  currentLang = translations[lang] ? lang : 'zh-CN';
  try { localStorage.setItem(LANG_KEY, currentLang); } catch (_) { /* storage unavailable */ }
  applyStatic();
  const sel = document.getElementById('label');
  if (sel) {
    const keepCustom = sel.value === '__custom';
    const idx = keepCustom ? null : sel.selectedIndex;
    rebuildLabels(sel);
    if (idx != null && idx < sel.options.length) sel.selectedIndex = idx;
    else if (keepCustom) sel.value = '__custom';
  }
}

export function initLang() {
  // Priority: ?lang= > /en page hint > localStorage > zh-CN
  let stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch (_) { /* storage unavailable */ }
  const url = new URLSearchParams(location.search).get('lang');
  const lang =
    (url && translations[url]) ? url :
    location.pathname.includes('/en') ? 'en' :
    (stored && translations[stored]) ? stored :
    'zh-CN';
  currentLang = lang;
  document.documentElement.lang = lang;
  rebuildLabels(document.getElementById('label'));
  applyStatic();
  const sel = document.getElementById('langSelector');
  if (sel) sel.value = lang;
}
