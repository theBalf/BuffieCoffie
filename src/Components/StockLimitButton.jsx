import { useState } from "react";
import { createPortal } from "react-dom";

export default function StockLimitButton({
  itemName,
  disabled,
  onClick,
  className = "",
}) {
  const [tooltip, setTooltip] = useState(null);

  function showTooltip(x, y) {
    setTooltip({
      x: Math.min(Math.max(x, 120), window.innerWidth - 120),
      y: y < 90 ? y + 28 : y - 14,
      placement: y < 90 ? "below" : "above",
    });
  }

  function handlePointerEnter(event) {
    if (event.pointerType === "mouse") {
      showTooltip(event.clientX, event.clientY);
    }
  }

  function handlePointerMove(event) {
    if (event.pointerType === "mouse") {
      showTooltip(event.clientX, event.clientY);
    }
  }

  function handleFocus(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    showTooltip(bounds.left + bounds.width / 2, bounds.top);
  }

  return (
    <span
      className="inline-flex h-full w-10"
      tabIndex={disabled ? 0 : undefined}
      onPointerEnter={disabled ? handlePointerEnter : undefined}
      onPointerMove={disabled ? handlePointerMove : undefined}
      onPointerLeave={disabled ? () => setTooltip(null) : undefined}
      onFocus={disabled ? handleFocus : undefined}
      onBlur={disabled ? () => setTooltip(null) : undefined}
      aria-label={
        disabled ? `موجودی ${itemName} برای افزایش کافی نیست` : undefined
      }
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`افزودن یک ${itemName} به سبد`}
        className={className}
      >
        +
      </button>
      {disabled && tooltip && createPortal(
        <span
          role="tooltip"
          className={`pointer-events-none fixed z-[9999] w-max max-w-[calc(100vw-2rem)] rounded-xl border border-white/60 bg-white/80 px-4 py-2.5 text-center text-xs font-medium leading-5 text-[#2B1B12] shadow-[0_12px_35px_-12px_rgba(43,27,18,0.45)] backdrop-blur-xl transition-all duration-150 dark:border-white/15 dark:bg-[#241812]/85 dark:text-[#F8F3EC] ${
            tooltip.placement === "above"
              ? "-translate-x-1/2 -translate-y-full"
              : "-translate-x-1/2"
          }`}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          موجودی این محصول کافی نیست
        </span>,
        document.body
      )}
    </span>
  );
}
