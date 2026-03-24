// lessons.js — JM Film School Lessons Page

let currentChapterId = 1;
let allData = null;

(async () => {
  const res = await fetch('data.json');
  allData = await res.json();

  const params = new URLSearchParams(window.location.search);
  currentChapterId = parseInt(params.get('chapter')) || 1;

  buildSidebar(allData.chapters);
  loadChapter(currentChapterId);
  initSidebarToggle();
  initModal();
  initNav();
  registerSW();
})();

// ===== SIDEBAR =====
function buildSidebar(chapters) {
  const container = document.getElementById('sidebarChapters');
  if (!container) return;
  const nums = ['الأول','الثاني','الثالث','الرابع','الخامس','السادس'];

  container.innerHTML = chapters.map((ch, i) => `
    <div class="sidebar-chapter-group" data-chapter-id="${ch.id}">
      <button class="sidebar-chapter-btn ${ch.id === currentChapterId ? 'active open' : ''}"
              onclick="toggleSidebarChapter(${ch.id}, this)">
        <span class="ch-icon"><i class="fa-solid ${ch.icon || 'fa-play'}"></i></span>
        <span class="ch-label">الفصل ${nums[i]}: ${ch.title.replace(/الفصل [^:]+:\s*/,'').slice(0,20)}</span>
        <i class="fa-solid fa-chevron-left ch-arrow"></i>
      </button>
      <div class="sidebar-lessons ${ch.id === currentChapterId ? 'open' : ''}">
        ${ch.lessons.map(l => `
          <button class="sidebar-lesson-btn"
                  data-chapter="${ch.id}" data-lesson="${l.id}"
                  onclick="openLessonModal(${ch.id}, ${l.id})">
            <span class="lesson-num-badge">${l.id}</span>
            <span class="lesson-label-text">${l.title}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleSidebarChapter(chapterId, btn) {
  if (chapterId !== currentChapterId) {
    currentChapterId = chapterId;
    loadChapter(chapterId);
    const url = new URL(window.location.href);
    url.searchParams.set('chapter', chapterId);
    window.history.replaceState({}, '', url);
  }
  const group = btn.closest('.sidebar-chapter-group');
  const lessonsEl = group.querySelector('.sidebar-lessons');
  const isOpen = btn.classList.contains('open');

  document.querySelectorAll('.sidebar-chapter-btn').forEach(b => b.classList.remove('active','open'));
  document.querySelectorAll('.sidebar-lessons').forEach(l => l.classList.remove('open'));

  if (!isOpen) {
    btn.classList.add('active','open');
    lessonsEl.classList.add('open');
  } else {
    btn.classList.add('active');
  }
}

function initSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });
}

// ===== LOAD CHAPTER =====
function loadChapter(chapterId) {
  const ch = allData.chapters.find(c => c.id === chapterId);
  if (!ch) return;

  const nums = ['','الأول','الثاني','الثالث','الرابع','الخامس','السادس'];
  document.getElementById('chapterBadge').innerHTML =
    `<i class="fa-solid ${ch.icon || 'fa-play'}"></i> الفصل ${nums[ch.id] || ch.id}`;
  document.getElementById('chapterTitle').textContent = ch.title.replace(/الفصل [^:]+:\s*/,'');
  document.getElementById('chapterSubtitle').textContent = ch.subtitle;
  document.getElementById('chapterMeta').innerHTML = `
    <div class="meta-item"><i class="fa-solid fa-play-circle"></i> ${ch.lessons.length} محاضرة</div>
    <div class="meta-item"><i class="fa-solid fa-folder"></i> videos/chapter${ch.id}/</div>
  `;
  document.getElementById('lessonsListTitle').textContent = `محاضرات الفصل ${nums[ch.id] || ch.id}`;

  const cards = document.getElementById('lessonsCards');
  cards.innerHTML = ch.lessons.map(l => `
    <div class="lesson-card" onclick="openLessonModal(${ch.id}, ${l.id})">
      <div class="lesson-card-top">
        <div class="lesson-card-num">${l.id}</div>
        <div class="play-btn"><i class="fa-solid fa-play"></i></div>
      </div>
      <div class="lesson-card-label">${l.label}</div>
      <div class="lesson-card-title">${l.title}</div>
      <div class="lesson-card-desc">${l.desc}</div>
    </div>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.lesson-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(14px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 35);
    });
  });

  document.querySelectorAll('.sidebar-chapter-btn').forEach(b => b.classList.remove('active','open'));
  document.querySelectorAll('.sidebar-lessons').forEach(l => l.classList.remove('open'));
  const activeGroup = document.querySelector(`[data-chapter-id="${chapterId}"]`);
  if (activeGroup) {
    activeGroup.querySelector('.sidebar-chapter-btn').classList.add('active','open');
    activeGroup.querySelector('.sidebar-lessons').classList.add('open');
  }
  document.getElementById('lessonMain').scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== MODAL =====
function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function openLessonModal(chapterId, lessonId) {
  const ch = allData.chapters.find(c => c.id === chapterId);
  if (!ch) return;
  const lesson = ch.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  document.getElementById('modalLabel').textContent = lesson.label;
  document.getElementById('modalTitle').textContent = lesson.title;
  document.getElementById('modalDesc').textContent = lesson.desc;
  document.getElementById('modalVideoPath').textContent = lesson.video;
  document.getElementById('modalOverlay').classList.add('open');

  document.querySelectorAll('.sidebar-lesson-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(
    `.sidebar-lesson-btn[data-chapter="${chapterId}"][data-lesson="${lessonId}"]`
  );
  if (activeBtn) activeBtn.classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ===== NAV =====
function initNav() {
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ===== PWA =====
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
