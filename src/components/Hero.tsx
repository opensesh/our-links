"use client";

import { motion } from "framer-motion";
import { ActionButton } from "./ActionButton";
import { TextBlockReveal } from "./TextBlockReveal";
import { UnderlineLink } from "./UnderlineLink";

export function Hero() {
  return (
    <section className="w-full mt-2 sm:mt-4">
      <div className="max-w-[var(--content-max-width)] mx-auto text-left">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-accent text-xs uppercase tracking-widest text-[var(--fg-brand-aperol)] mb-3 sm:mb-4"
        >
          A modern design studio.
        </motion.p>

        <TextBlockReveal
          as="h1"
          delay={0.1}
          stagger={0.15}
          className="font-display font-bold text-[var(--fg-primary)] leading-[1.1] tracking-tight text-4xl sm:text-5xl md:text-6xl"
        >
          Brand. Code. Creative.
        </TextBlockReveal>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-sm sm:text-base text-[var(--fg-secondary)] max-w-md mt-3 sm:mt-4 mb-6 sm:mb-8"
        >
          We focus on brand identity, content production, and digital products.
          Our edge is human-centered design and creative context engineering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.35 }}
          className="flex items-center gap-4 flex-wrap"
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
