// Every talk, newest first. To add one: add an entry here. That's it.
// slides: a link to a deck that is its own page or a list of images in public/media/<folder>/.
// recording: a YouTube id once it's up (empty = "recording coming").
// text: the words prepared for the talk, as markdown (empty = "text coming").
export interface Talk {
  slug: string;
  title: string;
  date: string;          // YYYY-MM-DD
  event?: string;
  summary: string;
  upcoming?: boolean;
  slidesUrl?: string;    // a slide deck that is its own page, e.g. /talks/<deck>/book.html
  slideImages?: { folder: string; files: string[] };
  youtube?: string;
  length?: string;       // e.g. '18 min', shown next to the recording links
  blog?: string;         // path of the blog post based on this talk, e.g. /blog/<name>/ (both pages link to each other)
  text?: string;
}

export const talks: Talk[] = [
  {
    slug: 'the-future-of-multiplayer-multi-agent-collaboration',
    title: 'The future of multiplayer multi-agent collaboration',
    date: '2026-10-07',
    summary: 'Woltspace believes that the future is multiplayer and multi-agent.',
    slidesUrl: '/talks/multiplayer-multi-agent/book.html',
    youtube: 'ZoMFJQN2irU',
    length: '18 min',
    blog: '/blog/the-future-is-multiplayer-multi-agent/',
  },
];

// The talk a blog post is based on, if any.
export const talkForPost = (path: string) => talks.find((t) => t.blog === path);

export const talkDay = (date: string) =>
  new Date(date + 'T12:00:00Z').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
