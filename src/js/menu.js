// Menu rendering, category chips and live search.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories, tagLabels } from '../data/menu.js';
import { site } from '../data/site.js';
import { icons } from './icons.js';
import { burstPoints } from './burst.js';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const arNum = (s) => String(s).replace(/\d/g, (d) => AR_DIGITS[d]).replace(/%/g, '٪');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Arabic-friendly normalisation (keeps a char → index map so we can highlight matches)
const MAP = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ة': 'ه', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي' };
const DROP = /[ً-ٰٟـ]/; // tashkeel + tatweel
function normalize(str) {
  let out = '';
  const idx = [];
  const s = String(str).toLowerCase();
  for (let i = 0; i < s.length; i++) {
    let ch = s[i];
    if (DROP.test(ch)) continue;
    if (AR_DIGITS.includes(ch)) ch = String(AR_DIGITS.indexOf(ch));
    out += MAP[ch] || ch;
    idx.push(i);
  }
  return { out, idx };
}

function highlight(text, q) {
  if (!q) return esc(text);
  const { out, idx } = normalize(text);
  const at = out.indexOf(q);
  if (at < 0) return esc(text);
  const a = idx[at], b = idx[at + q.length - 1] + 1;
  return `${esc(text.slice(0, a))}<mark>${esc(text.slice(a, b))}</mark>${esc(text.slice(b))}`;
}

const priceBurst = (seed) => `<svg viewBox="-110 -110 220 220" class="burst" aria-hidden="true"><polygon points="${burstPoints(12, 0.8, 0.08, seed)}"/></svg>`;
const cur = () => (site.currency ? `<small>${esc(site.currency)}</small>` : '');

function priceHTML(item, seed) {
  if (item.variants?.length) {
    const min = Math.min(...item.variants.map((v) => v.price ?? Infinity));
    if (Number.isFinite(min)) return `<div class="price">${priceBurst(seed)}<span class="price__val"><small>من</small>${arNum(min)}${cur()}</span></div>`;
  }
  if (item.price == null) return `<div class="price price--ask">${priceBurst(seed)}<span class="price__val">اسأل<br>عنّا</span></div>`;
  return `<div class="price">${priceBurst(seed)}<span class="price__val">${arNum(item.price)}${cur()}</span></div>`;
}

function cardHTML(item, i, cat) {
  const tags = (item.tags || []).map((t) => `<span class="tag tag--${t}">${t === 'spicy' ? icons.pepper : ''}${esc(tagLabels[t] || t)}</span>`).join('');
  const variants = item.variants?.length
    ? `<div class="variants">${item.variants.map((v) => `<span class="variant">${esc(arNum(v.label))} <b>${v.price != null ? arNum(v.price) : '—'}</b></span>`).join('')}</div>`
    : '';
  const ing = item.ingredients.map((x) => esc(arNum(x))).join('<span class="dot">•</span>');
  const searchText = normalize([item.name, item.latin || '', cat.title, cat.short, ...item.ingredients, ...(item.tags || []).map((t) => tagLabels[t])].join(' ')).out;
  return `<article class="card" data-search="${esc(searchText)}" data-name="${esc(item.name)}">
    <div class="card__top">
      <span class="card__num" dir="ltr">${String(i + 1).padStart(2, '0')}</span>
      ${priceHTML(item, i * 7 + cat.id.length)}
    </div>
    <h4 class="card__name"><span class="card__label">${esc(arNum(item.name))}</span>${item.latin ? `<span class="latin" dir="ltr">${esc(item.latin)}</span>` : ''}</h4>
    <p class="card__ing">${ing}</p>
    ${item.note ? `<p class="card__note">${esc(arNum(item.note))}</p>` : ''}
    ${variants}
    ${tags ? `<div class="card__foot">${tags}</div>` : ''}
  </article>`;
}

export function renderMenu() {
  const wrap = document.getElementById('menu-cats');
  const chips = document.getElementById('chips');

  wrap.innerHTML = categories.map((cat) => {
    const latin = /^[A-Za-z]+$/.test(cat.title);
    return `<section class="cat cat--${cat.color}" id="cat-${cat.id}" data-cat="${cat.id}" aria-labelledby="cat-title-${cat.id}">
      <header class="cat__head">
        <span class="cat__big" dir="ltr" aria-hidden="true">${String(categories.indexOf(cat) + 1).padStart(2, '0')}</span>
        <div class="cat__icon">${icons[cat.icon] || icons.burger}</div>
        <div class="cat__text">
          <p class="cat__count">${arNum(cat.items.length)} ${cat.items.length > 10 || cat.items.length < 3 ? 'صنف' : 'أصناف'}</p>
          <h3 class="cat__title" id="cat-title-${cat.id}">${latin ? `<span class="latin" dir="ltr">${esc(cat.title)}</span>` : esc(cat.title)}</h3>
          <p class="cat__blurb">${esc(cat.blurb)}</p>
        </div>
      </header>
      <div class="cat__grid">${cat.items.map((it, i) => cardHTML(it, i, cat)).join('')}</div>
    </section>`;
  }).join('');

  chips.innerHTML = `<span class="chips__pill" aria-hidden="true"></span>` + categories.map((c) =>
    `<button class="chip" type="button" data-target="cat-${c.id}">${icons[c.icon] || ''}<span>${esc(c.short)}</span></button>`).join('');

  // total count for the hero sticker
  const total = categories.reduce((n, c) => n + c.items.length, 0);
  const sticker = document.querySelector('#sticker-count b');
  if (sticker) sticker.textContent = `+${Math.floor(total / 5) * 5}`;
  return total;
}

export function initMenu({ scrollTo }) {
  const chipsEl = document.getElementById('chips');
  const pill = chipsEl.querySelector('.chips__pill');
  const chipBtns = [...chipsEl.querySelectorAll('.chip')];
  const cats = [...document.querySelectorAll('.cat')];
  let active = null;

  function setActive(id, instant = false) {
    if (active === id) return;
    active = id;
    const btn = chipBtns.find((b) => b.dataset.target === id);
    chipBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    if (!btn) { gsap.to(pill, { opacity: 0, duration: 0.2 }); return; }
    gsap.to(pill, { x: btn.offsetLeft, width: btn.offsetWidth, opacity: 1, duration: instant ? 0 : 0.5, ease: 'expo.out' });
    const left = btn.offsetLeft - (chipsEl.clientWidth - btn.offsetWidth) / 2;
    chipsEl.scrollTo({ left, behavior: instant ? 'auto' : 'smooth' });
  }
  gsap.set(pill, { opacity: 0 });

  chipBtns.forEach((b) => b.addEventListener('click', () => {
    const el = document.getElementById(b.dataset.target);
    if (el && !el.hidden) scrollTo(el, -(document.getElementById('menu-bar').offsetHeight + 90));
  }));

  cats.forEach((cat) => {
    ScrollTrigger.create({
      trigger: cat,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => { if (self.isActive) setActive(cat.id); },
    });
  });
  window.addEventListener('resize', () => { const id = active; active = null; if (id) setActive(id, true); });

  // ---------- search
  const input = document.getElementById('menu-search');
  const empty = document.getElementById('menu-empty');
  const cards = [...document.querySelectorAll('.card')];
  let raf = 0;
  input.addEventListener('input', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const q = normalize(input.value.trim()).out;
      const words = q.split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c) => {
        const ok = !words.length || words.every((w) => c.dataset.search.includes(w));
        c.classList.toggle('is-hidden', !ok);
        c.querySelector('.card__label').innerHTML = highlight(arNum(c.dataset.name), words[0] || '');
        if (ok) shown++;
      });
      cats.forEach((cat) => { cat.hidden = !cat.querySelector('.card:not(.is-hidden)'); });
      empty.hidden = shown > 0;
      ScrollTrigger.refresh();
    });
  });
  input.addEventListener('focus', () => {
    const bar = document.getElementById('menu-bar');
    if (bar.getBoundingClientRect().top > window.innerHeight * 0.5) scrollTo(document.getElementById('menu'), 0);
  });

  // card entrance
  gsap.set(cards, { y: 60, rotation: () => gsap.utils.random(-4, 4), opacity: 0 });
  ScrollTrigger.batch(cards, {
    start: 'top 95%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07, clearProps: 'transform' }),
  });
  cats.forEach((cat) => {
    const head = cat.querySelector('.cat__head');
    gsap.from(head, { scrollTrigger: { trigger: head, start: 'top 90%', once: true }, clipPath: 'inset(0 0 0 100% round 18px)', duration: 1, ease: 'expo.out' });
    gsap.from(head.querySelector('.cat__icon'), { scrollTrigger: { trigger: head, start: 'top 90%', once: true }, scale: 0, rotation: -180, duration: 1, delay: 0.2, ease: 'back.out(1.6)' });
  });
}
