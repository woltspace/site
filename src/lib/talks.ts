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
  video?: string;        // a recording hosted on the site, e.g. /media/talks/<name>.mp4 (instead of YouTube)
  thumb?: string;        // thumbnail for the blog card, e.g. /media/talks/<name>.jpg (default: YouTube's)
  length?: string;       // e.g. '18 min', shown next to the recording links
  blog?: string;         // path of the blog post based on this talk, e.g. /blog/<name>/ (both pages link to each other)
  code?: string;         // the demo's source, e.g. a GitHub README
  text?: string;
}

export const talks: Talk[] = [
  {
    slug: 'ai-tinkerers-montreal',
    title: 'Multiplayer coding agents, live on stage',
    date: '2026-10-22',
    event: 'AI Tinkerers Montréal',
    summary: "This was probably the most complex live demo I've ever done. 2 participants. 3 wolts. We took turns building a game that updated in real time on everyone's phone. All hosted entirely on my Mac.",
    youtube: 's7RAzfEFY_0',
    code: 'https://github.com/woltspace/multiplayer-demo#readme',
    length: '8 min',
    slideImages: { folder: 'talk-ai-tinkerers', files: ['slide-01-cover', 'slide-02-iwcl', 'slide-03-scaffold', 'slide-04-hello', 'slide-05-thanks'] },
  },
  {
    slug: 'the-future-of-multiplayer-multi-agent-collaboration',
    title: 'The future of multiplayer multi-agent collaboration',
    date: '2026-10-07',
    summary: 'Woltspace believes that the future is multiplayer and multi-agent.',
    slidesUrl: '/talks/multiplayer-multi-agent/book.html',
    youtube: 'H-4khO7o0XQ',
    thumb: '/media/talks/multiplayer-multi-agent-thumb.jpg',
    length: '18 min',
    blog: '/blog/the-future-is-multiplayer-multi-agent/',
  },
];

// The talk a blog post is based on, if any.
export const talkForPost = (path: string) => talks.find((t) => t.blog === path);

export const talkDay = (date: string) =>
  new Date(date + 'T12:00:00Z').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
