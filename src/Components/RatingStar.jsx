import { useId } from "react";

const starParts = [
  "50,50 38.24,33.82 50,5 61.76,33.82",
  "50,50 61.76,33.82 92.8,36.09 69.02,56.18",
  "50,50 69.02,56.18 76.45,86.4 50,70",
  "50,50 50,70 23.55,86.4 30.98,56.18",
  "50,50 30.98,56.18 7.2,36.09 38.24,33.82",
];

const starOutline = `
  50,5
  61.76,33.82
  92.8,36.09
  69.02,56.18
  76.45,86.4
  50,70
  23.55,86.4
  30.98,56.18
  7.2,36.09
  38.24,33.82
`;

export default function SegmentedStar({ rating = 0, size = 40 }) {
  const uniqueId = useId().replaceAll(":", "");

  const safeRating =
    Math.round(Math.min(Math.max(Number(rating) || 0, 0), 5) * 2) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`امتیاز ${safeRating} از ۵`}
    >
      <defs>
        {starParts.map((_, index) => (
          <linearGradient
            key={index}
            id={`half-${uniqueId}-${index}`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            gradientTransform={`rotate(${index * 72} 50 50)`}
          >
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="#D1D5DB" />
          </linearGradient>
        ))}
      </defs>

      {starParts.map((points, index) => {
        const amount = Math.min(Math.max(safeRating - index, 0), 1);

        let fill = "#D1D5DB";

        if (amount === 1) {
          fill = "#FACC15";
        }

        if (amount === 0.5) {
          fill = `url(#half-${uniqueId}-${index})`;
        }

        return <polygon key={index} points={points} fill={fill} />;
      })}

      <polygon
        points={starOutline}
        fill="none"
        stroke="#A8A29E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
