// ---- Header shrink on scroll ----
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---- Mobile menu ----
const burger = document.getElementById('burger');
const nav = document.getElementById('mainNav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

// ---- Плавающая кнопка звонка (появляется при прокрутке) ----
const callFab = document.querySelector('.call-fab');
if (callFab) {
  const toggleFab = () => callFab.classList.toggle('show', window.scrollY > 400);
  toggleFab();
  window.addEventListener('scroll', toggleFab, { passive: true });
}

// ---- Reveal on scroll ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 100}ms`;
  io.observe(el);
});

// ---- Contact form → Telegram ----
const form = document.getElementById('ctaForm');
const statusEl = document.getElementById('ctaStatus');
const TG_TOKEN = '8903006123:AAF3B7_8CTBAhKHXz1hrpRw7vbfSZfnqNsk';
const TG_CHAT = '-5367894062';

if (form) {
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.elements['name'].value.trim();
  const phone = form.elements['phone'].value.trim();
  const btn = form.querySelector('button[type="submit"]');

  statusEl.textContent = 'Отправляем…';
  btn.disabled = true;

  const text =
    '🔥 Новая заявка с сайта HOT LAB\n\n' +
    '👤 Имя: ' + (name || '—') + '\n' +
    '📞 Телефон: ' + (phone || '—');

  try {
    const r = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text: text })
    });
    const d = await r.json();
    if (!d.ok) throw new Error('tg');
    statusEl.textContent = 'Спасибо, ' + (name || 'друг') + '! Мы свяжемся с вами в ближайшее время.';
    form.reset();
  } catch (err) {
    statusEl.textContent = 'Не удалось отправить. Позвоните нам: 8 (993) 925-49-23';
  } finally {
    btn.disabled = false;
  }
});
}

// ---- Всплывающая форма записи (через 10 сек на сайте) ----
(function () {
  if (sessionStorage.getItem('hlPopupShown')) return;

  setTimeout(() => {
    if (sessionStorage.getItem('hlPopupShown')) return;
    sessionStorage.setItem('hlPopupShown', '1');
    showHlPopup();
  }, 10000);

  function showHlPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML =
      '<div class="popup-modal" role="dialog" aria-modal="true" aria-label="Записаться на пробное занятие">' +
        '<button type="button" class="popup-close" aria-label="Закрыть">&times;</button>' +
        '<span class="eyebrow">HOT LAB</span>' +
        '<h3 class="popup-title">Записаться на пробное занятие</h3>' +
        '<p class="popup-text">Оставьте контакт — пришлём актуальные цены, расписание и подберём удобное время.</p>' +
        '<form id="popupForm" class="popup-form">' +
          '<input type="text" name="name" placeholder="Ваше имя" required />' +
          '<input type="tel" name="phone" placeholder="Телефон" required />' +
          '<label class="cta-consent">' +
            '<input type="checkbox" name="consent" required />' +
            '<span>Я согласен(на) на <a href="politika-konfidencialnosti.html" target="_blank" rel="noopener">обработку персональных данных</a></span>' +
          '</label>' +
          '<button type="submit" class="btn btn-solid">Записаться <span class="arrow">→</span></button>' +
        '</form>' +
        '<p class="popup-status" id="popupStatus"></p>' +
        '<div class="popup-links">' +
          '<a href="index.html#pricing">Смотреть цены</a>' +
          '<a href="index.html#schedule">Расписание</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.classList.add('popup-lock');
    requestAnimationFrame(() => overlay.classList.add('show'));

    const closePopup = () => {
      overlay.classList.remove('show');
      document.body.classList.remove('popup-lock');
      document.removeEventListener('keydown', onKeydown);
      setTimeout(() => overlay.remove(), 400);
    };
    const onKeydown = (e) => { if (e.key === 'Escape') closePopup(); };

    overlay.querySelector('.popup-close').addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });
    document.addEventListener('keydown', onKeydown);

    const popupForm = overlay.querySelector('#popupForm');
    const popupStatus = overlay.querySelector('#popupStatus');

    popupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = popupForm.elements['name'].value.trim();
      const phone = popupForm.elements['phone'].value.trim();
      const btn = popupForm.querySelector('button[type="submit"]');

      popupStatus.textContent = 'Отправляем…';
      btn.disabled = true;

      const text =
        '🔥 Новая заявка с сайта HOT LAB (всплывающая форма)\n\n' +
        '👤 Имя: ' + (name || '—') + '\n' +
        '📞 Телефон: ' + (phone || '—');

      try {
        const r = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT, text: text })
        });
        const d = await r.json();
        if (!d.ok) throw new Error('tg');
        popupStatus.textContent = 'Спасибо, ' + (name || 'друг') + '! Мы свяжемся с вами в ближайшее время.';
        popupForm.reset();
        setTimeout(closePopup, 2500);
      } catch (err) {
        popupStatus.textContent = 'Не удалось отправить. Позвоните нам: 8 (993) 925-49-23';
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
