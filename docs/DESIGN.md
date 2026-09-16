<!DOCTYPE html><html class="dark" lang="en" style=""><head></head><body class="bg-surface text-on-surface font-body-md selection:bg-primary/30"><svg class="inline-defs-container" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"></svg>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #051424;
        }
        ::-webkit-scrollbar-thumb {
            background: #273647;
            border-radius: 10px;
        }
        .glass-panel {
            background: rgba(13, 28, 45, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .chart-glow {
            filter: drop-shadow(0 0 8px rgba(173, 198, 255, 0.3));
        }
    </style>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "primary-fixed": "#d8e2ff",
                    "surface-variant": "#273647",
                    "surface": "#051424",
                    "background": "#051424",
                    "on-error": "#690005",
                    "on-background": "#d4e4fa",
                    "on-tertiary-fixed-variant": "#723600",
                    "tertiary": "#ffb786",
                    "surface-bright": "#2c3a4c",
                    "on-secondary-fixed": "#111c2d",
                    "secondary-container": "#3e495d",
                    "on-tertiary-container": "#461f00",
                    "on-surface": "#d4e4fa",
                    "inverse-primary": "#005ac2",
                    "on-primary-fixed-variant": "#004395",
                    "secondary-fixed-dim": "#bcc7de",
                    "tertiary-container": "#df7412",
                    "surface-container-low": "#0d1c2d",
                    "primary-fixed-dim": "#adc6ff",
                    "on-primary-container": "#00285d",
                    "on-tertiary-fixed": "#311400",
                    "tertiary-fixed-dim": "#ffb786",
                    "secondary-fixed": "#d8e3fb",
                    "on-error-container": "#ffdad6",
                    "surface-container-highest": "#273647",
                    "surface-dim": "#051424",
                    "on-secondary-container": "#aeb9d0",
                    "primary": "#adc6ff",
                    "surface-container": "#122131",
                    "inverse-surface": "#d4e4fa",
                    "on-secondary-fixed-variant": "#3c475a",
                    "error": "#ffb4ab",
                    "error-container": "#93000a",
                    "outline": "#8c909f",
                    "surface-container-lowest": "#010f1f",
                    "on-primary-fixed": "#001a42",
                    "on-tertiary": "#502400",
                    "surface-container-high": "#1c2b3c",
                    "outline-variant": "#424754",
                    "on-primary": "#002e6a",
                    "inverse-on-surface": "#233143",
                    "on-secondary": "#263143",
                    "on-surface-variant": "#c2c6d6",
                    "tertiary-fixed": "#ffdcc6",
                    "primary-container": "#4d8eff",
                    "secondary": "#bcc7de",
                    "surface-tint": "#adc6ff"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "unit": "4px",
                    "gutter": "16px",
                    "xl": "32px",
                    "xs": "4px",
                    "lg": "24px",
                    "md": "16px",
                    "sm": "8px",
                    "margin": "24px"
            },
            "fontFamily": {
                    "body-lg": ["Inter"],
                    "headline-md": ["Inter"],
                    "display-lg": ["Inter"],
                    "headline-sm": ["Inter"],
                    "body-md": ["Inter"],
                    "label-sm": ["Inter"],
                    "data-mono": ["Inter"]
            },
            "fontSize": {
                    "body-lg": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "display-lg": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "headline-sm": ["18px", {"lineHeight": "1.4", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                    "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "data-mono": ["14px", {"lineHeight": "1.4", "fontWeight": "500"}]
            }
          },
        },
      }
    </script>


<!-- SideNavBar Shell -->
<aside class="flex flex-col w-64 h-full py-md fixed left-0 top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl border-r border-outline-variant/20 hidden md:flex">
<div class="px-lg mb-xl">
<span class="text-headline-sm font-headline-sm font-bold text-primary">QUANTUM</span>
<p class="text-on-surface-variant text-label-sm">Terminal v2.4</p>
</div>
<nav class="flex-1 space-y-xs">
<div class="text-on-surface-variant font-medium py-sm px-md flex items-center gap-sm hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer active:scale-95 transition-transform">
<span class="material-symbols-outlined">dashboard</span>
<span class="text-label-sm font-label-sm">Market Dashboard</span>
</div>

<div class="text-on-surface-variant font-medium py-sm px-md flex items-center gap-sm hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer active:scale-95 transition-transform">
<span class="material-symbols-outlined">star</span>
<span class="text-label-sm font-label-sm">Watchlist</span>
</div>
<div class="text-primary font-bold bg-primary/10 border-r-2 border-primary py-sm px-md flex items-center gap-sm cursor-pointer active:scale-95 transition-transform">
<span class="material-symbols-outlined">account_balance_wallet</span>
<span class="text-label-sm font-label-sm">Portfolio</span>
</div>
</nav>
<div class="px-md mt-auto space-y-xs">
<button class="w-full bg-primary text-on-primary py-sm rounded font-bold hover:brightness-110 transition-all mb-md">Quick Trade</button>
<div class="text-on-surface-variant font-medium py-sm px-md flex items-center gap-sm hover:bg-surface-container-high transition-colors cursor-pointer">
<span class="material-symbols-outlined">settings</span>
<span class="text-label-sm font-label-sm">Settings</span>
</div>
<div class="text-on-surface-variant font-medium py-sm px-md flex items-center gap-sm hover:bg-surface-container-high transition-colors cursor-pointer">
<span class="material-symbols-outlined">help_outline</span>
<span class="text-label-sm font-label-sm">Support</span>
</div>
</div>
</aside>
<!-- Main Content Area -->
<main class="md:ml-64 min-h-screen">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
<div class="flex items-center gap-md">
<span class="text-headline-md font-headline-md text-primary tracking-tight">QUANTUM TRADE</span>
<div class="hidden md:flex items-center gap-sm bg-surface-container rounded px-sm py-xs border border-outline-variant/20">
<span class="material-symbols-outlined text-on-surface-variant">search</span>
<input class="bg-transparent border-none focus:ring-0 text-body-md w-64 text-on-surface" placeholder="Search markets..." type="text">
</div>
</div>
<div class="flex items-center gap-lg">
<div class="flex items-center gap-xs">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
</span>
<span class="text-label-sm text-on-surface-variant uppercase tracking-widest">Market Open</span>
</div>
<div class="flex items-center gap-md text-on-surface-variant"><button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container hover:text-primary transition-colors cursor-pointer" title="Toggle Theme"><span class="material-symbols-outlined text-sm">dark_mode</span></button>
<span class="material-symbols-outlined hover:text-primary transition-colors cursor-pointer">notifications</span>
<span class="material-symbols-outlined hover:text-primary transition-colors cursor-pointer">history_edu</span>
<span class="material-symbols-outlined hover:text-primary transition-colors cursor-pointer">account_circle</span>
</div>
</div>
</header>
<div class="p-lg space-y-lg max-w-7xl mx-auto">
<!-- Summary Bento Grid -->
<section class="grid grid-cols-1 md:grid-cols-12 gap-gutter">
<!-- Total Equity -->
<div class="md:col-span-4 glass-panel p-md flex flex-col justify-between">
<div>
<p class="text-label-sm text-on-surface-variant flex items-center gap-xs">
                            TOTAL EQUITY VALUE <span class="material-symbols-outlined text-sm">info</span>
</p>
<h1 class="text-display-lg font-display-lg mt-sm">$1,284,502.42</h1>
</div>
<div class="mt-lg flex items-end justify-between">
<div>
<p class="text-label-sm text-on-surface-variant">DAILY P/L</p>
<p class="text-headline-sm font-headline-sm text-emerald-400">+$12,402.18 (0.97%)</p>
</div>
<div class="h-12 w-24">
<!-- Mini sparkline SVG -->
<svg class="w-full h-full stroke-emerald-500 fill-none stroke-2" viewBox="0 0 100 40">
<path d="M0,35 Q20,30 40,32 T80,10 T100,5"></path>
</svg>
</div>
</div>
</div>
<!-- Performance Chart -->
<div class="md:col-span-8 glass-panel p-md overflow-hidden">
<div class="flex justify-between items-center mb-md">
<p class="text-label-sm text-on-surface-variant">PERFORMANCE HISTORY</p>
<div class="flex gap-sm">
<button class="text-label-sm bg-surface-container-high px-sm py-1 rounded">1D</button>
<button class="text-label-sm text-on-surface-variant hover:bg-surface-container px-sm py-1 rounded">1W</button>
<button class="text-label-sm bg-primary/20 text-primary px-sm py-1 rounded">1M</button>
<button class="text-label-sm text-on-surface-variant hover:bg-surface-container px-sm py-1 rounded">1Y</button>
</div>
</div>
<div class="h-48 w-full relative">
<svg class="w-full h-full preserve-3d" viewBox="0 0 1000 200">
<!-- Grid lines -->
<line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="40" y2="40"></line>
<line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="80" y2="80"></line>
<line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="120" y2="120"></line>
<line stroke="rgba(255,255,255,0.05)" x1="0" x2="1000" y1="160" y2="160"></line>
<!-- Line chart path -->
<path class="stroke-primary stroke-2 fill-none chart-glow" d="M0,180 L100,165 L200,175 L300,140 L400,130 L500,110 L600,115 L700,80 L800,60 L900,65 L1000,40"></path>
<!-- Gradient Area -->
<linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="rgba(173, 198, 255, 0.2)"></stop>
<stop offset="100%" stop-color="transparent"></stop>
</linearGradient>
<path d="M0,180 L100,165 L200,175 L300,140 L400,130 L500,110 L600,115 L700,80 L800,60 L900,65 L1000,40 V200 H0 Z" fill="url(#chart-grad)"></path>
</svg>
</div>
</div>
</section>
<!-- Secondary Bento Row -->
<section class="grid grid-cols-1 md:grid-cols-12 gap-gutter">
<!-- Asset Allocation Pie -->
<div class="md:col-span-4 glass-panel p-md">
<p class="text-label-sm text-on-surface-variant mb-lg">ASSET ALLOCATION</p>
<div class="flex items-center justify-center relative mb-lg">
<!-- Simplified Donut Chart SVG -->
<svg class="w-48 h-48 -rotate-90">
<circle cx="96" cy="96" fill="transparent" r="70" stroke="#3e495d" stroke-width="20"></circle>
<circle class="chart-glow" cx="96" cy="96" fill="transparent" r="70" stroke="#adc6ff" stroke-dasharray="320 440" stroke-width="22"></circle>
<circle cx="96" cy="96" fill="transparent" r="70" stroke="#df7412" stroke-dasharray="100 440" stroke-dashoffset="-320" stroke-width="22"></circle>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-headline-md font-headline-md">72%</span>
<span class="text-label-sm text-on-surface-variant">Stocks</span>
</div>
</div>
<div class="space-y-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-sm">
<div class="w-3 h-3 rounded-full bg-primary"></div>
<span class="text-body-md">Equities</span>
</div>
<span class="font-data-mono">$924,841.00</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-sm">
<div class="w-3 h-3 rounded-full bg-tertiary-container"></div>
<span class="text-body-md">Crypto</span>
</div>
<span class="font-data-mono">$282,590.54</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-sm">
<div class="w-3 h-3 rounded-full bg-secondary-container"></div>
<span class="text-body-md">Cash Reserves</span>
</div>
<span class="font-data-mono">$77,070.88</span>
</div>
</div>
</div>
<!-- Detailed Holdings Table -->
<div class="md:col-span-8 glass-panel overflow-hidden flex flex-col">
<div class="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50"><div class="flex flex-col gap-sm w-full md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-md"><p class="text-label-sm text-on-surface-variant uppercase font-semibold">CURRENT HOLDINGS</p><div class="flex gap-xs bg-surface-container-lowest/50 p-1 rounded"><button class="text-xs px-sm py-1 rounded bg-primary/20 text-primary font-medium">All Markets</button><button class="text-xs px-sm py-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">US Equities</button><button class="text-xs px-sm py-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">HK Equities</button><button class="text-xs px-sm py-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">Crypto</button><button class="text-xs px-sm py-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-medium">Forex</button></div></div><div class="flex items-center gap-md"><span class="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-primary">tune</span><span class="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-primary">file_download</span></div></div></div>
<div class="overflow-x-auto flex-1">
<table class="w-full text-left border-collapse"><thead class="sticky top-0 bg-surface-container-low text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/20"><tr><th class="px-md py-sm font-semibold">Asset &amp; Market</th><th class="px-md py-sm font-semibold">Avg Cost</th><th class="px-md py-sm font-semibold">Price</th><th class="px-md py-sm font-semibold">Day P/L</th><th class="px-md py-sm font-semibold">Total P/L</th><th class="px-md py-sm font-semibold text-right">Market Value</th><th class="px-md py-sm font-semibold text-center">Actions</th></tr></thead><tbody class="divide-y divide-outline-variant/10"><tr class="hover:bg-primary/5 transition-colors group"><td class="px-md py-md"><div class="flex items-center gap-md"><div class="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center"><img class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" data-alt="Official logo for NVIDIA corporation in a minimalist dark theme context with high contrast white accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA8pbR-QZqHFtymnqJ7-z58cY8eo4hu3xZ9tqYo3p1cjS1VjRvY-OJaVo_B9SWP5-T17akOUb8-m7vRvHkPw3LxfEVG9R7ST2jLX-Wz6Vs7ZZrpMNU_YBk9HK9HArUM9dVgEQ3Fvkma39h9dDiv1DTNabUVFPRagP6LluXKrr8N3F1B8Z87XvNfSw152jOAkyjCg-_dPsNpUscRZpIGNaN2huLdIv7ej_4UJU95_Mr5tPNl-BxTncpeBityUmHAC3j49dMqKqEngg"></div><div><div class="flex items-center gap-xs"><p class="font-bold">NVDA</p><span class="text-[10px] px-1 rounded bg-primary/20 text-primary uppercase font-bold">US</span></div><p class="text-xs text-on-surface-variant">NVIDIA Corp</p></div></div></td><td class="px-md py-md font-data-mono text-on-surface-variant">$482.10</td><td class="px-md py-md font-data-mono">$902.50</td><td class="px-md py-md"><div class="flex items-center text-emerald-400 text-xs"><span class="material-symbols-outlined text-sm">arrow_drop_up</span>+3.4%</div></td><td class="px-md py-md"><div class="flex items-center text-emerald-400 text-xs font-semibold"><span class="material-symbols-outlined text-sm">arrow_drop_up</span>+87.2%</div></td><td class="px-md py-md text-right font-data-mono">$312,850.00</td><td class="px-md py-md"><div class="flex items-center justify-center gap-xs"><button class="px-xs py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Buy</button><button class="px-xs py-1 rounded text-xs bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium">Sell</button></div></td></tr><tr class="hover:bg-primary/5 transition-colors group"><td class="px-md py-md"><div class="flex items-center gap-md"><div class="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center"><img class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" data-alt="Official Bitcoin logo displayed in a sleek professional trading interface style with dark navy background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSgO5-GFXrWnJHPBa5TzWJRV3pbHjaQ5HHo9pRg2XPENIlwjZ4zKkP71bILHgIOzIH6_2tI9ze96GAmKfr_lnL3-ibA9Y6jQfbB4z_rkU2yRiu67euVHmhGLTtS6p-p3jDF2Dh5lMCCIl0elBZ4s2CS-W8CXQM4JOeVwECArW0Dfa-x-zGNTuUxFR3A9tPWW9nae64o4qjLUBgVL6nHo4w6HVabAt1EMjg5i7nNjVKvj0LGSw5XxlQR5nZe-UG3paOK1EpOMcu9sk"></div><div><div class="flex items-center gap-xs"><p class="font-bold">BTC</p><span class="text-[10px] px-1 rounded bg-tertiary-container/30 text-tertiary uppercase font-bold">Crypto</span></div><p class="text-xs text-on-surface-variant">Bitcoin</p></div></div></td><td class="px-md py-md font-data-mono text-on-surface-variant">$42,500.00</td><td class="px-md py-md font-data-mono">$68,240.12</td><td class="px-md py-md"><div class="flex items-center text-emerald-400 text-xs"><span class="material-symbols-outlined text-sm">arrow_drop_up</span>+1.8%</div></td><td class="px-md py-md"><div class="flex items-center text-emerald-400 text-xs font-semibold"><span class="material-symbols-outlined text-sm">arrow_drop_up</span>+60.5%</div></td><td class="px-md py-md text-right font-data-mono">$242,590.54</td><td class="px-md py-md"><div class="flex items-center justify-center gap-xs"><button class="px-xs py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Buy</button><button class="px-xs py-1 rounded text-xs bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium">Sell</button></div></td></tr><tr class="hover:bg-primary/5 transition-colors group"><td class="px-md py-md"><div class="flex items-center gap-md"><div class="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center"><span class="material-symbols-outlined text-primary text-sm">trending_up</span></div><div><div class="flex items-center gap-xs"><p class="font-bold">0700.HK</p><span class="text-[10px] px-1 rounded bg-secondary-container/40 text-on-secondary-container uppercase font-bold">HK</span></div><p class="text-xs text-on-surface-variant">Tencent Holdings</p></div></div></td><td class="px-md py-md font-data-mono text-on-surface-variant">HK$294.00</td><td class="px-md py-md font-data-mono">HK$312.40</td><td class="px-md py-md"><div class="flex items-center text-emerald-400 text-xs"><span class="material-symbols-outlined text-sm">arrow_drop_up</span>+2.1%</div></td><td class="px-md py-md"><div class="flex items-center text-emerald-400 text-xs font-semibold"><span class="material-symbols-outlined text-sm">arrow_drop_up</span>+6.2%</div></td><td class="px-md py-md text-right font-data-mono">$198,320.00</td><td class="px-md py-md"><div class="flex items-center justify-center gap-xs"><button class="px-xs py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Buy</button><button class="px-xs py-1 rounded text-xs bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium">Sell</button></div></td></tr><tr class="hover:bg-primary/5 transition-colors group"><td class="px-md py-md"><div class="flex items-center gap-md"><div class="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center"><img class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" data-alt="The Apple Inc. logo rendered in a minimalist flat style for a premium professional investment portfolio dashboard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2hsYonZNtFE6iRTi7Mfa9q5P0suI-PsQo6n4ozxMpRkwtNW63C93A-x8J_li3LxWxOUmqVoZe-8DwYXCfAMcCUmaJc2wd2QpplV_4ONDp8UbBKqUY_inM2OT4QxoCsqon9WVwOUIbmYeXwHIIDvfIZNgiUz8Ic_fb0m9DsBfLzfcYEkxPADS0jHDMdSJVne-OFo8CxUzuVdQ-zJYqo34tYrMwO5JuFRWDwqno8ARxKS3mHQs1Qi7HXN5JNrr6V2bRgdEi-Ai1MCs"></div><div><div class="flex items-center gap-xs"><p class="font-bold">AAPL</p><span class="text-[10px] px-1 rounded bg-primary/20 text-primary uppercase font-bold">US</span></div><p class="text-xs text-on-surface-variant">Apple Inc</p></div></div></td><td class="px-md py-md font-data-mono text-on-surface-variant">$185.20</td><td class="px-md py-md font-data-mono">$172.14</td><td class="px-md py-md"><div class="flex items-center text-error text-xs"><span class="material-symbols-outlined text-sm">arrow_drop_down</span>-0.8%</div></td><td class="px-md py-md"><div class="flex items-center text-error text-xs font-semibold"><span class="material-symbols-outlined text-sm">arrow_drop_down</span>-7.1%</div></td><td class="px-md py-md text-right font-data-mono">$145,210.00</td><td class="px-md py-md"><div class="flex items-center justify-center gap-xs"><button class="px-xs py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Buy</button><button class="px-xs py-1 rounded text-xs bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium">Sell</button></div></td></tr><tr class="hover:bg-primary/5 transition-colors group"><td class="px-md py-md"><div class="flex items-center gap-md"><div class="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center"><img class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" data-alt="Tesla corporate logo against a dark industrial aesthetic for a high-performance market tracking application." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV3GPeruu7NV2YBqTMHLbFO4U75Rk2vlydhqio_8iPlT0eDZAsO-GX3Jnier0689nYXwnJpY-BBJE_SXhiEBMG4sKIpBl5rqz9TDJ8hEPab42yZaccnzoLnB-TP9G7T7ZDP3EhV5MxE9bx9NQNYMkYKt8n0ISWDuG6STiYS-eSaSCRMrkfna5-DXhxXHvtQGUKiSG82hSZVGiVbKH97w63sGmIjVDx9u11bcZXhGkMajng-ufQFdwJzjCHOukBCRl3j31l-Rg1QSc"></div><div><div class="flex items-center gap-xs"><p class="font-bold">TSLA</p><span class="text-[10px] px-1 rounded bg-primary/20 text-primary uppercase font-bold">US</span></div><p class="text-xs text-on-surface-variant">Tesla Motors</p></div></div></td><td class="px-md py-md font-data-mono text-on-surface-variant">$198.45</td><td class="px-md py-md font-data-mono">$178.20</td><td class="px-md py-md"><div class="flex items-center text-error text-xs"><span class="material-symbols-outlined text-sm">arrow_drop_down</span>-1.4%</div></td><td class="px-md py-md"><div class="flex items-center text-error text-xs font-semibold"><span class="material-symbols-outlined text-sm">arrow_drop_down</span>-10.2%</div></td><td class="px-md py-md text-right font-data-mono">$88,400.00</td><td class="px-md py-md"><div class="flex items-center justify-center gap-xs"><button class="px-xs py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Buy</button><button class="px-xs py-1 rounded text-xs bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium">Sell</button></div></td></tr></tbody></table>
</div>
<div class="p-sm bg-surface-container-lowest/50 text-center">
<button class="text-label-sm text-primary hover:underline">View All 24 Positions</button>
</div>
</div>
</section>
<!-- Bottom Action Cards -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div class="glass-panel p-md flex items-center gap-md hover:border-primary/50 transition-all cursor-pointer">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">add_card</span>
</div>
<div>
<p class="font-bold">Deposit Funds</p>
<p class="text-xs text-on-surface-variant">Instant transfer via wire or card</p>
</div>
</div>
<div class="glass-panel p-md flex items-center gap-md hover:border-primary/50 transition-all cursor-pointer">
<div class="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined">insights</span>
</div>
<div>
<p class="font-bold">Portfolio Rebalance</p>
<p class="text-xs text-on-surface-variant">Optimize your current allocations</p>
</div>
</div>
<div class="glass-panel p-md flex items-center gap-md hover:border-primary/50 transition-all cursor-pointer">
<div class="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-on-secondary-container">
<span class="material-symbols-outlined">description</span>
</div>
<div>
<p class="font-bold">Tax Reports</p>
<p class="text-xs text-on-surface-variant">Generate FY 2023-24 statements</p>
</div>
</div>
</section>
</div>
</main>
<!-- Mobile Navigation Shell -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low/95 backdrop-blur-md border-t border-outline-variant/20 flex justify-around py-sm z-50">
<div class="flex flex-col items-center gap-xs text-on-surface-variant">
<span class="material-symbols-outlined">dashboard</span>
<span class="text-[10px] font-medium uppercase">Market</span>
</div>

<div class="flex flex-col items-center gap-xs text-primary">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
<span class="text-[10px] font-bold uppercase">Portfolio</span>
</div>
<div class="flex flex-col items-center gap-xs text-on-surface-variant">
<span class="material-symbols-outlined">settings</span>
<span class="text-[10px] font-medium uppercase">Settings</span>
</div>
</nav>


</body></html>