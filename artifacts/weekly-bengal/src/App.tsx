import { type ReactNode, type Dispatch, type SetStateAction, type FormEvent, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Link, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ArrowRight, BarChart3, Bookmark, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Copy, Edit3, FileText, Menu, Moon, Newspaper, PenLine, Play, Plus, Search, Send, Share2, ShieldCheck, Sun, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react';
import { supabase } from './supabaseClient';

type Lang = 'bn' | 'en';
type Status = 'draft' | 'pending' | 'published';
type Article = { id: string; authorId: string; authorName: string; titleBn: string; titleEn: string; contentBn: string; contentEn: string; excerptBn: string; excerptEn: string; category: string; image: string; status: Status; isBreaking: boolean; isLead: boolean; views: number; createdAt: string; readTime: number };
type Reporter = { id: string; name: string; email: string; role: string; avatar: string; bio: string; active: boolean };
type Comment = { id: string; articleId: string; userName: string; text: string; createdAt: string };
type Session = { role: 'admin' | 'reporter'; name: string; id: string } | null;

const images = {
  river: 'https://images.pexels.com/photos/240040/pexels-photo-240040.jpeg?auto=compress&cs=tinysrgb&w=1200',
  kolkata: 'https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb&w=1200',
  books: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1000',
  village: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1000',
  train: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=1000',
  art: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1000',
  tea: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=1000',
  coast: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1000',
  national: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1200',
  world: 'https://images.pexels.com/photos/723240/pexels-photo-723240.jpeg?auto=compress&cs=tinysrgb&w=1200',
  politics: 'https://images.pexels.com/photos/4669101/pexels-photo-4669101.jpeg?auto=compress&cs=tinysrgb&w=1200',
  economy: 'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=1200',
  sports: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1200',
  esports: 'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=1200',
  technology: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
  entertainment: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1200',
  editorial: 'https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=1200',
  lifestyle: 'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const categoryOptions = [
  { bn: 'জাতীয়', en: 'National' },
  { bn: 'আন্তর্জাতিক', en: 'International' },
  { bn: 'রাজনীতি', en: 'Politics' },
  { bn: 'অর্থনীতি', en: 'Business' },
  { bn: 'খেলাধুলা', en: 'Sports' },
  { bn: 'ই-স্পোর্টস ও গেমিং', en: 'Esports & Gaming' },
  { bn: 'প্রযুক্তি', en: 'Tech' },
  { bn: 'বিনোদন', en: 'Entertainment' },
  { bn: 'সম্পাদকীয় ও মতামত', en: 'Editorial & Opinion' },
  { bn: 'ফিচার ও জীবনযাপন', en: 'Features & Lifestyle' },
];

const seedArticles: Article[] = [
  { id:'a1', authorId:'r1', authorName:'ঋদ্ধি সেন', titleBn:'নদীর কাছে ফিরে আসা: সুন্দরবনের নতুন কথামালা', titleEn:'Returning to the river: new stories from the Sundarbans', contentBn:'জোয়ারের জল যখন কাদামাটির উঠোন ছুঁয়ে যায়, তখন সুন্দরবনের মানুষ সময়কে ঘড়িতে মাপেন না। তাঁরা মাপেন নৌকার দড়িতে, মাটির গন্ধে, আর দূরের বনের নীরবতায়।', contentEn:'When the tide touches the mud courtyards, people in the Sundarbans do not measure time by clocks.', excerptBn:'জোয়ারের জল, বদলে যাওয়া নদী আর মানুষের অনমনীয় আশার গল্প।', excerptEn:'A story of shifting tides, stubborn hope and the people of a changing coast.', category:'সমাজ', image:images.river, status:'published', isBreaking:false, isLead:true, views:18420, createdAt:'2026-02-18', readTime:8 },
  { id:'a2', authorId:'r2', authorName:'সায়ন্তনী ঘোষ', titleBn:'শীতের সকালে শান্ত নদীর তীরে জেগে ওঠা এক জনপদ', titleEn:'The town that wakes up by the quiet river on a winter morning', contentBn:'কুয়াশার নরম পর্দা সরিয়ে নদীপাড়ের জনপদ প্রতিদিন নিজের চিরচেনা রূপটি ফিরে পায়।', contentEn:'Behind a soft winter veil, the riverside town wakes to its familiar morning.', excerptBn:'মাঝির সুর, গরম চায়ের ধোঁয়া আর সকালের হাট—নদীপাড়ের শান্ত সকালের ছবি।', excerptEn:'Boat songs, hot morning tea and the river bazaar: frames of a quiet dawn.', category:'শহর', image:images.kolkata, status:'published', isBreaking:true, isLead:false, views:9240, createdAt:'2026-02-17', readTime:5 },
  { id:'a3', authorId:'r3', authorName:'অর্ক ভট্টাচার্য', titleBn:'বইমেলার বাইরে: বাংলা বইয়ের নতুন পাঠকরা', titleEn:'Beyond the book fair: Bengal’s new readers', contentBn:'বইমেলা শেষ হয়ে গেলেও পড়া থামে না। জেলা শহর থেকে নতুন পাঠকেরা নিজেদের পাঠচক্র তৈরি করছেন।', contentEn:'Reading does not stop when the fair closes.', excerptBn:'মেলা ছাড়িয়ে পাঠের যে নতুন ভূগোল তৈরি হচ্ছে।', excerptEn:'The new geography of reading taking shape beyond the fair.', category:'সংস্কৃতি', image:images.books, status:'published', isBreaking:false, isLead:false, views:7310, createdAt:'2026-02-16', readTime:6 }
];

const seedReporters: Reporter[] = [
  { id:'r1', name:'ঋদ্ধি সেন', email:'riddhi@weeklybengal.news', role:'Senior Reporter', avatar:'ঋস', bio:'উপকূল, জলবায়ু ও মানুষের গল্প লেখেন।', active:true },
  { id:'r2', name:'সায়ন্তনী ঘোষ', email:'sayantani@weeklybengal.news', role:'City Editor', avatar:'সঘ', bio:'শহর, সংস্কৃতি ও নাগরিক জীবনের খোঁজ রাখেন।', active:true },
  { id:'r3', name:'অর্ক ভট্টাচার্য', email:'arka@weeklybengal.news', role:'Arts Correspondent', avatar:'অভ', bio:'শিল্প, বই ও মানুষের সৃজনশীলতার গল্প।', active:true },
  { id:'r4', name:'মৃণাল দত্ত', email:'mrinal@weeklybengal.news', role:'Contributor', avatar:'মদ', bio:'নদীবিধৌত জনপদের জীবন ও ইতিহাস নিয়ে লেখেন।', active:false },
];

const seedComments: Comment[] = [
  { id:'c1', articleId:'a1', userName:'সোহিনী মুখোপাধ্যায়', text:'এই লেখার ভেতর দিয়ে সুন্দরবনকে যেন আরও কাছে পেলাম।', createdAt:'আজ, ১০:৪২' }
];

type AppContextValue = {
  lang: Lang;
  setLang: (v: Lang) => void;
  dark: boolean;
  toggleDark: () => void;
  articles: Article[];
  setArticles: Dispatch<SetStateAction<Article[]>>;
  reporters: Reporter[];
  setReporters: Dispatch<SetStateAction<Reporter[]>>;
  comments: Comment[];
  setComments: Dispatch<SetStateAction<Comment[]>>;
  session: Session;
  setSession: (v: Session) => void;
  notice: (s: string) => void;
  saveArticle: (article: Article) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const useApp = () => useContext(AppContext)!;
const tx = (lang: Lang, bn: string, en: string) => lang === 'bn' ? bn : en;
const formatDate = (s: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { day:'numeric', month:'long', year:'numeric' }).format(new Date(s));

const searchableArticleText = (article: Article) => {
  const category = categoryOptions.find((option) => option.bn === article.category);
  return [
    article.titleBn,
    article.titleEn,
    article.contentBn,
    article.contentEn,
    article.excerptBn,
    article.excerptEn,
    article.category,
    category?.en || '',
  ].join(' ').toLocaleLowerCase();
};

function Seo({ title, description, image, type = 'website', path, lang }: { title: string; description: string; image?: string; type?: 'website' | 'article'; path?: string; lang: Lang }) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const canonicalPath = path || (typeof window === 'undefined' ? '/' : window.location.pathname);
  const canonicalUrl = `${origin}${canonicalPath}`;
  const socialImage = image || images.river;
  return <Helmet>
    <html lang={lang}/>
    <title>{title} | The Weekly Bengal</title>
    <meta name="description" content={description}/>
    <meta property="og:title" content={title}/>
    <meta property="og:description" content={description}/>
    <meta property="og:image" content={socialImage}/>
    <meta property="og:url" content={canonicalUrl}/>
    <meta property="og:type" content={type}/>
    <meta property="og:site_name" content="The Weekly Bengal"/>
    <meta property="og:locale" content={lang === 'bn' ? 'bn_BD' : 'en_US'}/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content={title}/>
    <meta name="twitter:description" content={description}/>
    <meta name="twitter:image" content={socialImage}/>
    <link rel="canonical" href={canonicalUrl}/>
  </Helmet>;
}

function Header() {
  const { lang, setLang, dark, toggleDark, session } = useApp();
  const [menu, setMenu] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
      <button className="md:hidden text-foreground" onClick={() => setMenu(!menu)} data-testid="button-mobile-menu" aria-label="Open navigation"><Menu size={22}/></button>
      <Link href="/" className="group flex items-center gap-2" data-testid="link-masthead">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground"><Newspaper size={19}/></span>
        <span className="display text-xl font-bold tracking-tight sm:text-2xl">The Weekly Bengal</span>
      </Link>
      <nav className={`${menu ? 'flex' : 'hidden'} absolute left-0 top-16 w-full flex-col border-b bg-background p-4 md:static md:flex md:w-auto md:flex-row md:border-0 md:p-0`} data-testid="nav-primary">
        {categoryOptions.map((item) => <Link key={item.bn} href={`/search?category=${encodeURIComponent(item.bn)}`} className="border-b border-border py-3 text-sm font-medium hover:text-accent md:border-0 md:px-3 md:py-2" data-testid={`link-category-${item.bn}`}>{lang === 'bn' ? item.bn : item.en}</Link>)}
      </nav>
      <div className="flex items-center gap-1.5">
        <Link href="/search" className="rounded-full p-2 hover:bg-secondary" data-testid="link-search"><Search size={18}/></Link>
        <button className="hidden rounded-full px-2 py-1.5 text-xs font-bold md:block" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} data-testid="button-language-toggle">{lang === 'bn' ? 'EN' : 'বাং'}</button>
        <button className="rounded-full p-2 hover:bg-secondary" onClick={toggleDark} data-testid="button-theme-toggle" aria-label="Toggle theme">{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>
        {session ? <Link href={session.role === 'admin' ? '/admin' : '/reporter'} className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-bold sm:flex" data-testid="link-dashboard"><UserRound size={14}/>{session.name}</Link> : <Link href="/login" className="hidden rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground sm:block" data-testid="link-login">{tx(lang,'প্রবেশ','Login')}</Link>}
      </div>
    </div>
  </header>;
}

function Footer() {
  const { lang } = useApp();
  const currentYear = new Date().getFullYear();
  return <footer className="mt-20 bg-sidebar text-sidebar-foreground">
    <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 sm:grid-cols-4 sm:px-8">
      <div className="sm:col-span-2">
        <div className="display text-3xl font-bold">The Weekly Bengal</div>
        <p className="bn mt-3 max-w-sm text-sm leading-7 text-sidebar-foreground/65">{tx(lang,'বাংলার জানলা দিয়ে বিশ্বের দিকে তাকানো। প্রতিদিনের খবর, মানুষের গল্প এবং চিন্তার জায়গা।','A window from Bengal to the wider world. News, human stories and a little room to think.')}</p>
        <div className="mt-6 flex gap-2"><span className="h-2 w-2 rounded-full bg-accent"/><span className="h-2 w-2 rounded-full bg-sidebar-foreground/30"/><span className="h-2 w-2 rounded-full bg-sidebar-foreground/30"/></div>
      </div>
      <div>
        <div className="kicker text-sidebar-foreground/50">Explore</div>
        <div className="mt-4 space-y-3 text-sm text-sidebar-foreground/75">
          <Link href="/search" className="block hover:text-accent">আর্কাইভ</Link>
          <Link href="/search?category=জাতীয়" className="block hover:text-accent">জাতীয়</Link>
          <Link href="/search?category=আন্তর্জাতিক" className="block hover:text-accent">আন্তর্জাতিক</Link>
        </div>
      </div>
      <div>
        <div className="kicker text-sidebar-foreground/50">The paper</div>
        <div className="mt-4 space-y-3 text-sm text-sidebar-foreground/75">
          <span className="block">আমাদের কথা</span>
          <span className="block">যোগাযোগ</span>
          <span className="block">গোপনীয়তা</span>
        </div>
      </div>
    </div>
    <div className="border-t border-sidebar-border py-5 text-center font-mono text-[10px] tracking-[.18em] text-sidebar-foreground/45">
      © {currentYear} THE WEEKLY BENGAL · PUBLISHED FROM BANGLADESH
    </div>
  </footer>;
}

function Ticker() {
  const { lang } = useApp();
  return <div className="bg-accent text-accent-foreground">
    <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-2 text-xs">
      <span className="shrink-0 font-bold uppercase tracking-[.18em]">{tx(lang,'এই মুহূর্তে','Live')}</span>
      <span className="h-3 w-px bg-accent-foreground/35"/>
      <div className="truncate bn">{tx(lang,'সারাদেশে বৃষ্টির পূর্বাভাস, বইছে শীতল বাতাস','Rain forecast across the country as cool breeze sets in')}</div>
      <Link href="/search" className="ml-auto shrink-0 font-bold underline underline-offset-2">{tx(lang,'সব খবর','All news')}</Link>
    </div>
  </div>;
}

function Notice({ children }: { children: ReactNode }) { 
  return <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-sidebar px-5 py-3 text-sm text-sidebar-foreground shadow-xl enter">{children}</div>; 
}

function SectionTitle({ title, kicker, href='/search' }: { title: string; kicker?: string; href?: string }) { 
  return <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
    <div><div className="kicker mb-1">{kicker}</div><h2 className="display text-2xl font-bold sm:text-3xl">{title}</h2></div>
    <Link href={href} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-accent" data-testid={`link-more-${title}`}>আরও <ArrowRight size={14}/></Link>
  </div>; 
}

function StoryCard({ article, featured=false }: { article: Article; featured?: boolean }) {
  const { lang } = useApp();
  return <Link href={`/article/${article.id}`} className={`group block ${featured ? '' : 'grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[150px_1fr]'}`} data-testid={`card-article-${article.id}`}>
    <div className={`relative overflow-hidden rounded-sm bg-muted ${featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
      <img src={article.image || images.river} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>
      {article.isBreaking && <span className="absolute left-2 top-2 bg-accent px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">{tx(lang,'জরুরি','Breaking')}</span>}
    </div>
    <div className={featured ? 'mt-4' : ''}>
      <div className="kicker mb-2">{article.category}</div>
      <h3 className={`display font-bold leading-[1.25] group-hover:text-primary ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>{lang === 'bn' ? article.titleBn : article.titleEn}</h3>
      <p className={`bn mt-2 leading-7 text-muted-foreground ${featured ? 'text-base' : 'line-clamp-2 text-sm'}`}>{lang === 'bn' ? article.excerptBn : article.excerptEn}</p>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground"><span>{article.authorName}</span><span>·</span><span>{article.readTime} min read</span></div>
    </div>
  </Link>;
}

function Home() {
  const { lang, articles, notice } = useApp();
  const [clock, setClock] = useState(new Date());
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('');
  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(timer); }, []);
  const published = articles.filter(a => a.status === 'published');
  const lead = published.find(a => a.isLead) || published[0];
  const secondary = published.filter(a => a.id !== lead?.id).slice(0, 4);
  const multimedia = [images.coast, images.tea, images.kolkata];

  return <>
    <Seo title={tx(lang,'বাংলার কণ্ঠস্বর, বিশ্বমঞ্চের দর্পণ','Voice of Bengal, Lens to the World')} description={tx(lang,'বাংলা ও বিশ্বের খবর, মানুষের গল্প এবং চিন্তার জায়গা।','Bengali and global news, human stories and a little room to think.')} lang={lang}/>
    <Header/><Ticker/>
    <main className="mx-auto max-w-[1280px] px-4 pb-4 sm:px-8">
      <div className="flex items-center justify-between border-b border-border py-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2"><CalendarDays size={13}/><span data-testid="text-live-date">{new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(clock)}</span></div>
        <div className="font-mono" data-testid="text-live-clock">{clock.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-GB',{hour:'2-digit',minute:'2-digit'})} BST</div>
      </div>
      <section className="grid gap-8 py-10 lg:grid-cols-[1.45fr_.8fr] lg:gap-12 lg:py-14">
        {lead && <div className="enter"><StoryCard article={lead} featured/></div>}
        <div className="lg:border-l lg:border-border lg:pl-8">
          <div className="mb-5 flex items-center justify-between"><div className="kicker">{tx(lang,'সম্পাদকের পছন্দ','Editor’s picks')}</div><Bookmark size={17} className="text-accent"/></div>
          <div className="space-y-6">{secondary.slice(0,3).map((a,i)=><div key={a.id} className={`enter enter-${i+1}`}><StoryCard article={a}/></div>)}</div>
        </div>
      </section>
      <section className="py-10">
        <SectionTitle title={tx(lang,'আজকের চোখ','The day, in focus')} kicker={tx(lang,'নির্বাচিত প্রতিবেদন','Curated reports')}/>
        <div className="grid gap-x-7 gap-y-10 md:grid-cols-3">{secondary.slice(1,4).map(a=><StoryCard article={a} key={a.id}/>)}</div>
      </section>
      <section className="my-10 grid items-stretch overflow-hidden rounded-sm bg-primary text-primary-foreground md:grid-cols-[.8fr_1.2fr]">
        <div className="p-8 sm:p-12">
          <div className="kicker text-accent">{tx(lang,'শুনুন','Listen')}</div>
          <h2 className="display mt-3 text-3xl font-bold leading-tight sm:text-4xl">{tx(lang,'শব্দের ভেতর দিয়ে বাংলাকে চিনুন।','Meet Bengal through its voices.')}</h2>
          <p className="bn mt-4 max-w-sm text-sm leading-7 text-primary-foreground/70">{tx(lang,'সাপ্তাহিক পডকাস্টে থাকছে মানুষের মুখে বলা শহর, নদী ও স্মৃতির গল্প।','A weekly podcast of cities, rivers and memories, told in the voices of the people who live them.')}</p>
          <button onClick={()=>notice(tx(lang,'পডকাস্ট শীঘ্রই আসছে','Podcast coming soon'))} className="mt-7 flex items-center gap-2 border-b border-accent pb-2 text-sm font-bold text-accent" data-testid="button-podcast"><Play size={15} fill="currentColor"/> {tx(lang,'প্রথম পর্ব শুনুন','Listen to episode one')}</button>
        </div>
        <div className="relative min-h-[260px] overflow-hidden">
          <img src={multimedia[slide]} className="absolute inset-0 h-full w-full object-cover opacity-70" alt=""/>
          <div className="absolute inset-0 bg-primary/35"/>
          <div className="absolute bottom-5 left-5 right-5 flex justify-between">
            <span className="font-mono text-[10px] tracking-widest text-white">WB AUDIO / ০১</span>
            <div className="flex gap-2">
              <button onClick={()=>setSlide((slide+multimedia.length-1)%multimedia.length)} className="rounded-full bg-white/15 p-2 text-white"><ChevronLeft size={16}/></button>
              <button onClick={()=>setSlide((slide+1)%multimedia.length)} className="rounded-full bg-white/15 p-2 text-white"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10">
        <SectionTitle title={tx(lang,'বিষয় ধরে পড়ুন','Read by subject')} kicker={tx(lang,'আরও গল্প','More stories')}/>
        <div className="grid gap-10 md:grid-cols-2">
          {['জাতীয়','আন্তর্জাতিক','খেলাধুলা','প্রযুক্তি'].map((category)=><div key={category} className="border-t-2 border-primary pt-4">
            <div className="mb-5 flex items-center justify-between"><h3 className="display text-xl font-bold">{category}</h3><Link href={`/search?category=${encodeURIComponent(category)}`} className="text-accent"><ArrowRight size={18}/></Link></div>
            {published.filter(a=>a.category===category).slice(0,1).map(a=><StoryCard article={a} key={a.id}/>)}
          </div>)}
        </div>
      </section>
      <section className="my-10 flex flex-col justify-between gap-6 border-y border-border py-10 sm:flex-row sm:items-center">
        <div>
          <div className="kicker">{tx(lang,'সপ্তাহের চিঠি','The weekly letter')}</div>
          <h2 className="display mt-2 text-3xl font-bold">{tx(lang,'ভালো গল্পের জন্য একটুখানি জায়গা রাখুন।','Make room for good stories.')}</h2>
          <p className="bn mt-2 text-sm text-muted-foreground">{tx(lang,'সপ্তাহে একবার, ইনবক্সে আমাদের সেরা গল্প।','Our best stories, once a week.')}</p>
        </div>
        <form className="flex w-full max-w-md gap-2" onSubmit={e=>{e.preventDefault(); if(email) notice(tx(lang,'আপনাকে তালিকায় যোগ করা হয়েছে','You’re on the list')); setEmail('')}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder={tx(lang,'আপনার ইমেল','Your email address')} className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-1 py-3 text-sm outline-none focus:border-accent"/>
          <button className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"><Send size={14}/><span>{tx(lang,'যোগ দিন','Subscribe')}</span></button>
        </form>
      </section>
    </main>
    <Footer/>
  </>;
}

function ArticlePage() {
  const { id } = useParams<{id:string}>(); 
  const { lang, articles, comments, setComments, notice } = useApp(); 
  const article = articles.find(a=>a.id===id); 
  const [comment, setComment] = useState(''); 
  const [saved, setSaved] = useState(false);

  if (!article) return <NotFound/>;
  const title = lang === 'bn' ? article.titleBn : article.titleEn; 
  const content = lang === 'bn' ? article.contentBn : article.contentEn; 
  const related = articles.filter(a=>a.id!==id && a.status==='published').slice(0,3);
  const copy = () => { navigator.clipboard?.writeText(location.href); notice(tx(lang,'লিঙ্ক কপি হয়েছে','Link copied')); };

  return <>
    <Seo title={title} description={lang === 'bn' ? article.excerptBn : article.excerptEn} image={article.image} type="article" path={`/article/${article.id}`} lang={lang}/>
    <Header/>
    <div className="fixed left-0 right-0 top-16 z-30 h-0.5 bg-accent"/>
    <main className="mx-auto max-w-[1000px] px-4 pb-20 sm:px-8">
      <div className="mx-auto max-w-3xl py-10 sm:py-16">
        <div className="kicker">{article.category} · {article.readTime} min read</div>
        <h1 className="display mt-4 text-4xl font-bold leading-[1.12] sm:text-6xl">{title}</h1>
        <p className="bn mt-5 text-xl leading-9 text-muted-foreground">{lang === 'bn' ? article.excerptBn : article.excerptEn}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4 border-y border-border py-4 text-xs">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-bold text-primary">{article.authorName.slice(0,2)}</span>
          <span className="font-bold">{article.authorName}</span>
          <span className="text-muted-foreground">{formatDate(article.createdAt,lang)}</span>
          <span className="ml-auto flex gap-1">
            <button onClick={()=>setSaved(!saved)} className={`rounded-full p-2 ${saved?'bg-accent text-accent-foreground':'hover:bg-secondary'}`}><Bookmark size={16} fill={saved?'currentColor':'none'}/></button>
            <button onClick={copy} className="rounded-full p-2 hover:bg-secondary"><Copy size={16}/></button>
            <button onClick={()=>notice(tx(lang,'শেয়ার অপশন প্রস্তুত','Share options ready'))} className="rounded-full p-2 hover:bg-secondary"><Share2 size={16}/></button>
          </span>
        </div>
      </div>
      <img src={article.image || images.river} alt={title} className="mx-auto aspect-[16/8] w-full object-cover"/>
      <div className="mx-auto grid max-w-3xl gap-10 py-10 lg:grid-cols-[1fr_160px]">
        <article className="bn prose prose-lg max-w-none leading-[2] dark:prose-invert">
          {content.split('\\n\\n').map((p,i)=><p key={i}>{p}</p>)}
          <blockquote className="border-l-4 border-accent pl-5 text-2xl font-medium leading-relaxed text-primary">{tx(lang,'“খবর মানে শুধু যা ঘটেছে তা নয়, মানুষের ভিতর যা বদলেছে তারও খোঁজ।”','“News is not only what happened, but also what changed inside people.”')}</blockquote>
        </article>
      </div>
      <div className="mx-auto max-w-3xl border-t border-border pt-8">
        <h2 className="display text-2xl font-bold">{tx(lang,'মন্তব্য','Comments')} ({comments.filter(c=>c.articleId===id).length})</h2>
        <form className="mt-5 flex gap-3" onSubmit={e=>{e.preventDefault(); if(!comment.trim()) return; setComments(cs=>[...cs,{id:`c${Date.now()}`,articleId:id,userName:'আপনি',text:comment,createdAt:'এইমাত্র'}]);setComment('')}}>
          <input value={comment} onChange={e=>setComment(e.target.value)} className="min-w-0 flex-1 rounded-sm border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" placeholder={tx(lang,'আপনার মতামত লিখুন…','Write a comment…')}/>
          <button className="rounded-sm bg-primary px-4 text-primary-foreground"><Send size={16}/></button>
        </form>
        <div className="mt-6 space-y-5">{comments.filter(c=>c.articleId===id).map(c=><div className="border-b border-border pb-5" key={c.id}><div className="flex justify-between text-xs font-bold"><span>{c.userName}</span><span className="font-normal text-muted-foreground">{c.createdAt}</span></div><p className="bn mt-2 text-sm leading-7 text-muted-foreground">{c.text}</p></div>)}</div>
      </div>
      <section className="mx-auto mt-16 max-w-3xl">
        <SectionTitle title={tx(lang,'আরও পড়ুন','Read next')} kicker={tx(lang,'সম্পর্কিত গল্প','Related stories')}/>
        <div className="grid gap-6 sm:grid-cols-3">{related.map(a=><StoryCard article={a} key={a.id}/>)}</div>
      </section>
    </main>
    <Footer/>
  </>;
}

function SearchPage() {
  const { lang, articles } = useApp(); 
  const initialCategory = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('category') || 'সব'; 
  const [q,setQ]=useState(''); 
  const [category,setCategory]=useState(initialCategory); 
  const categories=['সব', ...categoryOptions.map((option) => option.bn)];
  const results=articles.filter(a=>a.status==='published' && (category==='সব'||a.category===category) && (!q.trim() || searchableArticleText(a).includes(q.trim().toLocaleLowerCase())));
  const labelForCategory = (value: string) => value === 'সব' ? tx(lang,'সব','All') : categoryOptions.find((option) => option.bn === value)?.[lang === 'bn' ? 'bn' : 'en'] || value;

  return <>
    <Seo title={tx(lang,'আর্কাইভ ও অনুসন্ধান','Archive & search')} description={tx(lang,'খবর ও প্রতিবেদনের ভেতর অনুসন্ধান করুন।','Search headlines, subjects and full story text.')} lang={lang}/>
    <Header/>
    <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8 sm:py-16">
      <div className="max-w-2xl"><div className="kicker">{tx(lang,'আর্কাইভ ও অনুসন্ধান','Archive & search')}</div><h1 className="display mt-3 text-5xl font-bold">{tx(lang,'আপনার গল্প খুঁজুন।','Find your story.')}</h1></div>
      <div className="mt-10 flex items-center gap-3 border-b-2 border-primary pb-3"><Search size={20}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={tx(lang,'খবর, মানুষ, বিষয়…','Search cities, people, ideas…')} className="w-full bg-transparent text-lg outline-none"/></div>
      <div className="my-7 flex gap-2 overflow-x-auto pb-2">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${category===c?'border-primary bg-primary text-primary-foreground':'border-border hover:border-primary'}`}>{labelForCategory(c)}</button>)}</div>
      <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground"><span>{results.length} {tx(lang,'টি গল্প','stories')}</span><span>{q && `“${q}”`}</span></div>
      {results.length ? <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">{results.map(a=><StoryCard article={a} key={a.id}/>)}</div> : <div className="rounded-sm border border-dashed border-border py-20 text-center"><Search className="mx-auto text-muted-foreground" size={30}/><h2 className="display mt-4 text-2xl font-bold">{tx(lang,'কোনও গল্প মেলেনি','No stories found')}</h2></div>}
    </main>
    <Footer/>
  </>;
}

function LoginPage() {
  const { lang, setSession, notice } = useApp(); 
  const [,navigate]=useLocation(); 
  const [email,setEmail]=useState(''); 
  const [password,setPassword]=useState('');
  const login=(role:'admin'|'reporter')=>{
    const s=role==='admin'?{role:'admin' as const,name:'অদিতি রায়',id:'admin'}:{role:'reporter' as const,name:'ঋদ্ধি সেন',id:'r1'};
    setSession(s);
    notice(tx(lang,'স্বাগতম, '+s.name,'Welcome, '+s.name));
    navigate(role==='admin'?'/admin':'/reporter');
  };

  return <>
    <Seo title={tx(lang,'সম্পাদকীয় ডেস্কে প্রবেশ করুন','Enter the editorial desk')} description="Enter desk" lang={lang}/>
    <Header/>
    <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-9 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-primary-foreground"><Newspaper size={23}/></span>
          <h1 className="display mt-5 text-4xl font-bold">{tx(lang,'ফিরে আসুন','Welcome back')}</h1>
        </div>
        <div className="rounded-sm border border-border bg-card p-6 editorial-shadow sm:p-8">
          <label className="kicker">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 mb-5 w-full border-b border-border bg-transparent px-1 py-3 outline-none focus:border-primary" placeholder="you@weeklybengal.news"/>
          <label className="kicker">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="mt-2 w-full border-b border-border bg-transparent px-1 py-3 outline-none focus:border-primary" placeholder="••••••••"/>
          <button onClick={()=>login('reporter')} className="mt-7 w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground">প্রবেশ করুন / Sign in</button>
          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground"><span className="h-px flex-1 bg-border"/>Demo access<span className="h-px flex-1 bg-border"/></div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={()=>login('admin')} className="rounded-sm border border-border py-3 text-xs font-bold hover:border-primary"><ShieldCheck size={15} className="mx-auto mb-1 text-accent"/>Admin access</button>
            <button onClick={()=>login('reporter')} className="rounded-sm border border-border py-3 text-xs font-bold hover:border-primary"><PenLine size={15} className="mx-auto mb-1 text-accent"/>Reporter access</button>
          </div>
        </div>
      </div>
    </main>
  </>;
}

function StatusBadge({ status }: {status: Status}) { 
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status==='published'?'bg-primary/10 text-primary':status==='pending'?'bg-accent/15 text-accent':'bg-muted text-muted-foreground'}`}>{status}</span>; 
}

function Stat({ icon:Icon, label, value, change }: {icon: typeof BarChart3; label:string; value:string; change?:string}) { 
  return <div className="rounded-sm border border-border bg-card p-5"><Icon size={18} className="text-accent"/><div className="mt-5 text-3xl font-bold tracking-tight">{value}</div><div className="mt-1 text-xs text-muted-foreground">{label}</div>{change&&<div className="mt-3 text-[10px] font-bold text-primary">{change}</div>}</div>; 
}

function AdminPage() {
  const { lang, articles, saveArticle, deleteArticle, reporters, setReporters, notice, setSession } = useApp(); 
  const [tab,setTab]=useState<'overview'|'articles'|'reporters'>('overview'); 
  const [,navigate]=useLocation(); 
  const [editing,setEditing]=useState<Article|null>(null); 
  const [showForm,setShowForm]=useState(false);

  const remove=async (id:string)=>{if(confirm(tx(lang,'এই গল্পটি মুছে ফেলবেন?','Delete this story?'))) {await deleteArticle(id); notice(tx(lang,'গল্প মুছে ফেলা হয়েছে','Story deleted'))}};
  const updateStatus=async (a:Article,status:Status)=>{await saveArticle({...a,status}); notice(status==='published'?tx(lang,'গল্প প্রকাশিত হয়েছে','Story published'):tx(lang,'অবস্থা আপডেট হয়েছে','Status updated'))};

  return <>
    <Seo title={tx(lang,'নিউজরুম নিয়ন্ত্রণ','Newsroom control')} description="Admin Desk" lang={lang}/>
    <Header/>
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="kicker">Editorial desk · Admin</div><h1 className="display mt-2 text-4xl font-bold">{tx(lang,'নিউজরুম নিয়ন্ত্রণ','Newsroom control')}</h1></div>
        <button onClick={()=>{setSession(null);navigate('/')}} className="text-xs font-bold text-muted-foreground hover:text-accent">Log out</button>
      </div>
      <div className="my-8 flex gap-6 overflow-x-auto border-b border-border">
        {[['overview','Overview'],['articles','Articles'],['reporters','Reporters']].map(([v,l])=><button key={v} onClick={()=>setTab(v as typeof tab)} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab===v?'border-accent text-accent':'border-transparent text-muted-foreground'}`}>{l}</button>)}
      </div>
      {tab==='overview'&&<>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={TrendingUp} label="Published stories" value={String(articles.filter(a=>a.status==='published').length)} change="+12% this month"/>
          <Stat icon={BarChart3} label="Total readership" value="47.2K" change="+8.4% this week"/>
          <Stat icon={Clock3} label="Pending review" value={String(articles.filter(a=>a.status==='pending').length)} change="Needs attention"/>
          <Stat icon={Users} label="Active reporters" value={String(reporters.filter(r=>r.active).length)} />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <SectionTitle title="Recent stories" kicker="Publishing queue" href="/admin"/>
            <div className="space-y-3">{articles.slice(0,5).map(a=><AdminRow article={a} onEdit={()=>{setEditing(a);setShowForm(true)}} onDelete={()=>remove(a.id)} onPublish={()=>updateStatus(a,'published')} key={a.id}/>)}</div>
          </div>
          <div>
            <SectionTitle title="The team" kicker="Byline desk" href="/admin"/>
            <div className="space-y-4">{reporters.slice(0,3).map(r=><div key={r.id} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">{r.avatar}</span><div className="flex-1"><div className="text-sm font-bold">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div></div>)}</div>
          </div>
        </div>
      </>}
      {tab==='articles'&&<>
        <div className="mb-5 flex justify-end">
          <button onClick={()=>{setEditing(null);setShowForm(true)}} className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Plus size={16}/> New story</button>
        </div>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-4">Story</th><th>Category</th><th>Status</th><th>Views</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody>{articles.map(a=><AdminRow article={a} onEdit={()=>{setEditing(a);setShowForm(true)}} onDelete={()=>remove(a.id)} onPublish={()=>updateStatus(a,'published')} table key={a.id}/>)}</tbody>
          </table>
        </div>
      </>}
      {tab==='reporters'&&<ReportersTab reporters={reporters} setReporters={setReporters} notice={notice}/>}
    </main>
    {showForm&&<ArticleForm article={editing} onClose={()=>setShowForm(false)} onSave={async (a)=>{await saveArticle(a); setShowForm(false); notice(tx(lang,'গল্প সংরক্ষিত হয়েছে','Story saved'))}}/>}
  </>;
}

function AdminRow({article,onEdit,onDelete,onPublish,table=false}:{article:Article;onEdit:()=>void;onDelete:()=>void;onPublish:()=>void;table?:boolean}) { 
  const {lang}=useApp(); 
  if(table) return <tr className="border-t border-border">
    <td className="p-4"><div className="flex items-center gap-3"><img src={article.image || images.river} className="h-10 w-14 object-cover" alt=""/><div><div className="font-bold">{lang==='bn'?article.titleBn:article.titleEn}</div><div className="text-xs text-muted-foreground">{article.authorName}</div></div></div></td>
    <td>{article.category}</td>
    <td><StatusBadge status={article.status}/></td>
    <td>{article.views.toLocaleString()}</td>
    <td className="p-4"><div className="flex justify-end gap-1"><button onClick={onEdit} className="rounded p-2 hover:bg-secondary"><Edit3 size={15}/></button>{article.status!=='published'&&<button onClick={onPublish} className="rounded p-2 text-primary hover:bg-secondary"><Check size={15}/></button>}<button onClick={onDelete} className="rounded p-2 text-destructive hover:bg-secondary"><Trash2 size={15}/></button></div></td>
  </tr>; 
  return <div className="flex items-center gap-4 rounded-sm border border-border p-3">
    <img src={article.image || images.river} className="h-12 w-16 object-cover" alt=""/>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-bold">{lang==='bn'?article.titleBn:article.titleEn}</div>
      <div className="mt-1 flex gap-2 text-xs text-muted-foreground"><span>{article.authorName}</span><StatusBadge status={article.status}/></div>
    </div>
    <div className="hidden items-center gap-1 sm:flex">
      <button onClick={onEdit} className="rounded p-2 hover:bg-secondary"><Edit3 size={15}/></button>
      {article.status!=='published'&&<button onClick={onPublish} className="rounded p-2 text-primary hover:bg-secondary"><Check size={15}/></button>}
      <button onClick={onDelete} className="rounded p-2 text-destructive hover:bg-secondary"><Trash2 size={15}/></button>
    </div>
  </div>; 
}

function ReportersTab({reporters,setReporters,notice}:{reporters:Reporter[];setReporters:Dispatch<SetStateAction<Reporter[]>>;notice:(s:string)=>void}) { 
  return <div className="grid gap-4 sm:grid-cols-2">{reporters.map(r=><div className="rounded-sm border border-border bg-card p-5" key={r.id}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary font-bold text-primary">{r.avatar}</span><div><div className="font-bold">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div></div></div><p className="bn mt-5 text-sm leading-7 text-muted-foreground">{r.bio}</p><div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">{r.email}</div></div>)}</div>; 
}

function ArticleForm({article,onClose,onSave}:{article:Article|null;onClose:()=>void;onSave:(a:Article)=>Promise<void>}) { 
  const {session}=useApp(); 
  const [titleBn,setTitleBn]=useState(article?.titleBn||''); 
  const [titleEn,setTitleEn]=useState(article?.titleEn||''); 
  const [excerptBn,setExcerptBn]=useState(article?.excerptBn||''); 
  const [contentBn,setContentBn]=useState(article?.contentBn||''); 
  const [category,setCategory]=useState(article?.category||'জাতীয়'); 
  const [status,setStatus]=useState<Status>(article?.status||'published'); 

  const submit=async (e:FormEvent)=>{
    e.preventDefault();
    await onSave({
      ...article,
      id:article?.id||`a${Date.now()}`,
      authorId:article?.authorId||session?.id||'r1',
      authorName:article?.authorName||session?.name||'রিপোর্টার',
      titleBn,
      titleEn:titleEn||titleBn,
      excerptBn,
      excerptEn:excerptBn,
      contentBn,
      contentEn:contentBn,
      category,
      image:article?.image||images.national,
      status,
      isBreaking:article?.isBreaking||false,
      isLead:article?.isLead||false,
      views:article?.views||0,
      createdAt:article?.createdAt||new Date().toISOString(),
      readTime:article?.readTime||5
    });
  }; 

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/50 p-0 sm:items-center sm:p-6">
    <form onSubmit={submit} className="max-h-[95dvh] w-full max-w-2xl overflow-y-auto rounded-t-sm bg-card p-6 shadow-2xl sm:rounded-sm sm:p-8">
      <div className="flex items-center justify-between"><div><div className="kicker">{article?'Edit story':'New story'}</div><h2 className="display mt-1 text-2xl font-bold">{article?'গল্প সম্পাদনা':'নতুন গল্প'}</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-secondary"><X size={18}/></button></div>
      <div className="mt-7 grid gap-5">
        <label className="text-xs font-bold">বাংলা শিরোনাম<input required value={titleBn} onChange={e=>setTitleBn(e.target.value)} className="mt-2 w-full border-b border-border bg-transparent py-2 text-lg outline-none focus:border-primary"/></label>
        <label className="text-xs font-bold">English title<input value={titleEn} onChange={e=>setTitleEn(e.target.value)} className="mt-2 w-full border-b border-border bg-transparent py-2 text-lg outline-none focus:border-primary"/></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold">Category<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-2 w-full border border-border bg-transparent p-3">{categoryOptions.map(x=><option key={x.bn} value={x.bn}>{x.bn}</option>)}</select></label>
          <label className="text-xs font-bold">Status<select value={status} onChange={e=>setStatus(e.target.value as Status)} className="mt-2 w-full border border-border bg-transparent p-3"><option value="published">Published</option><option value="pending">Pending review</option><option value="draft">Draft</option></select></label>
        </div>
        <label className="text-xs font-bold">Excerpt<textarea required value={excerptBn} onChange={e=>setExcerptBn(e.target.value)} rows={2} className="mt-2 w-full resize-none border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"/></label>
        <label className="text-xs font-bold">Story body<textarea required value={contentBn} onChange={e=>setContentBn(e.target.value)} rows={7} className="mt-2 w-full resize-y border border-border bg-transparent p-3 text-sm leading-7 outline-none focus:border-primary"/></label>
      </div>
      <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold">Cancel</button><button className="rounded-sm bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Save story</button></div>
    </form>
  </div>; 
}

function ReporterPage() {
  const { lang, articles, saveArticle, session, setSession }=useApp(); 
  const [,navigate]=useLocation(); 
  const [showForm,setShowForm]=useState(false); 
  const [editing,setEditing]=useState<Article|null>(null); 
  const mine=articles.filter(a=>a.authorId===session?.id);

  return <>
    <Seo title={tx(lang,'আমার ডেস্ক','My desk')} description="Reporter workspace" lang={lang}/>
    <Header/>
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="kicker">Reporter workspace</div><h1 className="display mt-2 text-4xl font-bold">{tx(lang,'আমার ডেস্ক','My desk')}</h1></div>
        <div className="flex gap-2">
          <button onClick={()=>{setEditing(null);setShowForm(true)}} className="flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"><Plus size={16}/> New story</button>
          <button onClick={()=>{setSession(null);navigate('/')}} className="px-3 text-xs font-bold text-muted-foreground">Log out</button>
        </div>
      </div>
      <div className="my-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={FileText} label="My stories" value={String(mine.length)} />
        <Stat icon={Clock3} label="Pending review" value={String(mine.filter(a=>a.status==='pending').length)} />
        <Stat icon={TrendingUp} label="Total views" value={mine.reduce((s,a)=>s+a.views,0).toLocaleString()} />
      </div>
      <div className="border-b border-border"><div className="kicker mb-3">Your newsroom</div><h2 className="display pb-3 text-2xl font-bold">Stories</h2></div>
      <div className="mt-5 space-y-3">
        {mine.length ? mine.map(a=><AdminRow article={a} key={a.id} onEdit={()=>{setEditing(a);setShowForm(true)}} onDelete={()=>{}} onPublish={()=>{}}/>) : <div className="border border-dashed border-border py-16 text-center"><p className="text-sm text-muted-foreground">আপনার প্রথম গল্পটি লিখুন।</p></div>}
      </div>
    </main>
    {showForm&&<ArticleForm article={editing} onClose={()=>setShowForm(false)} onSave={async (a)=>{await saveArticle(a); setShowForm(false);}}/>}
  </>;
}

function NotFound() { 
  const { lang } = useApp(); 
  return <>
    <Seo title={tx(lang,'পাতাটি পাওয়া যায়নি','Page not found')} description="Not found" lang={lang}/>
    <Header/>
    <main className="flex min-h-[60dvh] items-center justify-center px-5 text-center">
      <div>
        <div className="kicker">404 / Not found</div>
        <h1 className="display mt-3 text-5xl font-bold">এই পাতাটি নেই।</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"><ChevronLeft size={16}/> প্রথম পাতায় ফিরুন</Link>
      </div>
    </main>
  </>; 
}

function Router() { 
  return <ErrorBoundary resetKey={location.pathname}>
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/article/:id" component={ArticlePage}/>
      <Route path="/search" component={SearchPage}/>
      <Route path="/login" component={LoginPage}/>
      <Route path="/admin" component={AdminPage}/>
      <Route path="/reporter" component={ReporterPage}/>
      <Route component={NotFound}/>
    </Switch>
  </ErrorBoundary>; 
}

const queryClient = new QueryClient();

function App() {
  const [lang,setLangState]=useState<Lang>(()=>(localStorage.getItem('wb-lang') as Lang)||'bn'); 
  const [dark,setDark]=useState(()=>localStorage.getItem('wb-dark')==='1'); 
  const [articles,setArticles]=useState<Article[]>(seedArticles); 
  const [reporters,setReporters]=useState<Reporter[]>(seedReporters); 
  const [comments,setComments]=useState<Comment[]>(seedComments); 
  const [session,setSessionState]=useState<Session>(null); 
  const [toast,setToast]=useState('');

  useEffect(()=>{localStorage.setItem('wb-lang',lang)},[lang]); 
  useEffect(()=>{localStorage.setItem('wb-dark',dark?'1':'0');document.documentElement.classList.toggle('dark',dark)},[dark]); 
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)},[toast]);

  // Fetch articles from Supabase
  useEffect(() => {
    async function fetchFromSupabase() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: Article[] = data.map((d: any) => ({
            id: d.id,
            authorId: d.author_id,
            authorName: d.author_name,
            titleBn: d.title_bn,
            titleEn: d.title_en,
            contentBn: d.content_bn,
            contentEn: d.content_en,
            excerptBn: d.excerpt_bn,
            excerptEn: d.excerpt_en,
            category: d.category,
            image: d.image,
            status: d.status as Status,
            isBreaking: d.is_breaking,
            isLead: d.is_lead,
            views: d.views,
            createdAt: d.created_at,
            readTime: d.read_time
          }));
          setArticles(mapped);
        }
      } catch (e) {
        console.error('Supabase load error', e);
      }
    }
    fetchFromSupabase();
  }, []);

  const saveArticle = async (a: Article) => {
    setArticles(prev => {
      const idx = prev.findIndex(item => item.id === a.id);
      return idx >= 0 ? prev.map(item => item.id === a.id ? a : item) : [a, ...prev];
    });

    if (supabase) {
      try {
        await supabase.from('articles').upsert({
          id: a.id,
          author_id: a.authorId,
          author_name: a.authorName,
          title_bn: a.titleBn,
          title_en: a.titleEn,
          content_bn: a.contentBn,
          content_en: a.contentEn,
          excerpt_bn: a.excerptBn,
          excerpt_en: a.excerptEn,
          category: a.category,
          image: a.image,
          status: a.status,
          is_breaking: a.isBreaking,
          is_lead: a.isLead,
          views: a.views,
          created_at: a.createdAt,
          read_time: a.readTime
        });
      } catch (e) {
        console.error('Supabase save error', e);
      }
    }
  };

  const deleteArticle = async (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    if (supabase) {
      try {
        await supabase.from('articles').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete error', e);
      }
    }
  };

  const value=useMemo(()=>({
    lang,
    setLang:(v:Lang)=>setLangState(v),
    dark,
    toggleDark:()=>setDark(x=>!x),
    articles,
    setArticles,
    reporters,
    setReporters,
    comments,
    setComments,
    session,
    setSession:(v:Session)=>setSessionState(v),
    notice:setToast,
    saveArticle,
    deleteArticle
  }),[lang,dark,articles,reporters,comments,session]);

  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContext.Provider value={value}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}>
          <Router/>
        </WouterRouter>
        {toast&&<Notice>{toast}</Notice>}
      </AppContext.Provider>
      <Toaster/>
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
