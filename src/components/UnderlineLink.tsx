"use client";

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

interface UnderlineLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
  external?: boolean;
  children: ReactNode;
}

const easing = "[transition-timing-function:cubic-bezier(0.625,0.05,0,1)]";

export const UnderlineLink = forwardRef<HTMLAnchorElement, UnderlineLinkProps>(
  function UnderlineLink({ href, external, className, children, ...rest }, ref) {
    const wrapper = [
      "group relative inline-flex items-center cursor-pointer",
      "outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <a
        ref={ref}
        href={href}
        className={wrapper}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
        <span
          className="pointer-events-none absolute inset-x-0 -bottom-1"
          aria-hidden="true"
        >
          <span
            className={[
              "absolute inset-x-0 top-0 h-px bg-current",
              "origin-left scale-x-100 transition-transform duration-700 delay-300",
              easing,
              "group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0",
              "group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0",
            ].join(" ")}
          />
          <span
            className={[
              "absolute inset-x-0 top-0 h-px bg-current",
              "origin-right scale-x-0 transition-transform duration-700 delay-0",
              easing,
              "group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300",
              "group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300",
            ].join(" ")}
          />
        </span>
      </a>
    );
  }
);
