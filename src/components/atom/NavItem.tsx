import React from 'react'

// Shared look for every nav control (links, search, bell...).
// Mobile: square icon button. Desktop sidebar: full-width row whose label is revealed when the rail expands.
export const navIconClass = "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors [&>svg]:shrink-0 lg:h-11 lg:w-full lg:justify-start lg:gap-4 lg:px-3";
export const navIconIdle = "text-content-muted hover:bg-white/5 hover:text-content";
export const navIconActive = "bg-brand/15 text-brand";

// Text beside an icon, faded in while the sidebar (group/nav) is hovered or keyboard-focused.
export const navLabelReveal = "whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover/nav:opacity-100 lg:group-hover/nav:delay-100 lg:group-has-[:focus-visible]/nav:opacity-100";

export function NavLabel({ label }: { label: string }) {
  return (
    <span className={`hidden text-sm font-medium lg:inline ${navLabelReveal}`}>
      {label}
    </span>
  )
}
