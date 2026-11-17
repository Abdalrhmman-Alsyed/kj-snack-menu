// Hand-drawn comic icons (inline SVG, 64x64).
const S = 'stroke="#151214" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';

export const icons = {
  burger: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M8 29c0-11 11-19 24-19s24 8 24 19z" fill="#F2A03D" ${S}/>
    <g fill="#FFF3D6"><ellipse cx="22" cy="19" rx="2.2" ry="1.3" transform="rotate(-20 22 19)"/><ellipse cx="32" cy="15.5" rx="2.2" ry="1.3"/><ellipse cx="42" cy="19" rx="2.2" ry="1.3" transform="rotate(20 42 19)"/><ellipse cx="27" cy="24" rx="2.2" ry="1.3"/><ellipse cx="37" cy="24" rx="2.2" ry="1.3"/></g>
    <path d="M6 33.5c4-3.5 7 2.5 11.5 0s7 3 11.5 0 7 3 11.5 0 7 3 11.5 0 4 1 6 0" fill="none" stroke="#3E9E3A" stroke-width="5" stroke-linecap="round"/>
    <path d="M9 36.5h46l-4 5H13z" fill="#FFB000" ${S}/>
    <rect x="8" y="40" width="48" height="9" rx="4.5" fill="#6B3418" ${S}/>
    <path d="M9 52h46c0 4.5-4 7-9 7H18c-5 0-9-2.5-9-7z" fill="#F2A03D" ${S}/>
  </svg>`,

  chicken: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M38 7c10 0 18 8 17 18-1 11-12 16-21 13l-8 8c1 3 0 6-3 7-3 1-5-1-5-3-3 1-6-1-6-4 0-3 3-5 6-4l8-8c-3-9 2-27 12-27z" fill="#E8902E" ${S}/>
    <path d="M35 14c-3 4-4 10-3 15" fill="none" stroke="#FFD27A" stroke-width="3" stroke-linecap="round"/>
    <g fill="#B8601A"><circle cx="45" cy="16" r="1.8"/><circle cx="48" cy="25" r="1.6"/><circle cx="40" cy="22" r="1.4"/><circle cx="43" cy="31" r="1.6"/></g>
    <path d="M18 47c-2-1-5 0-5 2" fill="none" stroke="#FFF3D6" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  skewer: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M8 56L56 8" stroke="#151214" stroke-width="4" stroke-linecap="round"/>
    <path d="M8 56L56 8" stroke="#D9B07A" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="13" y="38" width="14" height="13" rx="4" transform="rotate(-45 20 44.5)" fill="#8A4320" ${S}/>
    <rect x="23" y="29" width="13" height="11" rx="3" transform="rotate(-45 29.5 34.5)" fill="#E3262E" ${S}/>
    <rect x="31" y="19" width="14" height="13" rx="4" transform="rotate(-45 38 25.5)" fill="#8A4320" ${S}/>
    <rect x="41" y="12" width="12" height="10" rx="3" transform="rotate(-45 47 17)" fill="#3E9E3A" ${S}/>
    <path d="M20 9c2 3-1 5 1 8M27 6c2 3-1 5 1 8" fill="none" stroke="#FB8532" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`,

  salad: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M14 30c-2-6 3-12 9-11 1-6 9-9 14-5 5-4 13 0 12 6 5 1 8 6 6 10z" fill="#5DB33F" ${S}/>
    <circle cx="25" cy="27" r="4.5" fill="#E3262E" ${S}/>
    <circle cx="40" cy="25" r="4" fill="#E3262E" ${S}/>
    <circle cx="33" cy="22" r="2.6" fill="#FFC61A" stroke="#151214" stroke-width="2.5"/>
    <path d="M6 31h52c0 14-11 24-26 24S6 45 6 31z" fill="#FFF6E2" ${S}/>
    <path d="M14 39c4 5 10 8 18 8" fill="none" stroke="#5B3FA0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  fries: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="#FFC61A" ${S}>
      <rect x="17" y="9" width="6" height="26" rx="2" transform="rotate(-10 20 22)"/>
      <rect x="25" y="5" width="6" height="28" rx="2" transform="rotate(-3 28 19)"/>
      <rect x="33" y="5" width="6" height="28" rx="2" transform="rotate(4 36 19)"/>
      <rect x="41" y="9" width="6" height="26" rx="2" transform="rotate(12 44 22)"/>
    </g>
    <path d="M12 26h40l-5 32H17z" fill="#E3262E" ${S}/>
    <text x="32" y="48" text-anchor="middle" font-family="Kanit, Arial Black, sans-serif" font-style="italic" font-weight="900" font-size="13" fill="#FFC61A" stroke="#151214" stroke-width="1" paint-order="stroke">KJ</text>
  </svg>`,

  pasta: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M12 30c0-6 6-12 10-10 2-5 10-7 14-3 5-3 13 1 13 7 4 1 6 4 5 6z" fill="#F7D36B" ${S}/>
    <path d="M18 26c3-3 6 3 9 0s6 3 9 0 6 3 9 0" fill="none" stroke="#C98A1F" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="36" cy="20" r="3" fill="#3E9E3A" stroke="#151214" stroke-width="2.5"/>
    <path d="M6 31h52c0 13-11 23-26 23S6 44 6 31z" fill="#1F5BD6" ${S}/>
    <path d="M16 38c4 4 10 6 16 6" fill="none" stroke="#FFF6E2" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  cup: `<svg viewBox="0 0 64 80" aria-hidden="true">
    <path d="M36 2l-4 18" stroke="#151214" stroke-width="4" stroke-linecap="round"/>
    <path d="M36 2l-4 18" stroke="#E3262E" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M10 22h44l-6 54H16z" fill="#E3262E" ${S}/>
    <rect x="7" y="16" width="50" height="9" rx="4.5" fill="#FFF6E2" ${S}/>
    <text x="32" y="56" text-anchor="middle" font-family="Kanit, Arial Black, sans-serif" font-style="italic" font-weight="900" font-size="17" fill="#FFC61A" stroke="#151214" stroke-width="1.2" paint-order="stroke">KJ</text>
  </svg>`,

  friesTall: `<svg viewBox="0 0 64 80" aria-hidden="true">
    <g fill="#FFC61A" ${S}>
      <rect x="14" y="8" width="7" height="34" rx="2" transform="rotate(-12 17 25)"/>
      <rect x="23" y="2" width="7" height="38" rx="2" transform="rotate(-4 26 21)"/>
      <rect x="32" y="3" width="7" height="38" rx="2" transform="rotate(5 35 22)"/>
      <rect x="41" y="8" width="7" height="34" rx="2" transform="rotate(14 44 25)"/>
    </g>
    <path d="M9 32h46l-6 44H15z" fill="#E3262E" ${S}/>
    <text x="32" y="62" text-anchor="middle" font-family="Kanit, Arial Black, sans-serif" font-style="italic" font-weight="900" font-size="17" fill="#FFC61A" stroke="#151214" stroke-width="1.2" paint-order="stroke">KJ</text>
  </svg>`,

  star: `<svg class="ticker__star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 6.8 7.2.4-5.6 4.6 1.9 7-6.1-4-6.1 4 1.9-7L2.2 8.7l7.2-.4z" fill="currentColor"/></svg>`,

  pepper: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6c3 0 5 3 4 7-2 6-9 9-14 9 4-3 6-7 6-11 0-3 2-5 4-5z" fill="currentColor"/><path d="M15 6c0-2 1-3 3-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" fill="currentColor"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.9-4.5 4.6V11H7v4h2.5v7h4v-7h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" fill="currentColor"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 3c.4 2.3 1.9 3.8 4 4v3.3c-1.5 0-2.9-.5-4-1.2v6.4A5.6 5.6 0 1111 9.9v3.4a2.3 2.3 0 102.2 2.3V3z" fill="currentColor"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 00-7-7zm0 9.6A2.6 2.6 0 1112 6.4a2.6 2.6 0 010 5.2z" fill="currentColor"/></svg>`,
};
