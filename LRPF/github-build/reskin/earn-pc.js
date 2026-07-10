/* ============================================================
   LONGRISE PC — EARN injection (replaces CRYPTO AI / 네비 01)
   • Compiled React bundle is NOT modified.
   • Detects the active 네비 01 tab, hides the original CRYPTO AI
     page, and mounts the EARN dashboard as a sibling in <main>.
   • Relabels nav: CRYPTO AI→EARN, PACKAGES→PLANS, REWARDS→NETWORK.
   Requires window.LRChart (reskin/candles.js) loaded first.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- EARN demo data (mirrors mobile HomeScreen) ---------- */
  var D = {
    user: { name: "Daniel Park", rank: "PURPLE" },
    bal: { available: 12480.50, earned: 1864.22, invested: 24000.00 },
    todayPnl: 412.18,
    spark: [21, 24, 22, 27, 25, 30, 28, 34, 31, 38, 36, 41, 39, 45, 43, 48],
    weekEarnings: [212, 248, 196, 284, 262, 318, 344],
    engine: { name: "NEURAL CORE", winRate: 87.4, dailyRoi: 1.42, signals: 1284, latency: 14 },
    portfolio: [
      { pkg: "STANDARD", amount: 24000, dailyRoi: 1.2, start: "Mar 14, 2026", end: "Sep 10, 2026", progress: 0.51, earned: 1864.22 },
      { pkg: "PREMIUM",  amount: 20000, dailyRoi: 1.6, start: "Apr 02, 2026", end: "Dec 28, 2026", progress: 0.28, earned: 1792.40 },
      { pkg: "FLEXIBLE", amount: 4200,  dailyRoi: 0.65, start: "May 20, 2026", end: "No lock",      progress: 0.12, earned: 168.90 }
    ],
    pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "AVAX/USDT"],
    trades: [
      { pair: "BTC/USDT", side: "LONG",  pnl: 184.20, time: "14:32:08" },
      { pair: "ETH/USDT", side: "SHORT", pnl: 96.75,  time: "14:31:42" },
      { pair: "SOL/USDT", side: "LONG",  pnl: -22.40, time: "14:30:51" },
      { pair: "BNB/USDT", side: "LONG",  pnl: 61.10,  time: "14:29:33" },
      { pair: "XRP/USDT", side: "SHORT", pnl: 38.92,  time: "14:28:17" }
    ],
    news: [
      { title: "Neural Engine throughput upgrade", tag: "ENGINE", date: "Jun 11" },
      { title: "CNYT market maker program opens",     tag: "MARKET", date: "Jun 07" },
      { title: "Q3 roadmap: advanced integrations",   tag: "ROADMAP", date: "Jun 02" }
    ]
  };
  function fmt(n, dec) { if (dec === undefined) dec = 2; return Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function genTrade() {
    var pair = D.pairs[(Math.random() * D.pairs.length) | 0];
    var side = Math.random() > 0.45 ? "LONG" : "SHORT";
    var win = Math.random() > 0.16;
    var pnl = (win ? 1 : -1) * (8 + Math.random() * 220);
    var t = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return { pair: pair, side: side, pnl: Math.round(pnl * 100) / 100, time: p(t.getHours()) + ":" + p(t.getMinutes()) + ":" + p(t.getSeconds()) };
  }
  var BRAND_ICON = "brand/icon-gold.png";

  /* ---------- nav relabel map ---------- */
  var RELABEL = [
    { from: "CRYPTO AI", to: "EARN" },
    { from: "PACKAGES",  to: "PLANS" },
    { from: "REWARDS",   to: "NETWORK" }
  ];

  /* =====================================================================
     USER RANK DISPLAY
     The account chip showed the literal word "Investor". Per product spec
     the title line must show the member's DRAGON RANK instead.
     Rank tiers (글로벌 직급 달성 조건):
        White  — Basic   ($200+)
        Blue   — Standard($500+)
        Purple — Premium ($1,000+)
        Red    — VIP     ($5,000+)
        Black  — $10,000+
     A brand-new signup or a sub-Basic ($<200) buyer holds NO rank → ROOKIE.
     ─ DEV (개발 AI) NOTE ───────────────────────────────────────────────
       This is a static preview: rank is hardcoded to the demo member's tier.
       In production, resolve the rank server-side from the member's highest
       active package and replace USER_RANK below (fallback "ROOKIE").
     ===================================================================== */
  var USER_RANK = "PURPLE"; // demo member tier — see DEV NOTE above

  /* ---------- global copy swaps (betting rebrand) ----------
     Phrase-level & case-sensitive so unrelated words are left untouched.
     Applied app-wide every reconcile; the compiled bundle is never modified.
     ORDER MATTERS: longer / more specific phrases must come before the
     generic catch-alls so partial matches don't clobber them. */
  var TEXT_SWAP = [
    /* --- version/edition strings stripped: no identifiable engine version,
       document version, or protocol version should be exposed in copy.
       Longer/more specific phrases first so partial matches don't clobber. --- */
    ["Download or open the approved LONGRISE V8.9 master plan document served by the platform API.", "Download or open the approved LONGRISE master plan document served by the platform API."],
    ["© 2026 LONGRISE AI. All rights reserved. | V6.0 Master Plan Edition", "© 2026 LONGRISE AI. All rights reserved."],
    ["I agree to the V7.2 asset management policy and understand the withdrawal fees.", "I agree to the asset management policy and understand the withdrawal fees."],
    ["Our V6 Core architecture continuously evolves", "Our Core architecture continuously evolves"],
    ["The Red Dragon engine is a V6 neural architecture", "The Red Dragon engine is a neural architecture"],
    ["LONGRISE V6.0 Neural Server Maintenance", "LONGRISE Neural Server Maintenance"],
    ["LONGRISE Master Plan V8.9", "LONGRISE Master Plan"],
    ["✓ V6 Neural Engine model training", "✓ Neural Engine model training"],
    ["V7 Neural Engine & AI Advancement", "Neural Engine & AI Advancement"],
    ["Launch V7 Neural Engine upgrade", "Launch Neural Engine upgrade"],
    ["roadmap v2 launch", "roadmap launch"],
    ["Security Protocol V7.2 Active", "Security Protocol Active"],
    ["The V6 Master Architecture", "The Master Architecture"],
    ["Platform Genesis V6.0", "Platform Genesis"],
    ["Neural Core V6", "Neural Core"],
    ["V6 Neural Engine", "Neural Engine"],
    /* --- Referral Program page: replaced the bundle's fabricated
       "staking tier" commission model (Bronze/Silver/Gold/Platinum/
       Diamond, 0-100%) with the actual structure from the GitBook
       (earning-system.md) and the official V8.9 master plan doc —
       10% direct referral + ~11.11% rollup across 25 levels + Red/Black
       global rank bonus. See rebuildCommissionStructure() below for the
       tier-grid section itself; these are the surrounding paragraphs. --- */
    ["The LONGRISE Referral Program lets you earn rewards by inviting your network to join. When your referrals participate in package investments, you earn a commission on their investments. The commission structure is tied to your staking tier.", "The LONGRISE Referral Program lets you earn rewards by inviting your network to join. When your direct referral purchases a package, you earn a 10% commission immediately. Additional rollup commission is paid down to 25 levels of your network."],
    ["20% Commission Pool", "10% Direct Referral"],
    ["20% of platform fees allocated to referral rewards", "Paid instantly on every direct referral's package purchase"],
    ["Commission tiers are updated monthly based on your cumulative referral milestones", "Rollup and global rank bonus are calculated daily from your network's betting profit"],
    /* --- explicit UI copy --- */
    ["INVEST NOW", "BETTING NOW"],
    ["Investment Plans", "AI Betting Plans"],
    ["INVESTMENT PLANS", "AI BETTING PLANS"],
    /* --- account chip: literal "Investor" title → member rank --- */
    ["Investor", USER_RANK],
    /* --- guide / help copy: "investment" rebranded to betting terms --- */
    ["investment packages", "betting plans"],
    ["investment package", "betting plan"],
    ["CONFIRM YOUR INVESTMENT", "CONFIRM YOUR BET"],
    ["MONITOR YOUR INVESTMENT", "MONITOR YOUR BET"],
    ["MANAGE YOUR INVESTMENT", "MANAGE YOUR BET"],
    ["Confirm Investment", "Confirm Bet"],
    ["investment details", "bet details"],
    ["Your Investment", "Your Bet"],
    ["your investment", "your bet"],
    ["How to Invest", "How to Bet"],
    ["Reinvest", "Re-bet"],
    ["reinvest", "re-bet"],
    ["Investments", "Bets"],
    ["investments", "bets"],
    ["Investment", "Betting"],
    ["investment", "betting"]
  ];
  function swapCopy() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode;
      if (p && (p.nodeName === "SCRIPT" || p.nodeName === "STYLE")) continue;
      if (p && p.closest && p.closest("#lr-pc-footer")) continue; /* don't rewrite our own footer */
      var v = n.nodeValue;
      if (!v) continue;
      var nv = v;
      for (var i = 0; i < TEXT_SWAP.length; i++) {
        if (nv.indexOf(TEXT_SWAP[i][0]) !== -1) nv = nv.split(TEXT_SWAP[i][0]).join(TEXT_SWAP[i][1]);
      }
      if (nv !== v) n.nodeValue = nv;
    }
  }

  /* =====================================================================
     PLATFORM SETTINGS — hidden from the account menu.
     Spec: "Platform Settings" 메뉴는 아직 개발 전이라 UI에서 제거(비활성).
     We DO NOT delete the compiled source — only hide the menu item in the
     UI so the bundle still carries it for future development.
     ─ DEV (개발 AI) NOTE ───────────────────────────────────────────────
       To re-enable, remove the hidePlatformSettings() call in reconcile()
       (or delete this block). The original button still exists in the
       React bundle untouched.
     ===================================================================== */
  function hidePlatformSettings() {
    var spans = document.querySelectorAll("span,p,div,a,button");
    for (var i = 0; i < spans.length; i++) {
      var el = spans[i];
      if (el.children.length === 0 && (el.textContent || "").trim() === "Platform Settings") {
        var btn = el.closest("button") || el;
        if (btn && btn.style.display !== "none") btn.style.display = "none";
      }
    }
  }

  /* =====================================================================
     MARKET > CNYT P2P MARKET — "Market Safety" card removed per product
     spec. Bundle untouched — the whole card (icon+heading row + bullet
     list, wrapped in one glass-panel container) is hidden in the DOM.
     ===================================================================== */
  function hideMarketSafety() {
    var h3s = document.querySelectorAll("h3");
    for (var i = 0; i < h3s.length; i++) {
      if ((h3s[i].textContent || "").trim() === "Market Safety") {
        var card = h3s[i].parentNode && h3s[i].parentNode.parentNode;
        if (card && card.style.display !== "none") card.style.display = "none";
      }
    }
  }

  /* =====================================================================
     NETWORK > HONOR — the "No honor rankings yet" empty-state card
     removed per product spec. Shares a generic empty-state component
     with 3 other cards on this page (vanguard/team/tree), so match on
     this card's exact title text only — don't touch the others.
     ===================================================================== */
  function hideHonorRankingsEmpty() {
    var ps = document.querySelectorAll("p");
    for (var i = 0; i < ps.length; i++) {
      if ((ps[i].textContent || "").trim() === "No honor rankings yet") {
        var card = ps[i].parentNode;
        if (card && card.style.display !== "none") card.style.display = "none";
      }
    }
  }

  /* =====================================================================
     CONCIERGE SUPPORT — subtitle removed per product spec.
     ===================================================================== */
  function hideConciergeSubtitle() {
    var ps = document.querySelectorAll("p");
    for (var i = 0; i < ps.length; i++) {
      if ((ps[i].textContent || "").trim() === "Operational support is connected to live ticket queues. Submit issues here and review recent case statuses on the same screen.") {
        if (ps[i].style.display !== "none") ps[i].style.display = "none";
      }
    }
  }

  /* =====================================================================
     DOCUMENTATION > INTRODUCTION — floating dragon emoji watermark
     removed per product spec (was a decorative 🐉 bobbing up/down in the
     hero banner). The animated X-mark SVG lines are untouched.
     ===================================================================== */
  function hideDragonFloat() {
    var els = document.querySelectorAll("div");
    for (var i = 0; i < els.length; i++) {
      if (els[i].children.length === 0 && (els[i].textContent || "").trim() === "🐉") {
        if (els[i].style.display !== "none") els[i].style.display = "none";
      }
    }
  }
  /* the animated X-mark is 2 diagonal <line>s sharing a gradient with a
     unique id ("lineGradient") — target via that id so no other SVG
     icon on the page is touched. */
  function hideIntroXLines() {
    var grad = document.getElementById("lineGradient");
    if (!grad) return;
    var svg = grad.closest("svg");
    if (svg && svg.style.display !== "none") svg.style.display = "none";
  }
  /* Replacement ambient effect for the same hero banner: a few soft
     blurred gradient blobs that slowly drift (aurora glow) plus a
     handful of small gold particles drifting upward — current-trend
     "ambient AI" look in place of the removed dragon/X-lines. Randomized
     per-particle timing is generated once and left as-is (no need to
     regenerate on every reconcile). */
  /* Gold/amber/brown only — matches the EARN page's warm luxury-card
     tone site-wide (previous pink/purple/teal accents read as an
     unrelated color family next to EARN and were reverted). */
  var AURORA_BLOBS = [
    { top: "-10%", left: "-6%",  w: 280, h: 280, gradient: "radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(217,119,6,0.3) 55%, transparent 78%)", delay: "0s" },
    { top: "20%",  left: "60%",  w: 240, h: 240, gradient: "radial-gradient(circle, rgba(217,119,6,0.4) 0%, rgba(251,191,36,0.28) 55%, transparent 78%)", delay: "-4s" },
    { top: "55%",  left: "10%",  w: 210, h: 210, gradient: "radial-gradient(circle, rgba(185,154,107,0.35) 0%, rgba(251,191,36,0.25) 55%, transparent 78%)", delay: "-9s" }
  ];
  function buildIntroAurora() {
    var wrap = document.createElement("div");
    wrap.id = "lr-intro-aurora";
    wrap.className = "absolute inset-0 overflow-hidden";
    wrap.style.pointerEvents = "none";

    for (var i = 0; i < AURORA_BLOBS.length; i++) {
      var b = AURORA_BLOBS[i];
      var blob = document.createElement("div");
      blob.className = "lr-aurora-blob";
      blob.style.top = b.top; blob.style.left = b.left;
      blob.style.width = b.w + "px"; blob.style.height = b.h + "px";
      blob.style.background = b.gradient;
      blob.style.animationDelay = b.delay;
      wrap.appendChild(blob);
    }
    for (var p = 0; p < 18; p++) {
      var dot = document.createElement("div");
      dot.className = "lr-aurora-particle";
      var size = 2 + Math.random() * 2.5;
      dot.style.width = size + "px"; dot.style.height = size + "px";
      dot.style.left = (Math.random() * 100) + "%";
      dot.style.top = (30 + Math.random() * 60) + "%";
      dot.style.animationDuration = (5 + Math.random() * 5) + "s";
      dot.style.animationDelay = (Math.random() * 6) + "s";
      wrap.appendChild(dot);
    }
    return wrap;
  }
  function introHeroContainer() {
    var h1s = document.querySelectorAll("h1");
    for (var i = 0; i < h1s.length; i++) {
      if ((h1s[i].textContent || "").trim() === "LONGRISE AI") {
        return h1s[i].closest(".overflow-hidden");
      }
    }
    return null;
  }
  function styleIntroTitle(container) {
    var h1 = container.querySelector("h1");
    if (h1 && !h1.style.backgroundImage) {
      h1.style.backgroundImage = "linear-gradient(90deg, #fbbf24 0%, #fde68a 50%, #fbbf24 100%)";
      h1.style.webkitBackgroundClip = "text";
      h1.style.backgroundClip = "text";
      h1.style.webkitTextFillColor = "transparent";
      h1.style.color = "transparent";
    }
  }
  function ensureIntroAurora() {
    var container = introHeroContainer();
    if (!container) return;
    if (!container.querySelector("#lr-intro-aurora")) {
      container.insertBefore(buildIntroAurora(), container.firstChild.nextSibling);
    }
    styleIntroTitle(container);
  }

  /* =====================================================================
     MARKET > USDT Trading Floor — "Execution Notice" card removed per
     product spec (same card layout/pattern as the CNYT "Market Safety"
     card: icon+h4 header row, sibling of the card container).
     ===================================================================== */
  function hideExecutionNotice() {
    var h4s = document.querySelectorAll("h4");
    for (var i = 0; i < h4s.length; i++) {
      if ((h4s[i].textContent || "").trim() === "Execution Notice") {
        var card = h4s[i].parentNode && h4s[i].parentNode.parentNode;
        if (card && card.style.display !== "none") card.style.display = "none";
      }
    }
  }

  /* NETWORK > "Imperial Vanguard" card's inline blood-red gradient is left
     as shipped — confirmed to match the mobile reference's maroon-red +
     gold identity, not a stray hardcode (see earn-pc.css palette note). */

  /* =====================================================================
     WALLET/MY WEALTH — PACKAGE HISTORY / RECENT ACTIVITY / TRANSFER HISTORY
     were 3 full-width cards stacked vertically (long scroll). Product spec:
     show one at a time behind tab buttons instead. Bundle untouched — the
     3 cards stay exactly as rendered, we just inject a tab bar above them
     and toggle display:none on the two that aren't active.
     ===================================================================== */
  var wealthTabActive = 0;
  var WEALTH_TAB_TITLES = ["PACKAGE HISTORY", "RECENT ACTIVITY", "TRANSFER HISTORY"];
  function findWealthHistoryCards() {
    var cards = [];
    for (var i = 0; i < WEALTH_TAB_TITLES.length; i++) {
      var h2s = document.querySelectorAll("h2");
      var found = null;
      for (var j = 0; j < h2s.length; j++) {
        if ((h2s[j].textContent || "").trim() === WEALTH_TAB_TITLES[i]) { found = h2s[j]; break; }
      }
      if (!found) return null;
      var card = found.closest(".glass-panel");
      if (!card) return null;
      cards.push(card);
    }
    if (cards[0].parentNode !== cards[1].parentNode || cards[1].parentNode !== cards[2].parentNode) return null;
    return cards;
  }
  function applyWealthTabState(cards) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.display = (i === wealthTabActive) ? "" : "none";
    }
    var tabs = document.getElementById("lr-wealth-tabs");
    if (tabs) {
      var btns = tabs.querySelectorAll(".lr-wealth-tab-btn");
      for (var k = 0; k < btns.length; k++) {
        btns[k].classList.toggle("lr-wealth-tab-active", k === wealthTabActive);
      }
    }
  }
  function buildWealthTabs(cards) {
    var bar = document.createElement("div");
    bar.id = "lr-wealth-tabs";
    bar.className = "lr-wealth-tabs";
    var labels = ["Package History", "Recent Activity", "Transfer History"];
    for (var i = 0; i < labels.length; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lr-wealth-tab-btn" + (i === wealthTabActive ? " lr-wealth-tab-active" : "");
      btn.textContent = labels[i];
      btn.setAttribute("data-idx", i);
      btn.addEventListener("click", function (e) {
        wealthTabActive = Number(e.currentTarget.getAttribute("data-idx"));
        var freshCards = findWealthHistoryCards();
        if (freshCards) applyWealthTabState(freshCards);
      });
      bar.appendChild(btn);
    }
    return bar;
  }
  function ensureWealthHistoryTabs() {
    var cards = findWealthHistoryCards();
    var existing = document.getElementById("lr-wealth-tabs");
    if (!cards) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      cards[0].parentNode.insertBefore(buildWealthTabs(cards), cards[0]);
    }
    applyWealthTabState(cards);
  }

  /* =====================================================================
     DOCUMENTATION > REFERRAL PROGRAM — "How It Works" steps each shipped
     with an "Upload Step Image" widget (member-facing file input for
     something only an admin should curate). Removed per product
     decision; replaced with a single Open/Download link to a
     jake-agent Resources entry titled "…Referral…" (same admin-curated
     Resources system built for Documentation > Resources).
     ===================================================================== */
  function hideStepImageUploads() {
    var h4s = document.querySelectorAll("h4");
    for (var i = 0; i < h4s.length; i++) {
      if ((h4s[i].textContent || "").trim() === "Upload Step Image") {
        var box = h4s[i].closest('[class*="border-dashed"]');
        if (box && box.style.display !== "none") box.style.display = "none";
      }
    }
  }
  /* =====================================================================
     REFERRAL PROGRAM — 대표님 결정: all of this page's own text (hero
     copy, "How It Works" steps, Commission Structure, Tier Benefits,
     Important Notes, bottom CTA) is hidden outright. The authoritative
     content lives in the admin-maintained PDF (jake-agent Resources)
     and the public GitBook (earning-system.md) — a single Open button
     (plus Download once a PDF is uploaded) is the entire page now.
     ===================================================================== */
  function referralPageRoot() {
    var h1s = document.querySelectorAll("h1");
    for (var i = 0; i < h1s.length; i++) {
      if ((h1s[i].textContent || "").trim() === "LONGRISE Referral Program") {
        return h1s[i].parentNode.parentNode;
      }
    }
    return null;
  }
  function ensureReferralGuideLink() {
    var root = referralPageRoot();
    if (!root) return;
    if (!document.getElementById("lr-referral-guide")) {
      var box = document.createElement("div");
      box.id = "lr-referral-guide";
      box.className = "flex justify-center gap-3 pt-32";
      box.innerHTML =
        '<button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-300 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all">Open</button>';
      root.insertBefore(box, root.firstChild);
    }
    Array.prototype.forEach.call(root.children, function (c) {
      if (c.id !== "lr-referral-guide" && c.style.display !== "none") c.style.display = "none";
    });
  }

  function topNavButtons() {
    var nav = document.querySelector("nav");
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll("button"));
  }

  /* =====================================================================
     NEWS & UPDATES — top main-menu tab (injected).
     The compiled app already ships the "Official Announcements" page; it is
     reachable from the account menu → "News & Updates". We add a primary
     nav tab that triggers that same navigation, so News & Updates lives in
     the TOP MENU (not on the EARN page). Bundle untouched.
     ===================================================================== */
  var NEWS_NAV_ID = "lr-nav-news";
  var navState = null; /* "news" when our News tab is the active view */
  var NAV_BASE = "px-4 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border-[1.5px]";
  var NAV_INACTIVE = NAV_BASE + " bg-transparent text-gray-300 border-red-900/40 hover:text-white hover:border-red-600/60";
  var NAV_ACTIVE = NAV_BASE + " bg-red-600/10 text-white border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.2)]";
  var NEWS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>';

  function accountBtn() { return document.querySelector('nav button[aria-label="Account menu"]'); }
  /* navigate to the bundle's Official Announcements page via the account menu */
  function goNews() {
    var u = accountBtn(); if (!u) return;
    u.click();
    setTimeout(function () {
      var btns = document.querySelectorAll("button"), nu = null;
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].id === NEWS_NAV_ID) continue; /* skip our own nav tab */
        if (/^News\s*&\s*Updates$/i.test((btns[i].textContent || "").trim())) { nu = btns[i]; break; }
      }
      if (nu) nu.click();
      /* close the account dropdown if it stayed open */
      setTimeout(function () { if (accountBtn() && document.querySelector('[role="menu"], [aria-label="Account menu"][aria-expanded="true"]')) { /* React usually closes it */ } }, 40);
    }, 70);
  }
  /* inject + keep the News tab in the top menu, styled like native tabs */
  function ensureNewsNav() {
    var menu = topMenuButtons();
    if (!menu.length) return;
    var container = menu[menu.length - 1].parentNode; /* the flex row holding the tabs */
    var btn = document.getElementById(NEWS_NAV_ID);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = NEWS_NAV_ID;
      btn.type = "button";
      btn.innerHTML = NEWS_ICON + '<span>NEWS &amp; UPDATES</span>';
      btn.addEventListener("click", function () { navState = "news"; goNews(); });
      container.appendChild(btn);
    } else if (btn.parentNode !== container) {
      container.appendChild(btn); /* re-attach if React re-rendered the row */
    }
    btn.className = (navState === "news") ? NAV_ACTIVE : NAV_INACTIVE;
  }

  /* find a top-nav button by its (original or relabeled) text */
  function findNavBtn(matches) {
    var btns = topNavButtons();
    for (var i = 0; i < btns.length; i++) {
      var txt = (btns[i].textContent || "").trim().toUpperCase();
      if (matches.indexOf(txt) !== -1) return btns[i];
    }
    return null;
  }
  /* The 5 primary menu buttons, identified by their STYLING classes — NOT by
     text. This is translation-proof: Google/browser translation rewrites the
     button labels (EARN→Korean) but never the className, so detection here
     keeps working. DOM order is fixed: [EARN, PLANS, NETWORK, MARKET, WALLET]. */
  function topMenuButtons() {
    var btns = topNavButtons(), out = [];
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].id === NEWS_NAV_ID) continue; /* exclude our injected tab */
      var c = btns[i].className || "";
      if (/tracking-widest/.test(c) && /border-\[1\.5px\]/.test(c)) out.push(btns[i]);
    }
    return out;
  }
  function isEarnActive() {
    var menu = topMenuButtons();
    var b = menu[0]; /* index 0 = EARN tab, regardless of translated label */
    if (!b) return false;
    /* active tab = solid bg-red-600/10. NOTE: do NOT match border-red-600/60,
       it also appears in the inactive hover:border-red-600/60 class. */
    return /(^|\s)bg-red-600\/10(\s|$)/.test(b.className || "");
  }
  function goPlans() {
    var menu = topMenuButtons();
    if (menu[1]) menu[1].click(); /* index 1 = PLANS tab */
  }

  /* relabel nav button text in place (only the visible label, keep icon) */
  function relabelNav() {
    var btns = topNavButtons();
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var cur = (btn.textContent || "").trim().toUpperCase();
      for (var r = 0; r < RELABEL.length; r++) {
        if (cur === RELABEL[r].from) {
          setBtnLabel(btn, RELABEL[r].to);
        }
      }
    }
  }
  /* replace the deepest text node of the button without nuking the icon */
  function setBtnLabel(btn, label) {
    var walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null);
    var node, target = null;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim()) target = node;
    }
    if (target && target.nodeValue.trim().toUpperCase() !== label) {
      target.nodeValue = label;
    }
  }

  /* ---------- sparkline ---------- */
  function sparkSVG(pts, w, h) {
    var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts), rng = (max - min) || 1;
    var step = w / (pts.length - 1);
    var d = pts.map(function (v, i) { return (i ? "L" : "M") + (i * step).toFixed(1) + " " + (h - ((v - min) / rng) * (h - 6) - 3).toFixed(1); }).join(" ");
    var area = d + " L" + w + " " + h + " L0 " + h + " Z";
    return '<svg width="100%" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="epcSpark" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="rgba(251,191,36,.28)"/><stop offset="1" stop-color="rgba(251,191,36,0)"/>' +
      '</linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#epcSpark)"/>' +
      '<path d="' + d + '" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ---------- build EARN panel ---------- */
  var chart = null, liveTimer = null;
  function buildPanel() {
    var total = D.bal.available + D.bal.earned + D.bal.invested;
    var weekMax = Math.max.apply(null, D.weekEarnings);
    var weekTotal = D.weekEarnings.reduce(function (a, b) { return a + b; }, 0);
    var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    var el = document.createElement("div");
    el.className = "earn-pc";
    el.id = "earn-pc";

    el.innerHTML =
      /* greeting + rank */
      '<div class="epc-top">' +
        '<div class="epc-greet"><div class="eyebrow">Welcome back</div><div class="name display">' + D.user.name + '</div></div>' +
        '<div class="epc-rank"><span class="dot"></span>' + D.user.rank + ' DRAGON</div>' +
      '</div>' +

      '<div class="epc-grid">' +

        /* HERO total assets */
        '<div class="card hero col-8">' +
          '<div class="card-head"><div class="eyebrow">Total assets</div><span class="pill live">Live</span></div>' +
          '<div class="epc-total display gold-text num">$' + fmt(total) + '</div>' +
          '<div class="epc-sub"><span class="delta green num">+$' + fmt(D.todayPnl) + '</span><span class="muted">today · USDT</span></div>' +
          '<div class="epc-spark">' + sparkSVG(D.spark, 560, 70) + '</div>' +
          '<button class="btn-gold" data-act="plans">Get more Profit →</button>' +
        '</div>' +

        /* snapshot stats */
        '<div class="card col-4">' +
          '<div class="card-head"><div class="card-title">Performance</div></div>' +
          '<div class="snap">' +
            '<div class="snap-tile"><div class="v num gold-text">' + D.engine.winRate + '<small>%</small></div><div class="l">Win rate</div></div>' +
            '<div class="snap-tile"><div class="v num gold-text">' + D.engine.dailyRoi + '<small>%</small></div><div class="l">Daily ROI</div></div>' +
            '<div class="snap-tile"><div class="v num">$' + fmt(D.bal.earned) + '</div><div class="l">Earned</div></div>' +
            '<div class="snap-tile"><div class="v num">$' + fmt(D.bal.invested, 0) + '</div><div class="l">Invested</div></div>' +
          '</div>' +
        '</div>' +

        /* AI ENGINE */
        '<div class="card col-8">' +
          '<div class="card-head">' +
            '<div class="eng-head"><img src="' + BRAND_ICON + '" alt=""><div><div class="eng-name display">' + D.engine.name + '</div><div class="eng-tag">AI execution engine</div></div></div>' +
            '<span class="pill live">Active</span>' +
          '</div>' +
          '<div class="fchart">' +
            '<div class="fchart-bar">' +
              '<div class="fchart-pair"><span class="fchart-sym">BTC/USDT</span><span class="fchart-perp">PERP</span><span class="pill live" style="margin-left:4px">AI</span></div>' +
              '<div class="fchart-px num" id="epc-px">67,213.5 <span class="green" style="font-size:12px;font-weight:700">+0.00%</span></div>' +
            '</div>' +
            '<div class="fchart-canvas"><canvas id="epc-canvas"></canvas></div>' +
          '</div>' +
          '<div class="stat-grid">' +
            '<div class="st"><div class="v num">' + D.engine.winRate + '<small>%</small></div><div class="l">Win rate</div></div>' +
            '<div class="st"><div class="v num">' + D.engine.dailyRoi + '<small>%</small></div><div class="l">Daily ROI</div></div>' +
            '<div class="st"><div class="v num" id="epc-sig">' + fmt(D.engine.signals, 0) + '<small>/s</small></div><div class="l">Signals</div></div>' +
            '<div class="st"><div class="v num" id="epc-lat">' + D.engine.latency + '<small>ms</small></div><div class="l">Latency</div></div>' +
          '</div>' +
          '<div class="terminal">' +
            '<div><span class="g">▸</span> neural.core.v6 — session synced · 3 exchanges</div>' +
            '<div><span class="a">▸</span> pattern.match BTC/USDT conf 0.94 → <span class="g">executed</span></div>' +
            '<div><span class="g">▸</span> pnl.stream +' + fmt(D.todayPnl) + ' USDT realized today</div>' +
          '</div>' +
        '</div>' +

        /* MY PACKAGES */
        '<div class="card col-4">' +
          '<div class="card-head"><div class="card-title">My packages</div><button class="card-action" data-act="plans">View plans →</button></div>' +
          D.portfolio.map(function (p) {
            return '<div class="pkg">' +
              '<div class="pkg-top"><span class="pkg-name display">' + p.pkg + '</span><span class="num green" style="font-size:14px;font-weight:800">+$' + fmt(p.earned) + '</span></div>' +
              '<div class="pkg-meta"><span class="num">$' + fmt(p.amount, 0) + ' principal</span><span class="num gold-text" style="font-weight:800">' + p.dailyRoi + '%/day</span></div>' +
              '<div class="bar"><i style="width:' + Math.round(p.progress * 100) + '%"></i></div>' +
              '<div class="pkg-foot"><span>' + p.start + '</span><span>' + Math.round(p.progress * 100) + '% · ends ' + p.end + '</span></div>' +
            '</div>';
          }).join("") +
        '</div>' +

        /* LIVE TRADES */
        '<div class="card col-8">' +
          '<div class="card-head"><div class="card-title">Live trades</div><span class="pill live">Streaming</span></div>' +
          '<div id="epc-trades">' + tradesHTML(D.trades) + '</div>' +
        '</div>' +

        /* LAST 7 DAYS */
        '<div class="card col-4">' +
          '<div class="card-head"><div class="card-title">Last 7 days</div></div>' +
          '<div class="week-total"><span class="v num gold-text">+$' + fmt(weekTotal) + '</span><span class="muted" style="font-size:11.5px">dividends credited</span></div>' +
          '<div class="week-bars">' +
            D.weekEarnings.map(function (v, i) {
              return '<div class="wb' + (i === 6 ? ' last' : '') + '"><i style="height:' + Math.round((v / weekMax) * 92) + 'px"></i><span>' + days[i] + '</span></div>';
            }).join("") +
          '</div>' +
        '</div>' +

      '</div>';

    /* wire nav buttons */
    Array.prototype.forEach.call(el.querySelectorAll('[data-act="plans"]'), function (b) {
      b.addEventListener("click", goPlans);
    });
    return el;
  }

  function tradesHTML(list) {
    return list.map(function (t) {
      var win = t.pnl >= 0;
      return '<div class="row">' +
        '<div class="disc ' + (win ? "up" : "down") + '">' + (win ? "▲" : "▼") + '</div>' +
        '<div class="row-main"><div class="row-title">' + t.pair + '</div><div class="row-sub">' + t.side + ' · ' + t.time + '</div></div>' +
        '<div class="row-trail num ' + (win ? "green" : "red") + '">' + (win ? "+" : "−") + '$' + fmt(Math.abs(t.pnl)) + '</div>' +
      '</div>';
    }).join("");
  }

  /* ---------- chart + live loops ---------- */
  function startChart() {
    var cv = document.getElementById("epc-canvas");
    if (!cv || !window.LRChart) return;
    var pxEl = document.getElementById("epc-px");
    var lastTs = 0;
    chart = window.LRChart(cv, {
      compact: false, start: 67213.5, decimals: 1, ai: true,
      onPrice: function (last, firstOpen) {
        var now = Date.now(); if (now - lastTs < 550) return; lastTs = now;
        if (!pxEl) return;
        var chg = firstOpen ? ((last - firstOpen) / firstOpen) * 100 : 0, up = chg >= 0;
        pxEl.innerHTML = fmt(last, 1) + ' <span class="' + (up ? "green" : "red") + '" style="font-size:12px;font-weight:700">' + (up ? "+" : "") + chg.toFixed(2) + '%</span>';
      },
      onStats: function (s) {
        var sg = document.getElementById("epc-sig"), lt = document.getElementById("epc-lat");
        if (sg) sg.innerHTML = fmt(s.sps, 0) + '<small>/s</small>';
        if (lt) lt.innerHTML = s.latency + '<small>ms</small>';
      }
    });
    if (chart && chart.render) chart.render();
  }
  function startLive() {
    liveTimer = setInterval(function () {
      var box = document.getElementById("epc-trades");
      if (!box) return;
      D.trades = [genTrade()].concat(D.trades).slice(0, 6);
      box.innerHTML = tradesHTML(D.trades);
    }, 3200);
  }
  function teardown() {
    if (chart) { try { chart.stop(); } catch (e) {} chart = null; }
    if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
  }

  /* ---------- mount / unmount ---------- */
  var applying = false;
  function getMain() { return document.querySelector("main"); }

  /* Hiding the original CRYPTO AI page via a per-reconcile inline
     style.display="none" loop raced with the compiled bundle's own
     re-renders: React periodically resets that inline style on its own
     children, and our MutationObserver-driven reconcile only re-hides it
     ~60ms later — long enough for a visible frame where both the native
     page and our EARN panel render on top of each other. A CSS class
     with !important can't be clobbered by React's inline style updates,
     so toggle that instead of touching style.display directly. */
  function showEarn() {
    var main = getMain(); if (!main) return;
    main.classList.add("lr-earn-active");
    var panel = document.getElementById("earn-pc");
    if (!panel) {
      panel = buildPanel();
      main.appendChild(panel);
      startChart();
      startLive();
    }
  }
  function hideEarn() {
    var main = getMain(); if (!main) return;
    main.classList.remove("lr-earn-active");
    var panel = document.getElementById("earn-pc");
    if (panel) { teardown(); panel.remove(); }
  }

  /* =====================================================================
     GLOBAL FOOTER — ported verbatim from the LONGRISE marketing site
     (kenwac74-svg.github.io/AIHP footer). Replaces the compiled app's
     own footer on every page. Bundle untouched: original <footer>s are
     hidden, ours is appended to <body> (outside the React root).
     ===================================================================== */
  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "footer lr-pc-footer";
    f.id = "lr-pc-footer";
    f.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<img class="footer-lockup" src="./brand/lockup-white-gold-trim.png" alt="LONGRISE" />' +
            '<p>AI powered gaming and futures strategy platform. Users choose a product plan, AI runs automated strategies, and returns are tracked through the system.</p>' +
          '</div>' +
          '<div>' +
            '<h5>Risk Info</h5>' +
            '<a href="terms.html">Terms</a><a href="privacy-policy.html">Privacy Policy</a><a href="risk-notice.html">Risk Notice</a><a href="ResponsibleGaming.html">Responsible Gaming</a>' +
          '</div>' +
          '<div>' +
            '<h5>Contact</h5>' +
            '<a href="https://t.me/Longrise_Support" target="_blank" rel="noopener">Telegram</a><a href="#">Email</a><a href="#">Support Center</a><a href="#">Business Inquiry</a>' +
          '</div>' +
          '<div>' +
            '<h5>Partners</h5>' +
            '<a href="https://kenwac74-svg.github.io/cnyt/" target="_blank" rel="noopener">CNYT Foundation ↗</a><a href="GamingPartners.html">Gaming Partners ↗</a><a href="StrategicAlliance.html">Strategic Alliance ↗</a>' +
          '</div>' +
        '</div>' +
        '<div class="legal">© 2026 LONGRISE GLOBAL FOUNDATION. AI Powered Gaming &amp; Futures Strategy Systems.<br><br>' +
          'LEGAL NOTICE: This platform involves high-risk automated casino betting and futures trading strategies. Results are not guaranteed. Users participate voluntarily and must understand all risks before depositing funds.</div>' +
      '</div>';
    return f;
  }
  function ensureFooter() {
    /* hide every footer the compiled app renders (marketing + dashboard) */
    var appFooters = document.querySelectorAll("footer:not(#lr-pc-footer)");
    for (var i = 0; i < appFooters.length; i++) {
      if (appFooters[i].style.display !== "none") appFooters[i].style.display = "none";
    }
    if (!document.getElementById("lr-pc-footer")) {
      document.body.appendChild(buildFooter());
    }
  }

  /* =====================================================================
     DOCUMENTATION > RESOURCES — replaces the static "Whitepaper" section.
     The compiled app's Whitepaper card ("LONGRISE Master Plan V8.9",
     forced-download link) is hidden; in its place a live resources list
     backed by jake-agent (/resources API) is rendered, plus a public
     upload form (product decision: anyone may upload sales materials —
     대표님 확인 완료). Bundle untouched — overlay is appended inside the
     existing r==="whitepaper" content wrapper.
     ─ DEV (개발 AI) NOTE ────────────────────────────────────────────────
       JAKE_API_BASE is localhost for local preview. Swap to the real
       jake-agent domain once LRPF is deployed off GitHub Pages.
     ===================================================================== */
  var JAKE_API_BASE = "http://localhost:8000";
  var resourcesLoaded = false;
  var resourcesLoading = false;

  function findWhitepaperHeading() {
    /* matches "Resources" too — once relabelHeading() renames the h2 on
       the first pass, later reconciles would otherwise fail to find it
       (still says "Whitepaper"? no — already "Resources"), read the
       section as "left", and rip out the panel we just built. */
    var hs = document.querySelectorAll("h2");
    for (var i = 0; i < hs.length; i++) {
      var t = (hs[i].textContent || "").trim();
      if (t === "Whitepaper" || t === "Resources") return hs[i];
    }
    return null;
  }
  function relabelHeading(h2) {
    var walker = document.createTreeWalker(h2, NodeFilter.SHOW_TEXT, null);
    var node, target = null;
    while ((node = walker.nextNode())) { if (node.nodeValue && node.nodeValue.trim()) target = node; }
    if (target && target.nodeValue.trim() !== "Resources") target.nodeValue = "Resources";
  }
  /* the left "Sections" sidebar still lists this item as "Whitepaper" —
     relabel it too. Scoped to the Sections list only (not a blanket
     TEXT_SWAP) so it can't fire before findWhitepaperHeading() runs and
     break section detection. */
  function relabelSectionsSidebar() {
    var h3s = document.querySelectorAll("h3");
    for (var i = 0; i < h3s.length; i++) {
      if ((h3s[i].textContent || "").trim() !== "Sections") continue;
      var spans = h3s[i].parentNode.querySelectorAll("span");
      for (var j = 0; j < spans.length; j++) {
        if (spans[j].children.length === 0 && (spans[j].textContent || "").trim() === "Whitepaper") {
          spans[j].textContent = "Resources";
        }
      }
      return;
    }
  }
  function fmtBytes(n) {
    if (!n && n !== 0) return "";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }
  function escapeHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function resourceCardHTML(r) {
    var dl = JAKE_API_BASE + "/resources/" + r.id + "/download";
    var d = new Date(r.uploaded_at);
    var dateStr = isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    return '<div class="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between hover:border-luxury-gold/30 transition-all">' +
      '<div class="space-y-1">' +
        '<h3 class="text-lg font-black text-white">' + escapeHTML(r.title) + '</h3>' +
        '<p class="text-xs text-gray-500">' + escapeHTML(r.original_filename) + (r.size_bytes ? ' · ' + fmtBytes(r.size_bytes) : '') + (dateStr ? ' · ' + dateStr : '') + '</p>' +
      '</div>' +
      '<div class="flex gap-3 shrink-0">' +
        '<a href="' + dl + '" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all">Open</a>' +
        '<a href="' + dl + '" download class="inline-flex items-center justify-center gap-2 rounded-xl bg-luxury-gold px-5 py-3 text-xs font-black uppercase tracking-widest text-black hover:scale-105 transition-all">Download</a>' +
      '</div>' +
    '</div>';
  }
  /* View-only for members: uploading is an admin action (done from the
     jake-agent dashboard's "LRPF 자료 관리" panel), not something a
     logged-in user can trigger from the public site. */
  function buildResourcesPanel() {
    var wrap = document.createElement("div");
    wrap.id = "lr-resources";
    wrap.className = "space-y-4";
    wrap.innerHTML = '<div id="lr-res-list" class="space-y-4"><p class="text-gray-500 text-sm">Loading resources…</p></div>';
    return wrap;
  }
  function loadResources(wrap, force) {
    if (resourcesLoading) return;
    if (resourcesLoaded && !force) return;
    resourcesLoading = true;
    var list = wrap.querySelector("#lr-res-list");
    fetch(JAKE_API_BASE + "/resources")
      .then(function (res) { if (!res.ok) throw new Error("fetch failed"); return res.json(); })
      .then(function (data) {
        var items = (data && data.resources) || [];
        list.innerHTML = items.length
          ? items.map(resourceCardHTML).join("")
          : '<p class="text-gray-500 text-sm">No resources available yet.</p>';
        resourcesLoaded = true;
        resourcesLoading = false;
      })
      .catch(function () {
        list.innerHTML = '<p class="text-red-400 text-sm">Unable to load resources right now. Please try again later.</p>';
        resourcesLoading = false;
      });
  }
  function ensureResourcesPanel() {
    var h2 = findWhitepaperHeading();
    var existing = document.getElementById("lr-resources");
    if (!h2) {
      /* left the Resources section — drop state so it reloads fresh next visit */
      if (existing) { existing.remove(); resourcesLoaded = false; }
      return;
    }
    relabelHeading(h2);
    var wrapper = h2.parentNode; /* the r==="whitepaper" space-y-8 container */

    /* hide the original document card (Master Plan V8.9 / download+open) */
    Array.prototype.forEach.call(wrapper.children, function (c) {
      if (c !== h2 && c.id !== "lr-resources" && c.style.display !== "none") c.style.display = "none";
    });

    if (!existing) {
      existing = buildResourcesPanel();
      wrapper.appendChild(existing);
    }
    loadResources(existing, false);
  }

  /* ---------- reconcile loop ---------- */
  var schedT = null;
  function reconcile() {
    schedT = null;
    if (applying) return;
    applying = true;
    try {
      relabelNav();
      ensureNewsNav();
      swapCopy();
      hidePlatformSettings();
      hideMarketSafety();
      hideExecutionNotice();
      ensureWealthHistoryTabs();
      hideStepImageUploads();
      ensureReferralGuideLink();
      hideHonorRankingsEmpty();
      hideConciergeSubtitle();
      hideDragonFloat();
      hideIntroXLines();
      ensureIntroAurora();
      ensureFooter();
      relabelSectionsSidebar();
      ensureResourcesPanel();
      if (isEarnActive()) showEarn(); else hideEarn();
    } catch (e) { console.error("[earn-pc] reconcile error:", e); }
    finally { applying = false; }
  }
  function schedule() {
    if (schedT) return;
    schedT = setTimeout(reconcile, 60);
  }

  function boot() {
    if (!document.querySelector("nav") || !getMain()) { setTimeout(boot, 120); return; }
    var obs = new MutationObserver(function () { if (!applying) schedule(); });
    obs.observe(document.getElementById("root") || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    /* nav clicks → immediate reconcile; clicking a native top tab clears news state.
       Captured BEFORE the bundle's own onClick runs, so we can flip
       showEarn()/hideEarn() synchronously here — without this, the ~60ms
       reconcile debounce leaves a visible window right after the click
       where the native page (e.g. "Liquidity Engagement Portfolio") is
       rendered but not yet hidden. */
    document.addEventListener("click", function (e) {
      var t = e.target;
      var mb = t && t.closest ? t.closest("nav button") : null;
      if (mb && mb.id !== NEWS_NAV_ID && /tracking-widest/.test(mb.className || "")) {
        navState = null;
        var menu = topMenuButtons();
        var idx = menu.indexOf(mb);
        if (idx === 0) showEarn(); else if (idx > 0) hideEarn();
      }
      setTimeout(schedule, 0);
    }, true);
    schedule();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
