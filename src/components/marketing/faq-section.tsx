"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How is Vox different from a conventional voice assistant?",
    answer:
      "Conventional assistants answer and the thread ends. Vox keeps working after the call: it creates tasks, updates calendars, schedules reminders and follow-ups, and can place an outbound call when a commitment changes or a deadline arrives.",
  },
  {
    question: "Do I need to install a special application to use Vox?",
    answer:
      "No. Vox is telephone and WhatsApp native. You reach Vox on a normal phone call or over WhatsApp. For deeper views there is a native desktop app, an Android app and a web app.",
  },
  {
    question: "How does Vox recognize different callers and maintain privacy?",
    answer:
      "Vox utilizes speaker recognition to verify caller identity on incoming audio streams. Personal context is kept attached to the right speaker, including when a phone is handed to someone else.",
  },
  {
    question: "Can Vox proactively reach out to me with updates?",
    answer:
      "Yes. If you ask Vox to check on a team milestone overnight, monitor a deadline, or confirm whether an external party responded, Vox schedules a proactive outbound phone call or WhatsApp message at your requested time.",
  },
  {
    question: "Which external systems and tools does Vox integrate with?",
    answer:
      "Vox Connections provides OAuth-linked providers including Uber, Zomato, Amazon, PlayStation and Expedia, plus MCP servers and declarative skills. Connecting an account grants nothing by itself; access comes from explicit per-agent grants, and consequential actions need approval.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="relative border-b border-line py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <header className="mb-14 max-w-2xl">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-fg-dim">
            FAQ
          </span>
          <h2 className="mt-3 font-serif text-[clamp(2rem,3.8vw,3rem)] font-normal leading-[1.2] tracking-[-0.02em] text-fg">
            Frequently asked questions.
          </h2>
          <p className="mt-4 font-mono text-[16px] text-fg-muted leading-[1.35] tracking-[-0.4px]">
            Technical and operational details regarding caller identification, protocol execution, and proactive follow-through.
          </p>
        </header>

        <div className="w-full">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="faq-accordion-row"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between text-left group cursor-pointer bg-transparent border-none p-0"
                >
                  <span className="font-serif text-[22px] sm:text-[24px] font-normal leading-[1.2] tracking-[-0.02em] text-fg group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <span className="ml-4 flex size-8 shrink-0 items-center justify-center text-fg">
                    <ChevronDown
                      size={20}
                      className={cn(
                        "transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </button>
                {isOpen && (
                  <div className="pt-2 pr-12 font-mono text-[16px] font-normal leading-[1.35] tracking-[-0.025em] text-fg-muted">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
