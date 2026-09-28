// The five steps of the Feynman Method, in order.
// `key` matches the field name stored on each note's `steps` object.
export const FEYNMAN_STEPS = [
  {
    key: 'explainIt',
    title: 'Explain it',
    icon: 'book-outline',
    description:
      'Write down what you know about the topic as if teaching someone who has never heard of it.',
    placeholder: 'Explain the topic in plain words, as if teaching a beginner...',
  },
  {
    key: 'simplifyIt',
    title: 'Simplify it',
    icon: 'pencil-outline',
    description:
      'Strip away jargon. Rewrite your explanation using the simplest words possible.',
    placeholder: 'Rewrite without jargon. Use analogies a 12-year-old would understand.',
  },
  {
    key: 'findAnalogy',
    title: 'Find an analogy',
    icon: 'key-outline',
    description:
      'Connect the idea to something familiar. A good analogy makes the abstract concrete.',
    placeholder: 'This is like... because...',
  },
  {
    key: 'spotGaps',
    title: 'Spot the gaps',
    icon: 'help-circle-outline',
    description:
      'Where did you get stuck or use fuzzy words? Those are the gaps in your understanding.',
    placeholder: "I wasn't sure about... I need to review...",
  },
  {
    key: 'reviewRefine',
    title: 'Review & refine',
    icon: 'refresh-outline',
    description:
      'Go back to the source, fill the gaps, and rewrite your explanation better.',
    placeholder: 'After reviewing, here is my improved understanding...',
  },
];

// Returns a fresh, empty steps object: { explainIt: '', simplifyIt: '', ... }
export function createEmptySteps() {
  return FEYNMAN_STEPS.reduce((acc, step) => {
    acc[step.key] = '';
    return acc;
  }, {});
}
