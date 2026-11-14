# RNG Engine

**The first game engine built on chance instead of certainty.**

Every engine you've ever used assumes determinism: same input, same output, forever. RNG Engine flips that. True randomness, with no seeds and no rewind, is the ground everything stands on. Nothing happens the same way twice, and that's the point.

---

## The Inverted Stack

Traditional engines treat randomness as a feature you call. Here it's the floor. Six layers, built bottom-up, each inheriting chance from the one beneath it.

### 1. Substrate
Memory, math, and the clock itself are non-deterministic. Time doesn't tick; it rolls. This is the core assumption every other engine gets "right," and the one we replace.

### 2. Simulation
Physics, AI, and anything that ticks forward. Outcomes fork. Throw the same rock twice and you get two histories. Real physics, never replayed.

### 3. Representation
Rendering and audio. A texture loads differently each time, a sound never plays the same. What you see is a moment, not a copy.

### 4. Structure
Scene graph, entities, relations. Sameness is inverted: no two instances are identical by default. Identity is earned, not assumed.

### 5. Behavior
Scripting and logic. Rules bend under probability. Code describes tendencies, and the world decides.

### 6. Social
Networking, persistence, player-to-player and player-to-world connections. Shared reality, built from rolls nobody can predict or rewind.

---

## The Economy Layer

On top of the stack sits the economy: **people pay to generate.**

- **Generate and record.** AI creates assets, and the engine records them permanently into the universe. Base storage is paid for.
- **Subscription.** Around **$15/month**, including generation credits.
- **Price the verb, not the object.** You pay to *create*, not to *own*. No hoarding, no reselling, no speculation on items.
- **Tiered verbs.**
  - **Small:** props and objects. Cheap.
  - **Mid:** characters and vehicles.
  - **Large:** whole regions or rule changes. Expensive, and meant to be.

The cost is the filter. It keeps the universe from becoming a junk drawer of 18 trillion low-quality things, and it makes rare finds actually rare.

---

## The Vision

A randomly generated universe where anything someone can imagine can be real, with real physics. Spaceships. Flying surfboards. Whatever you can name, the world can hold it and it behaves like it belongs there.

Not infinite noise. Infinite *meaning*, because every thing in it cost someone something to bring into being.

---

## The Standard

The bar is simple: **ship one full game on it.**

The method: reverse-engineer Unreal Engine down to its single core assumption, determinism. Tear that out. Replace it with true RNG. Then rebuild every feature on top, layer by layer, until nothing is missing and nothing is the same.

---

*Status: concept and architecture. Built by Charles Anthony Leone.*
