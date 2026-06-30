(function(){
  "use strict";

  const rooms = [
    {
      id:"home",
      title:"Home",
      subtitle:"The public portfolio starting point.",
      description:"The calm public entry for Inkspirations Studios with paths into the portfolio, artwork, rooms, writing, coasters, merch, and contact.",
      url:"index.html",
      theme:"home",
      accent:"#0174F3",
      status:"Live",
      category:"Core",
      tags:["portfolio","home","studio"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,bubbles:true,lightBeams:true,reducedMotion:true}
    },
    {
      id:"ocean-of-ink",
      title:"Ocean of Ink",
      subtitle:"Blue motion, water, light, and intention.",
      description:"The central atmosphere of Inkspirations Studios: ocean depth, ink movement, bubbles, and luminous blue focus.",
      url:"rooms.html",
      theme:"ocean",
      accent:"#0174F3",
      status:"Live",
      category:"Immersive World",
      tags:["ink","water","blue","portfolio"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{bubbles:true,particles:true,lightBeams:true,reducedMotion:true}
    },
    {
      id:"flight-deck",
      title:"Flight Deck",
      subtitle:"A DJ cockpit for melodic motion.",
      description:"A cinematic performance room with spinning vinyl, moving DJ controls, radar, altitude, fog, and signal graphics.",
      url:"flight-deck.html",
      theme:"navigation",
      accent:"#56d9ff",
      status:"Live",
      category:"Performance Room",
      tags:["dj","vinyl","flight","radar"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,lightBeams:true,radarSweep:true,musicPulse:true,reducedMotion:true}
    },
    {
      id:"writing-room",
      title:"Writing Room",
      subtitle:"Quiet focus for words and memory.",
      description:"A public writing space for Robert's poem, reflective fragments, word pieces, prompts, and calm studio ritual.",
      url:"rooms.html",
      theme:"quiet",
      accent:"#f5efe5",
      status:"Public Feature",
      category:"Writing / Poem",
      tags:["writing","memory","focus"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,reducedMotion:true}
    },
    {
      id:"music-room",
      title:"Music Room",
      subtitle:"Listening, rhythm, and emotional weather.",
      description:"A listening room that connects BeatForge, Flight Deck, and the sound side of Inkspirations Studios.",
      url:"rooms.html",
      theme:"music",
      accent:"#83f3ba",
      status:"Public Feature",
      category:"Music / Atmosphere",
      tags:["music","listening","mood"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,musicPulse:true,reducedMotion:true}
    },
    {
      id:"beatforge-studio",
      title:"BeatForge Studio",
      subtitle:"A playable browser music maker.",
      description:"The interactive pattern lab with channel rack, playlist, automation, pads, mixer controls, effects, and visualizer.",
      url:"beats.html",
      theme:"beatforge",
      accent:"#ff8a1f",
      status:"Live",
      category:"Creative Tool",
      tags:["beats","tool","automation","mixer"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,musicPulse:true,reducedMotion:true}
    },
    {
      id:"t-shirt-design-lab",
      title:"T-Shirt Design Lab",
      subtitle:"A creative workshop for shirt concepts.",
      description:"A public-facing lab for collecting, reviewing, and developing T-shirt ideas before they become finished designs.",
      url:"t-shirt-design-lab.html",
      theme:"design-lab",
      accent:"#56d9ff",
      status:"Concept Lab",
      category:"Creative Lab",
      tags:["shirts","ideas","sketchbook","workshop"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,bubbles:true,lightBeams:true,reducedMotion:true}
    },
    {
      id:"merch-concept-foundry",
      title:"Merch Concept Foundry",
      subtitle:"A creative workshop for merch and functional art.",
      description:"A creative foundry for coasters, Robertisms, custom art prints, shirt ideas, product concepts, Ocean of Ink merch, Data Zoology merch, and future collection candidates.",
      url:"merch-foundry.html",
      theme:"foundry",
      accent:"#0174F3",
      status:"Public Lab",
      category:"Merch / Functional Art",
      tags:["merch","coasters","robertisms","prints"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,bubbles:true,lightBeams:true,reducedMotion:true}
    },
    {
      id:"systems-i-built",
      title:"Systems I Built",
      subtitle:"Blueprints for creative systems and protocols.",
      description:"A public systems showcase for the frameworks, workflows, review protocols, and creative operating structures behind Inkspirations Studios.",
      url:"systems-i-built.html",
      theme:"blueprint",
      accent:"#56d9ff",
      status:"Public Feature",
      category:"Systems Showcase",
      tags:["systems","protocols","workflows","blueprints"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,lightBeams:true,reducedMotion:true}
    },
    {
      id:"room-hub",
      title:"Interactive Rooms Map",
      subtitle:"The visible map of studio rooms.",
      description:"The public room map for moving between Home, Ocean of Ink, Flight Deck, Writing Room, Music Room, BeatForge Studio, Merch Foundry, and Systems I Built.",
      url:"rooms.html",
      theme:"map",
      accent:"#9ed0ff",
      status:"Live",
      category:"Core",
      tags:["map","rooms","navigation"],
      hidden:false,
      unlockType:null,
      unlockHint:null,
      discovered:false,
      atmosphere:{particles:true,bubbles:true,lightBeams:true,reducedMotion:true}
    }
  ];

  function visibleRooms(){
    return rooms.filter(room => !room.hidden);
  }

  function byId(id){
    return rooms.find(room => room.id === id);
  }

  function detectActiveRoom(){
    const explicit = document.body && document.body.dataset ? document.body.dataset.roomId : "";
    if(explicit && byId(explicit)) return explicit;
    const path = window.location.pathname.split("/").pop() || "index.html";
    const hash = window.location.hash || "";
    const match = visibleRooms().find(room => {
      const parts = room.url.split("#");
      const roomPath = parts[0] || "index.html";
      const roomHash = parts[1] ? "#" + parts[1] : "";
      return roomPath === path && (!roomHash || roomHash === hash);
    });
    return match ? match.id : "";
  }

  function statusMarkup(status){
    return `<span class="room-status" data-status="${escapeHtml(status)}">${escapeHtml(status)}</span>`;
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      "\"":"&quot;",
      "'":"&#39;"
    }[char]));
  }

  function renderCards(target, options){
    const activeId = detectActiveRoom();
    const filter = options && options.category;
    const publicRooms = visibleRooms();
    const items = filter ? publicRooms.filter(room => room.category === filter) : publicRooms;
    target.innerHTML = items.map(room => {
      const tags = room.tags.slice(0,4).map(tag => `<span class="room-tag">${escapeHtml(tag)}</span>`).join("");
      const active = room.id === activeId ? " is-active" : "";
      return `<a class="room-card${active}" id="${escapeHtml(room.id)}" href="${escapeHtml(room.url)}" style="--room-accent:${escapeHtml(room.accent)}" data-room-card="${escapeHtml(room.id)}">
        <small>${escapeHtml(room.category)} / ${escapeHtml(room.status)}</small>
        <h2>${escapeHtml(room.title)}</h2>
        <p>${escapeHtml(room.description)}</p>
        <div class="room-card-footer">${tags}</div>
      </a>`;
    }).join("");
  }

  function renderNav(target){
    const publicRooms = visibleRooms();
    const activeId = detectActiveRoom() || "home";
    const activeIndex = Math.max(0, publicRooms.findIndex(room => room.id === activeId));
    const room = publicRooms[activeIndex] || publicRooms[0];
    const prev = publicRooms[(activeIndex - 1 + publicRooms.length) % publicRooms.length];
    const next = publicRooms[(activeIndex + 1) % publicRooms.length];
    target.innerHTML = `<nav class="room-global-nav" aria-label="Global room navigation" style="--room-accent:${escapeHtml(room.accent)}">
      <div class="room-nav-main">
        ${statusMarkup(room.status)}
        <div class="room-nav-meta">
          <span class="room-nav-title">${escapeHtml(room.title)}</span>
          <span class="room-nav-desc">${escapeHtml(room.subtitle)}</span>
        </div>
      </div>
      <label class="room-chip" for="roomJump">Room Menu</label>
      <div class="room-nav-links">
        <a class="room-nav-link" href="index.html">Home</a>
        <a class="room-nav-link" href="portfolio.html#world">Portfolio</a>
        <a class="room-nav-link" href="portfolio.html#portfolio">Artwork</a>
        <a class="room-nav-link" href="portfolio.html#interactive">Rooms</a>
        <a class="room-nav-link" href="portfolio.html#writing">Writing</a>
        <a class="room-nav-link" href="portfolio.html#functional">Coasters</a>
        <a class="room-nav-link" href="merch-foundry.html">Merch</a>
        <a class="room-nav-link" href="index.html#about">About</a>
        <a class="room-nav-link" href="index.html#contact">Contact</a>
        <a class="room-nav-link" href="site-map.html">Studio Map</a>
        <a class="room-nav-link" href="${escapeHtml(prev.url)}">Previous</a>
        <select class="room-select" id="roomJump" aria-label="Choose room">${publicRooms.map(item => `<option value="${escapeHtml(item.url)}"${item.id === room.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select>
        <a class="room-nav-link" href="${escapeHtml(next.url)}">Next</a>
      </div>
    </nav>`;
    const select = target.querySelector(".room-select");
    select.addEventListener("change", event => {
      window.location.href = event.target.value;
    });
  }

  function renderAtmosphere(target){
    const active = byId(detectActiveRoom()) || visibleRooms()[0];
    const settings = active.atmosphere || {};
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.classList.add("room-atmosphere");
    target.setAttribute("aria-hidden","true");
    if(reduce && settings.reducedMotion) return;
    let html = "";
    if(settings.lightBeams) html += '<span class="room-beam"></span>';
    if(settings.radarSweep) html += '<span class="room-radar"></span>';
    if(settings.musicPulse) html += '<span class="room-pulse"></span>';
    if(settings.particles || settings.bubbles){
      const particleCount = settings.particles ? 44 : 0;
      const bubbleCount = settings.bubbles ? 48 : 0;
      for(let i = 0; i < particleCount; i++) html += atmosphereDot("room-particle",2,5,9,18);
      for(let i = 0; i < bubbleCount; i++) html += atmosphereDot("room-bubble",3,8,10,20);
    }
    target.innerHTML = html;
  }

  function atmosphereDot(className,minSize,maxSize,minDuration,maxDuration){
    const size = minSize + Math.random() * maxSize;
    const duration = minDuration + Math.random() * maxDuration;
    const delay = Math.random() * -24;
    const sway = Math.random() * 180 - 90;
    return `<span class="${className}" style="--x:${Math.random()*100}%;--s:${size}px;--d:${duration}s;--delay:${delay}s;--sway:${sway}px"></span>`;
  }

  function init(){
    document.querySelectorAll("[data-room-cards]").forEach(target => renderCards(target, target.dataset));
    document.querySelectorAll("[data-room-nav]").forEach(renderNav);
    document.querySelectorAll("[data-room-atmosphere]").forEach(renderAtmosphere);
  }

  window.InkRooms = {rooms, visibleRooms, byId, detectActiveRoom, renderCards, renderNav, renderAtmosphere, init};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
