"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEscapeClose } from "../hooks/useEscapeClose";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { getFocusableElements } from "../lib/focusable";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/#data", label: "Explore Data" },
  {
    href: "https://www.openactive.io/about/",
    label: "About",
    external: true,
  },
];

const utilityLinks = [
  { href: "https://www.openactive.io/developers/", label: "For developers" },
  {
    href: "https://www.openactive.io/find-an-openactive-partner/",
    label: "Find an OpenActive Partner",
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEscapeClose(mobileMenuOpen, closeMobileMenu);
  useFocusTrap(mobileMenuRef, mobileMenuOpen);

  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;

    requestAnimationFrame(() => {
      const first = getFocusableElements(mobileMenuRef.current!)[0];
      first?.focus();
    });
  }, [mobileMenuOpen]);

  return (
    <header className="relative bg-white border-b border-oa-grey-200" role="banner">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop layout */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" aria-label="OpenActive — go to homepage">
            <Image
              src="/images/open-active-logo.svg"
              alt=""
              width={100}
              height={40}
              priority
              className="h-10 w-auto"
              aria-hidden="true"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:flex-col md:items-end md:gap-2">
            {/* Utility links */}
            <ul className="flex gap-6" aria-label="Utility links">
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-light text-oa-blue hover:text-oa-purple transition-colors"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Main nav */}
            <nav aria-label="Main navigation">
              <ul className="flex gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative px-4 py-2 text-sm font-medium text-oa-indigo hover:text-oa-purple transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-oa-purple after:scale-x-0 after:origin-center after:transition-transform hover:after:scale-x-100"
                      >
                        {link.label}
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="relative px-4 py-2 text-sm font-medium text-oa-indigo hover:text-oa-purple transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-oa-purple after:scale-x-0 after:origin-center after:transition-transform hover:after:scale-x-100"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-oa-grey-600 hover:text-oa-indigo hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-indigo focus:ring-offset-2 transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? "mobile-menu" : undefined}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav
            ref={mobileMenuRef}
            id="mobile-menu"
            className="absolute top-16 inset-x-0 z-50 md:hidden bg-white border-b border-oa-grey-200 shadow-lg pb-4"
            aria-label="Mobile navigation"
          >
            <ul className="mt-4 space-y-2 px-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-sm font-medium text-oa-indigo hover:bg-oa-grey-50 rounded-md focus:outline-none focus:ring-2 focus:ring-oa-indigo"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-sm font-medium text-oa-indigo hover:bg-oa-grey-50 rounded-md focus:outline-none focus:ring-2 focus:ring-oa-indigo"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <ul className="mt-4 pt-4 border-t border-oa-grey-100 space-y-2 px-4" aria-label="Utility links">
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-sm text-oa-blue hover:bg-oa-grey-50 rounded-md focus:outline-none focus:ring-2 focus:ring-oa-indigo"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
