export interface TimelineEntry {
  company: string;
  role: string;
  dates: string;
  current: boolean;
  description: string;
}

export const timeline: TimelineEntry[] = [
  {
    company: "Neurelo",
    role: "Founding Designer",
    dates: "2023\u20132025",
    current: false,
    description:
      "API platform for databases. Came in early, set the design foundation, and shipped the core experience end to end.",
  },
  {
    company: "Demiura",
    role: "Founder",
    dates: "2019\u2013now",
    current: true,
    description:
      'Keyboard and keycap studio. <a href="https://www.perplexity.ai/search?q=GMK+Mictlán" target="_blank" rel="noopener noreferrer" class="text-text-primary hover:text-text-secondary transition-colors underline">GMK Mictlán</a>, <a href="https://www.perplexity.ai/search?q=GMK+Gurokawa" target="_blank" rel="noopener noreferrer" class="text-text-primary hover:text-text-secondary transition-colors underline">GMK Gurokawa</a>, and whatever\'s next. Sold-out group buys, long runs, shipped worldwide.',
  },
  {
    company: "Mediwallet",
    role: "Freelance",
    dates: "2022",
    current: false,
    description:
      "Healthcare fintech. Simplified complex dashboard workflows under strict compliance requirements.",
  },
  {
    company: "Rever",
    role: "Head of Design",
    dates: "2018\u20132022",
    current: false,
    description:
      "Frontline worker platform. Built and led design, shipped across mobile and web, scaled it through the Sequoia chapter.",
  },
  {
    company: "Basiko",
    role: "Lead Web Dev / Designer",
    dates: "2014\u20132018",
    current: false,
    description:
      "Digital agency. Built and led the first web dev team, shipped 80+ custom sites across e-commerce and marketing.",
  },
];
