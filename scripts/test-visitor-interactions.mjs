import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

class FakeClassList {
  values = new Set();
  add(value) { this.values.add(value); }
  toggle(value, force) { force ? this.values.add(value) : this.values.delete(value); }
}

class FakeElement {
  constructor(text = "") {
    this.textContent = text;
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  querySelector() { return null; }
}

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createGain() {
    return { gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
  }
  createOscillator() {
    return { type: "sine", frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} };
  }
  async resume() { this.state = "running"; }
}

const control = new FakeElement("Play C4 Flight Signal");
control.dataset.audioMode = "c4";
const status = new FakeElement();
const soundStatus = new FakeElement("Deck ready");
const body = new FakeElement();
body.dataset.roomId = "flight-deck";
body.appendChild = () => {};
const documentElement = new FakeElement();
const document = {
  readyState: "complete",
  body,
  documentElement,
  createElement: () => status,
  getElementById: (id) => id === "inkspirations-audio-status" ? status : id === "soundStatus" ? soundStatus : null,
  querySelector: () => control,
  querySelectorAll: (selector) => {
    if (selector.includes("[data-audio-mode]") && !selector.includes("button[data-audio-mode]")) {
      return [documentElement, control];
    }
    return selector.includes("button[data-audio") || selector.includes("button#soundBtn") ? [control] : [];
  },
  addEventListener() {}
};
const windowObject = {
  AudioContext: FakeAudioContext,
  document,
  setInterval: () => 1,
  clearInterval() {},
  InkspirationsAudioEngine: null
};

vm.runInNewContext(fs.readFileSync(path.join(root, "studio-audio.js"), "utf8"), {
  window: windowObject,
  document,
  console,
  HTMLElement: FakeElement
});

assert.ok(windowObject.InkspirationsAudioEngine, "Audio engine should initialize");
assert.equal(await windowObject.InkspirationsAudioEngine.play("c4"), true);
const playingState = windowObject.InkspirationsAudioEngine.getState();
assert.equal(playingState.playing, true);
assert.equal(playingState.mode, "c4");
assert.equal(playingState.contextState, "running");
assert.equal(control.getAttribute("aria-pressed"), "true");
assert.match(soundStatus.textContent, /Playing C4 Flight Signal/);
assert.equal(documentElement.dataset.audioLabel, undefined, "The document root must never be treated as an audio control");
windowObject.InkspirationsAudioEngine.pause();
assert.equal(windowObject.InkspirationsAudioEngine.getState().playing, false);

const flightDeckData = fs.readFileSync(path.join(root, "data/flight-deck-tracks.json"), "utf8");
assert.doesNotMatch(flightDeckData, /dj\.html/i, "No nonexistent DJ page may remain");

const portfolioSource = fs.readFileSync(path.join(root, "portfolio.js"), "utf8");
assert.match(portfolioSource, /Ask About This Piece/);
assert.match(portfolioSource, /mailto:r\.marleton@gmail\.com/);
assert.doesNotMatch(fs.readFileSync(path.join(root, "portfolio.html"), "utf8"), /protectMailLinks/);

const lightboxCss = fs.readFileSync(path.join(root, "immersive-lightbox.css"), "utf8");
assert.match(lightboxCss, /height:\s*100dvh/);
assert.match(lightboxCss, /width:\s*100vw/);

console.log(JSON.stringify({
  audioStartPause: "pass",
  djLinks: "pass",
  inquiryLinks: "pass",
  fullscreenLightboxes: "pass"
}, null, 2));
