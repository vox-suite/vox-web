export const PACES = [
  { id: "slow", label: "Slow", wpm: 110, note: "Training, eulogies, careful delivery" },
  { id: "normal", label: "Normal", wpm: 130, note: "Presentations and speeches" },
  { id: "fast", label: "Fast", wpm: 160, note: "Conversation, podcasts" },
] as const;

export const COMMON_LENGTHS = [1, 2, 3, 5, 7, 10, 15, 20, 30];

export const FAQ = [
  {
    q: "How many words is a 5-minute speech?",
    a: "About 650 words at a normal speaking pace of 130 words per minute. Slow delivery fits about 550 words and fast delivery about 800.",
  },
  {
    q: "How is speaking time calculated?",
    a: "Word count divided by your words per minute. A 1,300-word script at 130 wpm takes 10 minutes. The calculator counts the words you paste and does the division for you.",
  },
  {
    q: "What is the average speaking speed?",
    a: "Most presenters speak at 120 to 150 words per minute. Everyday conversation runs closer to 150 to 160, while slow, deliberate speeches sit around 100 to 120.",
  },
  {
    q: "Should I add time for pauses and slides?",
    a: "Yes. The estimate covers continuous speech only. Add 10 to 15 percent for pauses, audience reactions, slide changes and demos.",
  },
  {
    q: "Is my text stored or sent anywhere?",
    a: "No. The calculation runs in your browser and your text never leaves the page. There is no signup.",
  },
  {
    q: "Can I rehearse a speech by phone?",
    a: "Yes. Call Vox, talk through your speech or talking points, and it can set a reminder or a follow-up so your prep keeps moving after the call.",
  },
];

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
