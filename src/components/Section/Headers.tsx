"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Bell,
  Bookmark,
  Clapperboard,
  Film,
  House,
  Library,
  Star,
  Tv,
  Upload,
} from "lucide-react";
import ProfileSheet from "./ProfileSheet";
import { useSelector } from "react-redux";
import { SearchSection } from "./SerachSection";
import { RootState } from "@/redux/store";
import {
  NavLabel,
  navIconActive,
  navIconClass,
  navIconIdle,
  navLabelReveal,
} from "../atom/NavItem";

export const navLinks = [
  { name: "Home", key: "", href: "/", icon: House },
  { name: "Movies", key: "movies", href: "/movies", icon: Film },
  { name: "TV Shows", key: "tv", href: "/tv", icon: Tv },
  { name: "Watchlist", key: "watchlist", href: "/watchlist", icon: Bookmark },
  { name: "Library", key: "jio+", href: "/jio+", icon: Library },
  { name: "Upload Strew", key: "upload", href: "/upload", icon: Upload },
];

// Mobile: 64px bar across the top.
// Laptop and up (lg): 76px icon rail on the left that widens on hover, overlaying the page
// (it is fixed, so the page's lg:pl-[76px] never changes).
function Headers() {
  const path = usePathname();
  const activeTabKey = path.split("/")[1];

  const user = useSelector((state: RootState) => state.user);
  const isPremium = user.user?.isPremium;

  return (
    <header className="group/nav fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-3 bg-surface px-4 transition-colors duration-300 hover:bg-surface-nav lg:inset-y-0 lg:right-auto lg:h-screen lg:w-[76px] lg:flex-col lg:gap-0 lg:overflow-x-hidden lg:bg-transparent lg:px-0 lg:py-5 lg:transition-[width] lg:ease-out lg:hover:w-[260px] lg:hover:bg-transparent lg:has-[:focus-visible]:w-[260px]">
      {/* Desktop backgrounds: solid when collapsed, cross-fades to a gradient when expanded */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-surface transition-opacity duration-300 group-hover/nav:opacity-0 group-has-[:focus-visible]/nav:opacity-0 lg:block"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-linear-to-r from-black via-black/90 via-60% to-black/40 opacity-0 transition-opacity duration-300 group-hover/nav:opacity-100 group-has-[:focus-visible]/nav:opacity-100 lg:block"
      />

      <Link
        href="/"
        aria-label="Strew home"
        className="flex shrink-0 items-center gap-2 overflow-hidden lg:mb-8 lg:w-full lg:gap-4 lg:px-[18px]"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground lg:size-10">
          <Clapperboard className="size-5" strokeWidth={2} />
        </span>
        <span
          className={`text-lg font-bold tracking-tight text-content ${navLabelReveal}`}
        >
          Strew
        </span>
      </Link>

      <nav
        aria-label="Main"
        className="hidden lg:flex lg:w-full lg:flex-1 lg:flex-col lg:gap-2 lg:px-4"
      >
        {navLinks.map(({ name, key, href, icon: Icon }) => {
          const isActive = activeTabKey === key;
          return (
            <Link
              href={href}
              key={key}
              aria-label={name}
              aria-current={isActive ? "page" : undefined}
              className={`${navIconClass} ${isActive ? navIconActive : navIconIdle}`}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <NavLabel label={name} />
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:w-full lg:flex-col lg:gap-2 lg:px-4">
        <SearchSection />

        {isPremium ? (
          <div aria-label="Premium" className={`${navIconClass} text-brand`}>
            <Star className="size-5" fill="currentColor" strokeWidth={0} />
            <NavLabel label="Premium" />
          </div>
        ) : (
          <Link
            href="/subscription"
            aria-label="Go Premium"
            className={`${navIconClass} text-brand hover:bg-brand/15`}
          >
            <Star className="size-5" fill="currentColor" strokeWidth={0} />
            <NavLabel label="Go Premium" />
          </Link>
        )}

        <button
          type="button"
          aria-label="Notifications"
          className={`${navIconClass} ${navIconIdle}`}
        >
          <Bell className="size-5" strokeWidth={1.75} />
          <NavLabel label="Notifications" />
        </button>

        <div className="ml-1 flex items-center gap-4 overflow-hidden lg:ml-0 lg:mt-3 lg:w-full lg:border-t lg:border-hairline lg:px-[2px] lg:pt-5">
          <ProfileSheet />
          <span
            className={`hidden truncate text-sm font-medium capitalize text-content lg:inline ${navLabelReveal}`}
          >
            {user.user?.name || "Guest"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Headers;
