"use client";

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import "./action-button.css";

interface ActionButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
  external?: boolean;
  size?: "md" | "lg";
  children: ReactNode;
}

const sizeConfig = {
  md: {
    icon: "w-8 h-8",
    height: "h-8",
    padding: "px-4",
    offset: "-translate-x-[calc(32px+6px)]",
    iconSvg: "w-3 h-3",
    text: "text-xs",
  },
  lg: {
    icon: "w-10 h-10",
    height: "h-10",
    padding: "px-6",
    offset: "-translate-x-[calc(40px+6px)]",
    iconSvg: "w-3.5 h-3.5",
    text: "text-sm",
  },
};

const transition =
  "transition-transform duration-700 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1v10M1 6h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export const ActionButton = forwardRef<HTMLAnchorElement, ActionButtonProps>(
  function ActionButton(
    { href, external, size = "lg", className, children, ...rest },
    ref
  ) {
    const sizing = sizeConfig[size];

    const wrapper = [
      "action-button group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center",
      "whitespace-nowrap font-sans font-medium uppercase tracking-normal",
      "outline-none rounded-[6px] overflow-hidden",
      "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
      sizing.text,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconBox = [
      "flex items-center justify-center",
      transition,
      sizing.icon,
      "bg-[var(--bg-brand-solid)] text-[var(--color-charcoal)]",
    ].join(" ");

    const inner = (
      <span className="relative flex w-full items-center gap-1.5">
        <span
          className={`${iconBox} origin-left -rotate-45 scale-0 group-hover:rotate-0 group-hover:scale-100`}
        >
          <PlusIcon className={sizing.iconSvg} />
        </span>

        <span
          className={[
            "flex w-full flex-1 items-center justify-center",
            transition,
            sizing.height,
            sizing.padding,
            sizing.offset,
            "group-hover:translate-x-0",
            "bg-[var(--bg-brand-solid)]",
          ].join(" ")}
        >
          <span className="action-button-glisten">{children}</span>
        </span>

        <span
          className={`${iconBox} absolute right-0 z-10 origin-right rotate-0 scale-100 group-hover:-rotate-45 group-hover:scale-0`}
        >
          <PlusIcon className={sizing.iconSvg} />
        </span>
      </span>
    );

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
        {inner}
      </a>
    );
  }
);
