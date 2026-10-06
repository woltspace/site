// Every talk, newest first. To add one: add an entry here. That's it.
// slides: a link (the Book of Wolt lives at /book/) or a list of images in public/media/<folder>/.
// recording: a YouTube id once it's up (empty = "recording coming").
// text: the words prepared for the talk, as markdown (empty = "text coming").
export interface Talk {
  slug: string;
  title: string;
  date: string;          // YYYY-MM-DD
  event: string;
  summary: string;
  upcoming?: boolean;
  slidesUrl?: string;    // a slide deck that is its own page, e.g. /book/
  slideImages?: { folder: string; files: string[] };
  youtube?: string;
  text?: string;
}

export const talks: Talk[] = [
  {
    slug: 'the-book-of-wolt',
    title: 'The Book of Wolt',
    date: '2026-10-07',
    event: '[event name]',
    summary: 'Wolts, lodges, and what happens when many agents and many people share the same tools. Slides are the Book of Wolt.',
    upcoming: true,
    slidesUrl: '/book/',
  },
  {
    slug: 'the-scaffold-for-your-harnesses',
    title: 'The scaffold for your harnesses',
    date: '2026-09-01',
    event: '[event name]',
    summary: 'What woltspace is and why it exists, in ten slides and a live demo: wolts messaged from a phone on stage, slides served out of the lodge they describe.',
    slideImages: {
      folder: 'talk',
      files: ['slide-01-title', 'slide-02-thesis', 'slide-03-harness', 'slide-04-wolts', 'slide-05-woltspace',
              'slide-06-compute', 'slide-07-reach', 'slide-08-coordination', 'slide-09-terminal', 'slide-10-close'],
    },
  },
];

export const talkDay = (date: string) =>
  new Date(date + 'T12:00:00Z').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
