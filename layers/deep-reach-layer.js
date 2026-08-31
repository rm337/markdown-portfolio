/*
 * Deep Reach Layer
 * Inkspirations Studios / Potato Chip Machine brain layer
 *
 * Purpose:
 *   Take a word or phrase and deliberately search for alternate interpretations,
 *   semantic trapdoors, capitalization shifts, sound-adjacent possibilities,
 *   hidden words, idiomatic readings, category jumps, and recursively expandable
 *   branches. This file is intentionally standalone and does not modify any UI.
 *
 * Usage in a browser:
 *   const result = window.DeepReachLayer.run("manufacture polish");
 *
 * Usage as an ES/CommonJS-style module can be added later when the host machine
 * architecture is finalized. For now it exposes a safe browser global.
 */

(function (global) {
  "use strict";

  const DEFAULTS = {
    maxDepth: 4,
    maxBranches: 80,
    minScore: 0.25,
    includeObvious: true,
    dedupe: true
  };

  const SEMANTIC_TRAPDOORS = {
    polish: [
      { value: "make shiny", type: "meaning", score: 0.72 },
      { value: "refine", type: "meaning", score: 0.68 },
      { value: "Polish", type: "capitalization", score: 0.96 },
      { value: "Poland", type: "place", score: 0.9 },
      { value: "kielbasa", type: "culture", score: 0.94 }
    ],
    chip: [
      { value: "potato chip", type: "meaning", score: 0.9 },
      { value: "computer chip", type: "meaning", score: 0.88 },
      { value: "poker chip", type: "meaning", score: 0.78 },
      { value: "chip away", type: "idiom", score: 0.72 },
      { value: "chip on your shoulder", type: "idiom", score: 0.7 }
    ],
    link: [
      { value: "connection", type: "meaning", score: 0.84 },
      { value: "chain link", type: "meaning", score: 0.78 },
      { value: "hyperlink", type: "technology", score: 0.86 },
      { value: "LinkedIn", type: "brand-language", score: 0.8 },
      { value: "missing link", type: "idiom", score: 0.76 }
    ],
    current: [
      { value: "electric current", type: "meaning", score: 0.84 },
      { value: "ocean current", type: "meaning", score: 0.84 },
      { value: "current events", type: "meaning", score: 0.8 },
      { value: "up to date", type: "meaning", score: 0.72 }
    ],
    draft: [
      { value: "rough version", type: "meaning", score: 0.82 },
      { value: "air current", type: "meaning", score: 0.8 },
      { value: "beer on tap", type: "meaning", score: 0.7 },
      { value: "sports selection", type: "meaning", score: 0.72 }
    ]
  };

  const PHRASE_TRAPDOORS = [
    {
      match: /\bmanufacture\s+polish\b/i,
      branches: [
        { value: "manufacture Polish", type: "capitalization", score: 1 },
        { value: "Polish manufacturing", type: "reframe", score: 0.96 },
        { value: "Poland", type: "place", score: 0.92 },
        { value: "kielbasa", type: "culture", score: 0.98 },
        { value: "sausage factory", type: "category-jump", score: 0.9 }
      ]
    }
  ];

  const HIDDEN_WORDS = [
    "art", "ink", "link", "chip", "cat", "hat", "code", "idea", "red",
    "blue", "tone", "type", "brand", "word", "work", "play", "AI"
  ];

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeKey(value) {
    return normalizeText(value).toLowerCase();
  }

  function tokenize(value) {
    return normalizeText(value)
      .split(/\s+/)
      .map(word => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
      .filter(Boolean);
  }

  function titleCase(word) {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function clampScore(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return 0.5;
    return Math.max(0, Math.min(1, n));
  }

  function makeBranch(source, value, type, score, depth, reason) {
    return {
      source,
      value: normalizeText(value),
      type: type || "association",
      score: clampScore(score),
      depth: Number.isFinite(depth) ? depth : 1,
      reason: reason || ""
    };
  }

  function capitalizationBranches(input, depth) {
    const branches = [];
    const words = tokenize(input);

    for (const word of words) {
      const variants = [word.toLowerCase(), word.toUpperCase(), titleCase(word)];
      for (const variant of variants) {
        if (variant !== word) {
          branches.push(
            makeBranch(word, variant, "capitalization", 0.45, depth,
              "A capitalization change may change identity, proper-noun meaning, or cultural context.")
          );
        }
      }
    }

    return branches;
  }

  function semanticBranches(input, depth) {
    const branches = [];
    const words = tokenize(input);

    for (const word of words) {
      const key = word.toLowerCase();
      const entries = SEMANTIC_TRAPDOORS[key] || [];
      for (const entry of entries) {
        branches.push(
          makeBranch(word, entry.value, entry.type, entry.score, depth,
            `Alternate reading of “${word}”.`)
        );
      }
    }

    return branches;
  }

  function phraseBranches(input, depth) {
    const branches = [];
    for (const trapdoor of PHRASE_TRAPDOORS) {
      if (!trapdoor.match.test(input)) continue;
      for (const entry of trapdoor.branches) {
        branches.push(
          makeBranch(input, entry.value, entry.type, entry.score, depth,
            "Phrase-level semantic trapdoor.")
        );
      }
    }
    return branches;
  }

  function hiddenWordBranches(input, depth) {
    const compact = normalizeKey(input).replace(/[^a-z0-9]/g, "");
    const branches = [];

    for (const candidate of HIDDEN_WORDS) {
      const needle = candidate.toLowerCase();
      if (needle.length < 2) continue;
      if (compact.includes(needle) && compact !== needle) {
        branches.push(
          makeBranch(input, candidate, "hidden-word", 0.48, depth,
            `“${candidate}” appears inside the input when spacing and punctuation are ignored.`)
        );
      }
    }

    return branches;
  }

  function fragmentBranches(input, depth) {
    const branches = [];
    const words = tokenize(input);

    for (const word of words) {
      if (word.length < 5) continue;

      const left = word.slice(0, Math.ceil(word.length / 2));
      const right = word.slice(Math.floor(word.length / 2));

      branches.push(makeBranch(word, left, "fragment", 0.3, depth,
        "Front fragment that may seed a new sound or meaning branch."));
      branches.push(makeBranch(word, right, "fragment", 0.3, depth,
        "Back fragment that may seed a new sound or meaning branch."));
    }

    return branches;
  }

  function literalizationBranches(input, depth) {
    const lower = normalizeKey(input);
    const branches = [];

    const patterns = [
      ["break a leg", "physically broken leg", "literalization"],
      ["cold call", "a phone call that is literally cold", "literalization"],
      ["brand voice", "a brand that literally speaks", "literalization"],
      ["word of mouth", "a word physically coming out of a mouth", "literalization"],
      ["social feed", "feeding social media", "literalization"]
    ];

    for (const [phrase, value, type] of patterns) {
      if (lower.includes(phrase)) {
        branches.push(makeBranch(input, value, type, 0.72, depth,
          "Turn a figurative phrase into a literal scene or object."));
      }
    }

    return branches;
  }

  function generateBranches(input, depth) {
    return [
      ...phraseBranches(input, depth),
      ...semanticBranches(input, depth),
      ...capitalizationBranches(input, depth),
      ...hiddenWordBranches(input, depth),
      ...fragmentBranches(input, depth),
      ...literalizationBranches(input, depth)
    ];
  }

  function dedupeBranches(branches) {
    const seen = new Map();

    for (const branch of branches) {
      const key = `${normalizeKey(branch.value)}|${branch.type}`;
      const existing = seen.get(key);
      if (!existing || branch.score > existing.score) seen.set(key, branch);
    }

    return Array.from(seen.values());
  }

  function rankBranches(branches) {
    return branches.slice().sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.value.localeCompare(b.value);
    });
  }

  function run(input, options) {
    const seed = normalizeText(input);
    const config = Object.assign({}, DEFAULTS, options || {});

    if (!seed) {
      return {
        input: "",
        branches: [],
        best: [],
        graph: [],
        stats: { generated: 0, kept: 0, depthReached: 0 }
      };
    }

    const all = [];
    const queue = [{ value: seed, depth: 0 }];
    const expanded = new Set();
    const graph = [];
    let depthReached = 0;

    while (queue.length && all.length < config.maxBranches) {
      const current = queue.shift();
      const currentKey = normalizeKey(current.value);

      if (!currentKey || expanded.has(currentKey)) continue;
      expanded.add(currentKey);
      depthReached = Math.max(depthReached, current.depth);

      if (current.depth >= config.maxDepth) continue;

      const nextDepth = current.depth + 1;
      let generated = generateBranches(current.value, nextDepth)
        .filter(branch => branch.value && normalizeKey(branch.value) !== currentKey)
        .filter(branch => config.includeObvious || branch.score >= 0.5);

      generated = config.dedupe ? dedupeBranches(generated) : generated;

      for (const branch of generated) {
        if (branch.score < config.minScore) continue;
        if (all.length >= config.maxBranches) break;

        all.push(branch);
        graph.push({
          from: current.value,
          to: branch.value,
          type: branch.type,
          score: branch.score,
          depth: branch.depth
        });

        const branchKey = normalizeKey(branch.value);
        if (!expanded.has(branchKey) && branch.depth < config.maxDepth) {
          queue.push({ value: branch.value, depth: branch.depth });
        }
      }
    }

    const branches = rankBranches(config.dedupe ? dedupeBranches(all) : all);

    return {
      input: seed,
      branches,
      best: branches.slice(0, 12),
      graph,
      stats: {
        generated: all.length,
        kept: branches.length,
        depthReached
      }
    };
  }

  function addTrapdoor(word, entries) {
    const key = normalizeKey(word);
    if (!key) return false;

    const incoming = Array.isArray(entries) ? entries : [entries];
    const normalized = incoming
      .filter(Boolean)
      .map(entry => {
        if (typeof entry === "string") {
          return { value: entry, type: "association", score: 0.7 };
        }
        return {
          value: normalizeText(entry.value),
          type: entry.type || "association",
          score: clampScore(entry.score == null ? 0.7 : entry.score)
        };
      })
      .filter(entry => entry.value);

    if (!SEMANTIC_TRAPDOORS[key]) SEMANTIC_TRAPDOORS[key] = [];
    SEMANTIC_TRAPDOORS[key].push(...normalized);
    return true;
  }

  function addPhraseTrapdoor(pattern, entries) {
    if (!(pattern instanceof RegExp)) return false;
    const incoming = Array.isArray(entries) ? entries : [entries];
    const branches = incoming
      .filter(Boolean)
      .map(entry => typeof entry === "string"
        ? { value: entry, type: "association", score: 0.7 }
        : {
            value: normalizeText(entry.value),
            type: entry.type || "association",
            score: clampScore(entry.score == null ? 0.7 : entry.score)
          })
      .filter(entry => entry.value);

    PHRASE_TRAPDOORS.push({ match: pattern, branches });
    return true;
  }

  const api = Object.freeze({
    run,
    addTrapdoor,
    addPhraseTrapdoor,
    defaults: Object.freeze(Object.assign({}, DEFAULTS)),
    version: "1.0.0"
  });

  global.DeepReachLayer = api;
})(typeof window !== "undefined" ? window : globalThis);
