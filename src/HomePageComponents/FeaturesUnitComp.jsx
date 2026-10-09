import { useState } from "react";

export default function FeatureUnit({ title, Icon, description }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={() => setIsExpanded((expanded) => !expanded)}
      className="feature-unit group flex min-h-16 w-full items-center justify-center gap-3 rounded-xl px-2 text-right text-[var(--mui-palette-text-primary)] transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mui-palette-primary-main)] sm:px-4"
      data-expanded={isExpanded}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold sm:text-base">{title}</span>
        <span className="feature-description block text-xs leading-5 sm:text-sm">
          {description}
        </span>
      </span>
      <Icon
        aria-hidden="true"
        className="h-6 w-6 shrink-0 sm:h-7 sm:w-7"
      />
    </button>
  );
}
