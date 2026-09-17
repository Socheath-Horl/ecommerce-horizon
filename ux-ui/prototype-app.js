(() => {
  // _src/prototype.jsx
  var { useState, useEffect, useRef } = React;
  var cn = (...c) => c.filter(Boolean).join(" ");
  var fmtMoney = (n) => "$" + Number(n).toFixed(2);
  var CATS = [
    { id: "outerwear", label: "Outerwear", img: "assets/img/waxed-jacket-b.jpg" },
    { id: "travel", label: "Travel", img: "assets/img/suitcase-a.jpg" },
    { id: "carry-desks", label: "Carry & Desk", img: "assets/img/daypack-b.jpg" },
    { id: "drinkware", label: "Drinkware", img: "assets/img/bottle-a.jpg" }
  ];
  var PRODUCTS = [
    { slug: "waxed-field-jacket", name: "Waxed Field Jacket", img: "assets/img/waxed-jacket-a.jpg", gallery: ["assets/img/gallery-waxed-field-jacket-2.jpg", "assets/img/gallery-waxed-field-jacket-3.jpg"], price: 189, rating: 4.5, reviews: 12, cat: "outerwear", stock: 24, desc: "A working man\u2019s jacket cut from 10oz waxed cotton. It shrugs off wind and light rain, softens with wear, and gains a patina that tells your story." },
    { slug: "country-wax-jacket", name: "Country Wax Jacket", img: "assets/img/waxed-jacket-b.jpg", gallery: ["assets/img/gallery-country-wax-jacket-2.jpg", "assets/img/gallery-country-wax-jacket-3.jpg"], price: 145, rating: 4, reviews: 8, cat: "outerwear", stock: 3, desc: "A shorter, roomier take on our classic waxed jacket, built for wandering fields and lanes with a full storm flap and corduroy collar." },
    { slug: "weekender-duffel", name: "Weekender Duffel", img: "assets/img/duffel-a.jpg", gallery: ["assets/img/gallery-weekender-duffel-2.jpg", "assets/img/gallery-weekender-duffel-3.jpg"], price: 168, rating: 4.8, reviews: 3, cat: "travel", stock: 7, desc: "Forty liters of waxed canvas and bridle leather with a wide opening that lives up to the name -- a true two-day carry for long weekends away." },
    { slug: "canvas-duffel", name: "Canvas Duffel", img: "assets/img/duffel-b.jpg", gallery: ["assets/img/gallery-canvas-duffel-2.jpg", "assets/img/gallery-canvas-duffel-3.jpg"], price: 124, rating: 4.6, reviews: 15, cat: "travel", stock: 41, desc: "A heavy cotton duck duffel with webbing handles that fold flat when you don\u2019t need them. Simple, tough, and made to outlast trends." },
    { slug: "cabin-carry-on", name: "Cabin Carry-On", img: "assets/img/suitcase-a.jpg", gallery: ["assets/img/suitcase-b.svg", "assets/img/gallery-cabin-carry-on-2.jpg", "assets/img/gallery-cabin-carry-on-3.jpg"], price: 139, rating: 4.8, reviews: 27, cat: "travel", stock: 12, desc: "A hardshell cabin case with 360\xB0 spinner wheels and a telescopic handle, sized to slip overhead on the tightest of regional jets." },
    { slug: "trail-mug", name: "Trail Mug", img: "assets/img/mug-a.jpg", gallery: ["assets/img/gallery-trail-mug-2.jpg", "assets/img/gallery-trail-mug-3.jpg"], price: 42, rating: 3.8, reviews: 21, cat: "drinkware", stock: 120, desc: "Enamel over steel, wide-mouthed and stackable, with a rolled rim that holds up to the campfire without complaint." },
    { slug: "insulated-bottle", name: "Insulated Bottle 750ml", img: "assets/img/bottle-a.jpg", gallery: ["assets/img/gallery-insulated-bottle-2.jpg", "assets/img/gallery-insulated-bottle-3.jpg"], price: 34, rating: 4.7, reviews: 34, cat: "drinkware", stock: 88, desc: "Double-wall vacuum insulation keeps coffee hot for 12 hours or water cold for 24. Powder-coated steel, leak-proof cap." },
    { slug: "steel-bottle", name: "Steel Bottle 1L", img: "assets/img/bottle-b.jpg", gallery: ["assets/img/gallery-steel-bottle-2.jpg", "assets/img/gallery-steel-bottle-3.jpg"], price: 28, rating: 4.3, reviews: 11, cat: "drinkware", stock: 64, desc: "A single-wall food-grade steel bottle for everyday trips to the tap. Scratch-hiding brushed finish, wide mouth for ice." },
    { slug: "utility-backpack", name: "Utility Backpack", img: "assets/img/daypack-b.jpg", gallery: ["assets/img/gallery-utility-backpack-2.jpg", "assets/img/gallery-utility-backpack-3.jpg"], price: 98, rating: 4.4, reviews: 19, cat: "carry-desks", stock: 9, desc: "A 22L commuter pack with a padded 15\u201D laptop sleeve, dual water-bottle pockets, and a roll-top that keeps the rain out." },
    { slug: "daypack", name: "Daypack", img: "assets/img/daypack-a.jpg", gallery: ["assets/img/gallery-daypack-2.jpg", "assets/img/gallery-daypack-3.jpg"], price: 8.95, rating: 4.2, reviews: 9, cat: "carry-desks", stock: 0, oos: true, desc: "A featherweight daypack for the trip you didn\u2019t plan. Packs into its own pocket when you arrive. Currently sold out." }
  ];
  var countByCat = (id) => PRODUCTS.filter((p) => p.cat === id).length;
  function toast(msg, isError) {
    const t = document.createElement("div");
    t.className = "fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-[10px] px-4 py-2 text-sm shadow-lg text-white " + (isError ? "bg-red-600" : "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  function ph(label) {
    const s = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#f4f4f5"/><text x="50%" y="46%" font-family="Georgia, serif" font-size="34" fill="#71717a" text-anchor="middle">' + label + '</text><text x="50%" y="58%" font-family="Arial, sans-serif" font-size="14" fill="#a1a1aa" text-anchor="middle">photo pending \u2014 swap seed asset</text></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(s);
  }
  var fallback = (label) => (e) => {
    e.currentTarget.src = ph(label);
  };
  var ICONS = {
    moon: /* @__PURE__ */ React.createElement("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }),
    sun: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 2v2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 20v2" }), /* @__PURE__ */ React.createElement("path", { d: "m4.93 4.93 1.41 1.41" }), /* @__PURE__ */ React.createElement("path", { d: "m17.66 17.66 1.41 1.41" }), /* @__PURE__ */ React.createElement("path", { d: "M2 12h2" }), /* @__PURE__ */ React.createElement("path", { d: "M20 12h2" }), /* @__PURE__ */ React.createElement("path", { d: "m6.34 17.66-1.41 1.41" }), /* @__PURE__ */ React.createElement("path", { d: "m19.07 4.93-1.41 1.41" })),
    "shopping-cart": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "21", r: "1" }), /* @__PURE__ */ React.createElement("circle", { cx: "19", cy: "21", r: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" })),
    user: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "7", r: "4" })),
    menu: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "4", x2: "20", y1: "6", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "4", x2: "20", y1: "12", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "4", x2: "20", y1: "18", y2: "18" })),
    x: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M18 6 6 18" }), /* @__PURE__ */ React.createElement("path", { d: "m6 6 12 12" })),
    search: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ React.createElement("path", { d: "m21 21-4.3-4.3" })),
    "chevron-down": /* @__PURE__ */ React.createElement("path", { d: "m6 9 6 6 6-6" }),
    "chevrons-up-down": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m7 15 5 5 5-5" }), /* @__PURE__ */ React.createElement("path", { d: "m7 9 5-5 5 5" })),
    "chevron-left": /* @__PURE__ */ React.createElement("path", { d: "m15 18-6-6 6-6" }),
    "chevron-right": /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" }),
    "sliders-horizontal": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "14", y1: "4", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "10", x2: "3", y1: "4", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "12", y1: "12", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "8", x2: "3", y1: "12", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "16", y1: "20", y2: "20" }), /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "3", y1: "20", y2: "20" }), /* @__PURE__ */ React.createElement("line", { x1: "14", x2: "14", y1: "2", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "8", x2: "8", y1: "10", y2: "14" }), /* @__PURE__ */ React.createElement("line", { x1: "16", x2: "16", y1: "18", y2: "22" })),
    check: /* @__PURE__ */ React.createElement("path", { d: "M20 6 9 17l-5-5" }),
    "shopping-bag": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" }), /* @__PURE__ */ React.createElement("path", { d: "M3 6h18" }), /* @__PURE__ */ React.createElement("path", { d: "M16 10a4 4 0 0 1-8 0" })),
    minus: /* @__PURE__ */ React.createElement("path", { d: "M5 12h14" }),
    plus: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M5 12h14" }), /* @__PURE__ */ React.createElement("path", { d: "M12 5v14" })),
    "trash-2": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M3 6h18" }), /* @__PURE__ */ React.createElement("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }), /* @__PURE__ */ React.createElement("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }), /* @__PURE__ */ React.createElement("line", { x1: "10", x2: "10", y1: "11", y2: "17" }), /* @__PURE__ */ React.createElement("line", { x1: "14", x2: "14", y1: "11", y2: "17" })),
    "image-plus": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M16 5h6" }), /* @__PURE__ */ React.createElement("path", { d: "M19 2v6" }), /* @__PURE__ */ React.createElement("path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" }), /* @__PURE__ */ React.createElement("path", { d: "m3 16 5-5 3 3 3-3 4 4" })),
    "map-pin": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "10", r: "3" })),
    "credit-card": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { width: "20", height: "14", x: "2", y: "5", rx: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "2", x2: "22", y1: "10", y2: "10" })),
    pencil: /* @__PURE__ */ React.createElement("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }),
    eye: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" })),
    "eye-off": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }), /* @__PURE__ */ React.createElement("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }), /* @__PURE__ */ React.createElement("path", { d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }), /* @__PURE__ */ React.createElement("line", { x1: "2", x2: "22", y1: "2", y2: "22" })),
    "layout-dashboard": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { width: "7", height: "9", x: "3", y: "3", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { width: "7", height: "5", x: "14", y: "3", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { width: "7", height: "9", x: "14", y: "12", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { width: "7", height: "5", x: "3", y: "16", rx: "1" })),
    package: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m7.5 4.27 9 5.15" }), /* @__PURE__ */ React.createElement("path", { d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" }), /* @__PURE__ */ React.createElement("path", { d: "M3.3 7 12 12l8.7-5" }), /* @__PURE__ */ React.createElement("path", { d: "M12 22V12" })),
    tags: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" }), /* @__PURE__ */ React.createElement("circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor" })),
    users: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }), /* @__PURE__ */ React.createElement("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })),
    "bar-chart": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "12", y1: "20", y2: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "18", x2: "18", y1: "20", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "6", x2: "6", y1: "20", y2: "16" })),
    "external-link": /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M15 3h6v6" }), /* @__PURE__ */ React.createElement("path", { d: "M10 14 21 3" }), /* @__PURE__ */ React.createElement("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }))
  };
  function Icon({ name, className }) {
    const inner = ICONS[name];
    return inner ? /* @__PURE__ */ React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        "aria-hidden": "true"
      },
      inner
    ) : null;
  }
  var BTN_VARIANTS = { default: "default", outline: "outline", destructive: "destructive", ghost: "ghost" };
  function Button({ variant = "default", size, className, children, ...props }) {
    const isIcon = variant === "icon";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        "data-variant": isIcon ? "ghost" : BTN_VARIANTS[variant] || variant,
        "data-size": isIcon ? size || "icon" : size,
        className: cn("btn", className),
        ...props
      },
      children
    );
  }
  function Badge({ variant = "default", className, children, ...props }) {
    return /* @__PURE__ */ React.createElement("span", { "data-variant": variant, className: cn("badge", className), ...props }, children);
  }
  function Input({ className, ...props }) {
    return /* @__PURE__ */ React.createElement("input", { ...props, className: cn("input", className) });
  }
  function Skeleton({ className }) {
    return /* @__PURE__ */ React.createElement("div", { className: cn("skeleton", className) });
  }
  function ProductCard({ p }) {
    return /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + p.slug, className: "group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-shadow" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, p.oos && /* @__PURE__ */ React.createElement(Badge, { className: "absolute top-3 left-3 z-10 bg-red-600 text-white" }, "Out of stock"), /* @__PURE__ */ React.createElement("div", { className: cn("aspect-square overflow-hidden", p.oos && "opacity-60") }, /* @__PURE__ */ React.createElement("img", { src: p.img, "data-ph": p.name, alt: p.name, onError: fallback(p.name), loading: "lazy", className: "ph transition-transform duration-300 group-hover:scale-105" }))), /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold leading-snug" }, p.name), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50" }, fmtMoney(p.price)), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-zinc-600 dark:text-zinc-300", "aria-label": "Rated " + p.rating + " out of 5" }, "\u2605 ", p.rating, " (", p.reviews, ")")));
  }
  var DEFAULT_REVIEWS = [
    { id: "d1", author: "Morgan L.", date: "2026-08-30", rating: 5, text: "Exactly as described \u2014 quality is far above the price point." },
    { id: "d2", author: "Taylor R.", date: "2026-08-14", rating: 4, text: "Great product overall; delivery took a day longer than expected." }
  ];
  var REVIEWS = [
    { id: "w1", slug: "waxed-field-jacket", author: "Jane D.", date: "2026-08-12", rating: 5, text: "Great fit, fast shipping.", own: true, images: ["assets/img/waxed-jacket-a.jpg"] },
    { id: "w2", slug: "waxed-field-jacket", author: "Marcus T.", date: "2026-07-03", rating: 4, text: "Solid waxed cotton, runs slightly large." },
    { id: "w3", slug: "waxed-field-jacket", author: "Aisha K.", date: "2026-06-21", rating: 5, text: "Repels drizzle perfectly and broke in fast.", images: ["assets/img/waxed-jacket-a.jpg"] }
  ];
  var reviewsFor = (slug) => {
    const mine = REVIEWS.filter((r) => r.slug === slug);
    if (mine.length) return mine;
    const img = (PRODUCTS.find((p) => p.slug === slug) || {}).img;
    return DEFAULT_REVIEWS.map((r) => ({ ...r, images: img ? [img] : [] }));
  };
  var catLabel = (id) => (CATS.find((c) => c.id === id) || {}).label || id;
  function Stars({ value, className }) {
    const n = Math.round(value);
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        className: cn("tracking-tight text-amber-500 dark:text-amber-400", className),
        role: "img",
        "aria-label": "Rated " + value + " out of 5"
      },
      "\u2605".repeat(n),
      "\u2606".repeat(5 - n)
    );
  }
  function StarPicker({ value, onChange }) {
    return /* @__PURE__ */ React.createElement("div", { className: "mt-1.5 flex gap-1.5" }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: n,
        type: "button",
        "aria-label": n + " star" + (n > 1 ? "s" : ""),
        onClick: () => onChange(n),
        "aria-pressed": n <= value,
        className: cn(
          "cursor-pointer rounded-md border-0 bg-transparent p-1 transition-transform hover:scale-110 focus:outline-none",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )
      },
      /* @__PURE__ */ React.createElement(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          fill: n <= value ? "currentColor" : "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: cn("h-7 w-7", n <= value ? "text-amber-500 dark:text-amber-400" : "text-zinc-300 dark:text-zinc-700")
        },
        /* @__PURE__ */ React.createElement("path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" })
      )
    )));
  }
  function Stepper({ value, onChange, max, disabled }) {
    const clamp = (n) => Math.min(max, Math.max(1, n));
    return /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "h-9 w-9 rounded-full",
        disabled: disabled || value <= 1,
        "aria-label": "Decrease quantity",
        onClick: () => onChange(clamp(value - 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "minus", className: "h-4 w-4" })
    ), /* @__PURE__ */ React.createElement("span", { className: "w-10 text-center text-sm font-semibold tabular-nums" }, value), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "h-9 w-9 rounded-full",
        disabled: disabled || value >= max,
        "aria-label": "Increase quantity",
        onClick: () => onChange(clamp(value + 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", className: "h-4 w-4" })
    ));
  }
  function ReviewCard({ r, onDelete }) {
    const initials = r.author.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return /* @__PURE__ */ React.createElement("article", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header flex-row items-center justify-between gap-4 p-4 pb-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "avatar", "data-size": "default", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: "avatar-fallback" }, initials)), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium leading-tight" }, r.author), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-xs text-zinc-500 dark:text-zinc-400" }, r.date))), /* @__PURE__ */ React.createElement(Stars, { value: r.rating })), /* @__PURE__ */ React.createElement("div", { className: "card-content p-4 pt-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm leading-relaxed text-zinc-700 dark:text-zinc-300" }, r.text), r.images && r.images.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap gap-2" }, r.images.map((src, i) => /* @__PURE__ */ React.createElement(
      "img",
      {
        key: i,
        src,
        alt: r.author + " photo " + (i + 1),
        onError: fallback("review photo"),
        loading: "lazy",
        className: "h-16 w-16 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
      }
    )))), onDelete && /* @__PURE__ */ React.createElement("div", { className: "card-footer p-4 pt-0" }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", className: "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300", onClick: onDelete }, /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "mr-1.5 h-4 w-4" }), " Delete")));
  }
  function ProductDetailView({ onAddToCart }) {
    const params = new URLSearchParams(location.search);
    const [p] = useState(() => PRODUCTS.find((x) => x.slug === params.get("slug")));
    const [qty, setQty] = useState(1);
    const [thumb, setThumb] = useState(0);
    const [reviews, setReviews] = useState(() => reviewsFor(p ? p.slug : ""));
    const [formOpen, setFormOpen] = useState(false);
    const [formRate, setFormRate] = useState(5);
    const [formText, setFormText] = useState("");
    const [formImgs, setFormImgs] = useState([]);
    const [fileError, setFileError] = useState("");
    const fileRef = useRef(null);
    const addFiles = (files) => {
      const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imgs.length !== files.length) setFileError("Only image files are allowed");
      const room = 5 - formImgs.length;
      if (room <= 0) {
        setFileError("A review can have up to 5 photos");
        return;
      }
      setFileError("");
      setFormImgs((prev) => [...prev, ...imgs.slice(0, room)].map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
      if (fileRef.current) fileRef.current.value = "";
    };
    const removeImg = (i) => {
      setFormImgs((prev) => {
        const url = prev[i].url;
        URL.revokeObjectURL(url);
        return prev.filter((_, j) => j !== i);
      });
    };
    if (!p) {
      return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-semibold text-zinc-900 dark:text-zinc-50" }, "Product not found"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-zinc-500 dark:text-zinc-400" }, "The product you\\u2019re looking for doesn\\u2019t exist."), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "outline", className: "btn mt-6" }, "Back to products"));
    }
    const oos = p.stock === 0;
    const catLink = "./products-page.html?category_id=" + p.cat;
    const views = [p.img, ...p.gallery || []].slice(0, 4);
    const related = PRODUCTS.filter((x) => x.slug !== p.slug).sort((a, b) => (b.cat === p.cat ? 1 : 0) - (a.cat === p.cat ? 1 : 0)).slice(0, 4);
    const crumbItem = (label, href, last) => /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, last ? /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, label) : /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href }, label));
    const crumbSep = () => /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" }));
    const addReview = () => {
      if (!formText.trim()) return;
      setReviews((rs) => [{ id: "u" + Date.now(), author: "Jane D.", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), rating: formRate, text: formText.trim(), own: true, images: formImgs.map((f) => f.url) }, ...rs]);
      setFormOpen(false);
      setFormText("");
      setFormImgs([]);
      toast("Review posted");
    };
    const deleteReview = (id) => {
      setReviews((rs) => rs.filter((r) => r.id !== id));
      toast("Review deleted");
    };
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, crumbItem("Home", "./home-page.html"), crumbSep(), crumbItem("Products", "./products-page.html"), crumbSep(), crumbItem(catLabel(p.cat), catLink), crumbSep(), crumbItem(p.name, null, true))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: views[thumb],
        "data-ph": p.name + " photo",
        alt: p.name + " \u2014 photo " + (thumb + 1),
        onError: fallback(p.name),
        loading: "eager",
        className: "ph"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-3 grid grid-cols-4 gap-3" }, views.map((v, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        type: "button",
        "aria-label": "View photo " + (i + 1),
        "aria-current": i === thumb,
        onClick: () => setThumb(i),
        className: cn(
          "block aspect-square overflow-hidden rounded-xl border-2 bg-white dark:bg-zinc-900 transition-colors",
          i === thumb ? "border-zinc-900 dark:border-zinc-100" : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
        )
      },
      /* @__PURE__ */ React.createElement("img", { src: v, alt: "", onError: fallback(p.name + " photo"), loading: "lazy", className: "ph" })
    )))), /* @__PURE__ */ React.createElement("div", { className: "card p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("a", { href: catLink, className: "text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-300" }, catLabel), /* @__PURE__ */ React.createElement("span", { className: "text-zinc-300 dark:text-zinc-600" }, "|"), oos ? /* @__PURE__ */ React.createElement(Badge, { variant: "destructive" }, "Out of stock") : /* @__PURE__ */ React.createElement(Badge, { variant: p.stock <= 10 ? "outline" : "default" }, p.stock <= 10 ? "Only " + p.stock + " left" : "In stock")), /* @__PURE__ */ React.createElement("h1", { className: "mt-3 text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50" }, p.name), /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Stars, { value: p.rating }), /* @__PURE__ */ React.createElement("a", { href: "#reviews", className: "text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400" }, p.reviews, " reviews")), /* @__PURE__ */ React.createElement("p", { className: "mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50" }, fmtMoney(p.price)), /* @__PURE__ */ React.createElement("hr", { className: "separator my-6" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300" }, "Quantity"), !oos && p.stock <= 10 && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-zinc-500 dark:text-zinc-400" }, p.stock, " available")), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement(Stepper, { value: qty, onChange: setQty, max: p.stock, disabled: oos }), /* @__PURE__ */ React.createElement(Button, { className: "min-w-[10rem] flex-1", disabled: oos, onClick: () => onAddToCart(p, qty) }, "Add to Cart")), /* @__PURE__ */ React.createElement("dl", { className: "mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "SKU"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium uppercase" }, "HS-", p.slug.slice(0, 8)), /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Shipping"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium" }, "Free over $50"), /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Returns"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium" }, "30 days")))), /* @__PURE__ */ React.createElement("section", { className: "mt-10" }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h2", { className: "card-title" }, "Description")), /* @__PURE__ */ React.createElement("div", { className: "card-content pt-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm leading-relaxed text-zinc-700 dark:text-zinc-300" }, p.desc), /* @__PURE__ */ React.createElement("ul", { className: "mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" }, /* @__PURE__ */ React.createElement("li", null, "Built from durable, weather-ready materials"), /* @__PURE__ */ React.createElement("li", null, "Your pick \u2014 style, finish and size at checkout"), /* @__PURE__ */ React.createElement("li", null, "Free shipping over $50 \xB7 30-day free returns"))))), /* @__PURE__ */ React.createElement("hr", { className: "separator my-12" }), /* @__PURE__ */ React.createElement("section", { id: "reviews", className: "scroll-mt-24" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-semibold text-zinc-900 dark:text-zinc-50" }, "Customer Reviews"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400" }, /* @__PURE__ */ React.createElement(Stars, { value: p.rating }), " ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-zinc-700 dark:text-zinc-200" }, p.rating), " (", p.reviews, ")")), /* @__PURE__ */ React.createElement(Button, { onClick: () => setFormOpen(true) }, "Post Review")), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid gap-4 md:grid-cols-2" }, reviews.map((r) => /* @__PURE__ */ React.createElement(ReviewCard, { key: r.id, r, onDelete: r.own ? () => deleteReview(r.id) : null })))), /* @__PURE__ */ React.createElement("section", { className: "mt-14" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-semibold text-zinc-900 dark:text-zinc-50" }, "You might also like"), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" }, related.map((x) => /* @__PURE__ */ React.createElement(ProductCard, { key: x.slug, p: x })))), /* @__PURE__ */ React.createElement(Sheet, { side: "right", className: "w-full max-w-[420px]", open: formOpen, onClose: () => setFormOpen(false), "aria-label": "Post a review" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-content flex h-full flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-header shrink-0" }, /* @__PURE__ */ React.createElement("h2", { className: "sheet-title" }, "Post a Review")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "sheet-close-x", "aria-label": "Close review form", onClick: () => setFormOpen(false) }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("div", { className: "sheet-body min-h-0 flex-1 overflow-y-auto" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-500 dark:text-zinc-400" }, "Reviewing ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-zinc-900 dark:text-zinc-50" }, p.name)), /* @__PURE__ */ React.createElement("span", { className: "mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200" }, "Your rating"), /* @__PURE__ */ React.createElement(StarPicker, { value: formRate, onChange: setFormRate }), /* @__PURE__ */ React.createElement("label", { className: "mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200", htmlFor: "review-text" }, "Your review"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        id: "review-text",
        className: "textarea mt-1.5",
        placeholder: "Share what you liked or disliked...",
        value: formText,
        onChange: (e) => setFormText(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200" }, "Photos ", /* @__PURE__ */ React.createElement("span", { className: "font-normal text-zinc-400" }, "(optional, up to 5)")), /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex flex-wrap items-center gap-2" }, formImgs.map((f, i) => /* @__PURE__ */ React.createElement("span", { key: f.url, className: "relative inline-block" }, /* @__PURE__ */ React.createElement("img", { src: f.url, alt: f.name, className: "h-16 w-16 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800" }), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Remove photo",
        onClick: () => removeImg(i),
        className: "absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-3 w-3" })
    ))), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: "image/*",
        multiple: true,
        className: "hidden",
        onChange: (e) => addFiles(e.target.files),
        "aria-label": "Upload review photos"
      }
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "sm",
        type: "button",
        disabled: formImgs.length >= 5,
        onClick: () => fileRef.current && fileRef.current.click()
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "image-plus", className: "mr-1.5 h-4 w-4" }),
      " Add photos"
    )), fileError && /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-xs text-red-600 dark:text-red-400" }, fileError)), /* @__PURE__ */ React.createElement("div", { className: "mt-4 shrink-0 space-y-2" }, /* @__PURE__ */ React.createElement(Button, { className: "w-full", disabled: !formText.trim(), onClick: addReview }, "Submit review"), /* @__PURE__ */ React.createElement(Button, { variant: "outline", className: "w-full", onClick: () => setFormOpen(false) }, "Cancel")))));
  }
  var SORT_OPTIONS = [
    { id: "newest", label: "Newest" },
    { id: "price_asc", label: "Price: Low to High" },
    { id: "price_desc", label: "Price: High to Low" },
    { id: "popular", label: "Popular" }
  ];
  function SortSelect({ id, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const btnRef = useRef(null);
    const popRef = useRef(null);
    const searchRef = useRef(null);
    const popId = id + "-sort-pop";
    const listId = id + "-sort-list";
    const options = SORT_OPTIONS.filter((o) => !q.trim() || o.label.toLowerCase().includes(q.trim().toLowerCase()));
    useEffect(() => {
      const el = popRef.current;
      if (!el) return;
      const onToggle = (e) => {
        const isOpen = e.newState === "open";
        setOpen(isOpen);
        if (isOpen) {
          setQ("");
          if (searchRef.current) searchRef.current.focus();
        } else if (btnRef.current) btnRef.current.focus();
      };
      el.addEventListener("toggle", onToggle);
      return () => el.removeEventListener("toggle", onToggle);
    }, []);
    const onTriggerClick = () => {
      const pop = popRef.current, btn = btnRef.current;
      if (!pop || !btn) return;
      if (!pop.matches(":popover-open")) {
        const r = btn.getBoundingClientRect();
        pop.style.position = "fixed";
        pop.style.top = r.bottom + 6 + "px";
        pop.style.left = r.left + "px";
      }
      pop.togglePopover();
    };
    const choose = (sel) => {
      onChange(sel);
      if (popRef.current) popRef.current.hidePopover();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "combobox relative min-w-0" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        ref: btnRef,
        className: "btn combobox-trigger w-auto",
        "data-variant": "outline",
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-controls": popId,
        onClick: onTriggerClick
      },
      /* @__PURE__ */ React.createElement("span", { className: "combobox-value truncate" }, SORT_OPTIONS.find((o) => o.id === value).label),
      /* @__PURE__ */ React.createElement(Icon, { name: "chevrons-up-down", className: "combobox-chevron h-4 w-4" })
    ), /* @__PURE__ */ React.createElement("div", { ref: popRef, id: popId, popover: "auto", className: "combobox-content w-64 max-w-[calc(100vw-2rem)]" }, /* @__PURE__ */ React.createElement("div", { className: "combobox-search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", className: "combobox-search-icon h-4 w-4" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: searchRef,
        type: "text",
        role: "combobox",
        className: "combobox-search-input",
        "aria-expanded": "true",
        "aria-controls": listId,
        "aria-autocomplete": "list",
        autoComplete: "off",
        placeholder: "Search sort options...",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && options.length === 1) choose(options[0].id);
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { id: listId, role: "listbox", className: "combobox-listbox", "aria-label": "Sort options" }, /* @__PURE__ */ React.createElement("div", { className: "combobox-empty", hidden: options.length > 0 }, "No results found."), options.map((o) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: o.id,
        role: "option",
        className: "combobox-item",
        "aria-selected": o.id === value,
        "data-value": o.id,
        onClick: () => choose(o.id)
      },
      /* @__PURE__ */ React.createElement("span", { className: "truncate" }, o.label)
    )))));
  }
  function FilterControls({ f, set, closeDrawer, group = "cat" }) {
    const onApply = () => {
      if (f.min != null && f.max != null && f.min > f.max) {
        toast("Min price can't exceed max", true);
        return;
      }
      toast("Filters applied");
      if (closeDrawer) closeDrawer();
    };
    const toggleRating = (r) => set({ rating: f.rating === r ? null : r });
    const clear = () => {
      set({ cat: "all", min: null, max: null, rating: null });
      toast("Filters cleared");
    };
    const radio = (id, label, count) => /* @__PURE__ */ React.createElement("div", { className: "radio-item" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "radio",
        type: "radio",
        name: group,
        id: group + "-" + id,
        value: id,
        checked: f.cat === id,
        onChange: () => set({ cat: id })
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: group + "-" + id }, label), count != null && /* @__PURE__ */ React.createElement("span", { className: "ml-auto text-xs text-zinc-400 dark:text-zinc-600" }, count));
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("fieldset", { className: "radio-group" }, /* @__PURE__ */ React.createElement("legend", { className: "text-sm font-semibold" }, "Category"), radio("all", "All", PRODUCTS.length), CATS.map((c) => radio(c.id, c.label, countByCat(c.id)))), /* @__PURE__ */ React.createElement("fieldset", { className: "mt-6" }, /* @__PURE__ */ React.createElement("legend", { className: "text-sm font-semibold" }, "Price"), /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex items-center gap-2 text-sm" }, /* @__PURE__ */ React.createElement(
      Input,
      {
        type: "number",
        min: "0",
        step: "0.01",
        placeholder: "Min",
        "aria-label": "Minimum price",
        value: f.min ?? "",
        onChange: (e) => set({ min: e.target.value === "" ? null : parseFloat(e.target.value) })
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "text-zinc-400" }, "\u2013"), /* @__PURE__ */ React.createElement(
      Input,
      {
        type: "number",
        min: "0",
        step: "0.01",
        placeholder: "Max",
        "aria-label": "Maximum price",
        value: f.max ?? "",
        onChange: (e) => set({ max: e.target.value === "" ? null : parseFloat(e.target.value) })
      }
    )), /* @__PURE__ */ React.createElement(Button, { onClick: onApply, className: "mt-2 w-full" }, "Apply")), /* @__PURE__ */ React.createElement("fieldset", { className: "mt-6" }, /* @__PURE__ */ React.createElement("legend", { className: "text-sm font-semibold" }, "Rating"), /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex flex-wrap gap-2" }, [4, 3, 2].map((r) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: r,
        type: "button",
        onClick: () => toggleRating(r),
        "data-variant": f.rating === r ? "default" : "outline",
        className: cn("btn rounded-full px-3 text-sm", f.rating === r && "font-semibold")
      },
      "\u2605 ",
      r,
      "+"
    )))), /* @__PURE__ */ React.createElement(Button, { variant: "link", className: "mt-6", onClick: clear }, "Clear all filters"));
  }
  function ProductsView() {
    const params = new URLSearchParams(location.search);
    const [f, setF] = useState(() => ({
      cat: params.get("category_id") || "all",
      min: params.get("min_price") ? parseFloat(params.get("min_price")) : null,
      max: params.get("max_price") ? parseFloat(params.get("max_price")) : null,
      rating: params.get("rating") ? parseFloat(params.get("rating")) : null
    }));
    const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
    const [sort, setSort] = useState(params.get("sort") || "newest");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState(null);
    const [q, setQ] = useState(params.get("search") || params.get("q"));
    const [baseUrl] = useState("./products-page.html");
    useEffect(() => {
      const t = setTimeout(() => setLoading(false), 700);
      return () => clearTimeout(t);
    }, []);
    useEffect(() => {
      const p = new URLSearchParams();
      if (f.cat !== "all") p.set("category_id", f.cat);
      if (f.min != null) p.set("min_price", f.min);
      if (f.max != null) p.set("max_price", f.max);
      if (f.rating != null) p.set("rating", f.rating);
      if (sort !== "newest") p.set("sort", sort);
      history.replaceState(null, "", baseUrl + (p.toString() ? "?" + p.toString() : ""));
    }, [f, sort]);
    const filtered = PRODUCTS.filter((p) => (f.cat === "all" || p.cat === f.cat) && (f.min == null || p.price >= f.min) && (f.max == null || p.price <= f.max) && (f.rating == null || p.rating >= f.rating));
    const sorted = [...filtered].sort((a, b) => sort === "price_asc" ? a.price - b.price : sort === "price_desc" ? b.price - a.price : 0);
    const activeFilters = (f.cat !== "all" ? 1 : 0) + (f.min != null || f.max != null ? 1 : 0) + (f.rating != null ? 1 : 0);
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), f.cat === "all" ? /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "Products")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./products-page.html" }, "Products")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, catLabel(f.cat)))))), q && /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm" }, "Results for ", /* @__PURE__ */ React.createElement("strong", { className: "font-semibold" }, q), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Clear search", onClick: () => {
      setQ(null);
      history.replaceState(null, "", baseUrl);
    }, className: "hover:text-zinc-900 dark:hover:text-zinc-50" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" })))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex items-center gap-2 sm:gap-3 lg:hidden" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", className: "shrink-0", onClick: (e) => {
      e.stopPropagation();
      setOpenId("filters");
    } }, /* @__PURE__ */ React.createElement(Icon, { name: "sliders-horizontal", className: "mr-2 h-4 w-4 shrink-0" }), " Filters", activeFilters > 0 && /* @__PURE__ */ React.createElement(Badge, { className: "ml-2 shrink-0" }, activeFilters)), /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement(SortSelect, { id: "mobile", value: sort, onChange: setSort })), /* @__PURE__ */ React.createElement("p", { className: "shrink-0 text-sm text-zinc-500 dark:text-zinc-400", "aria-live": "polite" }, sorted.length, " result", sorted.length === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex gap-8" }, /* @__PURE__ */ React.createElement("aside", { className: "hidden lg:block w-[260px] shrink-0", "aria-label": "Filters" }, /* @__PURE__ */ React.createElement(FilterControls, { f, set, group: "cat-lg" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "hidden lg:flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement(SortSelect, { id: "desktop", value: sort, onChange: setSort }), /* @__PURE__ */ React.createElement("p", { id: "resultCount", className: "text-sm text-zinc-500 dark:text-zinc-400", "aria-live": "polite" }, sorted.length, " result", sorted.length === 1 ? "" : "s")), loading ? /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", "aria-hidden": "true" }, Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4" }, /* @__PURE__ */ React.createElement(Skeleton, { className: "aspect-square w-full" }), /* @__PURE__ */ React.createElement(Skeleton, { className: "mt-3 h-4 w-3/4" }), /* @__PURE__ */ React.createElement(Skeleton, { className: "mt-2 h-4 w-1/4" }), /* @__PURE__ */ React.createElement(Skeleton, { className: "mt-2 h-4 w-1/3" })))) : sorted.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "mt-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 py-16 text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-600 dark:text-zinc-300" }, "No products match your filters"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      set({ cat: "all", min: null, max: null, rating: null });
    }, className: "mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 underline hover:no-underline" }, "Clear filters")) : /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" }, sorted.map((p) => /* @__PURE__ */ React.createElement(ProductCard, { key: p.slug, p }))), /* @__PURE__ */ React.createElement("nav", { className: "pagination mt-10", "aria-label": "Pagination" }, /* @__PURE__ */ React.createElement("ul", { className: "pagination-list" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "rounded-full",
        "aria-label": "Previous page",
        disabled: page <= 1,
        onClick: () => setPage(Math.max(1, page - 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left" })
    )), [1, 2, 3, "\u2026", 10].map((n, i) => n === "\u2026" ? /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "pagination-ellipsis" }, "\u2026")) : /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "icon",
        variant: page === n ? "default" : "ghost",
        className: cn("rounded-full", page === n && "font-semibold"),
        "data-page": n,
        "aria-current": page === n ? "page" : void 0,
        onClick: () => setPage(n)
      },
      n
    ))), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "rounded-full",
        "aria-label": "Next page",
        disabled: page >= 10,
        onClick: () => setPage(Math.min(10, page + 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })
    )))))), /* @__PURE__ */ React.createElement(
      Sheet,
      {
        side: "right",
        open: openId === "filters",
        onClose: () => setOpenId(null),
        "aria-label": "Filters",
        className: "w-full max-w-[320px]"
      },
      /* @__PURE__ */ React.createElement("div", { className: "sheet-content flex h-full flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-header shrink-0" }, /* @__PURE__ */ React.createElement("h2", { className: "sheet-title" }, "Filters")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "sheet-close-x", "aria-label": "Close filters", onClick: () => setOpenId(null) }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("div", { className: "sheet-body min-h-0 flex-1 overflow-y-auto" }, /* @__PURE__ */ React.createElement(FilterControls, { f, set, closeDrawer: () => setOpenId(null), group: "cat-m" })), /* @__PURE__ */ React.createElement("div", { className: "mt-4 shrink-0" }, /* @__PURE__ */ React.createElement(Button, { className: "w-full", onClick: () => setOpenId(null) }, "Show results")))
    ));
  }
  function HomeView() {
    const featured = PRODUCTS.filter((p) => ["waxed-field-jacket", "weekender-duffel", "trail-mug", "daypack"].includes(p.slug));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("section", { className: "relative h-[420px] overflow-hidden" }, /* @__PURE__ */ React.createElement("img", { src: "https://picsum.photos/id/1015/1280/420", "data-ph": "Horizon Supply Co.", alt: "", onError: fallback("Horizon Supply Co."), className: "ph absolute inset-0", loading: "eager" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 mx-auto max-w-7xl h-full px-4 flex flex-col items-start justify-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm uppercase tracking-[0.2em] text-zinc-200 mb-3" }, "SS26 Collection"), /* @__PURE__ */ React.createElement("h1", { className: "font-display text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xl" }, "Objects with a point of view"), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-zinc-200 max-w-md" }, "Carry gear built for the days you stay out longer than you said you would."), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", className: "mt-6 inline-flex h-11 items-center rounded-[10px] bg-white px-6 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100" }, "Shop Now"))), /* @__PURE__ */ React.createElement("section", { className: "mx-auto max-w-7xl px-4 py-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-semibold text-zinc-900 dark:text-zinc-50" }, "Shop by Category"), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, CATS.map((c) => /* @__PURE__ */ React.createElement("a", { key: c.id, href: "./products-page.html?category_id=" + c.id, className: "group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow" }, /* @__PURE__ */ React.createElement("div", { className: "aspect-square overflow-hidden" }, /* @__PURE__ */ React.createElement("img", { src: c.img, "data-ph": c.label, alt: c.label, onError: fallback(c.label), loading: "lazy", className: "ph transition-transform duration-300 group-hover:scale-105" })), /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold" }, c.label), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-zinc-500 dark:text-zinc-400" }, countByCat(c.id), " items")))))), /* @__PURE__ */ React.createElement("section", { className: "mx-auto max-w-7xl px-4 pb-16" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-semibold text-zinc-900 dark:text-zinc-50" }, "Featured Products"), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", className: "text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:underline" }, "View all ", /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u2192"))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, featured.map((p) => /* @__PURE__ */ React.createElement(ProductCard, { key: p.slug, p })))));
  }
  function Header({ cartCount, onCart, onMenu, dark, onTheme }) {
    const [acctOpen, setAcctOpen] = useState(false);
    const [sugOpen, setSugOpen] = useState(false);
    const acctBoxRef = useRef(null);
    const acctMenuRef = useRef(null);
    useEffect(() => {
      const el = acctMenuRef.current;
      if (!el) return;
      const onToggle = (e) => {
        const isOpen = e.newState === "open";
        setAcctOpen(isOpen);
        if (isOpen && acctBoxRef.current && !CSS.supports("position-anchor", "--dummy-anchor")) {
          const r = acctBoxRef.current.getBoundingClientRect();
          const w = el.getBoundingClientRect().width;
          el.style.position = "fixed";
          el.style.top = r.bottom + 4 + "px";
          el.style.left = Math.max(8, r.right - w) + "px";
          el.style.margin = "0";
        }
      };
      el.addEventListener("toggle", onToggle);
      return () => el.removeEventListener("toggle", onToggle);
    }, []);
    const onAcctClick = () => {
      const menu = acctMenuRef.current;
      if (menu) menu.togglePopover();
    };
    return /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-zinc-200 dark:bg-[#09090B]/90 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl h-full flex items-center gap-6 px-4" }, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "font-display text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50" }, "Horizon Supply Co.")), /* @__PURE__ */ React.createElement("nav", { "aria-label": "Primary", className: "hidden md:flex items-center gap-1" }, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "rounded-full px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800" }, "Home"), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", className: "rounded-full px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800" }, "Products")), /* @__PURE__ */ React.createElement("div", { className: "relative hidden md:block w-40 lg:w-[420px] shrink min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex items-center" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", className: "pointer-events-none absolute left-3 h-4 w-4 text-zinc-500 dark:text-zinc-400" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        "aria-label": "Search products",
        placeholder: "Search products\u2026",
        onFocus: () => setSugOpen(true),
        onBlur: () => setTimeout(() => setSugOpen(false), 150),
        className: "input pl-9"
      }
    )), sugOpen && /* @__PURE__ */ React.createElement("div", { className: "combobox-content absolute left-0 right-0 top-11 z-20 py-1" }, /* @__PURE__ */ React.createElement("p", { className: "px-4 py-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400" }, "Recent"), ["waxed field jacket", "canvas tote", "insulated bottle"].map((s) => /* @__PURE__ */ React.createElement("a", { key: s, href: "./products-page.html?search=" + encodeURIComponent(s), className: "combobox-item px-4 py-2 text-sm" }, s)))), /* @__PURE__ */ React.createElement("div", { className: "ml-auto flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Button, { variant: "icon", "aria-label": "Toggle dark mode", onClick: onTheme }, /* @__PURE__ */ React.createElement(Icon, { name: dark ? "sun" : "moon", className: "h-5 w-5" })), /* @__PURE__ */ React.createElement(Button, { variant: "icon", "aria-label": "Open cart, " + cartCount + " items", onClick: onCart, className: "relative" }, /* @__PURE__ */ React.createElement(Icon, { name: "shopping-cart", className: "h-5 w-5" }), /* @__PURE__ */ React.createElement("span", { className: "absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 px-1 text-[10px] font-semibold text-white dark:text-zinc-900" }, cartCount)), /* @__PURE__ */ React.createElement("div", { ref: acctBoxRef, className: "hidden sm:block" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        className: "gap-2 px-3",
        "aria-label": "Account menu",
        "aria-haspopup": "menu",
        "aria-expanded": acctOpen,
        "aria-controls": "account-menu",
        "data-dropdown-trigger": "account-menu",
        onClick: onAcctClick
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "user", className: "h-5 w-5" }),
      " ",
      /* @__PURE__ */ React.createElement("span", null, "Jane"),
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", className: "h-4 w-4 opacity-60" })
    ), /* @__PURE__ */ React.createElement("div", { ref: acctMenuRef, id: "account-menu", role: "menu", popover: "auto", className: "dropdown-content", "aria-label": "Account menu" }, /* @__PURE__ */ React.createElement("div", { className: "dropdown-label" }, "Signed in as Jane Doe \xB7 jane@mail.com"), /* @__PURE__ */ React.createElement("a", { role: "menuitem", className: "dropdown-item", href: "./profile-page.html" }, "My Profile"), /* @__PURE__ */ React.createElement("a", { role: "menuitem", className: "dropdown-item", href: "./orders-page.html" }, "My Orders"), /* @__PURE__ */ React.createElement("a", { role: "menuitem", className: "dropdown-item", href: "./admin-page.html" }, "Admin Panel"), /* @__PURE__ */ React.createElement("div", { className: "dropdown-separator", role: "separator" }), /* @__PURE__ */ React.createElement("a", { role: "menuitem", className: "dropdown-item text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white", "data-variant": "destructive", href: "./login-page.html" }, "Logout"))), /* @__PURE__ */ React.createElement(Button, { variant: "icon", "aria-label": "Open menu", className: "md:hidden", onClick: onMenu }, /* @__PURE__ */ React.createElement(Icon, { name: "menu", className: "h-5 w-5" })))));
  }
  function Footer() {
    return /* @__PURE__ */ React.createElement("footer", { className: "border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-display text-xl font-extrabold" }, "Horizon Supply Co."), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-zinc-500 dark:text-zinc-400" }, "Objects with a point of view.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold" }, "Quick Links"), /* @__PURE__ */ React.createElement("ul", { className: "mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "hover:underline" }, "Home")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", className: "hover:underline" }, "Products")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "./orders-page.html", className: "hover:underline" }, "My Orders")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "./profile-page.html", className: "hover:underline" }, "My Profile")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold" }, "Support"), /* @__PURE__ */ React.createElement("ul", { className: "mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:underline" }, "Help Center")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:underline" }, "Contact Us")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:underline" }, "Shipping")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#", className: "hover:underline" }, "Returns")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold" }, "Follow us"), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex gap-3" }, [["facebook", "Facebook"], ["x", "X (Twitter)"], ["instagram", "Instagram"]].map(([slug, label]) => /* @__PURE__ */ React.createElement("a", { key: slug, href: "#", "aria-label": label, className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700" }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.simpleicons.org/" + slug + "/18181B", alt: label, onError: fallback(label), className: "social-icon h-4 w-4" }))), /* @__PURE__ */ React.createElement("a", { href: "#", "aria-label": "LinkedIn", className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700" }, /* @__PURE__ */ React.createElement("svg", { role: "img", viewBox: "0 0 24 24", className: "social-icon h-4 w-4", fill: "#18181B", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" })))), /* @__PURE__ */ React.createElement("p", { className: "mt-6 text-sm font-semibold" }, "We accept"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-xs text-zinc-500 dark:text-zinc-400" }, "Visa\xA0\xA0\xB7\xA0\xA0Mastercard\xA0\xA0\xB7\xA0\xA0Amex"))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-zinc-200 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("p", { className: "mx-auto max-w-7xl px-4 py-4 text-xs text-zinc-500 dark:text-zinc-400" }, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " Horizon Supply Co. \u2014 All rights reserved")));
  }
  var INITIAL_CART = [
    { key: "waxed-field-jacket", name: "Waxed Field Jacket", img: "assets/img/waxed-jacket-a.jpg", price: 189, quantity: 2 },
    { key: "weekender-duffel", name: "Weekender Duffel", img: "assets/img/duffel-a.jpg", price: 168, quantity: 1 }
  ];
  function Sheet({ side = "right", open, onClose, className, children, ...rest }) {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (open && !el.open) {
        try {
          el.showModal();
        } catch (err) {
        }
      } else if (!open && el.open) {
        el.close();
      }
    }, [open]);
    useEffect(() => {
      const el = ref.current;
      const onBackdrop = (e) => {
        if (e.target === el) onClose();
      };
      el.addEventListener("click", onBackdrop);
      el.addEventListener("close", onClose);
      return () => {
        el.removeEventListener("click", onBackdrop);
        el.removeEventListener("close", onClose);
      };
    }, []);
    return /* @__PURE__ */ React.createElement("dialog", { ...rest, ref, className: cn("sheet", className), "data-side": side, tabIndex: -1 }, children);
  }
  function CartDrawer({ open, onClose, lines, setLines }) {
    const changeQty = (key, delta) => setLines((ls) => ls.map((l) => l.key === key ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l));
    const remove = (key) => setLines((ls) => ls.filter((l) => l.key !== key));
    const sub_total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    return /* @__PURE__ */ React.createElement(Sheet, { side: "right", className: "w-full max-w-[420px]", open, onClose, "aria-label": "Cart" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-content flex h-full flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-header shrink-0" }, /* @__PURE__ */ React.createElement("h2", { className: "sheet-title" }, "Cart ", /* @__PURE__ */ React.createElement("span", { className: "text-zinc-500 dark:text-zinc-400" }, "(", count, ")"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "sheet-close-x", "aria-label": "Close cart", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("div", { className: "sheet-body min-h-0 flex-1 space-y-4 overflow-y-auto" }, lines.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-16 text-center" }, /* @__PURE__ */ React.createElement(Icon, { name: "shopping-bag", className: "mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" }), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-zinc-500 dark:text-zinc-400" }, "Your cart is empty"), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", onClick: onClose, "data-variant": "outline", className: "btn mt-4" }, "Continue shopping")) : lines.map((l) => /* @__PURE__ */ React.createElement("div", { key: l.key, className: "flex gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement("img", { src: l.img, alt: "", onError: fallback(l.name), className: "ph", loading: "lazy" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium" }, l.name), /* @__PURE__ */ React.createElement(Button, { variant: "icon", className: "h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-400", "aria-label": "Remove " + l.name, onClick: () => remove(l.key) }, /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "h-4 w-4" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center rounded-full border border-zinc-300 dark:border-zinc-700" }, /* @__PURE__ */ React.createElement(Button, { variant: "icon", className: "h-8 w-8", "aria-label": "Decrease quantity", disabled: l.quantity <= 1, onClick: () => changeQty(l.key, -1) }, /* @__PURE__ */ React.createElement(Icon, { name: "minus", className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("span", { className: "w-6 text-center text-sm font-medium" }, l.quantity), /* @__PURE__ */ React.createElement(Button, { variant: "icon", className: "h-8 w-8", "aria-label": "Increase quantity", onClick: () => changeQty(l.key, 1) }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", className: "h-4 w-4" }))), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold" }, fmtMoney(l.price * l.quantity))))))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 shrink-0 space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-zinc-500 dark:text-zinc-400" }, "Subtotal"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, fmtMoney(sub_total))), /* @__PURE__ */ React.createElement("a", { href: "./checkout-page.html", "data-variant": "default", className: "btn w-full", onClick: onClose }, "Checkout"), /* @__PURE__ */ React.createElement("a", { href: "./cart-page.html", "data-variant": "outline", className: "btn w-full", onClick: onClose }, "View Cart"))));
  }
  var CART_PRICING = (lines) => {
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
      if (open && !el.open) {
        try {
          el.showModal();
        } catch (err) {
        }
      } else if (!open && el.open) {
        el.close();
      }
    }, [open]);
    useEffect(() => {
      const el = ref.current;
      const onBackdrop = (e) => {
        if (e.target === el) onClose();
      };
      el.addEventListener("click", onBackdrop);
      el.addEventListener("close", onClose);
      return () => {
        el.removeEventListener("click", onBackdrop);
        el.removeEventListener("close", onClose);
      };
    }, []);
    return /* @__PURE__ */ React.createElement("dialog", { ref, className: "dialog", tabIndex: -1, "aria-label": title }, /* @__PURE__ */ React.createElement("div", { className: "dialog-content relative" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "sheet-close-x", "aria-label": "Close", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("div", { className: "dialog-header" }, /* @__PURE__ */ React.createElement("h2", { className: "dialog-title" }, title), description && /* @__PURE__ */ React.createElement("p", { className: "dialog-description" }, description)), children));
  }
  function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel }) {
    return /* @__PURE__ */ React.createElement(Modal, { open, onClose, title, description }, /* @__PURE__ */ React.createElement("div", { className: "dialog-footer" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button,
      {
        className: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
        onClick: () => {
          onConfirm();
          onClose();
        }
      },
      confirmLabel
    )));
  }
  function CartView({ lines, setLines }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const setQty = (key, qty) => setLines((ls) => ls.map((l) => l.key === key ? { ...l, quantity: qty } : l));
    const remove = (key) => setLines((ls) => ls.filter((l) => l.key !== key));
    const maxOf = (key) => (PRODUCTS.find((p) => p.slug === key) || { stock: 99 }).stock;
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const { sub_total, shipping, tax, total } = CART_PRICING(lines);
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "Cart")))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-display font-semibold tracking-tight" }, "Cart ", /* @__PURE__ */ React.createElement("span", { className: "align-middle text-base font-normal text-zinc-500 dark:text-zinc-400" }, "(", count, " ", count === 1 ? "item" : "items", ")")), count > 0 && /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setConfirmOpen(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "mr-1.5 h-4 w-4" }), " Clear cart")), lines.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement(Icon, { name: "shopping-bag", className: "h-9 w-9 text-zinc-400 dark:text-zinc-500" })), /* @__PURE__ */ React.createElement("h2", { className: "mt-6 text-xl font-semibold" }, "Your cart is empty"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-zinc-500 dark:text-zinc-400" }, "Add gear you like and it will show up here, ready for checkout."), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "default", className: "btn mt-6" }, "Start shopping")) : /* @__PURE__ */ React.createElement("div", { className: "mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, lines.map((l) => /* @__PURE__ */ React.createElement("article", { key: l.key, className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-content flex gap-4 p-4" }, /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + l.key, className: "block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement("img", { src: l.img, alt: "", onError: fallback(l.name), className: "ph", loading: "lazy" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + l.key, className: "text-sm font-medium leading-snug hover:underline" }, l.name), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400",
        "aria-label": "Remove " + l.name,
        onClick: () => remove(l.key)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "h-4 w-4" })
    )), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400" }, fmtMoney(l.price), " each"), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement(Stepper, { value: l.quantity, max: maxOf(l.key), onChange: (n) => setQty(l.key, n) }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold tabular-nums" }, fmtMoney(l.price * l.quantity)))))))), /* @__PURE__ */ React.createElement("aside", { className: "h-fit lg:sticky lg:top-24" }, /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Order Summary")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("dl", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Subtotal"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(sub_total))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Shipping"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, shipping === 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-green-600 dark:text-green-500" }, "Free") : fmtMoney(shipping))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Tax (8.25%)"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(tax)))), /* @__PURE__ */ React.createElement("div", { className: "separator my-4", role: "separator" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-base" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "Total"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, fmtMoney(total))), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400" }, "Free shipping on orders over $100"), /* @__PURE__ */ React.createElement("div", { className: "mt-6 space-y-2" }, /* @__PURE__ */ React.createElement("a", { href: "./checkout-page.html", "data-variant": "default", className: "btn w-full" }, "Checkout"), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "outline", className: "btn w-full" }, "Continue shopping")))))), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        open: confirmOpen,
        onClose: () => setConfirmOpen(false),
        title: "Clear cart?",
        description: "Remove all " + count + " items from your cart. This can't be undone.",
        confirmLabel: "Clear cart",
        onConfirm: () => {
          setLines([]);
          toast("Cart cleared");
        }
      }
    ));
  }
  var CHECKOUT_ADDRESSES = [
    { label: "Home (default)", hint: "123 Harbor Ave, Portland, OR 97205" },
    { label: "Work", hint: "400 Industry Rd, Suite 200, Portland, OR 97210" },
    { label: "New address", hint: "Enter a fresh address below" }
  ];
  var ADDR_FIELDS = [
    ["line1", "Address line 1", "Street and number", { lg: true, required: true }],
    ["line2", "Address line 2 (optional)", "Apartment, suite, etc.", { lg: true }],
    ["city", "City", "City", { required: true }],
    ["state", "State", "State", { required: true }],
    ["zip", "ZIP code", "12345", { required: true }],
    ["country", "Country", "Country", { required: true }]
  ];
  function AddressSelect({ id, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const btnRef = useRef(null);
    const popRef = useRef(null);
    const searchRef = useRef(null);
    const popId = id + "-addr-pop";
    const listId = id + "-addr-list";
    const options = CHECKOUT_ADDRESSES.filter((o) => !q.trim() || o.label.toLowerCase().includes(q.trim().toLowerCase()));
    useEffect(() => {
      const el = popRef.current;
      if (!el) return;
      const onToggle = (e) => {
        setOpen(e.newState === "open");
        if (e.newState === "open") {
          setQ("");
          if (searchRef.current) searchRef.current.focus();
        } else if (btnRef.current) btnRef.current.focus();
      };
      el.addEventListener("toggle", onToggle);
      return () => el.removeEventListener("toggle", onToggle);
    }, []);
    const onTriggerClick = () => {
      const pop = popRef.current, btn = btnRef.current;
      if (!pop || !btn) return;
      if (!pop.matches(":popover-open")) {
        const r = btn.getBoundingClientRect();
        pop.style.position = "fixed";
        pop.style.top = r.bottom + 6 + "px";
        pop.style.left = r.left + "px";
        pop.style.width = btn.offsetWidth + "px";
      }
      pop.togglePopover();
    };
    const choose = (label) => {
      onChange(label);
      if (popRef.current) popRef.current.hidePopover();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "combobox relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        ref: btnRef,
        className: "btn combobox-trigger w-full",
        "data-variant": "outline",
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-controls": popId,
        onClick: onTriggerClick
      },
      /* @__PURE__ */ React.createElement("span", { className: "combobox-value truncate" }, value),
      /* @__PURE__ */ React.createElement(Icon, { name: "chevrons-up-down", className: "combobox-chevron h-4 w-4" })
    ), /* @__PURE__ */ React.createElement("div", { ref: popRef, id: popId, popover: "auto", className: "combobox-content w-96 max-w-[calc(100vw-2rem)]" }, /* @__PURE__ */ React.createElement("div", { className: "combobox-search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", className: "combobox-search-icon h-4 w-4" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: searchRef,
        type: "text",
        role: "combobox",
        className: "combobox-search-input",
        "aria-expanded": "true",
        "aria-controls": listId,
        "aria-autocomplete": "list",
        autoComplete: "off",
        placeholder: "Search addresses...",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && options.length === 1) choose(options[0].label);
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { id: listId, role: "listbox", className: "combobox-listbox", "aria-label": "Saved addresses" }, /* @__PURE__ */ React.createElement("div", { className: "combobox-empty", hidden: options.length > 0 }, "No results found."), options.map((o) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: o.label,
        role: "option",
        className: "combobox-item",
        "aria-selected": o.label === value,
        "data-value": o.label,
        onClick: () => choose(o.label)
      },
      /* @__PURE__ */ React.createElement("span", { className: "truncate" }, o.label)
    )))));
  }
  function AddressForm({ addr, setAddr, onContinue }) {
    const set = (k, v) => setAddr((a) => ({ ...a, [k]: v }));
    const addrValid = !addr.new && ADDR_FIELDS.every(([k, , , o]) => !o.required || addr[k].trim());
    return /* @__PURE__ */ React.createElement("form", { onSubmit: (e) => {
      e.preventDefault();
      if (addrValid) onContinue();
    } }, /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, "Address"), /* @__PURE__ */ React.createElement(
      AddressSelect,
      {
        id: "shipping",
        value: addr.new ? "New address" : addr.label,
        onChange: (label) => setAddr((a) => ({ ...a, new: label === "New address", label }))
      }
    ), !addr.new && /* @__PURE__ */ React.createElement("p", { className: "label-hint" }, CHECKOUT_ADDRESSES.find((s) => s.label === addr.label).hint)), ADDR_FIELDS.map(([k, label, ph2, o]) => /* @__PURE__ */ React.createElement("div", { key: k, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "addr-" + k, className: "label" }, label), /* @__PURE__ */ React.createElement(
      Input,
      {
        id: "addr-" + k,
        className: o.lg ? void 0 : "w-full sm:w-48",
        placeholder: ph2,
        value: addr[k],
        onChange: (e) => set(k, e.target.value)
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "Set as default address"), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-xs text-zinc-500 dark:text-zinc-400" }, "Pre-fill checkout with this address next time.")), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "addr-default",
        type: "checkbox",
        role: "switch",
        className: "switch",
        checked: addr.default,
        onChange: (e) => set("default", e.target.checked)
      }
    ))), /* @__PURE__ */ React.createElement(Button, { type: "submit", className: "w-full sm:w-auto", disabled: !addrValid }, "Continue")));
  }
  function PaymentForm({ total, onPay }) {
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const pay = () => {
      setBusy(true);
      setFailed(false);
      onPay && onPay();
      window.setTimeout(() => {
        setBusy(false);
        if (Math.random() < 0.85) setDone(true);
        else {
          setFailed(true);
          toast("422 PAYMENT_FAILED \u2014 try again");
        }
      }, 1100);
    };
    if (done) {
      return /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40" }, /* @__PURE__ */ React.createElement(Icon, { name: "check", className: "h-8 w-8 text-green-600 dark:text-green-400" })), /* @__PURE__ */ React.createElement("h2", { className: "mt-4 text-lg font-semibold" }, "Payment complete (test mode)"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-zinc-500 dark:text-zinc-400" }, "No card was charged \u2014 this is a wireframe prototype."), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex flex-col justify-center gap-2 sm:flex-row" }, /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "default", className: "btn" }, "Back to store"), /* @__PURE__ */ React.createElement("a", { href: "./order-success.html", "data-variant": "outline", className: "btn" }, "View order")));
    }
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("fieldset", { className: "radio-group" }, [["card", "Credit/Debit Card", "Stripe secure checkout \u2014 you\u2019ll be redirected to pay."]].map(([id, label, hint]) => /* @__PURE__ */ React.createElement("div", { key: id, className: "radio-item flex-col !items-start gap-1 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("input", { className: "radio", type: "radio", name: "payment", id: "pm-" + id, value: id, defaultChecked: true }), /* @__PURE__ */ React.createElement("label", { htmlFor: "pm-" + id }, label)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-zinc-500 pl-7 dark:text-zinc-400" }, hint)))), failed && /* @__PURE__ */ React.createElement("p", { className: "mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" }, "Payment didn't go through (simulated). Check the test card below and try again."), /* @__PURE__ */ React.createElement("p", { className: "mt-4 text-sm text-zinc-500 dark:text-zinc-400" }, "Test card: ", /* @__PURE__ */ React.createElement("code", { className: "rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800" }, "4242 4242 4242 4242")), /* @__PURE__ */ React.createElement(Button, { className: "mt-5", disabled: busy, onClick: pay }, busy ? "Processing" : "Pay " + fmtMoney(total)), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-xs text-zinc-500 dark:text-zinc-400" }, "You'll be redirected to Stripe's secure checkout."));
  }
  function CheckoutSteps({ step }) {
    const chips = [
      { n: 1, label: "Shipping Address", done: step > 1 },
      { n: 2, label: "Review & Pay", done: step > 2 }
    ];
    return /* @__PURE__ */ React.createElement("ol", { className: "mb-8 flex flex-wrap items-center gap-2" }, chips.map((c, i) => /* @__PURE__ */ React.createElement("li", { key: c.n, className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
      step === c.n ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" : c.done ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400" : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
    ) }, c.done ? /* @__PURE__ */ React.createElement(Icon, { name: "check", className: "h-4 w-4" }) : /* @__PURE__ */ React.createElement("span", { className: "tabular-nums" }, c.n), c.label), i < chips.length - 1 && /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", className: "h-4 w-4 text-zinc-400 dark:text-zinc-600" }))));
  }
  function CheckoutView({ lines }) {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const { sub_total, shipping, tax, total } = CART_PRICING(lines);
    const [step, setStep] = useState(1);
    const [addr, setAddr] = useState({
      label: "Home (default)",
      new: false,
      default: true,
      line1: "123 Harbor Ave",
      line2: "",
      city: "Portland",
      state: "OR",
      zip: "97205",
      country: "United States"
    });
    const breadcrumb = /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./cart-page.html" }, "Cart")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "Checkout"))));
    if (lines.length === 0) {
      return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, breadcrumb, /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement(Icon, { name: "shopping-cart", className: "h-9 w-9 text-zinc-400 dark:text-zinc-500" })), /* @__PURE__ */ React.createElement("h2", { className: "mt-6 text-xl font-semibold" }, "Your cart is empty"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-zinc-500 dark:text-zinc-400" }, "Add some gear before checking out."), /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "default", className: "btn mt-6" }, "Start shopping")));
    }
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, breadcrumb, /* @__PURE__ */ React.createElement("h1", { className: "mt-6 font-display text-2xl font-semibold tracking-tight" }, "Checkout"), /* @__PURE__ */ React.createElement("div", { className: "mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(CheckoutSteps, { step }), step === 1 ? /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Shipping Address")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6 pt-5" }, /* @__PURE__ */ React.createElement(AddressForm, { addr, setAddr, onContinue: () => setStep(2) }))) : /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0 flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Review & Pay"), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
        onClick: () => setStep(1)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left", className: "mr-1 h-4 w-4" }),
      " Edit address"
    )), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6 pt-5" }, /* @__PURE__ */ React.createElement("dl", { className: "rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900" }, /* @__PURE__ */ React.createElement("dt", { className: "sr-only" }, "Shipping to"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium" }, addr.label), /* @__PURE__ */ React.createElement("dd", { className: "mt-1 text-zinc-500 dark:text-zinc-400" }, addr.line1, addr.line2 ? ", " + addr.line2 : "", ", ", addr.city, ", ", addr.state, " ", addr.zip)), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement(PaymentForm, { total }))))), /* @__PURE__ */ React.createElement("aside", { className: "h-fit lg:sticky lg:top-24" }, /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Order Summary")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("ul", { className: "space-y-3" }, lines.map((l) => /* @__PURE__ */ React.createElement("li", { key: l.key, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement("img", { src: l.img, alt: "", onError: fallback(l.name), className: "ph", loading: "lazy" })), /* @__PURE__ */ React.createElement("span", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("span", { className: "block truncate text-sm font-medium" }, l.name), /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-zinc-500 dark:text-zinc-400" }, "Qty ", l.quantity)), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold tabular-nums" }, fmtMoney(l.price * l.quantity))))), /* @__PURE__ */ React.createElement("div", { className: "separator my-4", role: "separator" }), /* @__PURE__ */ React.createElement("dl", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Subtotal"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(sub_total))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Shipping"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, shipping === 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-green-600 dark:text-green-500" }, "Free") : fmtMoney(shipping))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Tax (8.25%)"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(tax)))), /* @__PURE__ */ React.createElement("div", { className: "separator my-4", role: "separator" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-base" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "Total"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, fmtMoney(total))), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400" }, count, " ", count === 1 ? "item" : "items"))))));
  }
  function OrderSuccessView() {
    const [resolving, setResolving] = useState(true);
    const orderNo = (() => {
      try {
        return new URLSearchParams(window.location.search).get("session_id") || "ord_" + Date.now().toString(36);
      } catch (e) {
        return "ord_" + Date.now().toString(36);
      }
    })();
    useEffect(() => {
      const t = window.setTimeout(() => setResolving(false), 1400);
      return () => window.clearTimeout(t);
    }, []);
    const { sub_total, shipping, tax, total } = CART_PRICING(INITIAL_CART);
    const count = INITIAL_CART.reduce((s, l) => s + l.quantity, 0);
    const breadcrumb = /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "Order Confirmation"))));
    if (resolving) {
      return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, breadcrumb, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center py-20 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "skeleton mb-6 h-20 w-20 rounded-full" }), /* @__PURE__ */ React.createElement("span", { className: "skeleton mb-3 h-5 w-60 rounded-md" }), /* @__PURE__ */ React.createElement("span", { className: "skeleton h-4 w-44 rounded-md" })));
    }
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, breadcrumb, /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40" }, /* @__PURE__ */ React.createElement(Icon, { name: "check", className: "h-10 w-10 text-green-600 dark:text-green-400" })), /* @__PURE__ */ React.createElement("h1", { className: "mt-4 font-display text-2xl font-semibold" }, "Thank you for your order!"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-zinc-500 dark:text-zinc-400" }, "Order ", /* @__PURE__ */ React.createElement("span", { className: "font-mono text-zinc-900 dark:text-zinc-100" }, orderNo)), /* @__PURE__ */ React.createElement(Badge, { className: "mt-3 bg-green-600 text-white" }, "PAID")), /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)] mt-8" }, /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("ul", { className: "space-y-3" }, INITIAL_CART.map((l) => /* @__PURE__ */ React.createElement("li", { key: l.key, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement("img", { src: l.img, alt: "", onError: fallback(l.name), className: "ph", loading: "lazy" })), /* @__PURE__ */ React.createElement("span", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("span", { className: "block truncate text-sm font-medium" }, l.name), /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-zinc-500 dark:text-zinc-400" }, "Qty ", l.quantity)), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold tabular-nums" }, fmtMoney(l.price * l.quantity))))), /* @__PURE__ */ React.createElement("div", { className: "separator my-4", role: "separator" }), /* @__PURE__ */ React.createElement("dl", { className: "space-y-2 text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Subtotal"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(sub_total))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Shipping"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, shipping === 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-green-600 dark:text-green-500" }, "Free") : fmtMoney(shipping))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Tax (8.25%)"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(tax)))), /* @__PURE__ */ React.createElement("div", { className: "separator my-4", role: "separator" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-base" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "Total"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, fmtMoney(total))), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400" }, "Visa \u2022\u2022\u2022\u2022 4242"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400" }, count, " ", count === 1 ? "item" : "items"))), /* @__PURE__ */ React.createElement("div", { className: "mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" }, /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "default", className: "btn min-w-[12rem]" }, "Continue Shopping"), /* @__PURE__ */ React.createElement("a", { href: "./orders-page.html", "data-variant": "outline", className: "btn min-w-[12rem]" }, "View My Orders")));
  }
  var ORDER_STATUS = {
    PENDING: { cls: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    PAID: { cls: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
    SHIPPED: { cls: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
    DELIVERED: { cls: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
    CANCELLED: { cls: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" }
  };
  function OrderStatusBadge({ status }) {
    const s = ORDER_STATUS[status] || ORDER_STATUS.PENDING;
    return /* @__PURE__ */ React.createElement(Badge, { className: s.cls }, status);
  }
  var ORDERS = [
    {
      id: "10f2c8ab-4d5f-4b7f-a9a0-3d4e5f6a7b8c",
      date: "2026-08-15",
      status: "PAID",
      addr: { name: "Jane Doe", line: "123 Harbor Ave, Portland, OR 97205, US" },
      lines: [
        { key: "waxed-field-jacket", name: "Waxed Field Jacket", img: "assets/img/waxed-jacket-a.jpg", price: 189, quantity: 2 },
        { key: "weekender-duffel", name: "Weekender Duffel", img: "assets/img/duffel-a.jpg", price: 168, quantity: 1 }
      ]
    },
    {
      id: "9ae12fcd-7e8a-4c2b-a1d2-3f4a5b6c7d8e",
      date: "2026-08-12",
      status: "SHIPPED",
      addr: { name: "Jane Doe", line: "123 Harbor Ave, Portland, OR 97205, US" },
      lines: [{ key: "trail-mug", name: "Trail Mug", img: "assets/img/mug-a.jpg", price: 42, quantity: 2 }]
    },
    {
      id: "2b11ad0a-1c2d-4e5f-8a9b-0c1d2e3f4a5b",
      date: "2026-07-30",
      status: "DELIVERED",
      addr: { name: "Jane Doe", line: "123 Harbor Ave, Portland, OR 97205, US" },
      lines: [{ key: "daypack", name: "Daypack", img: "assets/img/daypack-a.jpg", price: 8.95, quantity: 1, reviewed: true }]
    },
    {
      id: "77ee0415-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
      date: "2026-07-18",
      status: "DELIVERED",
      addr: { name: "Jane Doe", line: "123 Harbor Ave, Portland, OR 97205, US" },
      lines: [{ key: "steel-bottle", name: "Steel Bottle 1L", img: "assets/img/bottle-b.jpg", price: 28, quantity: 2 }]
    },
    {
      id: "c3d905f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
      date: "2026-06-25",
      status: "PENDING",
      addr: { name: "Jane Doe", line: "123 Harbor Ave, Portland, OR 97205, US" },
      lines: [{ key: "insulated-bottle", name: "Insulated Bottle 750ml", img: "assets/img/bottle-a.jpg", price: 34, quantity: 1 }]
    },
    {
      id: "e8ab34c7-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
      date: "2026-06-03",
      status: "CANCELLED",
      addr: { name: "Jane Doe", line: "400 Industry Rd, Portland, OR 97210, US" },
      lines: [{ key: "utility-backpack", name: "Utility Backpack", img: "assets/img/daypack-b.jpg", price: 98, quantity: 1 }]
    }
  ];
  var ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  var PAGE_SIZE = 4;
  function OrdersView() {
    const [filter, setFilter] = useState("All");
    const [page, setPage] = useState(1);
    const filtered = filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === filter);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    useEffect(() => setPage(1), [filter]);
    useEffect(() => {
      if (page > pages) setPage(pages);
    }, [page, pages]);
    const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "My Orders")))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-display font-semibold tracking-tight" }, "My Orders")), /* @__PURE__ */ React.createElement("div", { className: "mt-5 flex flex-wrap gap-2", role: "group", "aria-label": "Filter by status" }, ["All", ...ORDER_STATUSES].map((s) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s,
        type: "button",
        onClick: () => setFilter(s),
        className: "btn rounded-full",
        "data-variant": filter === s ? "default" : "outline",
        "aria-pressed": filter === s
      },
      s
    ))), shown.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement(Icon, { name: ORDERS.length === 0 ? "shopping-bag" : "search", className: "h-9 w-9 text-zinc-400 dark:text-zinc-500" })), /* @__PURE__ */ React.createElement("h2", { className: "mt-6 text-xl font-semibold" }, ORDERS.length === 0 ? "No orders yet" : "No matching orders"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-zinc-500 dark:text-zinc-400" }, ORDERS.length === 0 ? "Your purchases will appear here after your first checkout." : "Try another status filter."), ORDERS.length === 0 && /* @__PURE__ */ React.createElement("a", { href: "./products-page.html", "data-variant": "default", className: "btn mt-6" }, "Start shopping")) : /* @__PURE__ */ React.createElement("div", { className: "mt-6 space-y-4" }, shown.map((o) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: o.id,
        href: "./order-detail-page.html?order_id=" + o.id,
        className: "card block bg-[var(--card)] transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
      },
      /* @__PURE__ */ React.createElement("div", { className: "card-content p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-sm font-medium" }, "# ", o.id.slice(0, 8)), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-zinc-500 dark:text-zinc-400" }, o.date), /* @__PURE__ */ React.createElement(OrderStatusBadge, { status: o.status })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-zinc-500 dark:text-zinc-400" }, o.lines.reduce((s, l) => s + l.quantity, 0), " items"), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold tabular-nums" }, fmtMoney(CART_PRICING(o.lines).total)), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", className: "h-5 w-5 text-zinc-400 dark:text-zinc-600" }))))
    ))), pages > 1 && /* @__PURE__ */ React.createElement("nav", { className: "pagination mt-10", "aria-label": "Pagination" }, /* @__PURE__ */ React.createElement("ul", { className: "pagination-list" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "rounded-full",
        "aria-label": "Previous page",
        disabled: page <= 1,
        onClick: () => setPage(Math.max(1, page - 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left" })
    )), Array.from({ length: pages }, (_, i) => i + 1).map((n) => /* @__PURE__ */ React.createElement("li", { key: n }, /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "icon",
        variant: page === n ? "default" : "ghost",
        className: cn("rounded-full", page === n && "font-semibold"),
        "aria-current": page === n ? "page" : void 0,
        onClick: () => setPage(n)
      },
      n
    ))), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "rounded-full",
        "aria-label": "Next page",
        disabled: page >= pages,
        onClick: () => setPage(Math.min(pages, page + 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })
    )))));
  }
  function OrderDetailView() {
    const order_id = (() => {
      try {
        return new URLSearchParams(window.location.search).get("order_id") || ORDERS[0].id;
      } catch (e) {
        return ORDERS[0].id;
      }
    })();
    const order = ORDERS.find((o) => o.id === order_id) || ORDERS[0];
    const { sub_total, shipping, tax, total } = CART_PRICING(order.lines);
    const count = order.lines.reduce((s, l) => s + l.quantity, 0);
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./orders-page.html" }, "My Orders")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "# ", order.id.slice(0, 8))))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-display font-semibold tracking-tight" }, "Order ", /* @__PURE__ */ React.createElement("span", { className: "font-mono" }, order.id.slice(0, 8))), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-zinc-500 dark:text-zinc-400" }, "Placed on ", order.date)), /* @__PURE__ */ React.createElement(OrderStatusBadge, { status: order.status })), /* @__PURE__ */ React.createElement("div", { className: "mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_280px]" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("section", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Items")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("ul", { className: "space-y-5" }, order.lines.map((l) => /* @__PURE__ */ React.createElement("li", { key: l.key, className: "flex items-start gap-4" }, /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + l.key, className: "block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement("img", { src: l.img, alt: "", onError: fallback(l.name), className: "ph", loading: "lazy" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + l.key, className: "text-sm font-medium hover:underline" }, l.name), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold tabular-nums" }, fmtMoney(l.price * l.quantity))), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-xs text-zinc-500 dark:text-zinc-400" }, fmtMoney(l.price), " each \xD7 ", l.quantity), order.status === "DELIVERED" && (l.reviewed ? /* @__PURE__ */ React.createElement("span", { className: "mt-2 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" }, /* @__PURE__ */ React.createElement(Icon, { name: "check", className: "h-3.5 w-3.5" }), " Reviewed") : /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + l.key + "#reviews", className: "btn mt-2 inline-flex h-8 rounded-full px-3 text-xs" }, "Review")))))))), /* @__PURE__ */ React.createElement("section", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "flex items-center gap-2 text-base font-semibold" }, /* @__PURE__ */ React.createElement(Icon, { name: "map-pin", className: "h-4 w-4 text-zinc-400" }), " Shipping Address")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6 pt-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium" }, order.addr.name), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-zinc-500 dark:text-zinc-400" }, order.addr.line))), /* @__PURE__ */ React.createElement("section", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "flex items-center gap-2 text-base font-semibold" }, /* @__PURE__ */ React.createElement(Icon, { name: "credit-card", className: "h-4 w-4 text-zinc-400" }), " Payment")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6 pt-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-zinc-500 dark:text-zinc-400" }, "Visa \u2022\u2022\u2022\u2022 4242"), /* @__PURE__ */ React.createElement(OrderStatusBadge, { status: order.status }))))), /* @__PURE__ */ React.createElement("aside", { className: "h-fit md:sticky md:top-24" }, /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Total")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("dl", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Subtotal"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(sub_total))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Shipping"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, shipping === 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-green-600 dark:text-green-500" }, "Free") : fmtMoney(shipping))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("dt", { className: "text-zinc-500 dark:text-zinc-400" }, "Tax (8.25%)"), /* @__PURE__ */ React.createElement("dd", { className: "font-medium tabular-nums" }, fmtMoney(tax)))), /* @__PURE__ */ React.createElement("div", { className: "separator my-4", role: "separator" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-base" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "Total"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold tabular-nums" }, fmtMoney(total))), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400" }, count, " ", count === 1 ? "item" : "items"))))));
  }
  function ProfileView() {
    const [user, setUser] = useState({ name: "Jane Doe", email: "jane@mail.com", phone: "+1 555 0100" });
    const [avatar, setAvatar] = useState(null);
    const [addresses, setAddresses] = useState([
      { id: "a1", label: "Home", line: "123 Harbor Ave, Portland, OR 97205", default: true },
      { id: "a2", label: "Work", line: "400 Industry Rd, Portland, OR 97210", default: false }
    ]);
    const [editOpen, setEditOpen] = useState(false);
    const [draft, setDraft] = useState(user);
    const [addrOpen, setAddrOpen] = useState(false);
    const [addrDraft, setAddrDraft] = useState({ id: null, label: "", line: "", default: false });
    const [pendDelete, setPendDelete] = useState(null);
    const avatarRef = useRef(null);
    const openEdit = () => {
      setDraft(user);
      setEditOpen(true);
    };
    const saveProfile = () => {
      setUser(draft);
      setEditOpen(false);
      toast("Profile updated");
    };
    const openNewAddr = () => {
      setAddrDraft({ id: null, label: "", line: "", default: addresses.length === 0 });
      setAddrOpen(true);
    };
    const openEditAddr = (a) => {
      setAddrDraft({ ...a });
      setAddrOpen(true);
    };
    const saveAddr = () => {
      if (!addrDraft.label.trim() || !addrDraft.line.trim()) {
        toast("Label and address are required");
        return;
      }
      setAddresses((as) => addrDraft.id ? as.map((a) => a.id === addrDraft.id ? { ...addrDraft } : a) : [...as, { ...addrDraft, id: "a" + Date.now() }]);
      setAddrOpen(false);
      toast(addrDraft.id ? "Address updated" : "Address added");
    };
    const deleteAddr = (id) => {
      setAddresses((as) => {
        const next = as.filter((a) => a.id !== id);
        if (next.length && !next.some((a) => a.default)) next[0].default = true;
        return next;
      });
      toast("Address deleted");
    };
    const onAvatarPick = (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) {
        toast("Avatar must be smaller than 2MB");
        return;
      }
      if (avatar) URL.revokeObjectURL(avatar);
      setAvatar(URL.createObjectURL(f));
      toast("Avatar updated");
    };
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-4 pt-8 pb-16" }, /* @__PURE__ */ React.createElement("nav", { className: "breadcrumb", "aria-label": "Breadcrumb" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb-list" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("a", { className: "breadcrumb-link", href: "./home-page.html" }, "Home")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-separator", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement("span", { className: "breadcrumb-page", "aria-current": "page" }, "My Profile")))), /* @__PURE__ */ React.createElement("h1", { className: "mt-6 text-2xl font-display font-semibold tracking-tight" }, "My Profile"), /* @__PURE__ */ React.createElement("div", { className: "mt-8 grid grid-cols-1 gap-6 md:grid-cols-2" }, /* @__PURE__ */ React.createElement("section", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "relative shrink-0", "aria-label": "Upload avatar", onClick: () => avatarRef.current.click() }, /* @__PURE__ */ React.createElement("span", { className: "avatar", "data-size": "lg", "aria-hidden": "true" }, avatar ? /* @__PURE__ */ React.createElement("img", { src: avatar, alt: "", className: "avatar-image" }) : /* @__PURE__ */ React.createElement("span", { className: "avatar-fallback" }, "JD")), /* @__PURE__ */ React.createElement("span", { className: "absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow dark:bg-white dark:text-zinc-900" }, /* @__PURE__ */ React.createElement(Icon, { name: "image-plus", className: "h-4 w-4" }))), /* @__PURE__ */ React.createElement("input", { ref: avatarRef, type: "file", accept: "image/jpeg,image/png,image/webp", className: "sr-only", onChange: onAvatarPick }), /* @__PURE__ */ React.createElement("h2", { className: "mt-5 text-lg font-semibold" }, user.name), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" }, user.email), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-500 dark:text-zinc-400" }, user.phone), /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", className: "mt-5", onClick: openEdit }, "Edit Profile"), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-xs text-zinc-400 dark:text-zinc-600" }, "Click the avatar to upload a new photo (2MB max)."))), /* @__PURE__ */ React.createElement("section", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header flex items-center justify-between gap-4 p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Security")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-zinc-500 dark:text-zinc-400" }, "Passwords, multi-factor auth, and account recovery are managed by Zitadel, our identity provider \u2014 not by Horizon."), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: "http://localhost:8080/ui/console",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50"
      },
      "Manage password in Zitadel ",
      /* @__PURE__ */ React.createElement(Icon, { name: "external-link", className: "h-4 w-4" })
    ))), /* @__PURE__ */ React.createElement("section", { className: "card bg-[var(--card)] md:col-span-2" }, /* @__PURE__ */ React.createElement("div", { className: "card-header flex flex-wrap items-center justify-between gap-4 p-6 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "text-base font-semibold" }, "Addresses"), /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: openNewAddr }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", className: "mr-1.5 h-4 w-4" }), " Add Address")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("ul", { className: "divide-y divide-zinc-100 dark:divide-zinc-800" }, addresses.map((a) => /* @__PURE__ */ React.createElement("li", { key: a.id, className: "flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("p", { className: "flex items-center gap-2 text-sm font-medium" }, a.label, a.default && /* @__PURE__ */ React.createElement(Badge, { className: "border-transparent bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" }, "Default")), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" }, a.line)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200",
        "aria-label": "Edit " + a.label,
        onClick: () => openEditAddr(a)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "pencil", className: "h-4 w-4" })
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 text-zinc-400 hover:text-red-600 dark:text-red-400",
        "aria-label": "Delete " + a.label,
        onClick: () => setPendDelete(a)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "h-4 w-4" })
    )))), addresses.length === 0 && /* @__PURE__ */ React.createElement("li", { className: "py-6 text-sm text-zinc-500 dark:text-zinc-400" }, "No saved addresses yet."))))), /* @__PURE__ */ React.createElement(Modal, { open: editOpen, onClose: () => setEditOpen(false), title: "Edit Profile", description: "Update your personal details." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, [["Name", "name"], ["Email", "email"], ["Phone", "phone"]].map(([label, k]) => /* @__PURE__ */ React.createElement("div", { key: k, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "edit-" + k, className: "label" }, label), /* @__PURE__ */ React.createElement(
      Input,
      {
        id: "edit-" + k,
        type: k === "email" ? "email" : "text",
        value: draft[k],
        onChange: (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "dialog-footer" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", onClick: () => setEditOpen(false) }, "Cancel"), /* @__PURE__ */ React.createElement(Button, { onClick: saveProfile }, "Save")))), /* @__PURE__ */ React.createElement(
      Modal,
      {
        open: addrOpen,
        onClose: () => setAddrOpen(false),
        title: addrDraft.id ? "Edit Address" : "Add Address",
        description: "'Default' is pre-filled at checkout."
      },
      /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "addr-label", className: "label" }, "Label"), /* @__PURE__ */ React.createElement(
        Input,
        {
          id: "addr-label",
          placeholder: "Home / Work / \u2026",
          value: addrDraft.label,
          onChange: (e) => setAddrDraft((d) => ({ ...d, label: e.target.value }))
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "addr-line", className: "label" }, "Address"), /* @__PURE__ */ React.createElement(
        Input,
        {
          id: "addr-line",
          placeholder: "Street, city, state, ZIP",
          value: addrDraft.line,
          onChange: (e) => setAddrDraft((d) => ({ ...d, line: e.target.value }))
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "addr-default", className: "label cursor-pointer" }, "Set as default"), /* @__PURE__ */ React.createElement(
        "input",
        {
          id: "addr-default",
          type: "checkbox",
          role: "switch",
          className: "switch",
          checked: addrDraft.default,
          onChange: (e) => setAddrDraft((d) => ({ ...d, default: e.target.checked }))
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "dialog-footer" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", onClick: () => setAddrOpen(false) }, "Cancel"), /* @__PURE__ */ React.createElement(Button, { onClick: saveAddr }, addrDraft.id ? "Save" : "Add")))
    ), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        open: !!pendDelete,
        onClose: () => setPendDelete(null),
        title: "Delete " + (pendDelete ? pendDelete.label : "address") + "?",
        description: "This address will be removed from your profile. This can\u2019t be undone.",
        confirmLabel: "Delete",
        onConfirm: () => pendDelete && deleteAddr(pendDelete.id)
      }
    ));
  }
  function LoginCard() {
    const [busy, setBusy] = useState(false);
    const go = () => {
      if (busy) return;
      setBusy(true);
      toast("Redirecting to Zitadel\u2026");
      const next = new URLSearchParams(window.location.search).get("next");
      window.setTimeout(() => {
        toast("Signed in (demo)");
        window.location = next || "./home-page.html";
      }, 1200);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "card bg-[var(--card)]" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-6 pb-0" }, /* @__PURE__ */ React.createElement("h1", { className: "card-title text-center text-xl font-semibold" }, "Sign in")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement(Button, { type: "button", className: "w-full", disabled: busy, onClick: go }, busy ? "Redirecting\u2026" : "Continue with Zitadel"), /* @__PURE__ */ React.createElement("p", { className: "mt-4 text-center text-[13px] leading-relaxed text-zinc-400 dark:text-zinc-500" }, "You'll finish signing in on Zitadel's secure page. Horizon never sees your password.")));
  }
  function AuthScreen() {
    const next = new URLSearchParams(window.location.search).get("next");
    return /* @__PURE__ */ React.createElement("div", { className: "flex min-h-screen flex-col items-center justify-center px-4 py-12" }, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto block h-2 w-16 rounded-full bg-[var(--primary)]" }), /* @__PURE__ */ React.createElement("h1", { className: "mt-3 font-display text-xl font-extrabold tracking-tight" }, "Horizon Supply Co."), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-zinc-400 dark:text-zinc-600" }, "Outdoor gear for the long way round")), /* @__PURE__ */ React.createElement("div", { className: "mt-8 w-full max-w-[400px]" }, /* @__PURE__ */ React.createElement(LoginCard, null)), /* @__PURE__ */ React.createElement("p", { className: "mt-6 text-center text-sm text-zinc-700 dark:text-zinc-300" }, "New here? You'll create your account at Zitadel too."), /* @__PURE__ */ React.createElement("p", { className: "mt-8 text-center text-xs text-zinc-400 dark:text-zinc-600" }, "Demo: this button would redirect to our self-hosted Zitadel (OIDC + PKCE)."), next && /* @__PURE__ */ React.createElement("p", { className: "mt-4 text-xs text-zinc-400 dark:text-zinc-600" }, "Redirecting you to the page you were viewing."));
  }
  function MobileMenu({ open, onClose, onTheme, dark }) {
    return /* @__PURE__ */ React.createElement(Sheet, { side: "left", className: "w-full max-w-[320px]", open, onClose, "aria-label": "Menu" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-content flex h-full flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-header shrink-0 pr-8" }, /* @__PURE__ */ React.createElement("h2", { className: "sheet-title font-display" }, "Horizon Supply Co.")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "sheet-close-x", "aria-label": "Close menu", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" })), /* @__PURE__ */ React.createElement("ul", { className: "mt-2 list-none space-y-1 text-sm" }, /* @__PURE__ */ React.createElement("li", { className: "mb-3 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-800" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold" }, "Jane Doe"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-zinc-500 dark:text-zinc-400" }, "jane@mail.com")), [["Home", "./home-page.html"], ["Products", "./products-page.html"], ["My Profile", "./profile-page.html"], ["My Orders", "./orders-page.html"], ["Admin Panel", "./admin-page.html"]].map(([l, h]) => /* @__PURE__ */ React.createElement("li", { key: l }, /* @__PURE__ */ React.createElement("a", { href: h, onClick: onClose, className: "block rounded-lg px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800" }, l))), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Toggle dark mode", onClick: onTheme, className: "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800" }, /* @__PURE__ */ React.createElement(Icon, { name: dark ? "sun" : "moon", className: "h-5 w-5" }), " Theme")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "./login-page.html", className: "block rounded-lg px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" }, "Logout")))));
  }
  var VIEW_TITLES = { admin: "Dashboard", "admin-products": "Products", "admin-categories": "Categories", "admin-orders": "Orders", "admin-users": "Users" };
  var ADMIN_NAV = [
    { key: "admin", href: "./admin-page.html", icon: "layout-dashboard", label: "Dashboard" },
    { key: "admin-products", href: "./admin-products-page.html", icon: "package", label: "Products" },
    { key: "admin-categories", href: "./admin-categories-page.html", icon: "tags", label: "Categories" },
    { key: "admin-orders", href: "./admin-orders-page.html", icon: "shopping-cart", label: "Orders" },
    { key: "admin-users", href: "./admin-users-page.html", icon: "users", label: "Users", adminOnly: true }
  ];
  function AdminNav({ active, onNav }) {
    return /* @__PURE__ */ React.createElement("nav", { "aria-label": "Admin" }, /* @__PURE__ */ React.createElement("ul", { className: "list-none space-y-1" }, ADMIN_NAV.filter((n) => !n.adminOnly || active === "admin-users").map((n) => /* @__PURE__ */ React.createElement("li", { key: n.key }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: n.href,
        onClick: onNav,
        "aria-current": active === n.key ? "page" : void 0,
        className: cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
          active === n.key ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        )
      },
      /* @__PURE__ */ React.createElement(Icon, { name: n.icon, className: "h-4 w-4 shrink-0" }),
      n.label,
      n.adminOnly && /* @__PURE__ */ React.createElement("span", { className: "ml-auto rounded-full border border-amber-300/60 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300" }, "ADMIN")
    )))));
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
        const isOpen = e.newState === "open";
        setAcctOpen(isOpen);
        if (isOpen && acctBoxRef.current && !CSS.supports("position-anchor", "--dummy-anchor")) {
          const r = acctBoxRef.current.getBoundingClientRect();
          const w = el.getBoundingClientRect().width;
          el.style.position = "fixed";
          el.style.top = r.bottom + 4 + "px";
          el.style.left = Math.max(8, r.right - w) + "px";
          el.style.margin = "0";
        }
      };
      el.addEventListener("toggle", onToggle);
      return () => el.removeEventListener("toggle", onToggle);
    }, []);
    const sidebar = /* @__PURE__ */ React.createElement("div", { className: "flex h-full flex-col py-6" }, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "flex items-center gap-2 px-6" }, /* @__PURE__ */ React.createElement("span", { className: "h-2 w-6 rounded-full bg-[var(--primary)]" }), /* @__PURE__ */ React.createElement("span", { className: "font-display text-base font-extrabold tracking-tight" }, "Horizon")), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex-1 px-3" }, /* @__PURE__ */ React.createElement(AdminNav, { active: section, onNav: () => setSideOpen(false) })), /* @__PURE__ */ React.createElement("div", { className: "space-y-1 border-t border-zinc-200 px-3 pt-4 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50" }, /* @__PURE__ */ React.createElement(Icon, { name: "external-link", className: "h-4 w-4" }), " View Store"), /* @__PURE__ */ React.createElement("a", { href: "./login-page.html", className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-4 w-4" }), " Logout")));
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-zinc-50/50 dark:bg-[#09090B]" }, /* @__PURE__ */ React.createElement("aside", { className: "fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-zinc-200 bg-[var(--card)] dark:border-zinc-800 lg:block" }, sidebar), /* @__PURE__ */ React.createElement(Sheet, { side: "left", className: "w-full max-w-[300px]", open: sideOpen, onClose: () => setSideOpen(false), "aria-label": "Admin menu" }, /* @__PURE__ */ React.createElement("div", { className: "sheet-content h-full" }, sidebar)), /* @__PURE__ */ React.createElement("div", { className: "lg:pl-60" }, /* @__PURE__ */ React.createElement("header", { className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-[var(--card)] px-4 dark:border-zinc-800 lg:px-8" }, /* @__PURE__ */ React.createElement(Button, { variant: "icon", "aria-label": "Open menu", className: "lg:hidden", onClick: () => setSideOpen(true) }, /* @__PURE__ */ React.createElement(Icon, { name: "menu", className: "h-5 w-5" })), /* @__PURE__ */ React.createElement("h1", { className: "text-base font-semibold tracking-tight" }, title), /* @__PURE__ */ React.createElement("div", { className: "ml-auto flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Button, { variant: "icon", "aria-label": "Toggle dark mode", onClick: onTheme }, /* @__PURE__ */ React.createElement(Icon, { name: dark ? "sun" : "moon", className: "h-5 w-5" })), /* @__PURE__ */ React.createElement("a", { href: "./home-page.html", className: "hidden text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:inline" }, "View Store"), /* @__PURE__ */ React.createElement("div", { ref: acctBoxRef }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        className: "gap-2 px-3",
        "aria-label": "Account menu",
        "aria-haspopup": "menu",
        "aria-expanded": acctOpen,
        "aria-controls": "admin-acct-menu",
        "data-dropdown-trigger": "admin-acct-menu",
        onClick: () => acctMenuRef.current && acctMenuRef.current.togglePopover()
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "user", className: "h-5 w-5" }),
      " ",
      /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Jane"),
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", className: "h-4 w-4 opacity-60" })
    ), /* @__PURE__ */ React.createElement("div", { ref: acctMenuRef, id: "admin-acct-menu", role: "menu", popover: "auto", className: "dropdown-content", "aria-label": "Account menu" }, /* @__PURE__ */ React.createElement("div", { className: "dropdown-label" }, "Signed in as Jane Doe \xB7 jane@mail.com"), /* @__PURE__ */ React.createElement("a", { role: "menuitem", className: "dropdown-item", href: "./profile-page.html" }, "My Profile"), /* @__PURE__ */ React.createElement("div", { className: "dropdown-separator", role: "separator" }), /* @__PURE__ */ React.createElement(
      "a",
      {
        role: "menuitem",
        className: "dropdown-item text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white",
        "data-variant": "destructive",
        href: "./login-page.html"
      },
      "Logout"
    ))))), /* @__PURE__ */ React.createElement("main", { className: "px-4 py-6 lg:px-8" }, children)));
  }
  function StatCard({ label, value, delta, deltaTone }) {
    return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-content p-5" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, label), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-3xl font-semibold tracking-tight" }, value), /* @__PURE__ */ React.createElement("p", { className: cn("mt-1 text-xs", deltaTone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400") }, delta)));
  }
  function SalesChart() {
    const sales = [420, 610, 585, 900, 760, 1120, 985, 1350, 1180, 1510, 1420, 1680, 1590, 1820];
    const max = Math.max(...sales);
    const W = 600, H = 150, PAD = 12;
    const pts = sales.map((v, i) => [PAD + i * (W - 2 * PAD) / (sales.length - 1), H - PAD - v / max * (H - 2 * PAD)]);
    const line = pts.map((p) => p.join(",")).join(" ");
    const last = pts[pts.length - 1];
    const area = PAD + "," + H + " " + line + " " + (W - PAD) + "," + H;
    const xlabel = (i) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - (sales.length - 1 - i));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-5 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "card-title" }, "Sales"), /* @__PURE__ */ React.createElement("p", { className: "card-description text-xs text-muted-foreground" }, "Last 14 days")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-5" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 600 170", className: "h-44 w-full", role: "img", "aria-label": "Sales over the last 14 days" }, /* @__PURE__ */ React.createElement("polyline", { points: line, fill: "none", stroke: "var(--primary)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("polygon", { points: area, fill: "var(--primary)", opacity: "0.08" }), /* @__PURE__ */ React.createElement("circle", { cx: last[0], cy: last[1], r: "4", fill: "var(--primary)" })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[11px] text-muted-foreground" }, /* @__PURE__ */ React.createElement("span", null, xlabel(0)), /* @__PURE__ */ React.createElement("span", null, xlabel(4)), /* @__PURE__ */ React.createElement("span", null, xlabel(9)), /* @__PURE__ */ React.createElement("span", null, xlabel(13)))));
  }
  function AdminDashboardView() {
    const recent = ORDERS.slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 6);
    const lowStock = PRODUCTS.filter((p) => !p.oos && p.stock > 0 && p.stock <= 5).length;
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" }, /* @__PURE__ */ React.createElement(StatCard, { label: "Revenue", value: "$9,240.00", delta: "+12.4% vs last month" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Orders", value: "12", delta: "+3 this week" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Users", value: "34", delta: "+2 this week" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Products", value: String(PRODUCTS.length), delta: lowStock + " low stock", deltaTone: "amber" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-3" }, /* @__PURE__ */ React.createElement("div", { className: "xl:col-span-2" }, /* @__PURE__ */ React.createElement(SalesChart, null)), /* @__PURE__ */ React.createElement("div", { className: "card self-start" }, /* @__PURE__ */ React.createElement("div", { className: "card-header p-5 pb-0" }, /* @__PURE__ */ React.createElement("h2", { className: "card-title" }, "Recent Orders")), /* @__PURE__ */ React.createElement("div", { className: "card-content p-3" }, /* @__PURE__ */ React.createElement("ul", { className: "list-none space-y-1" }, recent.map((o) => /* @__PURE__ */ React.createElement("li", { key: o.id }, /* @__PURE__ */ React.createElement("a", { href: "./admin-orders-page.html", className: "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("p", { className: "truncate font-mono text-xs font-semibold" }, "#", o.id.slice(0, 8)), /* @__PURE__ */ React.createElement("p", { className: "truncate text-xs text-muted-foreground" }, o.addr.name, " \xB7 ", o.date)), /* @__PURE__ */ React.createElement(OrderStatusBadge, { status: o.status }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold" }, fmtMoney(CART_PRICING(o.lines).total)))))), /* @__PURE__ */ React.createElement("a", { href: "./admin-orders-page.html", className: "mt-2 block rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--primary)] hover:bg-zinc-50 dark:hover:bg-zinc-900" }, "View all orders \u2192")))));
  }
  function FilterSelect({ id, label, value, options, onChange, placeholder }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const popRef = useRef(null);
    const popId = id + "-menu";
    useEffect(() => {
      const el = popRef.current;
      if (!el) return;
      const onToggle = (e) => {
        setOpen(e.newState === "open");
        if (e.newState === "open" && btnRef.current) {
          const r = btnRef.current.getBoundingClientRect();
          el.style.position = "fixed";
          el.style.top = r.bottom + 6 + "px";
          el.style.left = Math.max(8, r.left) + "px";
          el.style.minWidth = r.width + "px";
        }
      };
      el.addEventListener("toggle", onToggle);
      return () => el.removeEventListener("toggle", onToggle);
    }, []);
    const onTriggerClick = () => {
      const pop = popRef.current, btn = btnRef.current;
      if (!pop || !btn) return;
      if (!pop.matches(":popover-open")) {
        const r = btn.getBoundingClientRect();
        pop.style.position = "fixed";
        pop.style.top = r.bottom + 6 + "px";
        pop.style.left = Math.max(8, r.left) + "px";
        pop.style.minWidth = r.width + "px";
      }
      pop.togglePopover();
    };
    const choose = (o) => {
      onChange(o);
      if (popRef.current) popRef.current.hidePopover();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "combobox relative shrink-0" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        ref: btnRef,
        className: "btn combobox-trigger w-auto",
        "data-variant": "outline",
        "aria-label": label,
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-controls": popId,
        onClick: onTriggerClick
      },
      /* @__PURE__ */ React.createElement("span", { className: "combobox-value truncate" }, value || placeholder || label),
      /* @__PURE__ */ React.createElement(Icon, { name: "chevrons-up-down", className: "combobox-chevron h-4 w-4" })
    ), /* @__PURE__ */ React.createElement("div", { ref: popRef, id: popId, popover: "auto", className: "combobox-content min-w-full" }, /* @__PURE__ */ React.createElement("div", { role: "listbox", className: "combobox-listbox", "aria-label": label }, options.map((o) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: o,
        role: "option",
        className: "combobox-item",
        "aria-selected": value === o,
        "data-value": o,
        onClick: () => choose(o)
      },
      /* @__PURE__ */ React.createElement("span", { className: "truncate" }, o)
    )))));
  }
  function Pager({ page, pages, onChange }) {
    if (pages <= 1) return null;
    return /* @__PURE__ */ React.createElement("nav", { className: "pagination mt-6", "aria-label": "Pagination" }, /* @__PURE__ */ React.createElement("ul", { className: "pagination-list" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "rounded-full",
        "aria-label": "Previous page",
        disabled: page <= 1,
        onClick: () => onChange(Math.max(1, page - 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-left" })
    )), Array.from({ length: pages }, (_, i) => i + 1).map((n) => /* @__PURE__ */ React.createElement("li", { key: n }, /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "icon",
        variant: page === n ? "default" : "ghost",
        className: cn("rounded-full", page === n && "font-semibold"),
        "aria-current": page === n ? "page" : void 0,
        onClick: () => onChange(n)
      },
      n
    ))), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "outline",
        size: "icon",
        className: "rounded-full",
        "aria-label": "Next page",
        disabled: page >= pages,
        onClick: () => onChange(Math.min(pages, page + 1))
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right" })
    ))));
  }
  function AdminPlaceholder({ label }) {
    return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-content p-6" }, /* @__PURE__ */ React.createElement("h2", { className: "card-title" }, label), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-muted-foreground" }, "This admin view is under construction in the prototype.")));
  }
  function AdminCategoriesView() {
    const [cats, setCats] = useState(CATS.map((c) => ({ ...c })));
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [pendDel, setPendDel] = useState(null);
    const deleteCat = (id) => {
      setCats((cs) => cs.filter((c) => c.id !== id));
      toast("Category deleted");
    };
    const save = (cat) => {
      if (cats.some((c) => c.label.toLowerCase() === cat.label.toLowerCase() && c.id !== cat.id)) {
        toast("Category name already exists", true);
        return;
      }
      if (cat.id) {
        setCats((cs) => cs.map((c) => c.id === cat.id ? cat : c));
        toast("Category updated");
      } else {
        setCats((cs) => [...cs, { ...cat, id: cat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-") }]);
        toast("Category created");
      }
      setOpen(false);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, cats.length, " categories"), /* @__PURE__ */ React.createElement(Button, { className: "w-fit", onClick: () => {
      setEditing(null);
      setOpen(true);
    } }, "+ New Category")), /* @__PURE__ */ React.createElement("div", { className: "table-container mt-4" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Category"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Slug"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Products"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Image"), /* @__PURE__ */ React.createElement("th", { className: "table-head text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, cats.map((c) => /* @__PURE__ */ React.createElement("tr", { className: "table-row", key: c.id }, /* @__PURE__ */ React.createElement("td", { className: "table-cell font-medium" }, c.label), /* @__PURE__ */ React.createElement("td", { className: "table-cell font-mono text-xs text-muted-foreground" }, c.id), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, countByCat(c.id)), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, c.img ? /* @__PURE__ */ React.createElement("img", { src: c.img, alt: "", className: "h-9 w-9 rounded-md object-cover" }) : /* @__PURE__ */ React.createElement("div", { className: "h-9 w-9 rounded-md bg-zinc-100 dark:bg-zinc-800" })), /* @__PURE__ */ React.createElement("td", { className: "table-cell text-right whitespace-nowrap" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "ml-1 h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200",
        "aria-label": "Edit " + c.label,
        onClick: () => {
          setEditing(c);
          setOpen(true);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "pencil", className: "h-4 w-4" })
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "ml-1 h-8 w-8 text-zinc-400 hover:text-red-600 dark:text-red-400",
        "aria-label": "Delete " + c.label,
        onClick: () => countByCat(c.id) > 0 ? toast("Category has products - reassign or delete them first", true) : setPendDel(c)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "h-4 w-4" })
    ))))))), /* @__PURE__ */ React.createElement(CategoryFormModal, { open, onClose: () => setOpen(false), editing, onSave: save }), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        open: !!pendDel,
        onClose: () => setPendDel(null),
        title: "Delete " + (pendDel ? pendDel.label : "category") + "?",
        description: "This category will be removed. Products are not deleted with it.",
        confirmLabel: "Delete",
        onConfirm: () => {
          if (pendDel) deleteCat(pendDel.id);
          setPendDel(null);
        }
      }
    ));
  }
  function CategoryFormModal({ open, onClose, editing, onSave }) {
    const [name, setName] = useState("");
    const [err, setErr] = useState("");
    const [files, setFiles] = useState([]);
    useEffect(() => {
      if (open) {
        setName(editing ? editing.label : "");
        setErr("");
        setFiles([]);
      }
    }, [open, editing]);
    const submit = (e) => {
      e.preventDefault();
      if (!name.trim()) {
        setErr("Category name is required.");
        return;
      }
      onSave({
        id: editing ? editing.id : null,
        label: name.trim(),
        img: files.length ? URL.createObjectURL(files[0]) : editing && !files.length ? editing.img : null
      });
    };
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        open,
        onClose,
        title: editing ? "Edit Category" : "New Category",
        description: "A category groups products on the shop floor."
      },
      /* @__PURE__ */ React.createElement("form", { onSubmit: submit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "cf-name", className: "label" }, "Name"), /* @__PURE__ */ React.createElement(Input, { id: "cf-name", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Outerwear", autoFocus: true }), err && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-600 dark:text-red-400", role: "alert" }, err)), /* @__PURE__ */ React.createElement(MultiUpload, { label: "Image", max: 1, files, setFiles }), /* @__PURE__ */ React.createElement("div", { className: "dialog-footer" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", type: "button", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Button, { type: "submit" }, "Save")))
    );
  }
  var NEXT_STATUS = {
    PENDING: ["PAID", "CANCELLED"],
    PAID: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: []
  };
  function AdminOrdersView() {
    const [rows, setRows] = useState(ORDERS.map((o) => ({ ...o })));
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const filtered = status === "All" ? rows : rows.filter((o) => o.status === status);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    useEffect(() => setPage(1), [status]);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const change = (o, next) => {
      if (!NEXT_STATUS[o.status].includes(next)) {
        toast("400 Invalid status transition", true);
        return;
      }
      setRows((rs) => rs.map((r) => r.id === o.id ? { ...r, status: next } : r));
      toast("Order #" + o.id.slice(0, 8) + " \u2192 " + next);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
      FilterSelect,
      {
        id: "ord-status",
        label: "Status",
        value: status,
        options: ["All"].concat(ORDER_STATUSES),
        onChange: setStatus
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "table-container mt-4" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Order"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Customer"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Total"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "table-head text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, paged.map((o) => /* @__PURE__ */ React.createElement("tr", { className: "table-row", key: o.id }, /* @__PURE__ */ React.createElement("td", { className: "table-cell font-mono text-xs font-semibold" }, "#", o.id.slice(0, 8)), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, /* @__PURE__ */ React.createElement("p", { className: "font-medium" }, o.addr.name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted-foreground" }, o.date)), /* @__PURE__ */ React.createElement("td", { className: "table-cell font-semibold tabular-nums" }, fmtMoney(CART_PRICING(o.lines).total)), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, NEXT_STATUS[o.status].length ? /* @__PURE__ */ React.createElement(
      FilterSelect,
      {
        id: "st-" + o.id.slice(0, 8),
        label: "Status",
        value: o.status,
        options: ORDER_STATUSES,
        onChange: (s) => change(o, s)
      }
    ) : /* @__PURE__ */ React.createElement(OrderStatusBadge, { status: o.status })), /* @__PURE__ */ React.createElement("td", { className: "table-cell text-right whitespace-nowrap" }, /* @__PURE__ */ React.createElement("a", { href: "./order-detail-page.html?order_id=" + o.id, className: "btn", "data-variant": "outline", "data-size": "sm" }, "Details"))))))), /* @__PURE__ */ React.createElement(Pager, { page, pages, onChange: setPage }));
  }
  var AdminUsersView = () => /* @__PURE__ */ React.createElement(AdminPlaceholder, { label: "Users" });
  function StockCell({ p }) {
    if (p.oos || p.stock === 0) return /* @__PURE__ */ React.createElement("span", { className: "font-medium text-red-600 dark:text-red-400" }, p.stock);
    if (p.stock <= 5) return /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300" }, p.stock, /* @__PURE__ */ React.createElement("span", { className: "font-normal opacity-80" }, "low"));
    return /* @__PURE__ */ React.createElement("span", null, p.stock);
  }
  function AdminProductsView() {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("All");
    const [stock, setStock] = useState("All");
    const [page, setPage] = useState(1);
    const [delSlug, setDelSlug] = useState(null);
    const filtered = PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cat !== "All" && p.cat !== cat) return false;
      if (stock === "In stock" && (p.oos || p.stock === 0)) return false;
      if (stock === "Out of stock" && (p.oos || p.stock !== 0)) return false;
      if (stock === "Low stock" && (p.oos || p.stock === 0 || p.stock > 5)) return false;
      return true;
    });
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    useEffect(() => setPage(1), [search, cat, stock]);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" }), /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": "Search products",
        placeholder: "Search products\u2026",
        value: search,
        onChange: (e) => setSearch(e.target.value),
        className: "w-full pl-9 sm:w-56 sm:min-w-0"
      }
    )), /* @__PURE__ */ React.createElement(
      FilterSelect,
      {
        id: "prod-cat",
        label: "Category",
        value: cat,
        options: ["All"].concat(CATS.map((c) => c.label)),
        onChange: setCat
      }
    ), /* @__PURE__ */ React.createElement(
      FilterSelect,
      {
        id: "prod-stock",
        label: "Stock",
        value: stock,
        options: ["All", "In stock", "Low stock", "Out of stock"],
        onChange: setStock
      }
    ), /* @__PURE__ */ React.createElement(Button, { className: "w-fit shrink-0 sm:ml-auto" }, /* @__PURE__ */ React.createElement("a", { href: "./admin-product-form.html" }, "+ New Product"))), /* @__PURE__ */ React.createElement("div", { className: "table-container mt-6" }, /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "table-head w-10" }, "#"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Name"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Price"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Stock"), /* @__PURE__ */ React.createElement("th", { className: "table-head" }, "Category"), /* @__PURE__ */ React.createElement("th", { className: "table-head text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, paged.map((p, i) => {
      const c = CATS.find((c2) => c2.id === p.cat);
      return /* @__PURE__ */ React.createElement("tr", { className: "table-row", key: p.slug }, /* @__PURE__ */ React.createElement("td", { className: "table-cell text-muted-foreground" }, (page - 1) * PAGE_SIZE + i + 1), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, /* @__PURE__ */ React.createElement("a", { href: "./product-detail-page.html?slug=" + p.slug, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("img", { src: p.img, alt: "", className: "h-9 w-9 rounded-md object-cover" }), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, p.name))), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, fmtMoney(p.price)), /* @__PURE__ */ React.createElement("td", { className: "table-cell" }, /* @__PURE__ */ React.createElement(StockCell, { p })), /* @__PURE__ */ React.createElement("td", { className: "table-cell text-muted-foreground" }, c ? c.label : p.cat), /* @__PURE__ */ React.createElement("td", { className: "table-cell text-right whitespace-nowrap" }, /* @__PURE__ */ React.createElement(
        "a",
        {
          href: "./admin-product-form.html?id=" + p.slug,
          "aria-label": "Edit " + p.name,
          "data-variant": "ghost",
          "data-size": "icon",
          className: "btn inline-flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "pencil", className: "h-4 w-4" })
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "ml-1 h-8 w-8 text-zinc-400 hover:text-red-600 dark:text-red-400",
          "aria-label": "Delete " + p.name,
          onClick: () => setDelSlug(p.slug)
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "trash-2", className: "h-4 w-4" })
      )));
    }), !paged.length && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "table-cell py-12 text-center text-muted-foreground", colSpan: "6" }, "No products match your filters."))))), /* @__PURE__ */ React.createElement(Pager, { page, pages, onChange: setPage }), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        open: !!delSlug,
        onClose: () => setDelSlug(null),
        title: "Delete " + (delSlug ? PRODUCTS.find((p) => p.slug === delSlug).name : "product") + "?",
        description: "This product will be permanently removed from the catalog. This can't be undone.",
        confirmLabel: "Delete",
        onConfirm: () => {
          setDelSlug(null);
          toast("Product deleted (demo)");
        }
      }
    ));
  }
  function MultiUpload({ label, max = 5, files, setFiles }) {
    const inputRef = useRef(null);
    const add = (list) => {
      const ok = [];
      for (const f of Array.from(list)) {
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
          toast("Only JPG, PNG or WebP images allowed", true);
          continue;
        }
        if (f.size > 5 * 1024 * 1024) {
          toast("Each image must be under 5MB", true);
          continue;
        }
        ok.push(f);
      }
      setFiles([...files, ...ok].slice(0, max));
      if (inputRef.current) inputRef.current.value = "";
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "label" }, label), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-3" }, files.map((f, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800" }, /* @__PURE__ */ React.createElement("img", { src: URL.createObjectURL(f), alt: f.name, className: "h-full w-full object-cover" }), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Remove " + f.name,
        onClick: () => setFiles(files.filter((_, j) => j !== i)),
        className: "absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900/60 text-white hover:bg-red-600"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", className: "h-3.5 w-3.5" })
    ))), files.length < max && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Add image " + (files.length + 1),
        onClick: () => inputRef.current && inputRef.current.click(),
        className: "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-[var(--primary)] hover:text-[var(--primary)] dark:border-zinc-700"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "image-plus", className: "h-5 w-5" }),
      /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium" }, "Add")
    )), /* @__PURE__ */ React.createElement("p", { className: "field-description" }, "Up to ", max, " images \xB7 5MB each \xB7 JPG, PNG or WebP"), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/jpeg,image/png,image/webp",
        multiple: true,
        className: "hidden",
        onChange: (e) => {
          if (e.target.value) add(e.target.files);
        }
      }
    ));
  }
  function AdminProductFormView() {
    const params = (() => {
      try {
        return new URLSearchParams(window.location.search);
      } catch (e) {
        return null;
      }
    })();
    const editSlug = params ? params.get("id") : null;
    const existing = editSlug ? PRODUCTS.find((p) => p.slug === editSlug) : null;
    const catLabel2 = (id) => (CATS.find((c) => c.id === id) || {}).label || "";
    const [name, setName] = useState(existing ? existing.name : "");
    const [desc, setDesc] = useState(existing ? existing.desc : "");
    const [price, setPrice] = useState(existing ? String(existing.price) : "");
    const [stock, setStock] = useState(existing ? String(existing.stock) : "");
    const [cat, setCat] = useState(existing ? catLabel2(existing.cat) : "");
    const [files, setFiles] = useState([]);
    const [errs, setErrs] = useState({});
    const [busy, setBusy] = useState(false);
    const go = () => {
      window.location = "./admin-products-page.html";
    };
    const submit = (e) => {
      e.preventDefault();
      const next = {};
      if (!name.trim()) next.name = "Name is required.";
      const p = Number(price);
      if (price === "" || Number.isNaN(p) || p < 0) next.price = "Enter a valid price (0 or more).";
      const s = Number(stock);
      if (stock === "" || Number.isNaN(s) || s < 0) next.stock = "Enter a valid stock count (0 or more).";
      if (!cat) next.category = "Select a category.";
      setErrs(next);
      if (Object.keys(next).length) return;
      setBusy(true);
      window.setTimeout(() => {
        toast(existing ? "Product updated (demo)" : "Product created (demo)");
        go();
      }, 900);
    };
    const fieldError = (k) => errs[k] && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-600 dark:text-red-400", role: "alert" }, errs[k]);
    return /* @__PURE__ */ React.createElement("form", { onSubmit: submit, className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold tracking-tight" }, existing ? "Edit Product" : "Create Product"), /* @__PURE__ */ React.createElement(Button, { variant: "outline", type: "button", onClick: go }, "Cancel")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-2" }, /* @__PURE__ */ React.createElement("div", { className: "card p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground" }, "Details"), /* @__PURE__ */ React.createElement("div", { className: "mt-4 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "pf-name", className: "label" }, "Name"), /* @__PURE__ */ React.createElement(Input, { id: "pf-name", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Waxed Field Jacket" }), fieldError("name")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "pf-desc", className: "label" }, "Description"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        id: "pf-desc",
        className: "input min-h-28",
        value: desc,
        onChange: (e) => setDesc(e.target.value),
        placeholder: "A working man's jacket cut from 10oz waxed cotton..."
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "pf-price", className: "label" }, "Price"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" }, "$"), /* @__PURE__ */ React.createElement(
      Input,
      {
        id: "pf-price",
        type: "number",
        min: "0",
        step: "0.01",
        inputMode: "decimal",
        value: price,
        className: "pl-8",
        onChange: (e) => setPrice(e.target.value),
        placeholder: "189.00"
      }
    )), fieldError("price")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "pf-stock", className: "label" }, "Stock"), /* @__PURE__ */ React.createElement(
      Input,
      {
        id: "pf-stock",
        type: "number",
        min: "0",
        step: "1",
        inputMode: "numeric",
        value: stock,
        onChange: (e) => setStock(e.target.value),
        placeholder: "24"
      }
    ), fieldError("stock"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "pf-cat", className: "label" }, "Category"), /* @__PURE__ */ React.createElement(
      FilterSelect,
      {
        id: "pf-cat",
        label: "Category",
        placeholder: "Select a category",
        value: cat,
        options: ["Outerwear", "Travel", "Carry & Desk", "Drinkware"],
        onChange: setCat
      }
    ), fieldError("category")))), /* @__PURE__ */ React.createElement("div", { className: "card p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground" }, "Images"), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement(MultiUpload, { label: "Product images", max: 5, files, setFiles })))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(Button, { type: "submit", disabled: busy, className: "w-fit" }, busy ? "Saving\u2026" : "Save"), /* @__PURE__ */ React.createElement(Button, { variant: "outline", type: "button", onClick: go }, "Cancel")));
  }
  function NotFoundView() {
    return /* @__PURE__ */ React.createElement("div", { className: "mx-auto flex max-w-7xl flex-col items-center px-4 pb-32 pt-24 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "mx-auto block h-2 w-12 rounded-full bg-[var(--primary)]" }), /* @__PURE__ */ React.createElement("p", { className: "mt-6 font-display text-7xl font-extrabold tracking-tight md:text-8xl" }, "404"), /* @__PURE__ */ React.createElement("h1", { className: "mt-3 text-xl font-semibold tracking-tight" }, "This trail goes cold"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 max-w-md text-sm text-muted-foreground" }, "The page you were looking for has wandered off the map. It may have moved, been retired, or never existed in the first place."), /* @__PURE__ */ React.createElement("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3" }, /* @__PURE__ */ React.createElement(Button, { className: "h-10 px-6" }, /* @__PURE__ */ React.createElement("a", { href: "./home-page.html" }, "Back to home")), /* @__PURE__ */ React.createElement(Button, { variant: "outline", className: "h-10 px-6" }, /* @__PURE__ */ React.createElement("a", { href: "./products-page.html" }, "Browse products"))));
  }
  function App() {
    const view = document.body.dataset.view;
    const isProducts = view === "products";
    const isProduct = view === "product";
    const isCart = view === "cart";
    const isCheckout = view === "checkout";
    const isOrderSuccess = view === "order-success";
    const isOrders = view === "orders";
    const isOrderDetail = view === "order-detail";
    const isProfile = view === "profile";
    const isAuth = view === "login";
    const is404 = view === "404";
    const isAdmin = view.startsWith("admin");
    const [dark, setDark] = useState(() => localStorage.getItem("ui.theme") ? localStorage.getItem("ui.theme") === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    useEffect(() => {
      document.documentElement.classList.toggle("dark", dark);
      localStorage.setItem("ui.theme", dark ? "dark" : "light");
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
      toast("Added to cart");
    };
    useEffect(() => {
      const esc = (e) => {
        if (e.key === "Escape") {
          setCartOpen(false);
          setMenuOpen(false);
        }
      };
      document.addEventListener("keydown", esc);
      return () => document.removeEventListener("keydown", esc);
    }, []);
    return isAuth ? /* @__PURE__ */ React.createElement(AuthScreen, null) : isAdmin ? /* @__PURE__ */ React.createElement(AdminShell, { title: VIEW_TITLES[view] || "Products", section: view === "admin-product-form" ? "admin-products" : view, dark, onTheme: () => setDark(!dark) }, view === "admin" ? /* @__PURE__ */ React.createElement(AdminDashboardView, null) : view === "admin-products" ? /* @__PURE__ */ React.createElement(AdminProductsView, null) : view === "admin-product-form" ? /* @__PURE__ */ React.createElement(AdminProductFormView, null) : view === "admin-categories" ? /* @__PURE__ */ React.createElement(AdminCategoriesView, null) : view === "admin-orders" ? /* @__PURE__ */ React.createElement(AdminOrdersView, null) : /* @__PURE__ */ React.createElement(AdminUsersView, null)) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("a", { href: "#main", className: "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2" }, "Skip to content"), /* @__PURE__ */ React.createElement(
      Header,
      {
        cartCount,
        onCart: () => setCartOpen(true),
        onMenu: () => setMenuOpen(true),
        dark,
        onTheme: () => setDark(!dark)
      }
    ), /* @__PURE__ */ React.createElement("main", { id: "main" }, isProducts ? /* @__PURE__ */ React.createElement(ProductsView, null) : isProduct ? /* @__PURE__ */ React.createElement(ProductDetailView, { onAddToCart: addToCart }) : isCart ? /* @__PURE__ */ React.createElement(CartView, { lines, setLines }) : isCheckout ? /* @__PURE__ */ React.createElement(CheckoutView, { lines }) : isOrderSuccess ? /* @__PURE__ */ React.createElement(OrderSuccessView, null) : isOrders ? /* @__PURE__ */ React.createElement(OrdersView, null) : isOrderDetail ? /* @__PURE__ */ React.createElement(OrderDetailView, null) : isProfile ? /* @__PURE__ */ React.createElement(ProfileView, null) : is404 ? /* @__PURE__ */ React.createElement(NotFoundView, null) : /* @__PURE__ */ React.createElement(HomeView, null)), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement(CartDrawer, { open: cartOpen, onClose: () => setCartOpen(false), lines, setLines }), /* @__PURE__ */ React.createElement(MobileMenu, { open: menuOpen, onClose: () => setMenuOpen(false), onTheme: () => setDark(!dark), dark }));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
