(() => {
  'use strict';

  const form = document.querySelector('#decoder-form');
  const source = document.querySelector('#source-text');
  const style = document.querySelector('#code-style');
  const salad = document.querySelector('#salad-level');
  const count = document.querySelector('#character-count');
  const output = document.querySelector('#result-output');
  const title = document.querySelector('#result-title');
  const comment = document.querySelector('#gehu-comment');
  const decodeButton = document.querySelector('#decode-button');
  const clearButton = document.querySelector('#clear-button');
  const copyButton = document.querySelector('#copy-button');
  const previewButton = document.querySelector('#preview-button');
  const shirtPrint = document.querySelector('#shirt-print');

  const gehuComments = [
    'Interesting. That was almost exactly what I expected.',
    'One moment. I wrote the explanation on a sticky note somewhere.',
    'Compilation complete. Coffee location still unknown.',
    'Excellent. Three new questions have appeared.',
    'I did not lose the answer. I temporarily misplaced the question.',
    'Curiosity level stable. Bow tie alignment questionable.'
  ];

  const saladBits = {
    light: ['*', '42', '{}', 'π'],
    house: ['*', '42', '{}', 'π', '!=', '&&', '0x', 'Σ', 'λ'],
    everything: ['*', '42', '{}', 'π', '!=', '&&', '0xDEADBEEF', 'Σ', 'λ', '∞', '</>', '404', '1337']
  };

  const errorCodes = [
    ['404', 'Coffee Not Found'],
    ['418', 'Tea Mode Activated'],
    ['429', 'Too Many Ideas'],
    ['1337', 'Nerd Level Increasing'],
    ['9001', 'Curiosity Overflow'],
    ['0xDEADBEEF', 'Experimental Results Pending']
  ];

  const floatingSymbols = ['*', '0', '1', 'π', 'Σ', 'λ', '∞', '!=', '&&', '{}', '<>', '[]', '()', '</>', '42', '404', '1337', '0x'];

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function toLeet(value) {
    const map = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', g: '6', b: '8' };
    return [...value].map(char => map[char.toLowerCase()] ?? char).join('');
  }

  function toBinary(value) {
    return [...value].map(char => char.codePointAt(0).toString(2).padStart(8, '0')).join(' ');
  }

  function toHex(value) {
    return [...value].map(char => char.codePointAt(0).toString(16).padStart(2, '0')).join(' ');
  }

  function toMorse(value) {
    const map = {
      a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---',
      k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-',
      u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', '0': '-----', '1': '.----', '2': '..---',
      '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };
    return value.toLowerCase().split(' ').map(word => [...word].map(char => map[char] ?? char).join(' ')).join(' / ');
  }

  function encode(value, mode) {
    switch (mode) {
      case 'binary': return toBinary(value);
      case 'hex': return toHex(value);
      case 'morse': return toMorse(value);
      case 'base64': return btoa(unescape(encodeURIComponent(value)));
      case 'reverse': return [...value].reverse().join('');
      default: return toLeet(value);
    }
  }

  function decode(value, mode) {
    try {
      switch (mode) {
        case 'binary': return value.trim().split(/\s+/).map(byte => String.fromCodePoint(parseInt(byte, 2))).join('');
        case 'hex': return value.trim().split(/\s+/).map(byte => String.fromCodePoint(parseInt(byte, 16))).join('');
        case 'base64': return decodeURIComponent(escape(atob(value.trim())));
        case 'reverse': return [...value].reverse().join('');
        default: return 'GEHU can reliably decode Binary, Hexadecimal, Base64, and Reverse Text in this prototype.';
      }
    } catch (error) {
      return 'Decoder hiccup: the transmission does not match the selected code style.';
    }
  }

  function addSalad(value, level) {
    if (level === 'off') return value;
    const bits = saladBits[level] || saladBits.light;
    const amount = level === 'light' ? 2 : level === 'house' ? 4 : 7;
    const garnish = Array.from({ length: amount }, () => randomItem(bits));
    return `${garnish.slice(0, Math.ceil(amount / 2)).join(' ')}  ${value}  ${garnish.slice(Math.ceil(amount / 2)).join(' ')}`;
  }

  function setResult(value, heading = 'Compilation complete') {
    output.textContent = value;
    title.textContent = heading;
    comment.textContent = randomItem(gehuComments);
  }

  source?.addEventListener('input', () => {
    count.textContent = String(source.value.length);
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const raw = source.value.trim();
    if (!raw) return;
    const compiled = addSalad(encode(raw, style.value), salad.value);
    setResult(compiled);
  });

  decodeButton?.addEventListener('click', () => {
    const raw = source.value.trim();
    if (!raw) return;
    setResult(decode(raw, style.value), 'Decoded transmission');
  });

  clearButton?.addEventListener('click', () => {
    source.value = '';
    count.textContent = '0';
    output.textContent = 'Type something and press Compile.';
    title.textContent = 'Awaiting transmission...';
    comment.textContent = 'Warning: this laboratory may contain traces of binary.';
    shirtPrint.textContent = 'YOUR IDEA';
    source.focus();
  });

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy Result'; }, 1400);
    } catch (error) {
      comment.textContent = 'Clipboard temporarily hiding behind the keyboard.';
    }
  });

  previewButton?.addEventListener('click', () => {
    const result = output.textContent.trim();
    if (!result || result === 'Type something and press Compile.') return;
    shirtPrint.textContent = result.slice(0, 90);
    document.querySelector('#forge')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function buildAmbientLab() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const field = document.createElement('div');
    field.className = 'gehu-code-field';
    field.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 28; index += 1) {
      const symbol = document.createElement('span');
      symbol.textContent = randomItem(floatingSymbols);
      symbol.style.setProperty('--x', `${Math.random() * 100}%`);
      symbol.style.setProperty('--delay', `${-Math.random() * 24}s`);
      symbol.style.setProperty('--duration', `${16 + Math.random() * 20}s`);
      symbol.style.setProperty('--size', `${0.7 + Math.random() * 1.1}rem`);
      field.appendChild(symbol);
    }

    document.body.prepend(field);
  }

  function buildErrorCode() {
    const [code, message] = randomItem(errorCodes);
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'wandering-error';
    badge.innerHTML = `<strong>${code}</strong><span>${message}</span>`;
    badge.setAttribute('aria-label', `${code}: ${message}`);
    badge.addEventListener('click', () => {
      badge.classList.toggle('expanded');
      comment.textContent = `${code}: ${message}. GEHU says this is probably educational.`;
    });
    document.querySelector('.gehu-hero')?.appendChild(badge);
  }

  buildAmbientLab();
  buildErrorCode();
})();
