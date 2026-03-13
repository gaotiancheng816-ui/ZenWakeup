export const MORNING_GREETINGS: Record<number, string[]> = {
  0: [ // Heavy
    "Yesterday was heavy. Today is new.",
    "You carried a lot. Set it down gently.",
    "A difficult day passed. Breathe into this one.",
    "The night has done its work. Begin again.",
  ],
  1: [ // Tired
    "Rest shaped you overnight. Rise slowly.",
    "Tiredness asks for gentleness. Give it.",
    "You showed up tired yesterday. That counts.",
    "Even weary rivers reach the sea.",
  ],
  2: [ // Neutral
    "A steady day behind you. A steady day ahead.",
    "Ordinary days are the practice.",
    "Nothing extraordinary — and that is enough.",
    "Stillness doesn't need a reason.",
  ],
  3: [ // Light
    "Something lifted yesterday. Carry it forward.",
    "A light day left its mark. Notice it.",
    "Lightness is also worth sitting with.",
    "You felt it. Begin from there.",
  ],
  4: [ // Fulfilled
    "Yesterday was full. Today, begin empty.",
    "Fulfilment passed through you. Let it go.",
    "A good day is not to be held — only appreciated.",
    "You arrived somewhere yesterday. Now depart again.",
  ],
};

export const HOURLY_QUOTES: Record<number, string[]> = {
  0: [ // Heavy
    "The heaviest burdens are carried in the mind.",
    "When the load is great, put it down for a moment.",
    "Difficulty is the doorway.",
  ],
  1: [ // Tired
    "Tiredness is the body asking to be heard.",
    "Even water rests in still places.",
    "Slow down before you are stopped.",
  ],
  2: [ // Neutral
    "This moment is complete.",
    "A settled mind settles all things.",
    "No rush — all things arrive.",
  ],
  3: [ // Light
    "Lightness travels far.",
    "Notice what is easy today.",
    "A clear sky doesn't announce itself.",
  ],
  4: [ // Fulfilled
    "What is full can receive nothing more.",
    "Rest in what was enough.",
    "Fullness, like emptiness, is temporary.",
  ],
};

export function getMorningGreeting(lastScore: number): string {
  const pool = MORNING_GREETINGS[lastScore] ?? MORNING_GREETINGS[2];
  return pool[new Date().getDate() % pool.length];
}

export function getHourlyQuote(lastScore: number): string {
  const pool = HOURLY_QUOTES[lastScore] ?? HOURLY_QUOTES[2];
  return pool[new Date().getHours() % pool.length];
}