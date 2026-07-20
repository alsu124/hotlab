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

// ---- Reveal on scroll ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// ---- Contact form → Telegram ----
const form = document.getElementById('ctaForm');
const statusEl = document.getElementById('ctaStatus');
const TG_TOKEN = '8903006123:AAF3B7_8CTBAhKHXz1hrpRw7vbfSZfnqNsk';
const TG_CHAT = '-5367894062';

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
