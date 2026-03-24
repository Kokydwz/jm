// main.js — JM Film School Homepage

(async () => {
  const res = await fetch('data.json');
  const data = await res.json();

  // Total lessons count
  const total = data.chapters.reduce((s, c) => s + c.lessons.length, 0);
  const el = document.getElementById('totalLessons');
  if (el) el.textContent = toArabicNum(total);

  renderChapters(data.chapters);
  renderResources(data.resources);
  initNav();
  initDownloadModal();
  registerSW();
})();

// ===== CHAPTERS =====
function renderChapters(chapters) {
  const grid = document.getElementById('chaptersGrid');
  if (!grid) return;
  const nums = ['الأول','الثاني','الثالث','الرابع','الخامس','السادس'];
  grid.innerHTML = chapters.map((ch, i) => `
    <a class="chapter-card" href="lessons.html?chapter=${ch.id}">
      <div class="chapter-card-icon">
        <i class="fa-solid ${ch.icon || 'fa-play'}"></i>
      </div>
      <div class="chapter-card-num">الفصل ${nums[i] || i+1}</div>
      <div class="chapter-card-title">${ch.title.replace(/الفصل [^:]+:\s*/,'')}</div>
      <div class="chapter-card-desc">${ch.subtitle}</div>
      <div class="chapter-card-meta">
        <div class="chapter-card-count">
          <i class="fa-solid fa-play-circle" style="color:var(--orange);font-size:12px;"></i>
          <span>${ch.lessons.length} محاضرة</span>
        </div>
        <div class="chapter-card-arrow">
          <i class="fa-solid fa-arrow-left"></i>
        </div>
      </div>
    </a>
  `).join('');
}

// ===== RESOURCES =====
function renderResources(resources) {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;
  grid.innerHTML = resources.map(r => `
    <div class="resource-card">
      <div class="resource-icon"><i class="fa-solid ${r.icon}"></i></div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-desc">${r.desc}</div>
      <button class="resource-btn"
              data-file="${r.file || '#'}"
              data-title="${r.title}"
              onclick="openDownloadModal(this)">
        <i class="fa-solid fa-download"></i> تحميل
      </button>
    </div>
  `).join('');
}

// ===== DOWNLOAD MODAL =====
function initDownloadModal() {
  document.getElementById('dlBackdrop').onclick = closeDownloadModal;
  document.getElementById('dlCancel').onclick = closeDownloadModal;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDownloadModal(); });
}

function openDownloadModal(btn) {
  const file = btn.dataset.file;
  const title = btn.dataset.title;
  document.getElementById('dlTitle').textContent = title;
  document.getElementById('dlFilename').textContent = file.split('/').pop();
  const confirmBtn = document.getElementById('dlConfirm');
  confirmBtn.href = file;
  confirmBtn.download = file.split('/').pop();
  document.getElementById('dlOverlay').classList.add('open');
}

function closeDownloadModal() {
  document.getElementById('dlOverlay').classList.remove('open');
}

// ===== NAV HAMBURGER =====
function initNav() {
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ===== PWA SERVICE WORKER =====
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// ===== HELPERS =====
function toArabicNum(n) {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}
