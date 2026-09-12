"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'
import { Bell, Clapperboard, Star } from 'lucide-react';
import ProfileSheet from './ProfileSheet';
import { useSelector } from 'react-redux';
import { SearchSection } from './SerachSection';
import { RootState } from '@/redux/store';

export const navLinks = [
  { name: "Home", key: "", href: "/" },
  { name: "Movies", key: "movies", href: "/movies" },
  { name: "TV Shows", key: "tv", href: "/tv" },
  { name: "Watchlist", key: "watchlist", href: "/watchlist" },
  { name: "Library", key: "jio+", href: "/jio+" },
];

function Headers() {
    const path = usePathname();
    const activeTabKey = path.split("/")[1];

    const user = useSelector((state: RootState) => state.user);

    const premiumPill = "flex items-center gap-2 rounded-full bg-brand px-5 py-1.5 text-[14px] font-semibold text-brand-foreground transition-colors";

  return (
    <header className='fixed top-0 z-50 h-[68px] w-full border-b border-hairline bg-surface-nav'>
        <div className='mx-auto flex h-full items-center gap-5 px-5 text-nowrap md:px-6'>
            <Link href="/" className='flex items-center gap-2 shrink-0'>
                <Clapperboard className='size-6 text-brand' fill='currentColor' strokeWidth={1.5} />
                <span className='text-[20px] font-bold tracking-tight text-content'>Strew</span>
            </Link>

            {user.user?.isPremium ? (
                <div className={premiumPill}>
                    <Star className='size-4' fill='currentColor' strokeWidth={0} />
                    <span>Premium</span>
                </div>
            ) : (
                <Link href="/subscription" className={`${premiumPill} hover:bg-brand-hover`}>
                    <Star className='size-4' fill='currentColor' strokeWidth={0} />
                    <span>Go Premium</span>
                </Link>
            )}

            <nav className="hidden items-center gap-7 lg:flex">
                {navLinks.map(item => (
                    <Link
                      href={item.href}
                      key={item.key}
                      className={`py-1 text-[15px] font-medium transition-colors ${activeTabKey === item.key
                        ? "border-b-2 border-brand text-brand"
                        : "text-content-muted hover:text-content"
                      }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
                <SearchSection/>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="grid size-9 place-items-center rounded-full text-content-muted transition-colors hover:text-content"
                >
                    <Bell className='size-5' />
                </button>
                <ProfileSheet/>
            </div>
        </div>
    </header>
  )
}

export default Headers
