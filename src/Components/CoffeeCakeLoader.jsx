// CoffeeCakeLoader.jsx
// لودینگ: یک دور آسیاب قهوه و برش کیک در یک ثانیه

const css = `
.ccl-wrap {
  --espresso: #2b1a12;
  --crema: #c8894f;
  --wood: #8a5a3b;
  --wood-dark: #5e3b25;
  --sponge: #e9c27a;
  --frosting: #f7e9d6;
  --berry: #c2415a;
  display: grid;
  place-items: center;
  gap: 12px;
  min-height: 100%;
  padding: 24px;
  color: var(--espresso);
  font-family: inherit;
}
.ccl-stage { position: relative; width: 200px; height: 200px; }
.ccl-scene { position: absolute; inset: 0; width: 100%; height: 100%; }
.ccl-label { margin: 0; font-size: 1rem; letter-spacing: 0; }

/* جابه‌جایی بین دو صحنه */
.ccl-scene-a { animation: ccl-show-a 1s 1 both; }
.ccl-scene-b { animation: ccl-show-b 1s 1 both; }
@keyframes ccl-show-a { 0%, 44% { opacity: 1 } 50%, 94% { opacity: 0 } 100% { opacity: 1 } }
@keyframes ccl-show-b { 0%, 44% { opacity: 0 } 50%, 94% { opacity: 1 } 100% { opacity: 0 } }

/* --- آسیاب قهوه --- */
.ccl-crank { animation: ccl-spin .5s linear 1 both; }
@keyframes ccl-spin { to { transform: rotate(360deg) } }

.ccl-mound {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: ccl-fill .5s ease-in 1 both;
}
@keyframes ccl-fill { 0% { transform: scaleY(.1) } 100% { transform: scaleY(1) } }

.ccl-bean-fall { animation: ccl-drop .25s ease-in 1 both; }
.ccl-bean-fall:nth-of-type(2) { animation-delay: .08s }
.ccl-bean-fall:nth-of-type(3) { animation-delay: .16s }
@keyframes ccl-drop {
  0% { transform: translateY(0); opacity: 1 }
  100% { transform: translateY(22px); opacity: 0 }
}

/* --- برش کیک --- */
.ccl-knife { animation: ccl-cut 1s ease-in-out 1 both; }
@keyframes ccl-cut {
  0%, 8%   { transform: translateY(-70px) }
  38%      { transform: translateY(0) }
  50%      { transform: translateY(0) }
  70%, 100% { transform: translateY(-70px) }
}
.ccl-cutline {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: ccl-line 1s ease-in-out 1 both;
}
@keyframes ccl-line {
  0%, 8%   { transform: scaleY(0) }
  38%, 90% { transform: scaleY(1) }
  100%     { transform: scaleY(0) }
}
.ccl-slice { animation: ccl-slide 1s ease-in-out 1 both; }
@keyframes ccl-slide {
  0%, 52%   { transform: translate(0, 0) rotate(0) }
  70%, 88%  { transform: translate(16px, 2px) rotate(3deg) }
  100%      { transform: translate(0, 0) rotate(0) }
}

@media (prefers-reduced-motion: reduce) {
  .ccl-wrap * { animation: none !important; }
  .ccl-scene-b { opacity: 0; }
}
`;

function GrinderScene() {
  return (
    <svg className="ccl-scene ccl-scene-a" viewBox="0 0 200 200" aria-hidden="true">
      {/* قیف دانه‌ها */}
      <path d="M58 34 H122 L112 72 H68 Z" fill="#f3e6d3" stroke="var(--wood-dark)" strokeWidth="2.5" strokeLinejoin="round" />
      <g fill="var(--espresso)">
        <ellipse cx="80" cy="48" rx="6" ry="4" transform="rotate(-20 80 48)" />
        <ellipse cx="96" cy="44" rx="6" ry="4" transform="rotate(15 96 44)" />
        <ellipse cx="108" cy="50" rx="6" ry="4" transform="rotate(-10 108 50)" />
        <ellipse cx="90" cy="56" rx="6" ry="4" transform="rotate(25 90 56)" />
        <ellipse cx="102" cy="60" rx="6" ry="4" transform="rotate(-25 102 60)" />
      </g>
      {/* دانه‌های در حال ریختن */}
      <g fill="var(--espresso)">
        <ellipse className="ccl-bean-fall" cx="86" cy="62" rx="4.5" ry="3" />
        <ellipse className="ccl-bean-fall" cx="94" cy="62" rx="4.5" ry="3" />
        <ellipse className="ccl-bean-fall" cx="100" cy="62" rx="4.5" ry="3" />
      </g>
      {/* بدنهٔ چوبی */}
      <rect x="50" y="72" width="80" height="92" rx="6" fill="var(--wood)" stroke="var(--wood-dark)" strokeWidth="2.5" />
      {/* کشو */}
      <rect x="58" y="116" width="64" height="40" rx="4" fill="var(--wood-dark)" />
      <path className="ccl-mound" d="M62 154 Q90 118 118 154 Z" fill="var(--crema)" />
      {/* دستهٔ آسیاب */}
      <g transform="translate(130 96)">
        <g className="ccl-crank">
          <line x1="0" y1="0" x2="34" y2="0" stroke="var(--espresso)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="34" cy="0" r="7" fill="var(--berry)" stroke="var(--espresso)" strokeWidth="2" />
        </g>
        <circle r="6" fill="var(--sponge)" stroke="var(--espresso)" strokeWidth="2" />
      </g>
    </svg>
  );
}

function CakeScene() {
  return (
    <svg className="ccl-scene ccl-scene-b" viewBox="0 0 200 200" aria-hidden="true">
      {/* بشقاب */}
      <ellipse cx="100" cy="166" rx="84" ry="10" fill="#d9cdbf" />
      <ellipse cx="100" cy="162" rx="78" ry="8" fill="#f4eee6" />

      {/* بخش اصلی کیک */}
      <g>
        <rect x="42" y="124" width="76" height="34" fill="var(--sponge)" />
        <rect x="42" y="114" width="76" height="10" fill="var(--frosting)" />
        <rect x="42" y="88" width="76" height="26" fill="var(--sponge)" />
        <path d="M42 88 V80 Q42 72 50 72 H118 V88 Z" fill="var(--frosting)" />
      </g>

      {/* تکهٔ بریده‌شده */}
      <g className="ccl-slice">
        <rect x="118" y="124" width="40" height="34" fill="var(--sponge)" />
        <rect x="118" y="114" width="40" height="10" fill="var(--frosting)" />
        <rect x="118" y="88" width="40" height="26" fill="var(--sponge)" />
        <path d="M118 88 V72 H150 Q158 72 158 80 V88 Z" fill="var(--frosting)" />
        <circle cx="138" cy="66" r="7" fill="var(--berry)" stroke="#8f2a40" strokeWidth="1.5" />
        <path d="M138 59 Q140 52 146 50" stroke="#4d6b3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* خط برش */}
      <rect className="ccl-cutline" x="117" y="72" width="2" height="86" fill="var(--wood-dark)" opacity=".55" />

      {/* چاقو */}
      <g className="ccl-knife">
        <rect x="116" y="30" width="4" height="128" rx="1" fill="#cfd4d8" stroke="#8d949a" strokeWidth="1" />
        <rect x="108" y="6" width="20" height="26" rx="5" fill="var(--wood-dark)" />
      </g>
    </svg>
  );
}

export default function CoffeeCakeLoader({ label = "در حال بارگذاری…" }) {
  return (
    <div className="ccl-wrap" role="status" aria-live="polite">
      <style>{css}</style>
      <div className="ccl-stage">
        <GrinderScene />
        <CakeScene />
      </div>
      <p className="ccl-label">{label}</p>
    </div>
  );
}
