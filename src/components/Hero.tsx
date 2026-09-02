"use client";

import { motion } from "framer-motion";
import { ActionButton } from "./ActionButton";
import { TextBlockReveal } from "./TextBlockReveal";
import { UnderlineLink } from "./UnderlineLink";

export function Hero() {
  return (
    <section className="w-full mt-3 sm:mt-4">
      <div className="max-w-[var(--content-max-width)] mx-auto text-left md:flex md:items-end md:justify-between md:gap-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-accent text-xs uppercase tracking-widest text-[var(--fg-brand-aperol)] mb-3 sm:mb-4"
          >
            A modern design company.
          </motion.p>

          <TextBlockReveal
            as="h1"
            delay={0.1}
            stagger={0.15}
            className="font-display font-bold text-[var(--fg-primary)] leading-[1.1] tracking-tight text-3xl sm:text-4xl lg:text-[2.5rem] mb-2 sm:mb-3"
          >
            Brand. Code. Creative.
          </TextBlockReveal>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-sm text-[var(--fg-secondary)] md:max-w-[412px]"
          >
            We build open-source resources and revolutionary products.
          </motion.p>
        </div>

        {/* CTAs step aside on mobile so the resources land above the fold. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.05 }}
          className="hidden md:flex items-center gap-4 flex-wrap justify-end shrink-0"
        >
          <ActionButton href="https://opensession.co/contact" external size="lg">
            Contact Us
          </ActionButton>
          <UnderlineLink
            href="https://opensession.co/projects"
            external
            className="self-center text-sm font-sans font-medium uppercase tracking-normal text-[var(--fg-primary)]"
          >
            View Our Work
          </UnderlineLink>
        </motion.div>
      </div>
    </section>
  );
}
