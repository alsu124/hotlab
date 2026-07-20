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

// ---- Открытие публичной оферты из футера ----
const offerLink = document.querySelector('.offer-link');
const offerBox = document.getElementById('offer');
if (offerLink && offerBox) {
  offerLink.addEventListener('click', (e) => {
    e.preventDefault();
    offerBox.open = true;
    offerBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ---- Contact form (demo) ----
const form = document.getElementById('ctaForm');
const status = document.getElementById('ctaStatus');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  status.textContent = `Спасибо, ${name || 'друг'}! Мы свяжемся с вами в ближайшее время.`;
  form.reset();
});
