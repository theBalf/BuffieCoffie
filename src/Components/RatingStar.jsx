const starVertices = [
  [50, 5],
  [61.76, 33.82],
  [92.8, 36.09],
  [69.02, 56.18],
  [76.45, 86.4],
  [50, 70],
  [23.55, 86.4],
  [30.98, 56.18],
  [7.2, 36.09],
  [38.24, 33.82],
];
const starCenter = [50, 50];
const TOTAL_SEGMENTS = starVertices.length; // ۱۰ قسمت

const FILLED_COLOR = "#F5B800";
const EMPTY_COLOR = "#c2bfbfad";
const OUTLINE_COLOR = "#8B5E00";

// هر قسمت یک مثلث است: مرکز + یک رأس + رأس بعدی (نیمی از یک پر)
const segments = starVertices.map((vertex, index) => {
  const next = starVertices[(index + 1) % TOTAL_SEGMENTS];
  return [starCenter, vertex, next].map(([x, y]) => `${x},${y}`).join(" ");
});

// خطوط دور کل ستاره (بدون خط بین قسمت‌ها)
const outlinePoints = starVertices.map(([x, y]) => `${x},${y}`).join(" ");

// ترتیب پر شدن: از نیمهٔ بالایی‌راستِ پر بالا شروع می‌شود و خلاف جهت عقربه‌های ساعت می‌رود.
// خروجی: قسمت شمارهٔ index چندمین قسمتی است که پر می‌شود (۰ = اولین).
const fillPosition = (index) => (TOTAL_SEGMENTS - index) % TOTAL_SEGMENTS;

export default function SegmentedStar({
  rating = 0, // میانگین امتیاز، بین ۰ تا ۵
  size = 40,
  onChange, // اگه بدی، هر قسمت قابل کلیک می‌شه (امتیازدهی کاربر)
  disabled = false,
}) {
  const safeRating =
    Math.round(Math.min(Math.max(Number(rating) || 0, 0), 5) * 2) / 2;
  const filledCount = safeRating * 2; // مثلاً ۴٫۵ → ۹ قسمت
  const interactive = Boolean(onChange);

  const select = (value) => {
    if (!disabled) onChange(value);
  };

  if (interactive) {
    const selectedRating = Math.round(safeRating);

    return (
      <div
        role="group"
        aria-label="امتیاز خود را از ۱ تا ۵ انتخاب کنید"
        className="flex items-center justify-center gap-0.5"
      >
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          const color = value <= selectedRating ? FILLED_COLOR : EMPTY_COLOR;

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              aria-label={`ثبت امتیاز ${value} از ۵`}
              aria-pressed={value === selectedRating}
              onClick={() => select(value)}
              className="rounded-sm transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mui-palette-primary-main)] disabled:cursor-wait"
            >
              <svg
                aria-hidden="true"
                width={size}
                height={size}
                viewBox="0 0 100 100"
                className="block"
              >
                {segments.map((points, segmentIndex) => (
                  <polygon
                    key={segmentIndex}
                    points={points}
                    fill={color}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                ))}
                <polygon
                  points={outlinePoints}
                  fill="none"
                  stroke={OUTLINE_COLOR}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              </svg>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <svg
      role="img"
      aria-label={`امتیاز ${safeRating} از ۵`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="block"
    >
      {segments.map((points, index) => {
        const position = fillPosition(index);
        const color = position < filledCount ? FILLED_COLOR : EMPTY_COLOR;
        return (
          <polygon
            key={index}
            points={points}
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        );
      })}

      <polygon
        points={outlinePoints}
        fill="none"
        stroke={OUTLINE_COLOR}
        strokeWidth="2.5"
        strokeLinejoin="round"
        pointerEvents="none"
      />
    </svg>
  );
}
