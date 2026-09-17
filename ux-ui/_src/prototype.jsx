
const { useState, useEffect, useRef } = React;
const cn = (...c) => c.filter(Boolean).join(' ');
const fmtMoney = (n) => '$' + Number(n).toFixed(2);

// ---- Real product data (Wikimedia Commons photos, assets/img/) ----
const CATS = [
  { id: 'outerwear',  label: 'Outerwear',     img: 'assets/img/waxed-jacket-b.jpg' },
  { id: 'travel',     label: 'Travel',        img: 'assets/img/suitcase-a.jpg' },
  { id: 'carry-desks', label: 'Carry & Desk', img: 'assets/img/daypack-b.jpg' },
  { id: 'drinkware',  label: 'Drinkware',     img: 'assets/img/bottle-a.jpg' },
];
const PRODUCTS = [
  { slug: 'waxed-field-jacket', name: 'Waxed Field Jacket', img: 'assets/img/waxed-jacket-a.jpg', gallery: ['assets/img/gallery-waxed-field-jacket-2.jpg', 'assets/img/gallery-waxed-field-jacket-3.jpg'], price: 189.00, rating: 4.5, reviews: 12, cat: 'outerwear', stock: 24, desc: 'A working man\u2019s jacket cut from 10oz waxed cotton. It shrugs off wind and light rain, softens with wear, and gains a patina that tells your story.' },
  { slug: 'country-wax-jacket', name: 'Country Wax Jacket', img: 'assets/img/waxed-jacket-b.jpg', gallery: ['assets/img/gallery-country-wax-jacket-2.jpg', 'assets/img/gallery-country-wax-jacket-3.jpg'], price: 145.00, rating: 4.0, reviews: 8, cat: 'outerwear', stock: 3, desc: 'A shorter, roomier take on our classic waxed jacket, built for wandering fields and lanes with a full storm flap and corduroy collar.' },
  { slug: 'weekender-duffel', name: 'Weekender Duffel', img: 'assets/img/duffel-a.jpg', gallery: ['assets/img/gallery-weekender-duffel-2.jpg', 'assets/img/gallery-weekender-duffel-3.jpg'], price: 168.00, rating: 4.8, reviews: 3, cat: 'travel', stock: 7, desc: 'Forty liters of waxed canvas and bridle leather with a wide opening that lives up to the name -- a true two-day carry for long weekends away.' },
  { slug: 'canvas-duffel', name: 'Canvas Duffel', img: 'assets/img/duffel-b.jpg', gallery: ['assets/img/gallery-canvas-duffel-2.jpg', 'assets/img/gallery-canvas-duffel-3.jpg'], price: 124.00, rating: 4.6, reviews: 15, cat: 'travel', stock: 41, desc: 'A heavy cotton duck duffel with webbing handles that fold flat when you don\u2019t need them. Simple, tough, and made to outlast trends.' },
  { slug: 'cabin-carry-on', name: 'Cabin Carry-On', img: 'assets/img/suitcase-a.jpg', gallery: ['assets/img/suitcase-b.svg', 'assets/img/gallery-cabin-carry-on-2.jpg', 'assets/img/gallery-cabin-carry-on-3.jpg'], price: 139.00, rating: 4.8, reviews: 27, cat: 'travel', stock: 12, desc: 'A hardshell cabin case with 360\u00B0 spinner wheels and a telescopic handle, sized to slip overhead on the tightest of regional jets.' },
  { slug: 'trail-mug', name: 'Trail Mug', img: 'assets/img/mug-a.jpg', gallery: ['assets/img/gallery-trail-mug-2.jpg', 'assets/img/gallery-trail-mug-3.jpg'], price: 42.00, rating: 3.8, reviews: 21, cat: 'drinkware', stock: 120, desc: 'Enamel over steel, wide-mouthed and stackable, with a rolled rim that holds up to the campfire without complaint.' },
  { slug: 'insulated-bottle', name: 'Insulated Bottle 750ml', img: 'assets/img/bottle-a.jpg', gallery: ['assets/img/gallery-insulated-bottle-2.jpg', 'assets/img/gallery-insulated-bottle-3.jpg'], price: 34.00, rating: 4.7, reviews: 34, cat: 'drinkware', stock: 88, desc: 'Double-wall vacuum insulation keeps coffee hot for 12 hours or water cold for 24. Powder-coated steel, leak-proof cap.' },
  { slug: 'steel-bottle', name: 'Steel Bottle 1L', img: 'assets/img/bottle-b.jpg', gallery: ['assets/img/gallery-steel-bottle-2.jpg', 'assets/img/gallery-steel-bottle-3.jpg'], price: 28.00, rating: 4.3, reviews: 11, cat: 'drinkware', stock: 64, desc: 'A single-wall food-grade steel bottle for everyday trips to the tap. Scratch-hiding brushed finish, wide mouth for ice.' },
  { slug: 'utility-backpack', name: 'Utility Backpack', img: 'assets/img/daypack-b.jpg', gallery: ['assets/img/gallery-utility-backpack-2.jpg', 'assets/img/gallery-utility-backpack-3.jpg'], price: 98.00, rating: 4.4, reviews: 19, cat: 'carry-desks', stock: 9, desc: 'A 22L commuter pack with a padded 15\u201D laptop sleeve, dual water-bottle pockets, and a roll-top that keeps the rain out.' },
  { slug: 'daypack', name: 'Daypack', img: 'assets/img/daypack-a.jpg', gallery: ['assets/img/gallery-daypack-2.jpg', 'assets/img/gallery-daypack-3.jpg'], price: 8.95, rating: 4.2, reviews: 9, cat: 'carry-desks', stock: 0, oos: true, desc: 'A featherweight daypack for the trip you didn\u2019t plan. Packs into its own pocket when you arrive. Currently sold out.' },
];
const countByCat = (id) => PRODUCTS.filter((p) => p.cat === id).length;

// ---- Small shared helpers ----
function toast(msg, isError) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-[10px] px-4 py-2 text-sm shadow-lg text-white '
    + (isError ? 'bg-red-600' : 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
function ph(label) {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">'
    + '<rect width="800" height="800" fill="#f4f4f5"/>'
    + '<text x="50%" y="46%" font-family="Georgia, serif" font-size="34" fill="#71717a" text-anchor="middle">' + label + '</text>'
    + '<text x="50%" y="58%" font-family="Arial, sans-serif" font-size="14" fill="#a1a1aa" text-anchor="middle">photo pending — swap seed asset</text></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
}
const fallback = (label) => (e) => { e.currentTarget.src = ph(label); };
// Inline lucide-style icons (ISC) as real <svg> elements — the lucide UMD CDN's
// API churned between versions (icon .toSvg() existed in 0.x, gone in 1.45.0),
// so the prototype renders the fixed set it needs instead of a 438kb dependency.
// In the Vite build these all become `lucide-react` imports. Set per spec §6.5.
const ICONS = {
  moon:            (<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />),
  sun:             (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>),
  'shopping-cart': (<><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>),
  user:            (<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  menu:            (<><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></>),
  x:               (<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  search:          (<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>),
  'chevron-down':  (<path d="m6 9 6 6 6-6" />),
  'chevrons-up-down': (<><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></>),
  'chevron-left':  (<path d="m15 18-6-6 6-6" />),
  'chevron-right': (<path d="m9 18 6-6-6-6" />),
  'sliders-horizontal': (<><line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" /><line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" /></>),
  check:           (<path d="M20 6 9 17l-5-5" />),
  'shopping-bag':  (<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>),
  minus:           (<path d="M5 12h14" />),
  plus:            (<><path d="M5 12h14" /><path d="M12 5v14" /></>),
  'trash-2':       (<><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></>),
  'image-plus':    (<><path d="M16 5h6" /><path d="M19 2v6" /><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" /><path d="m3 16 5-5 3 3 3-3 4 4" /></>),
  'map-pin':       (<><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>),
  'credit-card':   (<><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></>),
  pencil:          (<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />),
  eye:             (<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  'eye-off':       (<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>),
  'layout-dashboard': (<><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>),
  package:          (<><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /></>),
  tags:             (<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>),
  users:            (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  'bar-chart':        (<><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></>),
  'external-link':    (<><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>),
};
function Icon({ name, className }) {
  const inner = ICONS[name];
  return inner ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         className={className} aria-hidden="true">{inner}</svg>
  ) : null;
}

// ---- shadcn/ui components via the shadcn-html CDN ----
// Real shadcn component classes (.btn/.badge/.input/.skeleton) + semantic tokens
// served from jsDelivr (github.com/codylindley/shadcn-html) - see the <head>
// links in the HTML shells. data-variant / data-size swap surfaces through CSS
// vars, so dark mode is automatic. Vite build swaps to `npx shadcn add`.
const BTN_VARIANTS = { default: 'default', outline: 'outline', destructive: 'destructive', ghost: 'ghost' };
function Button({ variant = 'default', size, className, children, ...props }) {
  // Call sites used a local `icon` variant for round icon buttons - map it to
  // shadcn's ghost variant + icon size.
  const isIcon = variant === 'icon';
  return (
    <button data-variant={isIcon ? 'ghost' : BTN_VARIANTS[variant] || variant}
            data-size={isIcon ? size || 'icon' : size}
            className={cn('btn', className)} {...props}>{children}</button>
  );
}
function Badge({ variant = 'default', className, children, ...props }) {
  return <span data-variant={variant} className={cn('badge', className)} {...props}>{children}</span>;
}
function Input({ className, ...props }) {
  return <input {...props} className={cn('input', className)} />;
}
function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

// ---- ProductCard (§5.3) ----
function ProductCard({ p }) {
  return (
    <a href={'./product-detail-page.html?slug=' + p.slug} className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {p.oos && <Badge className="absolute top-3 left-3 z-10 bg-red-600 text-white">Out of stock</Badge>}
        <div className={cn('aspect-square overflow-hidden', p.oos && 'opacity-60')}>
          <img src={p.img} data-ph={p.name} alt={p.name} onError={fallback(p.name)} loading="lazy" className="ph transition-transform duration-300 group-hover:scale-105" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold leading-snug">{p.name}</h3>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{fmtMoney(p.price)}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300" aria-label={'Rated ' + p.rating + ' out of 5'}>★ {p.rating} ({p.reviews})</p>
      </div>
    </a>
  );
}

// ---- Product detail helpers + components (§5.5) ----
const DEFAULT_REVIEWS = [
  { id: 'd1', author: 'Morgan L.', date: '2026-08-30', rating: 5, text: 'Exactly as described — quality is far above the price point.' },
  { id: 'd2', author: 'Taylor R.', date: '2026-08-14', rating: 4, text: 'Great product overall; delivery took a day longer than expected.' },
];
const REVIEWS = [
  { id: 'w1', slug: 'waxed-field-jacket', author: 'Jane D.', date: '2026-08-12', rating: 5, text: 'Great fit, fast shipping.', own: true, images: ['assets/img/waxed-jacket-a.jpg'] },
  { id: 'w2', slug: 'waxed-field-jacket', author: 'Marcus T.', date: '2026-07-03', rating: 4, text: 'Solid waxed cotton, runs slightly large.' },
  { id: 'w3', slug: 'waxed-field-jacket', author: 'Aisha K.', date: '2026-06-21', rating: 5, text: 'Repels drizzle perfectly and broke in fast.', images: ['assets/img/waxed-jacket-a.jpg'] },
];
const reviewsFor = (slug) => {
  const mine = REVIEWS.filter((r) => r.slug === slug);
  if (mine.length) return mine;
  const img = (PRODUCTS.find((p) => p.slug === slug) || {}).img;
  return DEFAULT_REVIEWS.map((r) => ({ ...r, images: img ? [img] : [] }));
};

const catLabel = (id) => ((CATS.find((c) => c.id === id) || {}).label || id);

function Stars({ value, className }) {
  const n = Math.round(value);
  return (
    <span className={cn('tracking-tight text-amber-500 dark:text-amber-400', className)}
          role="img" aria-label={'Rated ' + value + ' out of 5'}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="mt-1.5 flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" aria-label={n + ' star' + (n > 1 ? 's' : '')}
                onClick={() => onChange(n)} aria-pressed={n <= value}
                className={cn('cursor-pointer rounded-md border-0 bg-transparent p-1 transition-transform hover:scale-110 focus:outline-none',
                              'hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill={n <= value ? 'currentColor' : 'none'}
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className={cn('h-7 w-7', n <= value ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-300 dark:text-zinc-700')}>
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, onChange, max, disabled }) {
  const clamp = (n) => Math.min(max, Math.max(1, n));
  return (
    <div className="inline-flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled={disabled || value <= 1}
              aria-label="Decrease quantity" onClick={() => onChange(clamp(value - 1))}><Icon name="minus" className="h-4 w-4" /></Button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled={disabled || value >= max}
              aria-label="Increase quantity" onClick={() => onChange(clamp(value + 1))}><Icon name="plus" className="h-4 w-4" /></Button>
    </div>
  );
}

function ReviewCard({ r, onDelete }) {
  const initials = r.author.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <article className="card bg-[var(--card)]">
      <div className="card-header flex-row items-center justify-between gap-4 p-4 pb-0">
        <div className="flex min-w-0 items-center gap-3">
          <span className="avatar" data-size="default" aria-hidden="true">
            <span className="avatar-fallback">{initials}</span>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{r.author}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{r.date}</p>
          </div>
        </div>
        <Stars value={r.rating} />
      </div>
      <div className="card-content p-4 pt-3">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{r.text}</p>
        {r.images && r.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {r.images.map((src, i) => (
              <img key={i} src={src} alt={r.author + ' photo ' + (i + 1)} onError={fallback('review photo')} loading="lazy"
                   className="h-16 w-16 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800" />
            ))}
          </div>
        )}
      </div>
      {onDelete && (
        <div className="card-footer p-4 pt-0">
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300" onClick={onDelete}>
            <Icon name="trash-2" className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      )}
    </article>
  );
}

function ProductDetailView({ onAddToCart }) {
  const params = new URLSearchParams(location.search);
  const [p] = useState(() => PRODUCTS.find((x) => x.slug === params.get('slug')));
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const [reviews, setReviews] = useState(() => reviewsFor(p ? p.slug : ''));
  const [formOpen, setFormOpen] = useState(false);
  const [formRate, setFormRate] = useState(5);
  const [formText, setFormText] = useState('');
  const [formImgs, setFormImgs] = useState([]);
  const [fileError, setFileError] = useState('');
  const fileRef = useRef(null);

  const addFiles = (files) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imgs.length !== files.length) setFileError('Only image files are allowed');
    const room = 5 - formImgs.length;
    if (room <= 0) { setFileError('A review can have up to 5 photos'); return; }
    setFileError('');
    setFormImgs((prev) => [...prev, ...imgs.slice(0, room)].map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
    if (fileRef.current) fileRef.current.value = '';
  };
  const removeImg = (i) => {
    setFormImgs((prev) => { const url = prev[i].url; URL.revokeObjectURL(url); return prev.filter((_, j) => j !== i); });
  };

  if (!p) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Product not found</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">The product you\u2019re looking for doesn\u2019t exist.</p>
        <a href="./products-page.html" data-variant="outline" className="btn mt-6">Back to products</a>
      </div>
    );
  }

  const oos = p.stock === 0;
  const catLink = './products-page.html?category_id=' + p.cat;
  const views = [p.img, ...(p.gallery || [])].slice(0, 4);
  const related = PRODUCTS.filter((x) => x.slug !== p.slug)
    .sort((a, b) => (b.cat === p.cat ? 1 : 0) - (a.cat === p.cat ? 1 : 0))
    .slice(0, 4);
  const crumbItem = (label, href, last) => (
    <li className="breadcrumb-item">{last
      ? <span className="breadcrumb-page" aria-current="page">{label}</span>
      : <a className="breadcrumb-link" href={href}>{label}</a>}</li>
  );
  const crumbSep = () => <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>;

  const addReview = () => {
    if (!formText.trim()) return;
    setReviews((rs) => [{ id: 'u' + Date.now(), author: 'Jane D.', date: new Date().toISOString().slice(0, 10), rating: formRate, text: formText.trim(), own: true, images: formImgs.map((f) => f.url) }, ...rs]);
    setFormOpen(false);
    setFormText('');
    setFormImgs([]);
    toast('Review posted');
  };
  const deleteReview = (id) => {
    setReviews((rs) => rs.filter((r) => r.id !== id));
    toast('Review deleted');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          {crumbItem('Home', './home-page.html')}{crumbSep()}
          {crumbItem('Products', './products-page.html')}{crumbSep()}
          {crumbItem(catLabel(p.cat), catLink)}{crumbSep()}
          {crumbItem(p.name, null, true)}
        </ol>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900">
            <img src={views[thumb]} data-ph={p.name + ' photo'} alt={p.name + ' — photo ' + (thumb + 1)}
                 onError={fallback(p.name)} loading="eager" className="ph" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {views.map((v, i) => (
              <button key={i} type="button" aria-label={'View photo ' + (i + 1)} aria-current={i === thumb}
                      onClick={() => setThumb(i)}
                      className={cn('block aspect-square overflow-hidden rounded-xl border-2 bg-white dark:bg-zinc-900 transition-colors',
                                     i === thumb ? 'border-zinc-900 dark:border-zinc-100' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700')}>
                <img src={v} alt="" onError={fallback(p.name + ' photo')} loading="lazy" className="ph" />
              </button>
            ))}
          </div>
        </div>

        {/* Product info panel */}
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <a href={catLink} className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-300">{catLabel}</a>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            {oos
              ? <Badge variant="destructive">Out of stock</Badge>
              : <Badge variant={p.stock <= 10 ? 'outline' : 'default'}>{p.stock <= 10 ? 'Only ' + p.stock + ' left' : 'In stock'}</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={p.rating} />
            <a href="#reviews" className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400">{p.reviews} reviews</a>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{fmtMoney(p.price)}</p>

          <hr className="separator my-6" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Quantity</span>
            {!oos && p.stock <= 10 && <span className="text-xs text-zinc-500 dark:text-zinc-400">{p.stock} available</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Stepper value={qty} onChange={setQty} max={p.stock} disabled={oos} />
            <Button className="min-w-[10rem] flex-1" disabled={oos} onClick={() => onAddToCart(p, qty)}>Add to Cart</Button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">SKU</dt>
            <dd className="font-medium uppercase">HS-{p.slug.slice(0, 8)}</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Shipping</dt>
            <dd className="font-medium">Free over $50</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Returns</dt>
            <dd className="font-medium">30 days</dd>
          </dl>
        </div>
      </div>

      {/* Description (full width, spec §5.5) */}
      <section className="mt-10">
        <div className="card">
          <div className="card-header"><h2 className="card-title">Description</h2></div>
          <div className="card-content pt-4">
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{p.desc}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
              <li>Built from durable, weather-ready materials</li>
              <li>Your pick — style, finish and size at checkout</li>
              <li>Free shipping over $50 · 30-day free returns</li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="separator my-12" />

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Customer Reviews</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Stars value={p.rating} /> <span className="font-medium text-zinc-700 dark:text-zinc-200">{p.rating}</span> ({p.reviews})
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>Post Review</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {reviews.map((r) => <ReviewCard key={r.id} r={r} onDelete={r.own ? () => deleteReview(r.id) : null} />)}
        </div>
      </section>

      {/* Related products */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">You might also like</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((x) => <ProductCard key={x.slug} p={x} />)}
        </div>
      </section>

      {/* Post-review drawer — native <dialog class="sheet"> */}
      <Sheet side="right" className="w-full max-w-[420px]" open={formOpen} onClose={() => setFormOpen(false)} aria-label="Post a review">
        <div className="sheet-content flex h-full flex-col">
          <div className="sheet-header shrink-0">
            <h2 className="sheet-title">Post a Review</h2>
          </div>
          <button type="button" className="sheet-close-x" aria-label="Close review form" onClick={() => setFormOpen(false)}>
            <Icon name="x" className="h-4 w-4" />
          </button>
          <div className="sheet-body min-h-0 flex-1 overflow-y-auto">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Reviewing <span className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</span></p>
            <span className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200">Your rating</span>
            <StarPicker value={formRate} onChange={setFormRate} />
            <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="review-text">Your review</label>
            <textarea id="review-text" className="textarea mt-1.5" placeholder="Share what you liked or disliked..."
                      value={formText} onChange={(e) => setFormText(e.target.value)} />

            <span className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200">Photos <span className="font-normal text-zinc-400">(optional, up to 5)</span></span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {formImgs.map((f, i) => (
                <span key={f.url} className="relative inline-block">
                  <img src={f.url} alt={f.name} className="h-16 w-16 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800" />
                  <button type="button" aria-label="Remove photo"
                          onClick={() => removeImg(i)}
                          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    <Icon name="x" className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                     onChange={(e) => addFiles(e.target.files)} aria-label="Upload review photos" />
              <Button variant="outline" size="sm" type="button" disabled={formImgs.length >= 5}
                      onClick={() => fileRef.current && fileRef.current.click()}>
                <Icon name="image-plus" className="mr-1.5 h-4 w-4" /> Add photos
              </Button>
            </div>
            {fileError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{fileError}</p>}
          </div>
          <div className="mt-4 shrink-0 space-y-2">
            <Button className="w-full" disabled={!formText.trim()} onClick={addReview}>Submit review</Button>
            <Button variant="outline" className="w-full" onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

// ---- SortSelect — shadcn/ui Combobox (select-like, non-native) (§5.4) ----
const SORT_OPTIONS = [
  { id: 'newest',     label: 'Newest' },
  { id: 'price_asc',  label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'popular',    label: 'Popular' },
];
function SortSelect({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const searchRef = useRef(null);
  const popId = id + '-sort-pop';
  const listId = id + '-sort-list';
  const options = SORT_OPTIONS.filter((o) => !q.trim() || o.label.toLowerCase().includes(q.trim().toLowerCase()));
  useEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const onToggle = (e) => {
      const isOpen = e.newState === 'open';
      setOpen(isOpen);
      if (isOpen) { setQ(''); if (searchRef.current) searchRef.current.focus(); }
      else if (btnRef.current) btnRef.current.focus();
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);
  const onTriggerClick = () => {
    const pop = popRef.current, btn = btnRef.current;
    if (!pop || !btn) return;
    if (!pop.matches(':popover-open')) {
      const r = btn.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.top = r.bottom + 6 + 'px';
      pop.style.left = r.left + 'px';
    }
    pop.togglePopover();
  };
  const choose = (sel) => {
    onChange(sel);
    if (popRef.current) popRef.current.hidePopover();
  };
  return (
    <div className="combobox relative min-w-0">
      <button type="button" ref={btnRef}
              className="btn combobox-trigger w-auto" data-variant="outline"
              aria-haspopup="listbox" aria-expanded={open} aria-controls={popId}
              onClick={onTriggerClick}>
        <span className="combobox-value truncate">{SORT_OPTIONS.find((o) => o.id === value).label}</span>
        <Icon name="chevrons-up-down" className="combobox-chevron h-4 w-4" />
      </button>
      <div ref={popRef} id={popId} popover="auto" className="combobox-content w-64 max-w-[calc(100vw-2rem)]">
        <div className="combobox-search">
          <Icon name="search" className="combobox-search-icon h-4 w-4" />
          <input ref={searchRef} type="text" role="combobox" className="combobox-search-input"
                 aria-expanded="true" aria-controls={listId} aria-autocomplete="list"
                 autoComplete="off" placeholder="Search sort options..."
                 value={q} onChange={(e) => setQ(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter' && options.length === 1) choose(options[0].id); }} />
        </div>
        <div id={listId} role="listbox" className="combobox-listbox" aria-label="Sort options">
          <div className="combobox-empty" hidden={options.length > 0}>No results found.</div>
          {options.map((o) => (
            <div key={o.id} role="option" className="combobox-item" aria-selected={o.id === value}
                 data-value={o.id} onClick={() => choose(o.id)}>
              <span className="truncate">{o.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- FilterSidebar content — shared by desktop sidebar + mobile drawer (§5.4) ----
function FilterControls({ f, set, closeDrawer, group = 'cat' }) {
  const onApply = () => {
    if (f.min != null && f.max != null && f.min > f.max) { toast("Min price can't exceed max", true); return; }
    toast('Filters applied');
    if (closeDrawer) closeDrawer();
  };
  const toggleRating = (r) => set({ rating: f.rating === r ? null : r });
  const clear = () => { set({ cat: 'all', min: null, max: null, rating: null }); toast('Filters cleared'); };
  const radio = (id, label, count) => (
    <div className="radio-item">
      <input className="radio" type="radio" name={group} id={group + '-' + id} value={id}
             checked={f.cat === id} onChange={() => set({ cat: id })} />
      <label htmlFor={group + '-' + id}>{label}</label>
      {count != null && <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600">{count}</span>}
    </div>
  );
  return (
    <div>
      <fieldset className="radio-group">
        <legend className="text-sm font-semibold">Category</legend>
        {radio('all', 'All', PRODUCTS.length)}
        {CATS.map((c) => radio(c.id, c.label, countByCat(c.id)))}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Price</legend>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Input type="number" min="0" step="0.01" placeholder="Min" aria-label="Minimum price"
                 value={f.min ?? ''} onChange={(e) => set({ min: e.target.value === '' ? null : parseFloat(e.target.value) })} />
          <span className="text-zinc-400">–</span>
          <Input type="number" min="0" step="0.01" placeholder="Max" aria-label="Maximum price"
                 value={f.max ?? ''} onChange={(e) => set({ max: e.target.value === '' ? null : parseFloat(e.target.value) })} />
        </div>
        <Button onClick={onApply} className="mt-2 w-full">Apply</Button>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Rating</legend>
        <div className="mt-2 flex flex-wrap gap-2">
{[4, 3, 2].map((r) => (
            <button key={r} type="button" onClick={() => toggleRating(r)} data-variant={f.rating === r ? 'default' : 'outline'}
                    className={cn('btn rounded-full px-3 text-sm', f.rating === r && 'font-semibold')}>
              ★ {r}+
            </button>
          ))}
        </div>
      </fieldset>

<Button variant="link" className="mt-6" onClick={clear}>Clear all filters</Button>
    </div>
  );
}

// ---- ProductsView (§5.4) ----
function ProductsView() {
  const params = new URLSearchParams(location.search);
  const [f, setF] = useState(() => ({
    cat: params.get('category_id') || 'all',
min: params.get('min_price') ? parseFloat(params.get('min_price')) : null,
    max: params.get('max_price') ? parseFloat(params.get('max_price')) : null,
    rating: params.get('rating') ? parseFloat(params.get('rating')) : null,
  }));
  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
  const [sort, setSort] = useState(params.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState(params.get('search') || params.get('q'));
  const [baseUrl] = useState('./products-page.html');

  // Loading state: 8 skeleton cards, then live grid (§6.4)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  // Query sync: URL params drive state (spec §5.4)
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.cat !== 'all') p.set('category_id', f.cat);
if (f.min != null) p.set('min_price', f.min);
    if (f.max != null) p.set('max_price', f.max);
    if (f.rating != null) p.set('rating', f.rating);
    if (sort !== 'newest') p.set('sort', sort);
    history.replaceState(null, '', baseUrl + (p.toString() ? '?' + p.toString() : ''));
}, [f, sort]);

  const filtered = PRODUCTS.filter((p) =>
    (f.cat === 'all' || p.cat === f.cat) &&
    (f.min == null || p.price >= f.min) &&
    (f.max == null || p.price <= f.max) &&
    (f.rating == null || p.rating >= f.rating));
  const sorted = [...filtered].sort((a, b) =>
    sort === 'price_asc' ? a.price - b.price :
    sort === 'price_desc' ? b.price - a.price : 0);
  const activeFilters = (f.cat !== 'all' ? 1 : 0) + (f.min != null || f.max != null ? 1 : 0) + (f.rating != null ? 1 : 0);

return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
          <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
          {f.cat === 'all' ? (
            <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">Products</span></li>
          ) : (
            <>
              <li className="breadcrumb-item"><a className="breadcrumb-link" href="./products-page.html">Products</a></li>
              <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
              <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">{catLabel(f.cat)}</span></li>
            </>
          )}
        </ol>
      </nav>

      {q && (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm">
            Results for <strong className="font-semibold">{q}</strong>
            <button type="button" aria-label="Clear search" onClick={() => { setQ(null); history.replaceState(null, '', baseUrl); }} className="hover:text-zinc-900 dark:hover:text-zinc-50">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </span>
        </div>
      )}

      {/* Mobile toolbar: Filters drawer trigger + SortSelect (≤640px per §5.4) */}
<div className="mt-6 flex items-center gap-2 sm:gap-3 lg:hidden">
        <Button variant="outline" className="shrink-0" onClick={(e) => { e.stopPropagation(); setOpenId('filters'); }}>
          <Icon name="sliders-horizontal" className="mr-2 h-4 w-4 shrink-0" /> Filters
          {activeFilters > 0 && <Badge className="ml-2 shrink-0">{activeFilters}</Badge>}
        </Button>
        <div className="min-w-0 flex-1">
          <SortSelect id="mobile" value={sort} onChange={setSort} />
        </div>
        <p className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">{sorted.length} result{sorted.length === 1 ? '' : 's'}</p>
      </div>

      <div className="mt-6 flex gap-8">
        {/* FilterSidebar — desktop, w=260 (§5.4) */}
<aside className="hidden lg:block w-[260px] shrink-0" aria-label="Filters">
          <FilterControls f={f} set={set} group="cat-lg" />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="hidden lg:flex items-center justify-between gap-4">
<SortSelect id="desktop" value={sort} onChange={setSort} />
            <p id="resultCount" className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">{sorted.length} result{sorted.length === 1 ? '' : 's'}</p>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/4" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 py-16 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">No products match your filters</p>
              <button type="button" onClick={() => { set({ cat: 'all', min: null, max: null, rating: null }); }} className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 underline hover:no-underline">Clear filters</button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          )}

{/* Pagination (§5.4) — shadcn pagination */}
          <nav className="pagination mt-10" aria-label="Pagination">
            <ul className="pagination-list">
              <li>
                <Button variant="outline" size="icon" className="rounded-full" aria-label="Previous page" disabled={page <= 1}
                        onClick={() => setPage(Math.max(1, page - 1))}><Icon name="chevron-left" /></Button>
              </li>
              {[1, 2, 3, '…', 10].map((n, i) => (
                n === '…' ? <li key={i}><span className="pagination-ellipsis">…</span></li> :
                <li key={i}>
                  <Button size="icon" variant={page === n ? 'default' : 'ghost'} className={cn('rounded-full', page === n && 'font-semibold')}
                          data-page={n} aria-current={page === n ? 'page' : undefined} onClick={() => setPage(n)}>{n}</Button>
                </li>
              ))}
              <li>
                <Button variant="outline" size="icon" className="rounded-full" aria-label="Next page" disabled={page >= 10}
                        onClick={() => setPage(Math.min(10, page + 1))}><Icon name="chevron-right" /></Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

{/* Mobile filter drawer — native <dialog class="sheet">, right slide (shadcn) */}
      <Sheet side="right" open={openId === 'filters'} onClose={() => setOpenId(null)} aria-label="Filters"
             className="w-full max-w-[320px]">
        <div className="sheet-content flex h-full flex-col">
          <div className="sheet-header shrink-0">
            <h2 className="sheet-title">Filters</h2>
          </div>
          <button type="button" className="sheet-close-x" aria-label="Close filters" onClick={() => setOpenId(null)}>
            <Icon name="x" className="h-4 w-4" />
          </button>
          <div className="sheet-body min-h-0 flex-1 overflow-y-auto">
            <FilterControls f={f} set={set} closeDrawer={() => setOpenId(null)} group="cat-m" />
          </div>
          <div className="mt-4 shrink-0">
            <Button className="w-full" onClick={() => setOpenId(null)}>Show results</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

// ---- HomeView (§5.3) ----
function HomeView() {
  const featured = PRODUCTS.filter((p) => ['waxed-field-jacket', 'weekender-duffel', 'trail-mug', 'daypack'].includes(p.slug));
  return (
    <>
      <section className="relative h-[420px] overflow-hidden">
        <img src="https://picsum.photos/id/1015/1280/420" data-ph="Horizon Supply Co." alt="" onError={fallback('Horizon Supply Co.')} className="ph absolute inset-0" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent"></div>
        <div className="relative z-10 mx-auto max-w-7xl h-full px-4 flex flex-col items-start justify-center">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-200 mb-3">SS26 Collection</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl">Objects with a point of view</h1>
          <p className="mt-3 text-zinc-200 max-w-md">Carry gear built for the days you stay out longer than you said you would.</p>
          <a href="./products-page.html" className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-white px-6 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100">Shop Now</a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Shop by Category</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATS.map((c) => (
            <a key={c.id} href={'./products-page.html?category_id=' + c.id} className="group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img src={c.img} data-ph={c.label} alt={c.label} onError={fallback(c.label)} loading="lazy" className="ph transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold">{c.label}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{countByCat(c.id)} items</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Featured Products</h2>
          <a href="./products-page.html" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:underline">View all <span aria-hidden="true">→</span></a>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>
    </>
  );
}

// ---- Shared chrome: header, footer, drawers (spec §3.1, §5.6) ----
function Header({ cartCount, onCart, onMenu, dark, onTheme }) {
  const [acctOpen, setAcctOpen] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const acctBoxRef = useRef(null);
  const acctMenuRef = useRef(null);
  useEffect(() => {
    const el = acctMenuRef.current;
    if (!el) return;
    const onToggle = (e) => {
      const isOpen = e.newState === 'open';
      setAcctOpen(isOpen);
      if (isOpen && acctBoxRef.current && !CSS.supports('position-anchor', '--dummy-anchor')) {
        const r = acctBoxRef.current.getBoundingClientRect();
        const w = el.getBoundingClientRect().width;
        el.style.position = 'fixed';
        el.style.top = r.bottom + 4 + 'px';
        el.style.left = Math.max(8, r.right - w) + 'px';
        el.style.margin = '0';
      }
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);
  const onAcctClick = () => {
    const menu = acctMenuRef.current;
    if (menu) menu.togglePopover();
  };
  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-zinc-200 dark:bg-[#09090B]/90 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl h-full flex items-center gap-6 px-4">
        <a href="./home-page.html" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Horizon Supply Co.</span>
        </a>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          <a href="./home-page.html" className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Home</a>
          <a href="./products-page.html" className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Products</a>
        </nav>

<div className="relative hidden md:block w-40 lg:w-[420px] shrink min-w-0">
          <div className="relative flex items-center">
            <Icon name="search" className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <input type="text" aria-label="Search products" placeholder="Search products…"
                   onFocus={() => setSugOpen(true)} onBlur={() => setTimeout(() => setSugOpen(false), 150)}
                   className="input pl-9" />
          </div>
          {sugOpen && (
            <div className="combobox-content absolute left-0 right-0 top-11 z-20 py-1">
              <p className="px-4 py-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Recent</p>
              {['waxed field jacket', 'canvas tote', 'insulated bottle'].map((s) => (
                <a key={s} href={'./products-page.html?search=' + encodeURIComponent(s)} className="combobox-item px-4 py-2 text-sm">{s}</a>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="icon" aria-label="Toggle dark mode" onClick={onTheme}>
            <Icon name={dark ? 'sun' : 'moon'} className="h-5 w-5" />
          </Button>
          <Button variant="icon" aria-label={'Open cart, ' + cartCount + ' items'} onClick={onCart} className="relative">
            <Icon name="shopping-cart" className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 px-1 text-[10px] font-semibold text-white dark:text-zinc-900">{cartCount}</span>
          </Button>
<div ref={acctBoxRef} className="hidden sm:block">
            <Button variant="ghost" className="gap-2 px-3"
                    aria-label="Account menu" aria-haspopup="menu" aria-expanded={acctOpen} aria-controls="account-menu"
                    data-dropdown-trigger="account-menu" onClick={onAcctClick}>
              <Icon name="user" className="h-5 w-5" /> <span>Jane</span>
              <Icon name="chevron-down" className="h-4 w-4 opacity-60" />
            </Button>
            <div ref={acctMenuRef} id="account-menu" role="menu" popover="auto" className="dropdown-content" aria-label="Account menu">
              <div className="dropdown-label">Signed in as Jane Doe · jane@mail.com</div>
              <a role="menuitem" className="dropdown-item" href="./profile-page.html">My Profile</a>
              <a role="menuitem" className="dropdown-item" href="./orders-page.html">My Orders</a>
              <a role="menuitem" className="dropdown-item" href="./admin-page.html">Admin Panel</a>
              <div className="dropdown-separator" role="separator"></div>
              <a role="menuitem" className="dropdown-item text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white" data-variant="destructive" href="./login-page.html">Logout</a>
            </div>
          </div>
          <Button variant="icon" aria-label="Open menu" className="md:hidden" onClick={onMenu}>
            <Icon name="menu" className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <p className="font-display text-xl font-extrabold">Horizon Supply Co.</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Objects with a point of view.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li><a href="./home-page.html" className="hover:underline">Home</a></li>
            <li><a href="./products-page.html" className="hover:underline">Products</a></li>
            <li><a href="./orders-page.html" className="hover:underline">My Orders</a></li>
            <li><a href="./profile-page.html" className="hover:underline">My Profile</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li><a href="#" className="hover:underline">Help Center</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Returns</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Follow us</h3>
          <div className="mt-3 flex gap-3">
            {[['facebook', 'Facebook'], ['x', 'X (Twitter)'], ['instagram', 'Instagram']].map(([slug, label]) => (
              <a key={slug} href="#" aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700">
                <img src={'https://cdn.simpleicons.org/' + slug + '/18181B'} alt={label} onError={fallback(label)} className="social-icon h-4 w-4" />
              </a>
            ))}
            <a href="#" aria-label="LinkedIn" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700">
              <svg role="img" viewBox="0 0 24 24" className="social-icon h-4 w-4" fill="#18181B" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
            </a>
          </div>
          <p className="mt-6 text-sm font-semibold">We accept</p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{'Visa\u00A0\u00A0·\u00A0\u00A0Mastercard\u00A0\u00A0·\u00A0\u00A0Amex'}</p>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} Horizon Supply Co. — All rights reserved</p>
      </div>
    </footer>
  );
}

const INITIAL_CART = [
  { key: 'waxed-field-jacket', name: 'Waxed Field Jacket', img: 'assets/img/waxed-jacket-a.jpg', price: 189.00, quantity: 2 },
{ key: 'weekender-duffel',   name: 'Weekender Duffel',   img: 'assets/img/duffel-a.jpg',       price: 168.00, quantity: 1 },
];

// ---- Sheet — shadcn slide-in panel on a native <dialog class="sheet">.
// React owns `open` and drives showModal()/close(); focus trap, ESC, backdrop
// click and the [open] transitions all come from the browser + sheet.css. ----
function Sheet({ side = 'right', open, onClose, className, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) { try { el.showModal(); } catch (err) { /* already open */ } }
    else if (!open && el.open) { el.close(); }
  }, [open]);
  useEffect(() => {
    const el = ref.current;
    const onBackdrop = (e) => { if (e.target === el) onClose(); };
    el.addEventListener('click', onBackdrop);
    el.addEventListener('close', onClose);
    return () => { el.removeEventListener('click', onBackdrop); el.removeEventListener('close', onClose); };
  }, []);
  return (
    <dialog {...rest} ref={ref} className={cn('sheet', className)} data-side={side} tabIndex={-1}>
      {children}
    </dialog>
  );
}

function CartDrawer({ open, onClose, lines, setLines }) {
  const changeQty = (key, delta) => setLines((ls) =>
    ls.map((l) => l.key === key ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l));
  const remove = (key) => setLines((ls) => ls.filter((l) => l.key !== key));
  const sub_total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
return (
    <Sheet side="right" className="w-full max-w-[420px]" open={open} onClose={onClose} aria-label="Cart">
      <div className="sheet-content flex h-full flex-col">
        <div className="sheet-header shrink-0">
          <h2 className="sheet-title">Cart <span className="text-zinc-500 dark:text-zinc-400">({count})</span></h2>
        </div>
        <button type="button" className="sheet-close-x" aria-label="Close cart" onClick={onClose}><Icon name="x" className="h-4 w-4" /></button>
        <div className="sheet-body min-h-0 flex-1 space-y-4 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="shopping-bag" className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Your cart is empty</p>
              <a href="./products-page.html" onClick={onClose} data-variant="outline" className="btn mt-4">Continue shopping</a>
            </div>
          ) : lines.map((l) => (
            <div key={l.key} className="flex gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <img src={l.img} alt="" onError={fallback(l.name)} className="ph" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{l.name}</p>
                  <Button variant="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-400" aria-label={'Remove ' + l.name} onClick={() => remove(l.key)}>
                    <Icon name="trash-2" className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
                    <Button variant="icon" className="h-8 w-8" aria-label="Decrease quantity" disabled={l.quantity <= 1} onClick={() => changeQty(l.key, -1)}>
                      <Icon name="minus" className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{l.quantity}</span>
                    <Button variant="icon" className="h-8 w-8" aria-label="Increase quantity" onClick={() => changeQty(l.key, 1)}>
                      <Icon name="plus" className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-semibold">{fmtMoney(l.price * l.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 shrink-0 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
            <span className="font-semibold">{fmtMoney(sub_total)}</span>
          </div>
          <a href="./checkout-page.html" data-variant="default" className="btn w-full" onClick={onClose}>Checkout</a>
          <a href="./cart-page.html" data-variant="outline" className="btn w-full" onClick={onClose}>View Cart</a>
        </div>
      </div>
    </Sheet>
  );
}

const CART_PRICING = (lines) => {
  const sub_total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = sub_total >= 100 ? 0 : 5;
  const tax = sub_total * 0.0825;
  return { sub_total, shipping, tax, total: sub_total + shipping + tax };
};

function Modal({ open, onClose, title, description, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) { try { el.showModal(); } catch (err) { /* already open */ } }
    else if (!open && el.open) { el.close(); }
  }, [open]);
  useEffect(() => {
    const el = ref.current;
    const onBackdrop = (e) => { if (e.target === el) onClose(); };
    el.addEventListener('click', onBackdrop);
    el.addEventListener('close', onClose);
    return () => { el.removeEventListener('click', onBackdrop); el.removeEventListener('close', onClose); };
  }, []);
  return (
    <dialog ref={ref} className="dialog" tabIndex={-1} aria-label={title}>
      <div className="dialog-content relative">
        <button type="button" className="sheet-close-x" aria-label="Close" onClick={onClose}><Icon name="x" className="h-4 w-4" /></button>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          {description && <p className="dialog-description">{description}</p>}
        </div>
        {children}
      </div>
    </dialog>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="dialog-footer">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

function CartView({ lines, setLines }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const setQty = (key, qty) => setLines((ls) => ls.map((l) => l.key === key ? { ...l, quantity: qty } : l));
  const remove = (key) => setLines((ls) => ls.filter((l) => l.key !== key));
  const maxOf = (key) => (PRODUCTS.find((p) => p.slug === key) || { stock: 99 }).stock;
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const { sub_total, shipping, tax, total } = CART_PRICING(lines);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
          <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
          <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">Cart</span></li>
        </ol>
      </nav>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          Cart <span className="align-middle text-base font-normal text-zinc-500 dark:text-zinc-400">({count} {count === 1 ? 'item' : 'items'})</span>
        </h1>
        {count > 0 && (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
            <Icon name="trash-2" className="mr-1.5 h-4 w-4" /> Clear cart
          </Button>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="py-20 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Icon name="shopping-bag" className="h-9 w-9 text-zinc-400 dark:text-zinc-500" />
          </span>
          <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Add gear you like and it will show up here, ready for checkout.</p>
          <a href="./products-page.html" data-variant="default" className="btn mt-6">Start shopping</a>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {lines.map((l) => (
              <article key={l.key} className="card bg-[var(--card)]">
                <div className="card-content flex gap-4 p-4">
                  <a href={'./product-detail-page.html?slug=' + l.key} className="block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <img src={l.img} alt="" onError={fallback(l.name)} className="ph" loading="lazy" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <a href={'./product-detail-page.html?slug=' + l.key} className="text-sm font-medium leading-snug hover:underline">{l.name}</a>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                              aria-label={'Remove ' + l.name} onClick={() => remove(l.key)}>
                        <Icon name="trash-2" className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{fmtMoney(l.price)} each</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Stepper value={l.quantity} max={maxOf(l.key)} onChange={(n) => setQty(l.key, n)} />
                      <p className="text-sm font-semibold tabular-nums">{fmtMoney(l.price * l.quantity)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="card bg-[var(--card)]">
              <div className="card-header p-6 pb-0"><h2 className="text-base font-semibold">Order Summary</h2></div>
              <div className="card-content p-6">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Subtotal</dt>
                    <dd className="font-medium tabular-nums">{fmtMoney(sub_total)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Shipping</dt>
                    <dd className="font-medium tabular-nums">{shipping === 0
                      ? <span className="text-green-600 dark:text-green-500">Free</span>
                      : fmtMoney(shipping)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Tax (8.25%)</dt>
                    <dd className="font-medium tabular-nums">{fmtMoney(tax)}</dd>
                  </div>
                </dl>
                <div className="separator my-4" role="separator" />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold tabular-nums">{fmtMoney(total)}</span>
                </div>
                <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">Free shipping on orders over $100</p>
                <div className="mt-6 space-y-2">
                  <a href="./checkout-page.html" data-variant="default" className="btn w-full">Checkout</a>
                  <a href="./products-page.html" data-variant="outline" className="btn w-full">Continue shopping</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Clear cart?"
                   description={'Remove all ' + count + " items from your cart. This can't be undone."}
                   confirmLabel="Clear cart"
                   onConfirm={() => { setLines([]); toast('Cart cleared'); }} />
    </div>
  );
}

const CHECKOUT_ADDRESSES = [
  { label: 'Home (default)', hint: '123 Harbor Ave, Portland, OR 97205' },
  { label: 'Work', hint: '400 Industry Rd, Suite 200, Portland, OR 97210' },
  { label: 'New address', hint: 'Enter a fresh address below' },
];
const ADDR_FIELDS = [
  ['line1', 'Address line 1', 'Street and number', { lg: true, required: true }],
  ['line2', 'Address line 2 (optional)', 'Apartment, suite, etc.', { lg: true }],
  ['city', 'City', 'City', { required: true }],
  ['state', 'State', 'State', { required: true }],
  ['zip', 'ZIP code', '12345', { required: true }],
  ['country', 'Country', 'Country', { required: true }],
];

// Non-native select — the same shadcn combobox + popover pattern as SortSelect.
function AddressSelect({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const searchRef = useRef(null);
  const popId = id + '-addr-pop';
  const listId = id + '-addr-list';
  const options = CHECKOUT_ADDRESSES.filter((o) =>
    !q.trim() || o.label.toLowerCase().includes(q.trim().toLowerCase()));
  useEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const onToggle = (e) => {
      setOpen(e.newState === 'open');
      if (e.newState === 'open') { setQ(''); if (searchRef.current) searchRef.current.focus(); }
      else if (btnRef.current) btnRef.current.focus();
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);
  const onTriggerClick = () => {
    const pop = popRef.current, btn = btnRef.current;
    if (!pop || !btn) return;
    if (!pop.matches(':popover-open')) {
      const r = btn.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.top = r.bottom + 6 + 'px';
      pop.style.left = r.left + 'px';
      pop.style.width = btn.offsetWidth + 'px';
    }
    pop.togglePopover();
  };
  const choose = (label) => {
    onChange(label);
    if (popRef.current) popRef.current.hidePopover();
  };
  return (
    <div className="combobox relative">
      <button type="button" ref={btnRef}
              className="btn combobox-trigger w-full" data-variant="outline"
              aria-haspopup="listbox" aria-expanded={open} aria-controls={popId}
              onClick={onTriggerClick}>
        <span className="combobox-value truncate">{value}</span>
        <Icon name="chevrons-up-down" className="combobox-chevron h-4 w-4" />
      </button>
      <div ref={popRef} id={popId} popover="auto" className="combobox-content w-96 max-w-[calc(100vw-2rem)]">
        <div className="combobox-search">
          <Icon name="search" className="combobox-search-icon h-4 w-4" />
          <input ref={searchRef} type="text" role="combobox" className="combobox-search-input"
                 aria-expanded="true" aria-controls={listId} aria-autocomplete="list"
                 autoComplete="off" placeholder="Search addresses..."
                 value={q} onChange={(e) => setQ(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter' && options.length === 1) choose(options[0].label); }} />
        </div>
        <div id={listId} role="listbox" className="combobox-listbox" aria-label="Saved addresses">
          <div className="combobox-empty" hidden={options.length > 0}>No results found.</div>
          {options.map((o) => (
            <div key={o.label} role="option" className="combobox-item" aria-selected={o.label === value}
                 data-value={o.label} onClick={() => choose(o.label)}>
              <span className="truncate">{o.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddressForm({ addr, setAddr, onContinue }) {
  const set = (k, v) => setAddr((a) => ({ ...a, [k]: v }));
  const addrValid = !addr.new && ADDR_FIELDS.every(([k, , , o]) => !o.required || addr[k].trim());
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (addrValid) onContinue(); }}>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <span className="label">Address</span>
          <AddressSelect id="shipping" value={addr.new ? 'New address' : addr.label}
                         onChange={(label) => setAddr((a) => ({ ...a, new: label === 'New address', label }))} />
          {!addr.new && <p className="label-hint">{CHECKOUT_ADDRESSES.find((s) => s.label === addr.label).hint}</p>}
        </div>

        {ADDR_FIELDS.map(([k, label, ph, o]) => (
          <div key={k} className="space-y-1.5">
            <label htmlFor={'addr-' + k} className="label">{label}</label>
            <Input id={'addr-' + k} className={o.lg ? undefined : 'w-full sm:w-48'} placeholder={ph} value={addr[k]}
                   onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-sm font-medium">Set as default address</span>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Pre-fill checkout with this address next time.</p>
            </div>
            <input id="addr-default" type="checkbox" role="switch" className="switch" checked={addr.default}
                   onChange={(e) => set('default', e.target.checked)} />
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={!addrValid}>Continue</Button>
      </div>
    </form>
  );
}

function PaymentForm({ total, onPay }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const pay = () => {
    setBusy(true); setFailed(false);
    onPay && onPay();
    window.setTimeout(() => {
      setBusy(false);
      if (Math.random() < 0.85) setDone(true); else { setFailed(true); toast('422 PAYMENT_FAILED — try again'); }
    }, 1100);
  };
  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <Icon name="check" className="h-8 w-8 text-green-600 dark:text-green-400" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Payment complete (test mode)</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No card was charged — this is a wireframe prototype.</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <a href="./products-page.html" data-variant="default" className="btn">Back to store</a>
          <a href="./order-success.html" data-variant="outline" className="btn">View order</a>
        </div>
      </div>
    );
  }
  return (
    <div>
      <fieldset className="radio-group">
        {[['card', 'Credit/Debit Card', 'Stripe secure checkout — you\u2019ll be redirected to pay.']].map(([id, label, hint]) => (
          <div key={id} className="radio-item flex-col !items-start gap-1 py-3">
            <div className="flex items-center gap-2">
              <input className="radio" type="radio" name="payment" id={'pm-' + id} value={id} defaultChecked />
              <label htmlFor={'pm-' + id}>{label}</label>
            </div>
            <p className="text-xs text-zinc-500 pl-7 dark:text-zinc-400">{hint}</p>
          </div>
        ))}
      </fieldset>
      {failed && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Payment didn't go through (simulated). Check the test card below and try again.
        </p>
      )}
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Test card: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">4242 4242 4242 4242</code>
      </p>
      <Button className="mt-5" disabled={busy} onClick={pay}>
        {busy ? 'Processing' : 'Pay ' + fmtMoney(total)}
      </Button>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">You'll be redirected to Stripe's secure checkout.</p>
    </div>
  );
}

function CheckoutSteps({ step }) {
  const chips = [
    { n: 1, label: 'Shipping Address', done: step > 1 },
    { n: 2, label: 'Review & Pay', done: step > 2 },
  ];
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <li key={c.n} className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium',
                              step === c.n ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                              : c.done ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400'
                              : 'border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400')}>
            {c.done ? <Icon name="check" className="h-4 w-4" /> : <span className="tabular-nums">{c.n}</span>}
            {c.label}
          </span>
          {i < chips.length - 1 && <Icon name="chevron-right" className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />}
        </li>
      ))}
    </ol>
  );
}

function CheckoutView({ lines }) {
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const { sub_total, shipping, tax, total } = CART_PRICING(lines);
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({
    label: 'Home (default)', new: false, default: true,
    line1: '123 Harbor Ave', line2: '', city: 'Portland', state: 'OR', zip: '97205', country: 'United States',
  });

  const breadcrumb = (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
        <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
        <li className="breadcrumb-item"><a className="breadcrumb-link" href="./cart-page.html">Cart</a></li>
        <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
        <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">Checkout</span></li>
      </ol>
    </nav>
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
        {breadcrumb}
        <div className="py-20 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Icon name="shopping-cart" className="h-9 w-9 text-zinc-400 dark:text-zinc-500" />
          </span>
          <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Add some gear before checking out.</p>
          <a href="./products-page.html" data-variant="default" className="btn mt-6">Start shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      {breadcrumb}
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <CheckoutSteps step={step} />
          {step === 1 ? (
            <div className="card bg-[var(--card)]">
              <div className="card-header p-6 pb-0"><h2 className="text-base font-semibold">Shipping Address</h2></div>
              <div className="card-content p-6 pt-5">
                <AddressForm addr={addr} setAddr={setAddr} onContinue={() => setStep(2)} />
              </div>
            </div>
          ) : (
            <div className="card bg-[var(--card)]">
              <div className="card-header p-6 pb-0 flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold">Review &amp; Pay</h2>
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                        onClick={() => setStep(1)}>
                  <Icon name="chevron-left" className="mr-1 h-4 w-4" /> Edit address
                </Button>
              </div>
              <div className="card-content p-6 pt-5">
                <dl className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <dt className="sr-only">Shipping to</dt>
                  <dd className="font-medium">{addr.label}</dd>
                  <dd className="mt-1 text-zinc-500 dark:text-zinc-400">
                    {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}, {addr.city}, {addr.state} {addr.zip}
                  </dd>
                </dl>
                <div className="mt-6">
                  <PaymentForm total={total} />
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card bg-[var(--card)]">
            <div className="card-header p-6 pb-0"><h2 className="text-base font-semibold">Order Summary</h2></div>
            <div className="card-content p-6">
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li key={l.key} className="flex items-center gap-3">
                    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <img src={l.img} alt="" onError={fallback(l.name)} className="ph" loading="lazy" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.name}</span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">Qty {l.quantity}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{fmtMoney(l.price * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="separator my-4" role="separator" />
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Subtotal</dt>
                  <dd className="font-medium tabular-nums">{fmtMoney(sub_total)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Shipping</dt>
                  <dd className="font-medium tabular-nums">{shipping === 0
                    ? <span className="text-green-600 dark:text-green-500">Free</span> : fmtMoney(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Tax (8.25%)</dt>
                  <dd className="font-medium tabular-nums">{fmtMoney(tax)}</dd>
                </div>
              </dl>
              <div className="separator my-4" role="separator" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-semibold tabular-nums">{fmtMoney(total)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">{count} {count === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OrderSuccessView() {
  const [resolving, setResolving] = useState(true);
  const orderNo = (() => { try { return new URLSearchParams(window.location.search).get('session_id') || 'ord_' + Date.now().toString(36); } catch (e) { return 'ord_' + Date.now().toString(36); } })();
  useEffect(() => { const t = window.setTimeout(() => setResolving(false), 1400); return () => window.clearTimeout(t); }, []);
  const { sub_total, shipping, tax, total } = CART_PRICING(INITIAL_CART);
  const count = INITIAL_CART.reduce((s, l) => s + l.quantity, 0);

  const breadcrumb = (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
        <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
        <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">Order Confirmation</span></li>
      </ol>
    </nav>
  );

  if (resolving) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
        {breadcrumb}
        <div className="flex flex-col items-center py-20 text-center">
          <span className="skeleton mb-6 h-20 w-20 rounded-full" />
          <span className="skeleton mb-3 h-5 w-60 rounded-md" />
          <span className="skeleton h-4 w-44 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      {breadcrumb}

      <div className="mt-6 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <Icon name="check" className="h-10 w-10 text-green-600 dark:text-green-400" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold">Thank you for your order!</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Order <span className="font-mono text-zinc-900 dark:text-zinc-100">{orderNo}</span></p>
        <Badge className="mt-3 bg-green-600 text-white">PAID</Badge>
      </div>

      <div className="card bg-[var(--card)] mt-8">
        <div className="card-content p-6">
          <ul className="space-y-3">
            {INITIAL_CART.map((l) => (
              <li key={l.key} className="flex items-center gap-3">
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <img src={l.img} alt="" onError={fallback(l.name)} className="ph" loading="lazy" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{l.name}</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">Qty {l.quantity}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{fmtMoney(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="separator my-4" role="separator" />

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Subtotal</dt>
              <dd className="font-medium tabular-nums">{fmtMoney(sub_total)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Shipping</dt>
              <dd className="font-medium tabular-nums">{shipping === 0 ? <span className="text-green-600 dark:text-green-500">Free</span> : fmtMoney(shipping)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Tax (8.25%)</dt>
              <dd className="font-medium tabular-nums">{fmtMoney(tax)}</dd>
            </div>
          </dl>

          <div className="separator my-4" role="separator" />

          <div className="flex items-center justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-semibold tabular-nums">{fmtMoney(total)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">Visa •••• 4242</p>
          <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{count} {count === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="./products-page.html" data-variant="default" className="btn min-w-[12rem]">Continue Shopping</a>
        <a href="./orders-page.html" data-variant="outline" className="btn min-w-[12rem]">View My Orders</a>
      </div>
    </div>
  );
}

// ---- Orders (§5.9) ----
const ORDER_STATUS = {
  PENDING:   { cls: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  PAID:      { cls: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  SHIPPED:   { cls: 'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  DELIVERED: { cls: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  CANCELLED: { cls: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};
function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.PENDING;
  return <Badge className={s.cls}>{status}</Badge>;
}

const ORDERS = [
  { id: '10f2c8ab-4d5f-4b7f-a9a0-3d4e5f6a7b8c', date: '2026-08-15', status: 'PAID',
    addr: { name: 'Jane Doe', line: '123 Harbor Ave, Portland, OR 97205, US' },
    lines: [{ key: 'waxed-field-jacket', name: 'Waxed Field Jacket', img: 'assets/img/waxed-jacket-a.jpg', price: 189.00, quantity: 2 },
            { key: 'weekender-duffel',   name: 'Weekender Duffel',   img: 'assets/img/duffel-a.jpg',       price: 168.00, quantity: 1 }] },
  { id: '9ae12fcd-7e8a-4c2b-a1d2-3f4a5b6c7d8e', date: '2026-08-12', status: 'SHIPPED',
    addr: { name: 'Jane Doe', line: '123 Harbor Ave, Portland, OR 97205, US' },
    lines: [{ key: 'trail-mug', name: 'Trail Mug', img: 'assets/img/mug-a.jpg', price: 42.00, quantity: 2 }] },
  { id: '2b11ad0a-1c2d-4e5f-8a9b-0c1d2e3f4a5b', date: '2026-07-30', status: 'DELIVERED',
    addr: { name: 'Jane Doe', line: '123 Harbor Ave, Portland, OR 97205, US' },
    lines: [{ key: 'daypack', name: 'Daypack', img: 'assets/img/daypack-a.jpg', price: 8.95, quantity: 1, reviewed: true }] },
  { id: '77ee0415-6a7b-8c9d-0e1f-2a3b4c5d6e7f', date: '2026-07-18', status: 'DELIVERED',
    addr: { name: 'Jane Doe', line: '123 Harbor Ave, Portland, OR 97205, US' },
    lines: [{ key: 'steel-bottle', name: 'Steel Bottle 1L', img: 'assets/img/bottle-b.jpg', price: 28.00, quantity: 2 }] },
  { id: 'c3d905f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f', date: '2026-06-25', status: 'PENDING',
    addr: { name: 'Jane Doe', line: '123 Harbor Ave, Portland, OR 97205, US' },
    lines: [{ key: 'insulated-bottle', name: 'Insulated Bottle 750ml', img: 'assets/img/bottle-a.jpg', price: 34.00, quantity: 1 }] },
  { id: 'e8ab34c7-5f6a-7b8c-9d0e-1f2a3b4c5d6e', date: '2026-06-03', status: 'CANCELLED',
    addr: { name: 'Jane Doe', line: '400 Industry Rd, Portland, OR 97210, US' },
    lines: [{ key: 'utility-backpack', name: 'Utility Backpack', img: 'assets/img/daypack-b.jpg', price: 98.00, quantity: 1 }] },
];
const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAGE_SIZE = 4;

function OrdersView() {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const filtered = filter === 'All' ? ORDERS : ORDERS.filter((o) => o.status === filter);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => setPage(1), [filter]);
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
          <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
          <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">My Orders</span></li>
        </ol>
      </nav>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-semibold tracking-tight">My Orders</h1>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['All', ...ORDER_STATUSES].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)}
                  className="btn rounded-full"
                  data-variant={filter === s ? 'default' : 'outline'}
                  aria-pressed={filter === s}>
            {s}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="py-20 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Icon name={ORDERS.length === 0 ? 'shopping-bag' : 'search'} className="h-9 w-9 text-zinc-400 dark:text-zinc-500" />
          </span>
          <h2 className="mt-6 text-xl font-semibold">{ORDERS.length === 0 ? 'No orders yet' : 'No matching orders'}</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {ORDERS.length === 0 ? 'Your purchases will appear here after your first checkout.' : 'Try another status filter.'}
          </p>
          {ORDERS.length === 0 && <a href="./products-page.html" data-variant="default" className="btn mt-6">Start shopping</a>}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {shown.map((o) => (
            <a key={o.id} href={'./order-detail-page.html?order_id=' + o.id}
               className="card block bg-[var(--card)] transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
              <div className="card-content p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-mono text-sm font-medium"># {o.id.slice(0, 8)}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{o.date}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{o.lines.reduce((s, l) => s + l.quantity, 0)} items</span>
                    <span className="text-sm font-semibold tabular-nums">{fmtMoney(CART_PRICING(o.lines).total)}</span>
                    <Icon name="chevron-right" className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="pagination mt-10" aria-label="Pagination">
          <ul className="pagination-list">
            <li>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Previous page" disabled={page <= 1}
                      onClick={() => setPage(Math.max(1, page - 1))}><Icon name="chevron-left" /></Button>
            </li>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <Button size="icon" variant={page === n ? 'default' : 'ghost'}
                        className={cn('rounded-full', page === n && 'font-semibold')}
                        aria-current={page === n ? 'page' : undefined} onClick={() => setPage(n)}>{n}</Button>
              </li>
            ))}
            <li>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Next page" disabled={page >= pages}
                      onClick={() => setPage(Math.min(pages, page + 1))}><Icon name="chevron-right" /></Button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

function OrderDetailView() {
  const order_id = (() => { try { return new URLSearchParams(window.location.search).get('order_id') || ORDERS[0].id; } catch (e) { return ORDERS[0].id; } })();
  const order = ORDERS.find((o) => o.id === order_id) || ORDERS[0];
  const { sub_total, shipping, tax, total } = CART_PRICING(order.lines);
  const count = order.lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
          <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
          <li className="breadcrumb-item"><a className="breadcrumb-link" href="./orders-page.html">My Orders</a></li>
          <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
          <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page"># {order.id.slice(0, 8)}</span></li>
        </ol>
      </nav>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Order <span className="font-mono">{order.id.slice(0, 8)}</span></h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Placed on {order.date}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="card bg-[var(--card)]">
            <div className="card-header p-6 pb-0"><h2 className="text-base font-semibold">Items</h2></div>
            <div className="card-content p-6">
              <ul className="space-y-5">
                {order.lines.map((l) => (
                  <li key={l.key} className="flex items-start gap-4">
                    <a href={'./product-detail-page.html?slug=' + l.key} className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <img src={l.img} alt="" onError={fallback(l.name)} className="ph" loading="lazy" />
                    </a>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <a href={'./product-detail-page.html?slug=' + l.key} className="text-sm font-medium hover:underline">{l.name}</a>
                        <span className="text-sm font-semibold tabular-nums">{fmtMoney(l.price * l.quantity)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{fmtMoney(l.price)} each × {l.quantity}</p>
                      {order.status === 'DELIVERED' && (
                        l.reviewed
                          ? <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              <Icon name="check" className="h-3.5 w-3.5" /> Reviewed
                            </span>
                          : <a href={'./product-detail-page.html?slug=' + l.key + '#reviews'} className="btn mt-2 inline-flex h-8 rounded-full px-3 text-xs">Review</a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card bg-[var(--card)]">
            <div className="card-header p-6 pb-0">
              <h2 className="flex items-center gap-2 text-base font-semibold"><Icon name="map-pin" className="h-4 w-4 text-zinc-400" /> Shipping Address</h2>
            </div>
            <div className="card-content p-6 pt-3">
              <p className="text-sm font-medium">{order.addr.name}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{order.addr.line}</p>
            </div>
          </section>

          <section className="card bg-[var(--card)]">
            <div className="card-header p-6 pb-0">
              <h2 className="flex items-center gap-2 text-base font-semibold"><Icon name="credit-card" className="h-4 w-4 text-zinc-400" /> Payment</h2>
            </div>
            <div className="card-content p-6 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Visa •••• 4242</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit md:sticky md:top-24">
          <div className="card bg-[var(--card)]">
            <div className="card-header p-6 pb-0"><h2 className="text-base font-semibold">Total</h2></div>
            <div className="card-content p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Subtotal</dt>
                  <dd className="font-medium tabular-nums">{fmtMoney(sub_total)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Shipping</dt>
                  <dd className="font-medium tabular-nums">{shipping === 0 ? <span className="text-green-600 dark:text-green-500">Free</span> : fmtMoney(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Tax (8.25%)</dt>
                  <dd className="font-medium tabular-nums">{fmtMoney(tax)}</dd>
                </div>
              </dl>
              <div className="separator my-4" role="separator" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-semibold tabular-nums">{fmtMoney(total)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">{count} {count === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProfileView() {
  const [user, setUser] = useState({ name: 'Jane Doe', email: 'jane@mail.com', phone: '+1 555 0100' });
  const [avatar, setAvatar] = useState(null);
  const [addresses, setAddresses] = useState([
    { id: 'a1', label: 'Home', line: '123 Harbor Ave, Portland, OR 97205', default: true },
    { id: 'a2', label: 'Work', line: '400 Industry Rd, Portland, OR 97210', default: false },
  ]);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(user);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrDraft, setAddrDraft] = useState({ id: null, label: '', line: '', default: false });
  const [pendDelete, setPendDelete] = useState(null);
  const avatarRef = useRef(null);

  const openEdit = () => { setDraft(user); setEditOpen(true); };
  const saveProfile = () => { setUser(draft); setEditOpen(false); toast('Profile updated'); };
  const openNewAddr = () => { setAddrDraft({ id: null, label: '', line: '', default: addresses.length === 0 }); setAddrOpen(true); };
  const openEditAddr = (a) => { setAddrDraft({ ...a }); setAddrOpen(true); };
  const saveAddr = () => {
    if (!addrDraft.label.trim() || !addrDraft.line.trim()) { toast('Label and address are required'); return; }
    setAddresses((as) => addrDraft.id
      ? as.map((a) => a.id === addrDraft.id ? { ...addrDraft } : a)
      : [...as, { ...addrDraft, id: 'a' + Date.now() }]);
    setAddrOpen(false);
    toast(addrDraft.id ? 'Address updated' : 'Address added');
  };
  const deleteAddr = (id) => {
    setAddresses((as) => {
      const next = as.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.default)) next[0].default = true;
      return next;
    });
    toast('Address deleted');
  };

  const onAvatarPick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast('Avatar must be smaller than 2MB'); return; }
    if (avatar) URL.revokeObjectURL(avatar);
    setAvatar(URL.createObjectURL(f));
    toast('Avatar updated');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-16">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item"><a className="breadcrumb-link" href="./home-page.html">Home</a></li>
          <li className="breadcrumb-separator" aria-hidden="true"><Icon name="chevron-right" /></li>
          <li className="breadcrumb-item"><span className="breadcrumb-page" aria-current="page">My Profile</span></li>
        </ol>
      </nav>

      <h1 className="mt-6 text-2xl font-display font-semibold tracking-tight">My Profile</h1>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="card bg-[var(--card)]">
          <div className="card-content p-6">
            <button type="button" className="relative shrink-0" aria-label="Upload avatar" onClick={() => avatarRef.current.click()}>
              <span className="avatar" data-size="lg" aria-hidden="true">
                {avatar ? <img src={avatar} alt="" className="avatar-image" /> : <span className="avatar-fallback">JD</span>}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow dark:bg-white dark:text-zinc-900">
                <Icon name="image-plus" className="h-4 w-4" />
              </span>
            </button>
            <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onAvatarPick} />

            <h2 className="mt-5 text-lg font-semibold">{user.name}</h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.phone}</p>
            <Button variant="outline" size="sm" className="mt-5" onClick={openEdit}>Edit Profile</Button>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-600">Click the avatar to upload a new photo (2MB max).</p>
          </div>
        </section>

        <section className="card bg-[var(--card)]">
          <div className="card-header flex items-center justify-between gap-4 p-6 pb-0">
            <h2 className="text-base font-semibold">Security</h2>
          </div>
          <div className="card-content p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Passwords, multi-factor auth, and account recovery are managed by
              Zitadel, our identity provider — not by Horizon.
            </p>
            <a href="http://localhost:8080/ui/console"
               target="_blank" rel="noopener noreferrer"
               className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50">
              Manage password in Zitadel <Icon name="external-link" className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="card bg-[var(--card)] md:col-span-2">
          <div className="card-header flex flex-wrap items-center justify-between gap-4 p-6 pb-0">
            <h2 className="text-base font-semibold">Addresses</h2>
            <Button variant="outline" size="sm" onClick={openNewAddr}>
              <Icon name="plus" className="mr-1.5 h-4 w-4" /> Add Address
            </Button>
          </div>
          <div className="card-content p-6">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {addresses.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {a.label}
                      {a.default && <Badge className="border-transparent bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Default</Badge>}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{a.line}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                            aria-label={'Edit ' + a.label} onClick={() => openEditAddr(a)}>
                      <Icon name="pencil" className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:text-red-400"
                            aria-label={'Delete ' + a.label} onClick={() => setPendDelete(a)}>
                      <Icon name="trash-2" className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {addresses.length === 0 && <li className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No saved addresses yet.</li>}
            </ul>
          </div>
        </section>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" description="Update your personal details.">
        <div className="space-y-4">
          {[['Name', 'name'], ['Email', 'email'], ['Phone', 'phone']].map(([label, k]) => (
            <div key={k} className="space-y-1.5">
              <label htmlFor={'edit-' + k} className="label">{label}</label>
              <Input id={'edit-' + k} type={k === 'email' ? 'email' : 'text'} value={draft[k]}
                     onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="dialog-footer">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={addrOpen} onClose={() => setAddrOpen(false)} title={addrDraft.id ? 'Edit Address' : 'Add Address'}
             description="'Default' is pre-filled at checkout.">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="addr-label" className="label">Label</label>
            <Input id="addr-label" placeholder="Home / Work / …" value={addrDraft.label}
                   onChange={(e) => setAddrDraft((d) => ({ ...d, label: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="addr-line" className="label">Address</label>
            <Input id="addr-line" placeholder="Street, city, state, ZIP" value={addrDraft.line}
                   onChange={(e) => setAddrDraft((d) => ({ ...d, line: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="addr-default" className="label cursor-pointer">Set as default</label>
            <input id="addr-default" type="checkbox" role="switch" className="switch" checked={addrDraft.default}
                   onChange={(e) => setAddrDraft((d) => ({ ...d, default: e.target.checked }))} />
          </div>
          <div className="dialog-footer">
            <Button variant="outline" onClick={() => setAddrOpen(false)}>Cancel</Button>
            <Button onClick={saveAddr}>{addrDraft.id ? 'Save' : 'Add'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!pendDelete} onClose={() => setPendDelete(null)} title={'Delete ' + (pendDelete ? pendDelete.label : 'address') + '?'}
                     description={'This address will be removed from your profile. This can\u2019t be undone.'}
                     confirmLabel="Delete"
                     onConfirm={() => pendDelete && deleteAddr(pendDelete.id)} />
    </div>
  );
}

// ---- Auth — standalone centered card, no header/footer (§5.1) ----
// Zitadel OIDC hand-off: no local passwords. The button redirects the user to
// Zitadel's hosted sign-in; account creation happens there too.
function LoginCard() {
  const [busy, setBusy] = useState(false);
  const go = () => {
    if (busy) return;
    setBusy(true);
    toast('Redirecting to Zitadel…');
    const next = new URLSearchParams(window.location.search).get('next');
    window.setTimeout(() => { toast('Signed in (demo)'); window.location = next || './home-page.html'; }, 1200);
  };
  return (
    <div className="card bg-[var(--card)]">
      <div className="card-header p-6 pb-0"><h1 className="card-title text-center text-xl font-semibold">Sign in</h1></div>
      <div className="card-content p-6">
        <Button type="button" className="w-full" disabled={busy} onClick={go}>
          {busy ? 'Redirecting…' : 'Continue with Zitadel'}
        </Button>
        <p className="mt-4 text-center text-[13px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          You'll finish signing in on Zitadel's secure page. Horizon never sees your password.
        </p>
      </div>
    </div>
  );
}

function AuthScreen() {
  const next = new URLSearchParams(window.location.search).get('next');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <a href="./home-page.html" className="text-center">
        <span className="mx-auto block h-2 w-16 rounded-full bg-[var(--primary)]" />
        <h1 className="mt-3 font-display text-xl font-extrabold tracking-tight">Horizon Supply Co.</h1>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">Outdoor gear for the long way round</p>
      </a>
      <div className="mt-8 w-full max-w-[400px]">
        <LoginCard />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-700 dark:text-zinc-300">
        New here? You'll create your account at Zitadel too.
      </p>
      <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
        Demo: this button would redirect to our self-hosted Zitadel (OIDC + PKCE).
      </p>
      {next && <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">Redirecting you to the page you were viewing.</p>}
    </div>
  );
}

function MobileMenu({ open, onClose, onTheme, dark }) {
  return (
    <Sheet side="left" className="w-full max-w-[320px]" open={open} onClose={onClose} aria-label="Menu">
      <div className="sheet-content flex h-full flex-col">
        <div className="sheet-header shrink-0 pr-8">
          <h2 className="sheet-title font-display">Horizon Supply Co.</h2>
        </div>
        <button type="button" className="sheet-close-x" aria-label="Close menu" onClick={onClose}><Icon name="x" className="h-4 w-4" /></button>
        <ul className="mt-2 list-none space-y-1 text-sm">
          <li className="mb-3 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
            <p className="text-sm font-semibold">Jane Doe</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">jane@mail.com</p>
          </li>
          {[['Home', './home-page.html'], ['Products', './products-page.html'], ['My Profile', './profile-page.html'], ['My Orders', './orders-page.html'], ['Admin Panel', './admin-page.html']].map(([l, h]) => (
            <li key={l}><a href={h} onClick={onClose} className="block rounded-lg px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">{l}</a></li>
          ))}
          <li>
            <button type="button" aria-label="Toggle dark mode" onClick={onTheme} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <Icon name={dark ? 'sun' : 'moon'} className="h-5 w-5" /> Theme
            </button>
          </li>
          <li><a href="./login-page.html" className="block rounded-lg px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">Logout</a></li>
        </ul>
      </div>
    </Sheet>
  );
}

// ---- Admin shell (§3.2) + Dashboard (§5.12) ----
const VIEW_TITLES = { admin: 'Dashboard', 'admin-products': 'Products', 'admin-categories': 'Categories', 'admin-orders': 'Orders', 'admin-users': 'Users' };
const ADMIN_NAV = [
  { key: 'admin', href: './admin-page.html', icon: 'layout-dashboard', label: 'Dashboard' },
  { key: 'admin-products', href: './admin-products-page.html', icon: 'package', label: 'Products' },
  { key: 'admin-categories', href: './admin-categories-page.html', icon: 'tags', label: 'Categories' },
  { key: 'admin-orders', href: './admin-orders-page.html', icon: 'shopping-cart', label: 'Orders' },
  { key: 'admin-users', href: './admin-users-page.html', icon: 'users', label: 'Users', adminOnly: true },
];
function AdminNav({ active, onNav }) {
  return (
    <nav aria-label="Admin">
      <ul className="list-none space-y-1">
        {ADMIN_NAV.filter((n) => !n.adminOnly || active === 'admin-users').map((n) => (
          <li key={n.key}>
            <a href={n.href} onClick={onNav} aria-current={active === n.key ? 'page' : undefined}
               className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                 active === n.key ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50')}>
              <Icon name={n.icon} className="h-4 w-4 shrink-0" />
              {n.label}
              {n.adminOnly && <span className="ml-auto rounded-full border border-amber-300/60 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">ADMIN</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AdminShell({ title, section, children, dark, onTheme }) {
  const [sideOpen, setSideOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const acctBoxRef = useRef(null);
  const acctMenuRef = useRef(null);
  useEffect(() => {
    const el = acctMenuRef.current;
    if (!el) return;
    const onToggle = (e) => {
      const isOpen = e.newState === 'open';
      setAcctOpen(isOpen);
      if (isOpen && acctBoxRef.current && !CSS.supports('position-anchor', '--dummy-anchor')) {
        const r = acctBoxRef.current.getBoundingClientRect();
        const w = el.getBoundingClientRect().width;
        el.style.position = 'fixed';
        el.style.top = r.bottom + 4 + 'px';
        el.style.left = Math.max(8, r.right - w) + 'px';
        el.style.margin = '0';
      }
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);
  const sidebar = (
    <div className="flex h-full flex-col py-6">
      <a href="./home-page.html" className="flex items-center gap-2 px-6">
        <span className="h-2 w-6 rounded-full bg-[var(--primary)]" />
        <span className="font-display text-base font-extrabold tracking-tight">Horizon</span>
      </a>
      <div className="mt-6 flex-1 px-3">
        <AdminNav active={section} onNav={() => setSideOpen(false)} />
      </div>
      <div className="space-y-1 border-t border-zinc-200 px-3 pt-4 dark:border-zinc-800">
        <a href="./home-page.html" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
          <Icon name="external-link" className="h-4 w-4" /> View Store
        </a>
        <a href="./login-page.html" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
          <Icon name="x" className="h-4 w-4" /> Logout
        </a>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#09090B]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-zinc-200 bg-[var(--card)] dark:border-zinc-800 lg:block">
        {sidebar}
      </aside>
      <Sheet side="left" className="w-full max-w-[300px]" open={sideOpen} onClose={() => setSideOpen(false)} aria-label="Admin menu">
        <div className="sheet-content h-full">{sidebar}</div>
      </Sheet>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-[var(--card)] px-4 dark:border-zinc-800 lg:px-8">
          <Button variant="icon" aria-label="Open menu" className="lg:hidden" onClick={() => setSideOpen(true)}>
            <Icon name="menu" className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="icon" aria-label="Toggle dark mode" onClick={onTheme}>
              <Icon name={dark ? 'sun' : 'moon'} className="h-5 w-5" />
            </Button>
            <a href="./home-page.html" className="hidden text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:inline">View Store</a>
            <div ref={acctBoxRef}>
              <Button variant="ghost" className="gap-2 px-3" aria-label="Account menu" aria-haspopup="menu"
                      aria-expanded={acctOpen} aria-controls="admin-acct-menu" data-dropdown-trigger="admin-acct-menu"
                      onClick={() => acctMenuRef.current && acctMenuRef.current.togglePopover()}>
                <Icon name="user" className="h-5 w-5" /> <span className="hidden sm:inline">Jane</span>
                <Icon name="chevron-down" className="h-4 w-4 opacity-60" />
              </Button>
              <div ref={acctMenuRef} id="admin-acct-menu" role="menu" popover="auto" className="dropdown-content" aria-label="Account menu">
                <div className="dropdown-label">Signed in as Jane Doe · jane@mail.com</div>
                <a role="menuitem" className="dropdown-item" href="./profile-page.html">My Profile</a>
                <div className="dropdown-separator" role="separator"></div>
                <a role="menuitem" className="dropdown-item text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white"
                   data-variant="destructive" href="./login-page.html">Logout</a>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, deltaTone }) {
  return (
    <div className="card">
      <div className="card-content p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        <p className={cn('mt-1 text-xs', deltaTone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>{delta}</p>
      </div>
    </div>
  );
}

function SalesChart() {
  const sales = [420, 610, 585, 900, 760, 1120, 985, 1350, 1180, 1510, 1420, 1680, 1590, 1820];
  const max = Math.max(...sales);
  const W = 600, H = 150, PAD = 12;
  const pts = sales.map((v, i) => [PAD + (i * (W - 2 * PAD)) / (sales.length - 1), H - PAD - (v / max) * (H - 2 * PAD)]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const last = pts[pts.length - 1];
  const area = PAD + ',' + H + ' ' + line + ' ' + (W - PAD) + ',' + H;
  const xlabel = (i) => {
    const d = new Date(); d.setDate(d.getDate() - (sales.length - 1 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return (
    <div className="card">
      <div className="card-header p-5 pb-0">
        <h2 className="card-title">Sales</h2>
        <p className="card-description text-xs text-muted-foreground">Last 14 days</p>
      </div>
      <div className="card-content p-5">
        <svg viewBox="0 0 600 170" className="h-44 w-full" role="img" aria-label="Sales over the last 14 days">
          <polyline points={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points={area} fill="var(--primary)" opacity="0.08" />
          <circle cx={last[0]} cy={last[1]} r="4" fill="var(--primary)" />
        </svg>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{xlabel(0)}</span><span>{xlabel(4)}</span><span>{xlabel(9)}</span><span>{xlabel(13)}</span>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardView() {
  const recent = ORDERS.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const lowStock = PRODUCTS.filter((p) => !p.oos && p.stock > 0 && p.stock <= 5).length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value="$9,240.00" delta="+12.4% vs last month" />
        <StatCard label="Orders" value="12" delta="+3 this week" />
        <StatCard label="Users" value="34" delta="+2 this week" />
        <StatCard label="Products" value={String(PRODUCTS.length)} delta={lowStock + ' low stock'} deltaTone="amber" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><SalesChart /></div>
        <div className="card self-start">
          <div className="card-header p-5 pb-0"><h2 className="card-title">Recent Orders</h2></div>
          <div className="card-content p-3">
            <ul className="list-none space-y-1">
              {recent.map((o) => (
                <li key={o.id}>
                  <a href={'./admin-orders-page.html'} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs font-semibold">#{o.id.slice(0, 8)}</p>
                      <p className="truncate text-xs text-muted-foreground">{o.addr.name} · {o.date}</p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm font-semibold">{fmtMoney(CART_PRICING(o.lines).total)}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="./admin-orders-page.html" className="mt-2 block rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--primary)] hover:bg-zinc-50 dark:hover:bg-zinc-900">View all orders →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ id, label, value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const popId = id + '-menu';
  useEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const onToggle = (e) => {
      setOpen(e.newState === 'open');
      if (e.newState === 'open' && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        el.style.position = 'fixed';
        el.style.top = r.bottom + 6 + 'px';
        el.style.left = Math.max(8, r.left) + 'px';
        el.style.minWidth = r.width + 'px';
      }
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);
  const onTriggerClick = () => {
    const pop = popRef.current, btn = btnRef.current;
    if (!pop || !btn) return;
    if (!pop.matches(':popover-open')) {
      const r = btn.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.top = r.bottom + 6 + 'px';
      pop.style.left = Math.max(8, r.left) + 'px';
      pop.style.minWidth = r.width + 'px';
    }
    pop.togglePopover();
  };
  const choose = (o) => { onChange(o); if (popRef.current) popRef.current.hidePopover(); };
  return (
    <div className="combobox relative shrink-0">
      <button type="button" ref={btnRef}
              className="btn combobox-trigger w-auto" data-variant="outline"
              aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={popId}
              onClick={onTriggerClick}>
        <span className="combobox-value truncate">{value || placeholder || label}</span>
        <Icon name="chevrons-up-down" className="combobox-chevron h-4 w-4" />
      </button>
      <div ref={popRef} id={popId} popover="auto" className="combobox-content min-w-full">
        <div role="listbox" className="combobox-listbox" aria-label={label}>
          {options.map((o) => (
            <div key={o} role="option" className="combobox-item" aria-selected={value === o}
                 data-value={o} onClick={() => choose(o)}>
              <span className="truncate">{o}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination mt-6" aria-label="Pagination">
      <ul className="pagination-list">
        <li>
          <Button variant="outline" size="icon" className="rounded-full" aria-label="Previous page" disabled={page <= 1}
                  onClick={() => onChange(Math.max(1, page - 1))}><Icon name="chevron-left" /></Button>
        </li>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Button size="icon" variant={page === n ? 'default' : 'ghost'}
                    className={cn('rounded-full', page === n && 'font-semibold')}
                    aria-current={page === n ? 'page' : undefined} onClick={() => onChange(n)}>{n}</Button>
          </li>
        ))}
        <li>
          <Button variant="outline" size="icon" className="rounded-full" aria-label="Next page" disabled={page >= pages}
                  onClick={() => onChange(Math.min(pages, page + 1))}><Icon name="chevron-right" /></Button>
        </li>
      </ul>
    </nav>
  );
}

function AdminPlaceholder({ label }) {
  return (
    <div className="card">
      <div className="card-content p-6">
        <h2 className="card-title">{label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">This admin view is under construction in the prototype.</p>
      </div>
    </div>
  );
}
function AdminCategoriesView() {
  const [cats, setCats] = useState(CATS.map((c) => ({ ...c })));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendDel, setPendDel] = useState(null);
  const deleteCat = (id) => {
    setCats((cs) => cs.filter((c) => c.id !== id));
    toast('Category deleted');
  };
  const save = (cat) => {
    if (cats.some((c) => c.label.toLowerCase() === cat.label.toLowerCase() && c.id !== cat.id)) {
      toast('Category name already exists', true);
      return;
    }
    if (cat.id) {
      setCats((cs) => cs.map((c) => (c.id === cat.id ? cat : c)));
      toast('Category updated');
    } else {
      setCats((cs) => [...cs, { ...cat, id: cat.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') }]);
      toast('Category created');
    }
    setOpen(false);
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{cats.length} categories</p>
        <Button className="w-fit" onClick={() => { setEditing(null); setOpen(true); }}>+ New Category</Button>
      </div>
      <div className="table-container mt-4">
        <table className="table">
          <thead>
            <tr>
              <th className="table-head">Category</th>
              <th className="table-head">Slug</th>
              <th className="table-head">Products</th>
              <th className="table-head">Image</th>
              <th className="table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr className="table-row" key={c.id}>
                <td className="table-cell font-medium">{c.label}</td>
                <td className="table-cell font-mono text-xs text-muted-foreground">{c.id}</td>
                <td className="table-cell">{countByCat(c.id)}</td>
                <td className="table-cell">
                  {c.img
                    ? <img src={c.img} alt="" className="h-9 w-9 rounded-md object-cover" />
                    : <div className="h-9 w-9 rounded-md bg-zinc-100 dark:bg-zinc-800" />}
                </td>
                <td className="table-cell text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                          aria-label={'Edit ' + c.label} onClick={() => { setEditing(c); setOpen(true); }}>
                    <Icon name="pencil" className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 text-zinc-400 hover:text-red-600 dark:text-red-400"
                          aria-label={'Delete ' + c.label}
                          onClick={() => countByCat(c.id) > 0 ? toast('Category has products - reassign or delete them first', true) : setPendDel(c)}>
                    <Icon name="trash-2" className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CategoryFormModal open={open} onClose={() => setOpen(false)} editing={editing} onSave={save} />
      <ConfirmDialog open={!!pendDel} onClose={() => setPendDel(null)} title={'Delete ' + (pendDel ? pendDel.label : 'category') + '?'}
                     description="This category will be removed. Products are not deleted with it."
                     confirmLabel="Delete"
                     onConfirm={() => { if (pendDel) deleteCat(pendDel.id); setPendDel(null); }} />
    </>
  );
}

function CategoryFormModal({ open, onClose, editing, onSave }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [files, setFiles] = useState([]);
  useEffect(() => {
    if (open) { setName(editing ? editing.label : ''); setErr(''); setFiles([]); }
  }, [open, editing]);
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Category name is required.'); return; }
    onSave({ id: editing ? editing.id : null, label: name.trim(),
             img: files.length ? URL.createObjectURL(files[0]) : (editing && !files.length ? editing.img : null) });
  };
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Category' : 'New Category'}
           description="A category groups products on the shop floor.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="cf-name" className="label">Name</label>
          <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Outerwear" autoFocus />
          {err && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
        </div>
        <MultiUpload label="Image" max={1} files={files} setFiles={setFiles} />
        <div className="dialog-footer">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
const NEXT_STATUS = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

function AdminOrdersView() {
  const [rows, setRows] = useState(ORDERS.map((o) => ({ ...o })));
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const filtered = status === 'All' ? rows : rows.filter((o) => o.status === status);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => setPage(1), [status]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const change = (o, next) => {
    if (!NEXT_STATUS[o.status].includes(next)) { toast('400 Invalid status transition', true); return; }
    setRows((rs) => rs.map((r) => (r.id === o.id ? { ...r, status: next } : r)));
    toast('Order #' + o.id.slice(0, 8) + ' → ' + next);
  };
  return (
    <>
      <div className="flex items-center gap-3">
        <FilterSelect id="ord-status" label="Status" value={status}
                      options={['All'].concat(ORDER_STATUSES)} onChange={setStatus} />
      </div>
      <div className="table-container mt-4">
        <table className="table">
          <thead>
            <tr>
              <th className="table-head">Order</th>
              <th className="table-head">Customer</th>
              <th className="table-head">Total</th>
              <th className="table-head">Status</th>
              <th className="table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((o) => (
              <tr className="table-row" key={o.id}>
                <td className="table-cell font-mono text-xs font-semibold">#{o.id.slice(0, 8)}</td>
                <td className="table-cell">
                  <p className="font-medium">{o.addr.name}</p>
                  <p className="text-xs text-muted-foreground">{o.date}</p>
                </td>
                <td className="table-cell font-semibold tabular-nums">{fmtMoney(CART_PRICING(o.lines).total)}</td>
                <td className="table-cell">
                  {NEXT_STATUS[o.status].length
                    ? <FilterSelect id={'st-' + o.id.slice(0, 8)} label="Status" value={o.status}
                                    options={ORDER_STATUSES} onChange={(s) => change(o, s)} />
                    : <OrderStatusBadge status={o.status} />}
                </td>
                <td className="table-cell text-right whitespace-nowrap">
                  <a href={'./order-detail-page.html?order_id=' + o.id} className="btn" data-variant="outline" data-size="sm">Details</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onChange={setPage} />
    </>
  );
}
const AdminUsersView = () => <AdminPlaceholder label="Users" />;

function StockCell({ p }) {
  if (p.oos || p.stock === 0) return <span className="font-medium text-red-600 dark:text-red-400">{p.stock}</span>;
  if (p.stock <= 5) return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
      {p.stock}<span className="font-normal opacity-80">low</span>
    </span>
  );
  return <span>{p.stock}</span>;
}

function AdminProductsView() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [stock, setStock] = useState('All');
  const [page, setPage] = useState(1);
  const [delSlug, setDelSlug] = useState(null);
  const filtered = PRODUCTS.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (cat !== 'All' && p.cat !== cat) return false;
    if (stock === 'In stock' && (p.oos || p.stock === 0)) return false;
    if (stock === 'Out of stock' && (p.oos || p.stock !== 0)) return false;
    if (stock === 'Low stock' && (p.oos || p.stock === 0 || p.stock > 5)) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => setPage(1), [search, cat, stock]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input aria-label="Search products" placeholder="Search products…" value={search}
                 onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 sm:w-56 sm:min-w-0" />
        </div>
        <FilterSelect id="prod-cat" label="Category" value={cat}
                      options={['All'].concat(CATS.map((c) => c.label))} onChange={setCat} />
        <FilterSelect id="prod-stock" label="Stock" value={stock}
                      options={['All', 'In stock', 'Low stock', 'Out of stock']} onChange={setStock} />
        <Button className="w-fit shrink-0 sm:ml-auto"><a href="./admin-product-form.html">+ New Product</a></Button>
      </div>

      <div className="table-container mt-6">
        <table className="table">
          <thead>
            <tr>
              <th className="table-head w-10">#</th>
              <th className="table-head">Name</th>
              <th className="table-head">Price</th>
              <th className="table-head">Stock</th>
              <th className="table-head">Category</th>
              <th className="table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p, i) => {
              const c = CATS.find((c) => c.id === p.cat);
              return (
                <tr className="table-row" key={p.slug}>
                  <td className="table-cell text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="table-cell">
                    <a href={'./product-detail-page.html?slug=' + p.slug} className="flex items-center gap-3">
                      <img src={p.img} alt="" className="h-9 w-9 rounded-md object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </a>
                  </td>
                  <td className="table-cell">{fmtMoney(p.price)}</td>
                  <td className="table-cell"><StockCell p={p} /></td>
                  <td className="table-cell text-muted-foreground">{c ? c.label : p.cat}</td>
                  <td className="table-cell text-right whitespace-nowrap">
                    <a href={'./admin-product-form.html?id=' + p.slug} aria-label={'Edit ' + p.name} data-variant="ghost" data-size="icon"
                       className="btn inline-flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200">
                      <Icon name="pencil" className="h-4 w-4" />
                    </a>
                    <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 text-zinc-400 hover:text-red-600 dark:text-red-400"
                            aria-label={'Delete ' + p.name} onClick={() => setDelSlug(p.slug)}>
                      <Icon name="trash-2" className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!paged.length && (
              <tr><td className="table-cell py-12 text-center text-muted-foreground" colSpan="6">No products match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} onChange={setPage} />
      <ConfirmDialog open={!!delSlug} onClose={() => setDelSlug(null)}
                     title={'Delete ' + (delSlug ? PRODUCTS.find((p) => p.slug === delSlug).name : 'product') + '?'}
                     description="This product will be permanently removed from the catalog. This can't be undone."
                     confirmLabel="Delete"
                     onConfirm={() => { setDelSlug(null); toast('Product deleted (demo)'); }} />
    </>
  );
}

function MultiUpload({ label, max = 5, files, setFiles }) {
  const inputRef = useRef(null);
  const add = (list) => {
    const ok = [];
    for (const f of Array.from(list)) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { toast('Only JPG, PNG or WebP images allowed', true); continue; }
      if (f.size > 5 * 1024 * 1024) { toast('Each image must be under 5MB', true); continue; }
      ok.push(f);
    }
    setFiles([...files, ...ok].slice(0, max));
    if (inputRef.current) inputRef.current.value = '';
  };
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-3">
        {files.map((f, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
            <button type="button" aria-label={'Remove ' + f.name}
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900/60 text-white hover:bg-red-600">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {files.length < max && (
          <button type="button" aria-label={'Add image ' + (files.length + 1)}
                  onClick={() => inputRef.current && inputRef.current.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-[var(--primary)] hover:text-[var(--primary)] dark:border-zinc-700">
            <Icon name="image-plus" className="h-5 w-5" />
            <span className="text-xs font-medium">Add</span>
          </button>
        )}
      </div>
      <p className="field-description">Up to {max} images · 5MB each · JPG, PNG or WebP</p>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
             onChange={(e) => { if (e.target.value) add(e.target.files); }} />
    </div>
  );
}

function AdminProductFormView() {
  const params = (() => { try { return new URLSearchParams(window.location.search); } catch (e) { return null; } })();
  const editSlug = params ? params.get('id') : null;
  const existing = editSlug ? PRODUCTS.find((p) => p.slug === editSlug) : null;
  const catLabel = (id) => (CATS.find((c) => c.id === id) || {}).label || '';
  const [name, setName] = useState(existing ? existing.name : '');
  const [desc, setDesc] = useState(existing ? existing.desc : '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [stock, setStock] = useState(existing ? String(existing.stock) : '');
  const [cat, setCat] = useState(existing ? catLabel(existing.cat) : '');
  const [files, setFiles] = useState([]);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const go = () => { window.location = './admin-products-page.html'; };
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = 'Name is required.';
    const p = Number(price);
    if (price === '' || Number.isNaN(p) || p < 0) next.price = 'Enter a valid price (0 or more).';
    const s = Number(stock);
    if (stock === '' || Number.isNaN(s) || s < 0) next.stock = 'Enter a valid stock count (0 or more).';
    if (!cat) next.category = 'Select a category.';
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    window.setTimeout(() => { toast(existing ? 'Product updated (demo)' : 'Product created (demo)'); go(); }, 900);
  };
  const fieldError = (k) => errs[k] && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{errs[k]}</p>;
  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{existing ? 'Edit Product' : 'Create Product'}</h2>
        <Button variant="outline" type="button" onClick={go}>Cancel</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="pf-name" className="label">Name</label>
              <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Waxed Field Jacket" />
              {fieldError('name')}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pf-desc" className="label">Description</label>
              <textarea id="pf-desc" className="input min-h-28" value={desc} onChange={(e) => setDesc(e.target.value)}
                        placeholder="A working man's jacket cut from 10oz waxed cotton..."></textarea>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="pf-price" className="label">Price</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input id="pf-price" type="number" min="0" step="0.01" inputMode="decimal" value={price}
                         className="pl-8" onChange={(e) => setPrice(e.target.value)} placeholder="189.00" />
                </div>
                {fieldError('price')}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pf-stock" className="label">Stock</label>
                <Input id="pf-stock" type="number" min="0" step="1" inputMode="numeric" value={stock}
                       onChange={(e) => setStock(e.target.value)} placeholder="24" />
                {fieldError('stock')}
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pf-cat" className="label">Category</label>
              <FilterSelect id="pf-cat" label="Category" placeholder="Select a category" value={cat}
                            options={['Outerwear', 'Travel', 'Carry & Desk', 'Drinkware']} onChange={setCat} />
              {fieldError('category')}
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Images</h3>
          <div className="mt-4">
            <MultiUpload label="Product images" max={5} files={files} setFiles={setFiles} />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={busy} className="w-fit">{busy ? 'Saving…' : 'Save'}</Button>
        <Button variant="outline" type="button" onClick={go}>Cancel</Button>
      </div>
    </form>
  );
}

function NotFoundView() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-32 pt-24 text-center">
      <span className="mx-auto block h-2 w-12 rounded-full bg-[var(--primary)]" />
      <p className="mt-6 font-display text-7xl font-extrabold tracking-tight md:text-8xl">404</p>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">This trail goes cold</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">The page you were looking for has wandered off the map. It may have moved, been retired, or never existed in the first place.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button className="h-10 px-6"><a href="./home-page.html">Back to home</a></Button>
        <Button variant="outline" className="h-10 px-6"><a href="./products-page.html">Browse products</a></Button>
      </div>
    </div>
  );
}

function App() {
  const view = document.body.dataset.view;
  const isProducts = view === 'products';
  const isProduct = view === 'product';
  const isCart = view === 'cart';
  const isCheckout = view === 'checkout';
  const isOrderSuccess = view === 'order-success';
  const isOrders = view === 'orders';
  const isOrderDetail = view === 'order-detail';
  const isProfile = view === 'profile';
  const isAuth = view === 'login';
  const is404 = view === '404';
  const isAdmin = view.startsWith('admin');
  const [dark, setDark] = useState(() =>
    localStorage.getItem('ui.theme') ? localStorage.getItem('ui.theme') === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ui.theme', dark ? 'dark' : 'light');
  }, [dark]);
const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lines, setLines] = useState(INITIAL_CART);
  const cartCount = lines.reduce((s, l) => s + l.quantity, 0);
  const addToCart = (p, qty) => {
    setLines((ls) => {
      const found = ls.find((l) => l.key === p.slug);
      if (found) return ls.map((l) => l.key === p.slug ? { ...l, quantity: l.quantity + qty } : l);
      return [...ls, { key: p.slug, name: p.name, img: p.img, price: p.price, quantity: qty }];
    });
    toast('Added to cart');
  };

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') { setCartOpen(false); setMenuOpen(false); } };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

return (
    isAuth ? <AuthScreen /> : isAdmin ? (
      <AdminShell title={VIEW_TITLES[view] || 'Products'} section={view === 'admin-product-form' ? 'admin-products' : view} dark={dark} onTheme={() => setDark(!dark)}>
        {view === 'admin' ? <AdminDashboardView />
          : view === 'admin-products' ? <AdminProductsView />
          : view === 'admin-product-form' ? <AdminProductFormView />
          : view === 'admin-categories' ? <AdminCategoriesView />
          : view === 'admin-orders' ? <AdminOrdersView />
          : <AdminUsersView />}
      </AdminShell>
    ) : (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header cartCount={cartCount} onCart={() => setCartOpen(true)} onMenu={() => setMenuOpen(true)}
              dark={dark} onTheme={() => setDark(!dark)} />
<main id="main">
        {isProducts ? <ProductsView /> : isProduct ? <ProductDetailView onAddToCart={addToCart} /> : isCart ? <CartView lines={lines} setLines={setLines} /> : isCheckout ? <CheckoutView lines={lines} /> : isOrderSuccess ? <OrderSuccessView /> : isOrders ? <OrdersView /> : isOrderDetail ? <OrderDetailView /> : isProfile ? <ProfileView /> : is404 ? <NotFoundView /> : <HomeView />}
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} lines={lines} setLines={setLines} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onTheme={() => setDark(!dark)} dark={dark} />
    </>)
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

