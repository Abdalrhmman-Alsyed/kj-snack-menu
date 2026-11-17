// Small UI effects: ticker, cursor, magnetic buttons, reveals, offer + footer content.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { icons } from './icons.js';
import { flamesSVG } from './logo.js';
import { site } from '../data/site.js';
import { categories } from '../data/menu.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function initTicker() {
  const words = ['برغر', 'مقلي مقرمش', 'مشاوي', 'BITE THE WOW!', 'سلطات', 'مقبلات', 'KJ SNACK'];
  document.querySelectorAll('[data-ticker]').forEach((track, n) => {
    const list = n ? [...words].reverse() : words;
    const group = `<div class="ticker__group">${list.map((w) => `<span class="ticker__item${/[A-Z]/.test(w) ? ' ticker__item--latin' : ''}">${w}${icons.star}</span>`).join('')}</div>`;
    track.setAttribute('dir', 'ltr');
    track.innerHTML = group + group + group;
    const dir = +track.dataset.ticker;
    const tween = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -33.333 }, { xPercent: dir > 0 ? -33.333 : 0, duration: 26, ease: 'none', repeat: -1 });
    let boost = 1;
    ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = Math.min(5, Math.abs(self.getVelocity()) / 400);
        boost = 1 + v;
        gsap.to(tween, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: 1, duration: 1.2 }) });
      },
    });
  });
}

export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const el = document.getElementById('cursor');
  const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const hot = e.target.closest('a, button, input, .card');
    el.classList.toggle('is-hover', !!hot);
    el.classList.toggle('is-dark', !!e.target.closest('.footer, .stage.is-dark, .preloader'));
  });
  document.addEventListener('pointerleave', () => gsap.to(el, { opacity: 0, duration: 0.2 }));
  document.addEventListener('pointerenter', () => gsap.to(el, { opacity: 1, duration: 0.2 }));
}

export function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

export function initReveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true }, y: 50, opacity: 0, duration: 1, ease: 'expo.out' });
  });
  document.querySelectorAll('[data-reveal-title]').forEach((el) => {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%', once: true }, yPercent: 60, scale: 0.6, rotation: -6, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' });
  });
  // offer art
  const offer = document.querySelector('.offer__panel');
  if (offer) {
    gsap.from('.offer__icons svg', { scrollTrigger: { trigger: offer, start: 'top 75%', once: true }, y: 120, rotation: (i) => (i ? 40 : -40), opacity: 0, duration: 1.1, stagger: 0.12, ease: 'back.out(1.7)', delay: 0.15 });
    gsap.from('.burst--offer', { scrollTrigger: { trigger: offer, start: 'top 75%', once: true }, scale: 0, duration: 1, ease: 'back.out(1.5)' });
  }
}

export function initHeader() {
  const header = document.getElementById('site-header');
  const bar = document.getElementById('progress-bar');
  ScrollTrigger.create({
    start: 80,
    end: 'max',
    onUpdate: (self) => {
      header.classList.toggle('is-solid', self.scroll() > 80);
      bar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

export function renderOffer() {
  const { offer } = site;
  document.getElementById('offer-title').textContent = offer.title;
  document.getElementById('offer-text').textContent = offer.text;
  document.getElementById('offer-icons').innerHTML = icons.cup + icons.friesTall;
  const cta = [];
  if (site.whatsapp) cta.push(`<a class="btn btn--yellow" href="https://wa.me/${encodeURIComponent(site.whatsapp)}" target="_blank" rel="noopener">${icons.whatsapp.replace('<svg', '<svg width="20" height="20"')}<span>اطلب عالواتساب</span></a>`);
  if (site.phone) cta.push(`<a class="btn btn--paper" href="tel:${esc(site.phone.replace(/\s+/g, ''))}">${icons.phone.replace('<svg', '<svg width="20" height="20"')}<span dir="ltr">${esc(site.phone)}</span></a>`);
  if (!cta.length) cta.push(`<a class="btn btn--yellow" href="#menu" data-scroll><span>شوف المنيو</span></a>`);
  document.getElementById('offer-cta').innerHTML = cta.join('');
}

export function renderFooter() {
  const cols = [];
  cols.push(`<div class="footer__col"><h3>المنيو</h3><ul>${categories.map((c) => `<li><a href="#cat-${c.id}" data-scroll>${esc(c.title)}</a></li>`).join('')}</ul></div>`);

  const contact = [];
  if (site.phone) contact.push(`<li><a href="tel:${esc(site.phone.replace(/\s+/g, ''))}" dir="ltr">${esc(site.phone)}</a></li>`);
  if (site.whatsapp) contact.push(`<li><a href="https://wa.me/${encodeURIComponent(site.whatsapp)}" target="_blank" rel="noopener">واتساب</a></li>`);
  if (site.address) contact.push(`<li>${site.mapUrl ? `<a href="${esc(site.mapUrl)}" target="_blank" rel="noopener">${esc(site.address)}</a>` : esc(site.address)}</li>`);
  if (site.hours) contact.push(`<li>${esc(site.hours)}</li>`);
  cols.push(`<div class="footer__col"><h3>زورونا</h3>${contact.length ? `<ul>${contact.join('')}</ul>` : '<p>منستناك عنّا — جيب جوعك معك!</p>'}</div>`);

  const social = ['instagram', 'facebook', 'tiktok'].filter((k) => site[k]);
  cols.push(`<div class="footer__col"><h3>تابعونا</h3>${social.length
    ? `<div class="footer__social">${social.map((k) => `<a href="${esc(site[k])}" target="_blank" rel="noopener" aria-label="${k}">${icons[k]}</a>`).join('')}</div>`
    : '<p dir="ltr" style="text-align:right">#BiteTheWow</p>'}</div>`);

  document.getElementById('footer-cols').innerHTML = cols.join('');
  document.getElementById('footer-flames').innerHTML = Array.from({ length: 4 }, flamesSVG).join('');
  document.getElementById('year').textContent = new Date().getFullYear();
}
