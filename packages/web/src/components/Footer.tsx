/**
 * Footer Component
 * Addresses MEDIUM-002: No footer links
 */

"use client";

import React from "react";
import Link from "next/link";

interface FooterLink {
  href: string;
  label: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections: FooterSection[] = [
    {
      title: "Product",
      links: [
        { href: "/#features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/#testimonials", label: "Testimonials" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/study-guide", label: "Study Guide" },
        { href: "/faq", label: "FAQ" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/contact", label: "Contact" },
      ],
    },
  ];

  return (
    <footer className="bg-md-surface border-t border-md-outline-variant py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="PMP Study Pro - Home"
            >
              <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-lg font-semibold">PMP Study Pro</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Comprehensive PMP exam preparation with adaptive learning and
              real-time analytics.
            </p>
          </div>

          {/* Footer Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} PMP Study Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
