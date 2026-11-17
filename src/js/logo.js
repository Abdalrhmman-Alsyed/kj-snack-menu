// KJ logo rebuilt as layered vector art (traced from the original), so every part can animate.
import { gsap } from 'gsap';
import paths from '../data/logo-paths.json';

const SQUIGGLE = 'M521 202C510 212 499 222 492 231C502 244 512 258 519 270C508 284 495 296 485 307C481 318 482 330 484 341C485 353 488 365 490 376';
const SHINE = 'M455 437C465 434 475 430 484 425';
let uid = 0;

export function logoSVG({ ring = true, label = 'KJ Snack' } = {}) {
  const id = `kjclip${++uid}`;
  return `<svg class="kjlogo" viewBox="-8 -8 656 656" role="img" aria-label="${label}">
  <defs><clipPath id="${id}"><circle cx="320" cy="320" r="318"/></clipPath></defs>
  <g class="kjlogo__disc"><circle cx="320" cy="320" r="318" fill="#FFFDE3"/></g>
  <g clip-path="url(#${id})"><g class="kjlogo__flames"><path d="${paths.flames}" fill="#FB8532" fill-rule="evenodd"/></g></g>
  <g class="kjlogo__k"><path d="${paths.k}" fill="#FB8532" fill-rule="evenodd"/></g>
  <g class="kjlogo__dog">
    <path d="${paths.bread}" fill="#FBF4A2" fill-rule="evenodd"/>
    <path d="${paths.speckle}" fill="#A9A23A" fill-rule="evenodd"/>
    <path d="${paths.bun}" fill="#DE8640" fill-rule="evenodd"/>
    <path d="${paths.sausage}" fill="#D4202C" fill-rule="evenodd"/>
    <path d="${SQUIGGLE}" fill="none" stroke="#FFC4A8" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${SHINE}" fill="none" stroke="#FFC4A8" stroke-width="2.8" stroke-linecap="round"/>
  </g>
  <g class="kjlogo__splat"><path d="${paths.splat}" fill="#E0214B" fill-rule="evenodd"/></g>
  ${ring ? '<circle class="kjlogo__ring" cx="320" cy="320" r="319" fill="none" stroke="#151214" stroke-width="10"/>' : ''}
</svg>`;
}

export function mountLogos(root = document) {
  root.querySelectorAll('[data-kj-logo]').forEach((el) => { el.innerHTML = logoSVG(); });
}

export function flamesSVG() {
  // just the bottom flame row, cropped
  return `<svg viewBox="40 452 560 190" preserveAspectRatio="none" aria-hidden="true"><path d="${paths.flames}" fill-rule="evenodd"/></svg>`;
}

/** Build-up animation: disc pops, flames rise, the K blasts in, the hot dog drops, splat! */
export function logoIntro(container) {
  const svg = container.querySelector('svg');
  const q = (s) => svg.querySelector(s);
  const ring = q('.kjlogo__ring');
  const C = 2 * Math.PI * 319;
  const tl = gsap.timeline();
  gsap.set(svg.querySelectorAll('g'), { transformOrigin: '50% 50%' });
  tl.from(q('.kjlogo__disc'), { scale: 0, duration: 0.7, ease: 'back.out(1.8)' })
    .fromTo(ring, { strokeDasharray: C, strokeDashoffset: C }, { strokeDashoffset: 0, duration: 0.9, ease: 'power3.inOut' }, 0.05)
    .from(q('.kjlogo__flames'), { y: 230, duration: 0.8, ease: 'expo.out' }, 0.3)
    .from(q('.kjlogo__k'), { x: -520, skewX: -30, opacity: 0, duration: 0.75, ease: 'expo.out' }, 0.45)
    .from(q('.kjlogo__dog'), { y: -520, rotation: -35, duration: 0.9, ease: 'bounce.out' }, 0.6)
    .from(q('.kjlogo__splat'), { scale: 0, rotation: -120, duration: 0.8, ease: 'elastic.out(1, 0.45)' }, 1.15);
  return tl;
}

/** little wiggle used on hover / when the logo lands in the nav */
export function logoWiggle(container) {
  const svg = container.querySelector('svg');
  if (!svg) return;
  gsap.fromTo(svg.querySelector('.kjlogo__dog'), { rotation: -14 }, { rotation: 0, duration: 1, ease: 'elastic.out(1.1, 0.3)', transformOrigin: '50% 90%' });
  gsap.fromTo(svg.querySelector('.kjlogo__splat'), { scale: 1.6 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)', transformOrigin: '50% 50%' });
  gsap.fromTo(svg.querySelector('.kjlogo__k'), { x: -40 }, { x: 0, duration: 0.7, ease: 'expo.out' });
}
