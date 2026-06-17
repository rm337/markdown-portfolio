(function(){
  "use strict";

  const rooms = [
    {
      id:"ocean-of-ink",
      title:"Ocean of Ink",
      subtitle:"Blue motion, water, light, and intention.",
      description:"The central atmosphere of Inkspirations Studios: ocean depth, ink movement, bubbles, and luminous blue focus.",
      url:"index.html#ocean",
      theme:"ocean",
      accent:"#0174F3",
      status:"Live",
      category:"Immersive World",
      tags:["ink","water","blue","portfolio"],
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
      atmosphere:{particles:true,lightBeams:true,radarSweep:true,musicPulse:true,reducedMotion:true}
    },
    {
      id:"writing-room",
      title:"Writing Room",
      subtitle:"Quiet focus for words and memory.",
      description:"A future room for reflective writing, story fragments, prompts, and calm studio ritual.",
      url:"rooms.html#writing-room",
      theme:"quiet",
      accent:"#f5efe5",
      status:"Draft",
      category:"Writing Space",
      tags:["writing","memory","focus"],
      atmosphere:{particles:true,reducedMotion:true}
    },
    {
      id:"music-room",
      title:"Music Room",
      subtitle:"Listening, rhythm, and emotional weather.",
      description:"A listening room that connects BeatForge, Flight Deck, and future sound experiments.",
      url:"rooms.html#music-room",
      theme:"music",
      accent:"#83f3ba",
      status:"Draft",
      category:"Sound Space",
      tags:["music","listening","mood"],
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
      atmosphere:{particles:true,musicPulse:true,reducedMotion:true}
    },
    {
      id:"memory-lanterns",
      title:"Memory Lanterns",
      subtitle:"Small lights for remembered moments.",
      description:"A future emotional gallery zone for pieces, notes, and fragments that feel half remembered.",
      url:"rooms.html#memory-lanterns",
      theme:"memory",
      accent:"#ffb45c",
      status:"Coming Soon",
      category:"Gallery Zone",
      tags:["memory","light","story"],
      atmosphere:{particles:true,bubbles:true,reducedMotion:true}
    },
    {
      id:"daylight-district",
      title:"Daylight District",
      subtitle:"The bright edge of the blue world.",
      description:"A future zone for clearer, lighter work: morning color, clean presentation, and open-air studio energy.",
      url:"rooms.html#daylight-district",
      theme:"daylight",
      accent:"#9ed0ff",
      status:"Coming Soon",
      category:"Gallery Zone",
      tags:["daylight","gallery","prints"],
      atmosphere:{particles:true,lightBeams:true,reducedMotion:true}
    },
    {
      id:"c4-territory",
      title:"C4 Territory",
      subtitle:"Pressure, signal, and controlled impact.",
      description:"A future high-energy zone for bold marks, strong contrast, sound pressure, and intense creative direction.",
      url:"rooms.html#c4-territory",
      theme:"pressure",
      accent:"#ff6b9d",
      status:"Coming Soon",
      category:"Experimental Zone",
      tags:["energy","signal","impact"],
      atmosphere:{particles:true,radarSweep:true,musicPulse:true,reducedMotion:true}
    }
  ];

  function byId(id){
    return rooms.find(room => room.id === id);
  }

  function detectActiveRoom(){
    const explicit = document.body && document.body.dataset ? document.body.dataset.roomId : "";
    if(explicit && byId(explicit)) return explicit;
    const path = window.location.pathname.split("/").pop() || "index.html";
    const hash = window.location.hash || "";
    const match = rooms.find(room => {
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
    const items = filter ? rooms.filter(room => room.category === filter) : rooms;
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
    const activeId = detectActiveRoom() || "ocean-of-ink";
    const activeIndex = Math.max(0, rooms.findIndex(room => room.id === activeId));
    const room = rooms[activeIndex];
    const prev = rooms[(activeIndex - 1 + rooms.length) % rooms.length];
    const next = rooms[(activeIndex + 1) % rooms.length];
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
        <a class="room-nav-link" href="${escapeHtml(prev.url)}">Previous</a>
        <select class="room-select" id="roomJump" aria-label="Choose room">${rooms.map(item => `<option value="${escapeHtml(item.url)}"${item.id === room.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select>
        <a class="room-nav-link" href="${escapeHtml(next.url)}">Next</a>
      </div>
    </nav>`;
    const select = target.querySelector(".room-select");
    select.addEventListener("change", event => {
      window.location.href = event.target.value;
    });
  }

  function renderAtmosphere(target){
    const active = byId(detectActiveRoom()) || rooms[0];
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

  window.InkRooms = {rooms, byId, detectActiveRoom, renderCards, renderNav, renderAtmosphere, init};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
