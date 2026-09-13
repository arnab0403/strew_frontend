import Link from "next/link";
import { Clapperboard } from "lucide-react";

const footerLinks = ["Privacy Policy", "Terms of Service", "Help Center", "Contact Us", "Careers"];

export default function Footer() {
    return (
        <footer className="bg-[#0b0d10] px-14 py-16 text-[#f2d99b] shadow-[0_0_18px_rgba(99,102,241,0.12)] max-md:px-7 max-md:py-10">
            <div className="flex items-start justify-between gap-10 max-md:flex-col">
                <div>
                    <Link href="/" className="flex items-center gap-2" aria-label="Strew home">
                        <Clapperboard className="size-5 text-brand" fill="currentColor" strokeWidth={1.5} />
                        <span className="text-sm font-white font-bold tracking-tight">Strew</span>
                    </Link>
                    <p className="mt-4 max-w-[360px] text-sm leading-6">
                        © 2024 Strew. All rights reserved. High-fidelity
                        <br className="max-md:hidden" /> cinematic experiences.
                    </p>
                </div>

                <nav aria-label="Footer navigation" className="flex flex-wrap justify-end gap-x-7 gap-y-3 pt-2 text-[11px] font-semibold text-[#a9a49a] max-md:justify-start max-md:pt-0">
                    {footerLinks.map((link) => (
                        <Link key={link} href="#" className="transition-colors hover:text-[#f2d99b]">
                            {link}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
