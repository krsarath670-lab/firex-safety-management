const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/USER/.gemini/antigravity/brain/defede34-5da7-4cdd-b2e1-673bd45e8b88';
const logoPath = path.join(artifactDir, 'firex_logo.png');
const letterheadPath = path.join(artifactDir, 'firex_letterhead.png');

const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString('base64') : '';
const letterheadBase64 = fs.existsSync(letterheadPath) ? fs.readFileSync(letterheadPath).toString('base64') : '';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FireX Fire & Safety Management — Interactive System Demo Video</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.02); }
    }
    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .cursor-pointer-sim {
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
      z-index: 9999;
    }
    .custom-scrollbar::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 select-none">

  <!-- Top Header Navigation -->
  <header class="w-full max-w-5xl flex items-center justify-between pb-4 border-b border-slate-800">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 p-0.5 shadow-lg shadow-red-900/30">
        <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
          <img src="data:image/png;base64,${logoBase64}" alt="FireX Logo" class="h-7 w-auto object-contain" />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            <span>FIREX</span>
            <span class="text-xs px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-md font-mono font-bold">DEMO VIDEO</span>
          </h1>
          <span class="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
        <p class="text-xs text-slate-400">Fire & Safety Service Management Application Walkthrough</p>
      </div>
    </div>

    <!-- Live Status & URL Badge -->
    <div class="flex items-center gap-2">
      <a href="https://firex-safety-management.onrender.com" target="_blank" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="hidden sm:inline">Open Live App:</span>
        <span class="font-mono text-red-400">onrender.com</span>
        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </a>
    </div>
  </header>

  <!-- Video Player Master Container -->
  <main class="w-full max-w-5xl my-4 flex flex-col items-center">
    
    <!-- Player Wrapper with 16:9 Aspect Ratio Frame -->
    <div class="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black relative flex flex-col group">

      <!-- Screen Mode Switcher Pills (Top Floating Bar) -->
      <div class="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/60 text-xs">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Device:</span>
        <button id="btn-device-laptop" class="px-2 py-0.5 rounded-lg font-bold bg-red-600 text-white transition-all text-[11px]">Laptop</button>
        <button id="btn-device-mobile" class="px-2 py-0.5 rounded-lg font-bold text-slate-300 hover:text-white transition-all text-[11px]">Mobile</button>
      </div>

      <!-- Chapter Badge (Top Right Floating) -->
      <div class="absolute top-4 right-4 z-40 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span id="current-chapter-title" class="text-xs font-bold text-amber-300 tracking-wide">Scene 1: Introduction</span>
      </div>

      <!-- MAIN VIDEO STAGE (Canvas / Screen Simulation Area) -->
      <div id="video-stage" class="w-full bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center p-2 sm:p-6">
        
        <!-- Animated Simulated Virtual Mouse Cursor -->
        <div id="virtual-cursor" class="cursor-pointer-sim absolute top-1/2 left-1/2 w-6 h-6 flex items-start justify-start z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-0">
          <svg class="w-6 h-6 text-red-500 filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.485z"/>
          </svg>
          <div id="cursor-click-ring" class="absolute -top-1 -left-1 w-8 h-8 rounded-full border-2 border-red-400 scale-0 opacity-0 transition-transform duration-300"></div>
        </div>

        <!-- SIMULATED DEVICE BEZEL (Laptop Frame by default) -->
        <div id="device-bezel" class="w-full h-full max-w-[1000px] max-h-[580px] bg-slate-900 rounded-2xl border-4 border-slate-700 shadow-2xl flex flex-col overflow-hidden transition-all duration-500 relative">
          
          <!-- Device Top Bar (MacBook / Browser Style) -->
          <div id="device-header" class="h-8 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between px-3 shrink-0">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div class="flex items-center gap-1.5 bg-slate-900/90 px-4 py-1 rounded-md text-[11px] font-mono text-slate-300 border border-slate-700/80 max-w-[400px] w-full justify-center">
              <svg class="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              <span>https://firex-safety-management.onrender.com</span>
            </div>
            <div class="flex items-center gap-2 text-slate-400 text-xs">
              <span id="scene-device-time" class="font-mono text-[10px]">10:45 AM</span>
            </div>
          </div>

          <!-- SCREEN CONTENT AREA (Dynamically Rendered Scenes) -->
          <div id="screen-canvas" class="flex-1 bg-slate-100 text-slate-900 overflow-y-auto custom-scrollbar relative flex flex-col justify-start">
            <!-- Scene markup injected dynamically via JS based on current timestamp -->
          </div>

        </div>

      </div>

      <!-- Closed Captions (Subtitles Overlay Bar) -->
      <div id="subtitles-container" class="bg-slate-950/95 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 w-full">
          <div class="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/></svg>
          </div>
          <p id="subtitles-text" class="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed truncate">
            Welcome to FireX Fire &amp; Safety Service Management. Initializing interactive walkthrough...
          </p>
        </div>
        <button id="btn-toggle-voice" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors" title="Toggle audio voiceover narration">
          <svg id="voice-icon-on" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          <span id="voice-status-text">Voiceover ON</span>
        </button>
      </div>

      <!-- VIDEO CONTROLS & TIMELINE BAR -->
      <div class="bg-slate-900 border-t border-slate-800/80 px-4 sm:px-6 py-3 flex flex-col gap-2">
        
        <!-- Interactive Progress Bar & Scrubber -->
        <div class="relative w-full h-3 flex items-center cursor-pointer group/scrub" id="timeline-container">
          <!-- Background track -->
          <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div id="timeline-buffered" class="absolute top-0 left-0 h-full bg-slate-700 w-full opacity-40"></div>
            <div id="timeline-progress" class="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-amber-500 w-0 transition-all duration-75"></div>
          </div>
          <!-- Scrubber thumb -->
          <div id="timeline-thumb" class="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-full shadow-md scale-0 group-hover/scrub:scale-100 transition-transform -ml-1.5"></div>
          
          <!-- Chapter markers along track -->
          <div class="absolute inset-x-0 h-full flex justify-between pointer-events-none px-0.5">
            <div class="w-1 h-2 bg-slate-900/90 rounded-sm" style="left: 0%"></div>
            <div class="w-1 h-2 bg-slate-900/90 rounded-sm" style="left: 14%"></div>
            <div class="w-1 h-2 bg-slate-900/90 rounded-sm" style="left: 31%"></div>
            <div class="w-1 h-2 bg-slate-900/90 rounded-sm" style="left: 50%"></div>
            <div class="w-1 h-2 bg-slate-900/90 rounded-sm" style="left: 71%"></div>
            <div class="w-1 h-2 bg-slate-900/90 rounded-sm" style="left: 88%"></div>
          </div>
        </div>

        <!-- Buttons Row: Play, Jump, Speed, Fullscreen, Recording -->
        <div class="flex items-center justify-between gap-3 text-xs">
          
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Play / Pause Button -->
            <button id="btn-play-pause" class="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center font-bold shadow-md shadow-red-900/40 transition-all">
              <svg id="play-icon" class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="pause-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>

            <!-- Skip Prev / Next Scene -->
            <button id="btn-prev-scene" class="p-1.5 text-slate-400 hover:text-white transition-colors" title="Previous scene">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button id="btn-next-scene" class="p-1.5 text-slate-400 hover:text-white transition-colors" title="Next scene">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>

            <!-- Time Counter -->
            <span class="font-mono text-slate-300 font-bold ml-1">
              <span id="time-current">0:00</span> / <span id="time-total">2:25</span>
            </span>
          </div>

          <!-- Right Controls: Speed, Auto-Narrate, Download -->
          <div class="flex items-center gap-2">
            <!-- Speed Selector -->
            <div class="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl overflow-hidden px-1">
              <button class="btn-speed px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white" data-speed="0.75">0.75x</button>
              <button class="btn-speed px-2 py-1 text-[11px] font-bold text-white bg-slate-700 rounded-lg" data-speed="1">1x</button>
              <button class="btn-speed px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white" data-speed="1.25">1.25x</button>
              <button class="btn-speed px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white" data-speed="1.5">1.5x</button>
            </div>

            <!-- Download Demo Script / Presentation -->
            <button id="btn-restart" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-bold flex items-center gap-1.5 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Replay</span>
            </button>
          </div>

        </div>

      </div>

    </div>

    <!-- Chapter Quick-Select Navigation Strip -->
    <div class="w-full mt-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center gap-2 justify-center">
      <span class="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
        <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
        <span>Jump to Scene:</span>
      </span>
      <button class="chapter-btn px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold transition-all" data-scene="0">1. Welcome</button>
      <button class="chapter-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all" data-scene="1">2. Simple Login</button>
      <button class="chapter-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all" data-scene="2">3. Admin Dashboard</button>
      <button class="chapter-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all" data-scene="3">4. Staff &amp; Passwords</button>
      <button class="chapter-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all" data-scene="4">5. Multi-Building AMC</button>
      <button class="chapter-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all" data-scene="5">6. Emergency &amp; PDF</button>
    </div>

    <!-- Feature Highlights Cards under Player -->
    <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
      <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <div>
          <h4 class="font-bold text-slate-100">6-Character Password Security</h4>
          <p class="text-slate-400 mt-0.5 leading-relaxed">Exact 6-character alphanumeric rules with 5-attempt rate-limiting and 15-minute temporary lockout protection.</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <div>
          <h4 class="font-bold text-slate-100">Multi-Building AMC Inspections</h4>
          <p class="text-slate-400 mt-0.5 leading-relaxed">Independent checklists for Tower A, Tower B, and parking blocks under one site across 10 safety systems.</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
        <div>
          <h4 class="font-bold text-slate-100">Admin Staff Password Visibility</h4>
          <p class="text-slate-400 mt-0.5 leading-relaxed">Admin view with eye toggle, 1-click password copy, and instant login synchronization for all 12 staff accounts.</p>
        </div>
      </div>
    </div>

  </main>

  <!-- Interactive Demo Simulation Script -->
  <script>
    // Storyboard Scenes Configuration
    const SCENES = [
      {
        id: 'intro',
        title: 'Scene 1: Introduction & Brand',
        duration: 20, // seconds
        subtitles: 'Welcome to FireX Fire & Safety Service Management — the complete operational platform designed for enterprise fire protection, AMC contracts, multi-building inspections, and emergency call-outs in Bahrain.',
        narration: 'Welcome to FireX Fire and Safety Service Management. Designed for enterprise fire protection operations in Bahrain.',
        render: (step) => \`
          <div class="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white relative">
            <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-orange-500 p-1 shadow-2xl shadow-red-900/50 mb-4 animate-bounce">
              <div class="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center p-2">
                <img src="data:image/png;base64,${logoBase64}" alt="FireX Logo" class="h-16 w-auto object-contain" />
              </div>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              FireX Fire &amp; Safety Service Management
            </h2>
            <p class="text-amber-400 font-bold text-sm mt-1">Enterprise Operations Platform • Kingdom of Bahrain</p>
            <div class="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-mono">
              <span class="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300">CR No.: 96850 1</span>
              <span class="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300">VAT No.: 220006271900002</span>
              <span class="px-3 py-1 bg-red-950/80 border border-red-700/60 rounded-lg text-red-300">Villa 13, Road 2831, Al Seef</span>
            </div>
            <div class="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Fully tested on Mobile &amp; Desktop • Ready for Real Company Operations</span>
            </div>
          </div>
        \`
      },
      {
        id: 'login',
        title: 'Scene 2: Simple & Secure Login',
        duration: 25,
        subtitles: 'Access begins with a clean, mobile-optimized login screen showing only the logo and credentials. Passwords strictly require 6 alphanumeric characters with brute-force rate limiting.',
        narration: 'Access begins with a clean, distraction-free login screen. Passwords require a 6-character alphanumeric code with temporary lockout protection.',
        render: (step) => {
          const typeAdmin = step > 0.2 ? 'admin' : (step > 0.1 ? 'adm' : '');
          const typePass = step > 0.6 ? 'FX7B2K' : (step > 0.4 ? '••••••' : '');
          const isAuthed = step > 0.85;

          return \`
            <div class="w-full h-full flex items-center justify-center p-4 bg-slate-50">
              <div class="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 p-0.5 shadow-md">
                  <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <img src="data:image/png;base64,${logoBase64}" alt="Logo" class="h-10 w-auto object-contain" />
                  </div>
                </div>
                <div>
                  <h3 class="text-base font-black text-slate-900">Sign In to FireX</h3>
                  <p class="text-xs text-slate-500">Service Management Portal</p>
                </div>
                <div class="space-y-3 text-left">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Username</label>
                    <div class="relative">
                      <input type="text" value="\${typeAdmin}" readonly class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none" />
                      \${step > 0.1 && step < 0.3 ? '<span class="absolute right-3 top-2.5 w-2 h-4 bg-red-600 animate-pulse"></span>' : ''}
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-[11px] font-bold text-slate-600 uppercase">Password (6 Chars)</label>
                      <span class="text-[10px] text-amber-600 font-bold">Exact 6 Letters + Numbers</span>
                    </div>
                    <div class="relative">
                      <input type="text" value="\${typePass}" readonly class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none" />
                      <button class="absolute right-2.5 top-2 text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                    </div>
                  </div>
                  <button class="w-full py-2.5 \${isAuthed ? 'bg-emerald-600' : 'bg-red-600'} text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5">
                    \${isAuthed ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Welcome Back, Admin!' : 'Sign In to Portal'}
                  </button>
                </div>
                <div class="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800 font-medium">
                  🛡️ Brute-force protection: 5 attempts limit with 15-min lockout.
                </div>
              </div>
            </div>
          \`;
        }
      },
      {
        id: 'dashboard',
        title: 'Scene 3: Admin & Accounts Full Access',
        duration: 25,
        subtitles: 'The executive dashboard provides unified operational control. Both Admin and Accounts roles enjoy full access across contracts, visits, invoices, and field safety jobs.',
        narration: 'Upon signing in, the executive dashboard loads comprehensive operational intelligence. Accounts and Admin share full access across all modules.',
        render: (step) => \`
          <div class="w-full h-full p-4 bg-slate-100 flex flex-col gap-3">
            <!-- Top Dashboard Stats Row -->
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 class="text-base font-black text-slate-900">Executive Operations Dashboard</h2>
                <p class="text-xs text-slate-500">Live Fire &amp; Safety Service Metrics • Bahrain</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded-lg text-xs font-bold font-mono">Role: Admin</span>
                <span class="px-2.5 py-1 bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-bold font-mono">Accounts: Full Access</span>
              </div>
            </div>

            <!-- Metric Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Active AMCs</span>
                <div class="text-lg font-black text-slate-900">48 Contracts</div>
                <span class="text-[10px] text-emerald-600 font-bold">100% Compliant</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Q1 Scheduled Visits</span>
                <div class="text-lg font-black text-blue-600">32 Visits</div>
                <span class="text-[10px] text-blue-700 font-bold">24 Completed</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Emergency Calls</span>
                <div class="text-lg font-black text-amber-600">5 Active</div>
                <span class="text-[10px] text-amber-700 font-bold">Avg 28m Response</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Sites Covered</span>
                <div class="text-lg font-black text-purple-600">114 Buildings</div>
                <span class="text-[10px] text-purple-700 font-bold">Kingdom of Bahrain</span>
              </div>
            </div>

            <!-- Quick Contracts Table Preview -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex-1 flex flex-col justify-between">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 class="text-xs font-bold text-slate-800">Recent Customer AMC Contracts &amp; Sites</h3>
                <span class="text-[11px] text-blue-600 font-bold">View All 48 &rarr;</span>
              </div>
              <div class="space-y-1.5 text-xs mt-2">
                <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span class="font-bold text-slate-800">Emaar Hospitality Group — ABC Complex (3 Buildings)</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active AMC</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span class="font-bold text-slate-800">Seef Tower Commercial Complex (2 Buildings)</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active AMC</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span class="font-bold text-slate-800">Bahrain Financial Harbour Suites</span>
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">Q1 Visit Ready</span>
                </div>
              </div>
            </div>
          </div>
        \`
      },
      {
        id: 'staff',
        title: 'Scene 4: Staff Management & Passwords',
        duration: 30,
        subtitles: 'Administrators can view, reveal, or mask the assigned 6-character passwords for all team members, with one-click copying and administrative password resets.',
        narration: 'Under Staff Management, administrators can easily view, reveal, or mask the assigned passwords for all team members, with one-click copying.',
        render: (step) => {
          const isCopied = step > 0.4 && step < 0.7;
          return \`
            <div class="w-full h-full p-4 bg-slate-100 flex flex-col gap-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 class="text-base font-black text-slate-900">User &amp; Staff Management</h2>
                  <p class="text-xs text-slate-500">12 Verified Operational Staff Accounts</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-amber-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                    <span>Pass: Visible for Admin</span>
                  </span>
                </div>
              </div>

              <!-- Staff Cards Grid Simulation -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto">
                <!-- Card 1: Sarath Kr -->
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs">SK</div>
                      <div>
                        <h4 class="font-black text-slate-900 text-xs">Sarath Kr</h4>
                        <span class="text-[10px] text-blue-700 font-bold">@sarath • Senior Field Supervisor</span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>

                  <!-- The Password Badge -->
                  <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs">
                    <div class="flex items-center gap-1.5 font-bold text-amber-900">
                      <span>Password:</span>
                      <span class="font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 text-xs tracking-wider">EX8DS2</span>
                    </div>
                    <button class="px-2 py-0.5 \${isCopied ? 'bg-emerald-600 text-white' : 'bg-white text-amber-800'} border border-amber-300 rounded font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                      \${isCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <!-- Card 2: Yaser Zidan -->
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-teal-700 text-white font-black flex items-center justify-center text-xs">YZ</div>
                      <div>
                        <h4 class="font-black text-slate-900 text-xs">Yaser Zidan</h4>
                        <span class="text-[10px] text-teal-800 font-bold">@yaser • Accounts Manager</span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>

                  <!-- The Password Badge -->
                  <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs">
                    <div class="flex items-center gap-1.5 font-bold text-amber-900">
                      <span>Password:</span>
                      <span class="font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 text-xs tracking-wider">U2NMC3</span>
                    </div>
                    <button class="px-2 py-0.5 bg-white text-amber-800 border border-amber-300 rounded font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                      Copy
                    </button>
                  </div>
                </div>

                <!-- Card 3: Chandiramohan -->
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-cyan-700 text-white font-black flex items-center justify-center text-xs">CM</div>
                      <div>
                        <h4 class="font-black text-slate-900 text-xs">Chandiramohan</h4>
                        <span class="text-[10px] text-cyan-800 font-bold">@Chandiramohan • Projects Manager</span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>
                  <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs">
                    <div class="flex items-center gap-1.5 font-bold text-amber-900">
                      <span>Password:</span>
                      <span class="font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 text-xs tracking-wider">7FB6DK</span>
                    </div>
                    <button class="px-2 py-0.5 bg-white text-amber-800 border border-amber-300 rounded font-bold text-[10px]">Copy</button>
                  </div>
                </div>

                <!-- Card 4: Wissam Jamal (MD) -->
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-xs">WJ</div>
                      <div>
                        <h4 class="font-black text-slate-900 text-xs">Wissam Jamal Hussein</h4>
                        <span class="text-[10px] text-amber-800 font-bold">@md • Managing Director</span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>
                  <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs">
                    <div class="flex items-center gap-1.5 font-bold text-amber-900">
                      <span>Password:</span>
                      <span class="font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 text-xs tracking-wider">F8B3PU</span>
                    </div>
                    <button class="px-2 py-0.5 bg-white text-amber-800 border border-amber-300 rounded font-bold text-[10px]">Copy</button>
                  </div>
                </div>
              </div>
            </div>
          \`;
        }
      },
      {
        id: 'amc',
        title: 'Scene 5: Multi-Building AMC & 10 Systems Checklist',
        duration: 30,
        subtitles: 'For customer sites containing multiple buildings, FireX provides separate inspection checklists for each building, with custom checklists across 10 specialized fire safety systems.',
        narration: 'For sites with multiple buildings, FireX provides dedicated, independent checklists for each individual building across ten fire and safety systems.',
        render: (step) => {
          const activeBuilding = step > 0.5 ? 'Tower B' : 'Tower A';
          return \`
            <div class="w-full h-full p-4 bg-slate-100 flex flex-col gap-2.5">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div>
                  <h3 class="text-sm font-black text-slate-900">AMC Service Report Preparation</h3>
                  <p class="text-[11px] text-slate-500">Customer: ABC Company • Site: ABC Complex</p>
                </div>
                <span class="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-xs font-mono">Q1 Visit</span>
              </div>

              <!-- Multi-Building Tabs Selector -->
              <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select Building Under Site (Each has its OWN checklist):</span>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-1.5 rounded-lg text-xs font-bold \${activeBuilding === 'Tower A' ? 'bg-navy-900 bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}">
                    🏢 Building 1 — Tower A
                  </button>
                  <button class="px-3 py-1.5 rounded-lg text-xs font-bold \${activeBuilding === 'Tower B' ? 'bg-navy-900 bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}">
                    🏢 Building 2 — Tower B
                  </button>
                  <button class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                    🅿️ Building 3 — Parking Block
                  </button>
                </div>
              </div>

              <!-- 10 Fire Systems Selector -->
              <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 flex-1 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Inspected Systems (\${activeBuilding}):</span>
                <div class="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ Fire Alarm System</span>
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ Fire Fighting Pumps</span>
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ Fire Hose Reel</span>
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ Landing Valves</span>
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ Fire Extinguishers</span>
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ FM200 Clean Agent</span>
                  <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">✓ Emergency Lights</span>
                </div>

                <!-- Checklist Items -->
                <div class="space-y-1 text-xs mt-1 overflow-y-auto">
                  <div class="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200/60">
                    <span class="font-medium text-slate-800">1. Main Fire Alarm Control Panel (FACP) Primary Power &amp; AC Normal</span>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">OK</span>
                  </div>
                  <div class="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200/60">
                    <span class="font-medium text-slate-800">2. Standby Battery Voltage &amp; Charger Functional</span>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">OK</span>
                  </div>
                  <div class="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200/60">
                    <span class="font-medium text-slate-800">3. Smoke / Heat Detector Loop Circuit &amp; Sensitivity Test</span>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">OK</span>
                  </div>
                </div>
              </div>
            </div>
          \`;
        }
      },
      {
        id: 'emergency-pdf',
        title: 'Scene 6: Emergency Call-Out & Official PDF Report',
        duration: 25,
        subtitles: 'Emergency call-outs capture fault diagnostics and corrective actions, concluding with an instantly generated, print-ready PDF complete with official FireX letterhead branding.',
        narration: 'Emergency call-outs capture immediate diagnostics and repairs, concluding with an instantly generated official PDF with FireX letterhead.',
        render: (step) => \`
          <div class="w-full h-full p-4 bg-slate-100 flex items-center justify-center">
            <!-- Simulated PDF Document Window -->
            <div class="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-300 p-4 space-y-3 font-sans">
              <!-- PDF Letterhead Banner -->
              <div class="border-b-2 border-red-600 pb-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img src="data:image/png;base64,${logoBase64}" alt="FireX" class="h-8 w-auto object-contain" />
                  <div>
                    <h3 class="text-xs font-black text-red-600 uppercase">FIREX FIRE &amp; SAFETY SERVICES</h3>
                    <p class="text-[9px] text-slate-500">Kingdom of Bahrain • CR No.: 96850 1 • VAT No.: 220006271900002</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold uppercase font-mono">EMERGENCY REPORT</span>
              </div>

              <!-- Report Header Grid -->
              <div class="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div><strong>Client:</strong> Emaar Hospitality Group</div>
                <div><strong>Report #:</strong> RPT-EMG-2026-0042</div>
                <div><strong>Site:</strong> ABC Complex (Tower A)</div>
                <div><strong>Date:</strong> 15-Oct-2026 14:30</div>
              </div>

              <!-- Findings & Corrective Action -->
              <div class="text-[10px] space-y-1">
                <div class="p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900">
                  <strong>Reported Fault:</strong> Zone 3 Smoke Detector Fault signal triggered FACP buzzer.
                </div>
                <div class="p-1.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                  <strong>Corrective Action Taken:</strong> Replaced faulty optical chamber detector (Model FX-SD02). Tested loop signaling — system normal.
                </div>
              </div>

              <!-- Signatures Row -->
              <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px]">
                <div class="text-center">
                  <div class="font-signature text-blue-800 italic font-bold">Ahmed Mohammed</div>
                  <div class="text-slate-500">Technician Sign-off</div>
                </div>
                <div class="text-center">
                  <div class="font-signature text-blue-800 italic font-bold">Sarath Kr</div>
                  <div class="text-slate-500">Supervisor Approval</div>
                </div>
                <div class="text-center">
                  <div class="w-12 h-6 border border-dashed border-red-400 rounded flex items-center justify-center text-[8px] text-red-500 font-bold uppercase">
                    OFFICIAL STAMP
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-1">
                <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  ✓ PDF Verified &amp; Signed
                </span>
              </div>
            </div>
          </div>
        \`
      }
    ];

    // State Variables
    let isPlaying = false;
    let currentTime = 0; // in seconds
    let playbackSpeed = 1.0;
    let voiceEnabled = true;
    let activeSceneIndex = 0;
    let animFrameId = null;
    let lastTimestamp = null;
    let isMobileView = false;
    let synth = window.speechSynthesis;
    let lastSpokenScene = -1;

    const totalDuration = SCENES.reduce((acc, s) => acc + s.duration, 0);

    // DOM Elements
    const screenCanvas = document.getElementById('screen-canvas');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const timelineProgress = document.getElementById('timeline-progress');
    const currentChapterTitle = document.getElementById('current-chapter-title');
    const subtitlesText = document.getElementById('subtitles-text');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const deviceBezel = document.getElementById('device-bezel');
    const btnDeviceLaptop = document.getElementById('btn-device-laptop');
    const btnDeviceMobile = document.getElementById('btn-device-mobile');
    const btnToggleVoice = document.getElementById('btn-toggle-voice');
    const voiceStatusText = document.getElementById('voice-status-text');
    const chapterButtons = document.querySelectorAll('.chapter-btn');
    const speedButtons = document.querySelectorAll('.btn-speed');
    const timelineContainer = document.getElementById('timeline-container');
    const virtualCursor = document.getElementById('virtual-cursor');

    // Format mm:ss
    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    timeTotal.textContent = formatTime(totalDuration);

    // Get Scene at time
    function getSceneAtTime(t) {
      let accumulated = 0;
      for (let i = 0; i < SCENES.length; i++) {
        if (t >= accumulated && t < accumulated + SCENES[i].duration) {
          return {
            index: i,
            scene: SCENES[i],
            sceneTime: t - accumulated,
            progress: (t - accumulated) / SCENES[i].duration
          };
        }
        accumulated += SCENES[i].duration;
      }
      return {
        index: SCENES.length - 1,
        scene: SCENES[SCENES.length - 1],
        sceneTime: SCENES[SCENES.length - 1].duration,
        progress: 1
      };
    }

    // Speak Narration
    function speakNarration(text) {
      if (!voiceEnabled || !synth) return;
      synth.cancel(); // stop previous
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = playbackSpeed * 1.0;
      utter.pitch = 1.0;
      synth.speak(utter);
    }

    // Render Scene Frame
    function renderFrame() {
      const { index, scene, sceneTime, progress } = getSceneAtTime(currentTime);

      if (index !== activeSceneIndex) {
        activeSceneIndex = index;
        currentChapterTitle.textContent = scene.title;
        subtitlesText.textContent = scene.subtitles;

        // Highlight active chapter button
        chapterButtons.forEach((btn, i) => {
          if (i === index) {
            btn.classList.add('bg-red-600', 'text-white');
            btn.classList.remove('bg-slate-800', 'text-slate-300');
          } else {
            btn.classList.remove('bg-red-600', 'text-white');
            btn.classList.add('bg-slate-800', 'text-slate-300');
          }
        });

        // Speak narration once per scene change
        if (isPlaying && lastSpokenScene !== index) {
          lastSpokenScene = index;
          speakNarration(scene.narration);
        }
      }

      // Render inner HTML for the scene
      screenCanvas.innerHTML = scene.render(progress);

      // Animate Cursor Simulation across scenes
      if (index === 1) { // Login Scene
        virtualCursor.style.opacity = '1';
        if (progress < 0.3) {
          virtualCursor.style.transform = 'translate(-30px, 40px)';
        } else if (progress < 0.7) {
          virtualCursor.style.transform = 'translate(40px, 90px)';
        } else {
          virtualCursor.style.transform = 'translate(10px, 140px)';
        }
      } else if (index === 3) { // Staff Scene
        virtualCursor.style.opacity = '1';
        virtualCursor.style.transform = 'translate(60px, -40px)';
      } else {
        virtualCursor.style.opacity = '0';
      }

      // Update Timeline bar
      const pct = (currentTime / totalDuration) * 100;
      timelineProgress.style.width = pct + '%';
      timeCurrent.textContent = formatTime(currentTime);
    }

    // Animation Loop
    function stepAnimation(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        currentTime += delta * playbackSpeed;
        if (currentTime >= totalDuration) {
          currentTime = totalDuration;
          pause();
        }
        renderFrame();
      }

      if (isPlaying) {
        animFrameId = requestAnimationFrame(stepAnimation);
      }
    }

    function play() {
      if (currentTime >= totalDuration) currentTime = 0;
      isPlaying = true;
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      lastTimestamp = performance.now();
      animFrameId = requestAnimationFrame(stepAnimation);

      // Speak current scene narration
      const { index, scene } = getSceneAtTime(currentTime);
      if (lastSpokenScene !== index) {
        lastSpokenScene = index;
        speakNarration(scene.narration);
      }
    }

    function pause() {
      isPlaying = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (synth) synth.cancel();
    }

    // Play/Pause toggle
    btnPlayPause.addEventListener('click', () => {
      if (isPlaying) pause(); else play();
    });

    // Spacebar shortcut
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (isPlaying) pause(); else play();
      }
    });

    // Seek Timeline on click
    timelineContainer.addEventListener('click', (e) => {
      const rect = timelineContainer.getBoundingClientRect();
      const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      currentTime = clickRatio * totalDuration;
      lastSpokenScene = -1; // force narration re-trigger
      renderFrame();
      if (isPlaying) {
        const { index, scene } = getSceneAtTime(currentTime);
        speakNarration(scene.narration);
      }
    });

    // Chapter Buttons
    chapterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetSceneIdx = parseInt(btn.getAttribute('data-scene'), 10);
        let accumulated = 0;
        for (let i = 0; i < targetSceneIdx; i++) {
          accumulated += SCENES[i].duration;
        }
        currentTime = accumulated;
        lastSpokenScene = -1;
        renderFrame();
        if (isPlaying) {
          speakNarration(SCENES[targetSceneIdx].narration);
        }
      });
    });

    // Prev / Next Scene Buttons
    document.getElementById('btn-prev-scene').addEventListener('click', () => {
      const { index } = getSceneAtTime(currentTime);
      const prevIdx = Math.max(0, index - 1);
      let accumulated = 0;
      for (let i = 0; i < prevIdx; i++) accumulated += SCENES[i].duration;
      currentTime = accumulated;
      lastSpokenScene = -1;
      renderFrame();
    });

    document.getElementById('btn-next-scene').addEventListener('click', () => {
      const { index } = getSceneAtTime(currentTime);
      const nextIdx = Math.min(SCENES.length - 1, index + 1);
      let accumulated = 0;
      for (let i = 0; i < nextIdx; i++) accumulated += SCENES[i].duration;
      currentTime = accumulated;
      lastSpokenScene = -1;
      renderFrame();
    });

    // Replay
    document.getElementById('btn-restart').addEventListener('click', () => {
      currentTime = 0;
      lastSpokenScene = -1;
      renderFrame();
      play();
    });

    // Speed Selector Buttons
    speedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        playbackSpeed = parseFloat(btn.getAttribute('data-speed'));
        speedButtons.forEach(b => {
          b.classList.remove('bg-slate-700', 'text-white');
          b.classList.add('text-slate-400');
        });
        btn.classList.add('bg-slate-700', 'text-white');
        btn.classList.remove('text-slate-400');
      });
    });

    // Voice Toggle Button
    btnToggleVoice.addEventListener('click', () => {
      voiceEnabled = !voiceEnabled;
      if (voiceEnabled) {
        voiceStatusText.textContent = 'Voiceover ON';
        btnToggleVoice.classList.add('text-amber-400');
        btnToggleVoice.classList.remove('text-slate-400');
        const { scene } = getSceneAtTime(currentTime);
        speakNarration(scene.narration);
      } else {
        voiceStatusText.textContent = 'Voiceover OFF';
        btnToggleVoice.classList.remove('text-amber-400');
        btnToggleVoice.classList.add('text-slate-400');
        if (synth) synth.cancel();
      }
    });

    // Device Frame Switcher (Laptop vs Mobile)
    btnDeviceLaptop.addEventListener('click', () => {
      isMobileView = false;
      btnDeviceLaptop.classList.add('bg-red-600', 'text-white');
      btnDeviceLaptop.classList.remove('text-slate-300');
      btnDeviceMobile.classList.remove('bg-red-600', 'text-white');
      btnDeviceMobile.classList.add('text-slate-300');
      deviceBezel.classList.remove('max-w-[340px]', 'max-h-[580px]', 'rounded-[36px]', 'border-[8px]');
      deviceBezel.classList.add('max-w-[1000px]', 'max-h-[580px]', 'rounded-2xl', 'border-4');
    });

    btnDeviceMobile.addEventListener('click', () => {
      isMobileView = true;
      btnDeviceMobile.classList.add('bg-red-600', 'text-white');
      btnDeviceMobile.classList.remove('text-slate-300');
      btnDeviceLaptop.classList.remove('bg-red-600', 'text-white');
      btnDeviceLaptop.classList.add('text-slate-300');
      deviceBezel.classList.add('max-w-[340px]', 'max-h-[580px]', 'rounded-[36px]', 'border-[8px]');
      deviceBezel.classList.remove('max-w-[1000px]', 'rounded-2xl', 'border-4');
    });

    // Initial Frame Render
    renderFrame();

    // Auto-start presentation after 500ms
    setTimeout(() => {
      play();
    }, 600);
  </script>
</body>
</html>
`;

const targetFile = path.join(artifactDir, 'FireX_Interactive_Demo_Video.html');
fs.writeFileSync(targetFile, htmlContent, 'utf8');
console.log('Successfully created Interactive Demo Video Artifact at:', targetFile);
