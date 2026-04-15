# TST Build Daemon — Builder Hints

## Cycle 1 Learnings
- Using Oswald font-display for player names is a massive visual upgrade — applied across all 3 directions now
- Team-color ambient glow behind hero creates emotional depth without adding clutter
- Game context line adds emotional weight cheaply
- CTA glow that intensifies with urgency phase works well for Supreme
- Remote was SSH with denied deploy key — switched to HTTPS

## Cycle 2 Learnings
- Upstream changes can happen — always pull before starting a cycle
- API changed: getSaleEndsAt → SALE_DURATION_MS, useCountdown takes duration, added playerImageUrl/actionImageUrl
- Broadcast's left-edge accent line + animated lower-third creates genuine ESPN broadcast energy
- Staggered entrance on certificate makes W screen more theatrical
- playerImageUrl is now available — use it for hero backgrounds

## Cycle 3 Learnings
- Moving inline `style jsx global` to globals.css is cleaner and more reliable in App Router
- Arena already had the most features — needed polish more than new features
- "OWN THIS MOMENT" CTA copy aligns with research insight #6 (endowment effect)
- After 3 foundation cycles, Supreme is weakest at 4.83 (Interaction 3.5, Emotion 4.0)
- Supreme needs the most work in Cycles 4-6 POLISH phase — the button micro-interactions and emotional context are lacking
- All three directions now share Oswald for player names — maintains brand consistency while each direction styles it differently

## Cycle 4 Learnings
- Spring cubic-bezier (0.34, 1.56, 0.64, 1) on button gives excellent tactile feel on mobile
- Staggered entrance animations (hero → info → button → social) create a natural reading flow
- Box-shadow on the CTA button adds depth perception — makes it feel clickable
- The W screen benefits from 2-phase reveal: flash+W first, then details 500ms later — builds drama
- Pre-existing build errors in other directions (broadcast StatBreakdown) should be fixed immediately rather than ignored
- `animate-glow-breathe` applied to the ambient glow behind the button makes it feel alive without being distracting

## Cycle 5 Learnings
- Drop cap with Oswald font instantly makes narrative feel like a premium magazine article
- Hero progress bar using team-color gradient (primary → secondary) adds broadcast energy
- Tier card top-accent line (2px) on selection gives clear visual hierarchy without being heavy
- CTA hover fill (rgba team-color) creates depth — button feels like it's activating
- StatBreakdown cards with staggered fly-in animation are high-impact, low-effort
- Broadcast direction benefits most from editorial/typography refinements — it's already cinematic

## Cycle 7 Learnings
- Triple urgency stack = time + supply + competition. Supreme implements all 3 minimally: thin bar, live counter, name ticker
- `useClaimTicker` hook simulates live edition claiming — reusable for other directions but should feel different in each
- Scarcity labels ("Almost gone" / "Going fast") change based on remaining count thresholds — cheap emotional leverage
- The urgency bar at top is only 2px but creates powerful visual tension when it glows in CRITICAL phase
- Claim ticker key includes Date.now() to force re-render animation — needed for repeated same-name claims

## Cycle 8 Learnings
- Editorial urgency (narrated, not raw numbers) fits Broadcast perfectly — "FINAL MINUTES" feels like ESPN breaking news
- Georgia italic for supply narrative adds editorial gravitas vs plain sans-serif
- `useRecentCollectors` hook simulates competition — simple but effective
- The urgency banner uses max-height animation for smooth reveal without layout shift
- Supply narrative changes at 60%/80%/95% thresholds — each level adds more pressure

## Cycle 9 Learnings
- SVG sparkline is lightweight and high-impact — shows velocity trend visually
- City-based social proof ("Sarah K. from Miami") adds geographical reality to claiming
- PanicBanner reuses existing urgency-pulse-fast animation — no new CSS needed
- Arena is the most feature-dense — be careful about adding MORE features vs polishing existing ones
- Arena's weakness is now Visual polish (6.5) — it has lots of features but could be more refined

## Strategic Notes
- URGENCY phase complete (cycles 7-9). All 3 directions have triple urgency stack.
- Cycles 10-12 = W SCREEN. Post-purchase confirmation = viral engine. SNKRS "Got 'Em" is benchmark.
- Interaction scores are the weakest across all 3 (4.5-5.5) — W screen improvements should fix this
- Broadcast W screen (Certificate) needs the most work — currently the weakest (4.5 interaction)
- Supreme W screen has confetti + staggered reveal, Arena has celebration + feed. Broadcast is static.
- Arena slightly weakest overall (6.30) — but can't repeat, so Supreme gets Cycle 10

## Cycle 10 Learnings
- Confetti was anti-Supreme. Radial burst rings (expanding circle of light) are much more on-brand — clean, dramatic, one motion.
- Action image at 10% opacity with vignette > headshot at 6% — adds visual richness without clutter.
- "YOURS." is better than "You own this moment" for Supreme's minimal philosophy — one word, period, done.
- Date stamp (font-mono, uppercase month) makes screenshots feel permanent — collectors want proof of when.
- Serial number as inline `#N / 5,000` with thin underline feels more luxury than bordered card.
- The tag v0.10 was already used — daemon must check existing tags or increment from last known.
- W screen phase is high-impact: Emotion +1.5, Interaction +1.0. Confirms cycle-log prediction.

## Cycle 11 Learnings
- 4-phase staggered reveal (hero→details→cert→share) is much more cinematic than single fade-in. Interaction jumped from 4.5 → 6.5.
- Hero action image at 12% opacity with team-color radial wash creates cinematic atmosphere.
- "COLLECTED" in Oswald with team-color accents feels like ESPN breaking news — perfect for Broadcast.
- Certificate card benefits from backdrop-blur + team-color top accent — museum-grade feel.
- Removed QR placeholder — it was filler, not value. The date stamp + blockchain verification line is cleaner.
- Broadcast W screen was the weakest (4.5 interaction) — now 6.5. W screen phase delivering as expected.

## Cycle 12 Learnings
- Screen shake (arena-rumble) on entry is visceral and 100% Arena. Simple CSS keyframes, huge impact.
- Action image backdrop at 6% opacity gives jumbotron depth without competing with text.
- "Top X% speed" competition stat creates social comparison even post-purchase — fits Arena's social urgency.
- YOUR purchase highlighted in feed (team-color border, "YOU just claimed") connects the W to the live commerce energy.
- Pulsing edition number glow (arena-edition-pulse) makes the number feel alive, like a jumbotron stat.
- All 3 W screens now have 4-phase staggered reveals — this pattern delivers consistently.
- W SCREEN phase complete. Interaction scores jumped significantly: Supreme 5.0→6.0, Broadcast 4.5→6.5, Arena 5.5→7.0.
- Cycles 13-15 = RARITY TIERS. Supreme needs rarity display. Broadcast has tier cards. Arena has RarityCards.
- Supreme has NO rarity tier UI at all yet — it only shows the Open tier price. Needs the most work in rarity.
- Broadcast already has TierCard component with team-color accents. Needs refinement, not rebuild.
- Arena already has RarityCards (premium tiers). Could add more energy/urgency to low-remaining tiers.

## Cycle 13 Learnings (retroactive)
- Supreme's rarity tier selector is minimal by design — horizontal picker with underline, no cards. Fits Supreme philosophy perfectly.
- Dynamic CTA price ("OWN THIS MOMENT — $99") is essential — the price must update when tier changes.
- Small delta (+0.15) because rarity selector was the expected missing piece, not a visual leap.

## Cycle 14 Learnings
- Editorial taglines per tier ("Collector Edition", "Museum Edition", "Vault Reserve") add prestige without clutter — very Broadcast.
- Diamond icons as visual hierarchy (0/1/2/3 per tier) is a cheap but effective rarity signal.
- "X of Y" format ("14 of 25") feels more prestige than "14 left" — gives context of total scarcity.
- Shimmer effect on premium tier cards (Legendary/Ultimate) when selected adds luxury feel — CSS-only, no JS.
- Low-stock amber pulse on ≤5 remaining creates urgency without being garish.
- Tier tagline in the W certificate adds editorial depth to the confirmation screen.
- Removed dead QRPlaceholder component — clean up unused code as you find it.
- Broadcast Visual jumped from 8.0→8.5 — editorial details compound. Purity also up (8.0→8.5) because prestige auction is core Broadcast identity.

## Cycle 15 Learnings
- Arena RarityCards were display-only — not selectable, CTA showed `moment.price` instead of selected tier price. Critical UX bug.
- Moving tiers ABOVE the CTA (instead of below) gives better flow: see options → select → buy. Reduces cognitive load.
- Tier-specific colors (Open=teal, Rare=blue, Legendary=purple, Ultimate=amber) create instant visual hierarchy — no labels needed.
- All 4 tiers visible (including Open) is better than hiding Open — user sees the full price range and feels the relative value.
- Low-stock pulse (`arena-tier-urgent`) on premium tiers with ≤5 remaining creates auction urgency — very Arena.
- Arena's Interaction score jumped 7.0→7.5 — the selectable tiers + dynamic CTA was the missing piece.

## Strategic Notes — Post Rarity Phase
- RARITY TIERS phase complete (cycles 13-15). All 3 have selectable tier systems.
- Supreme weakest at 7.15 — Interaction (6.5) is the drag. The tier selector works but the overall flow could be tighter.
- Broadcast leads at 7.55 — editorial prestige identity is cohering well.
- Cycles 16-18 = STATE TRANSITIONS. Pre-drop → Live drop → Closing → Sold out → Post-window.
- Each state should feel designed, not just toggled. This is about the full lifecycle of a drop.
- Supreme already has phase-based urgency (OPEN/CLOSING/CRITICAL/ENDED). Need to make each feel more distinct visually.
- Broadcast has urgency banner for CLOSING/CRITICAL. Needs pre-drop and sold-out states.
- Arena has PanicBanner for closing. Needs pre-drop hype and sold-out finality.

## Cycle 16 Learnings
- Phase labels ("Live now" / "Closing soon" / "Final seconds" / "Drop closed") cost almost nothing to add but make state changes much more legible.
- Critical vignette (red box-shadow inset, pulsing) makes the entire viewport feel urgent without adding new elements — very Supreme.
- Hero desaturation on ENDED (grayscale 0.7 + brightness 0.6) makes the page feel definitively over. No ambiguity.
- Timer growing from 28px to 32px in CRITICAL draws the eye naturally. Size = attention.
- ENDED social proof switches from claim ticker to "X editions collected" — past tense signals finality.
- All these transitions use CSS `transition-all duration-500/1000` — smooth, no jarring state flips.
- Supreme Purity jumped to 8.5 — all changes were minimal (a label, a vignette, a filter). That's the Supreme way.

## Cycle 18 Learnings
- Arena state transitions reuse the same pattern as Supreme/Broadcast (phase labels, vignette, hero desat) but each feels distinct because of direction-specific styling.
- CTA morphing through 4 copy states (OWN → GOING FAST → LAST CHANCE → DROP CLOSED) creates natural urgency escalation.
- Hiding the LiveFeed on ended creates a sudden silence effect — the "crowd leaving the arena" feeling. Very Arena.
- Stats bar ended state: changing "Claimed" → "Collected" (past tense), velocity to "—", progress bar to gray. Small changes, clear finality.
- Background gradient pulse stopping on ended reinforces the "lights off" feeling.
- Arena-critical-vignette at 1.2s is faster than Supreme's 1.5s — Arena should feel more frantic.
- All 3 Purity scores now at 8.5 — state transitions were an opportunity to reinforce each direction's identity.

## Cycle 64 Learnings
- Score bug is one of the highest-ROI broadcast elements — small, instantly recognizable, minimal code.
- Per-moment plausible scores (home team winning) reinforce the emotional narrative of the moment.
- The team-color accent dot on the home team row + dimmed opponent is how real ESPN score bugs work — visual hierarchy through opacity, not size.
- Fixed positioning at top-left avoids conflict with network bug (top-right) and ticker (top edge scroll).
- Slide-in delay of 1.2s lets the page load and ticker start first — staggered reveal feels more broadcast.
- Broadcast page now has 5 distinct broadcast UI layers: ticker, network bug, score bug, replay tag, lower-third. The metaphor is complete.
- Next cycle: Arena (rotation). Consider what Arena atmospheric element hasn't been explored yet.

## Cycle 65 Learnings
- Crowd wave is a vertical complement to the spotlight sweep (horizontal) — two cross-axis light movements create rich arena atmosphere.
- 8s cycle is slow enough to be subliminal but fast enough to be noticeable over a page visit.
- The gradient band with soft edges (transparent→6%→10%→6%→transparent) looks like real arena lighting, not a hard bar.
- z-6 puts it above background gradients but below everything else — it affects the feel without interfering with content.
- Arena now has 4 ambient atmospheric layers: bg pulse, spotlight sweep, crowd wave, LED flash. Each on a different axis/timing.

## Strategic Notes — Post State Transitions Phase
- STATE TRANSITIONS phase complete (cycles 16-18). All 3 have full lifecycle.
- Entering REFINEMENT phase (cycles 19+). Agent picks weakest dimension.
- Supreme weakest at 7.58 — Conversion (7.0) and Interaction (7.0) are the drag.
- Broadcast leads at 7.80 — strongest Emotion (8.0) and Visual (8.5).
- Arena at 7.78 — highest Conversion (7.5) and Interaction (7.5) across all 3.
- Weakest dimensions across all: Conversion (7.0-7.5) and Interaction (7.0-7.5).
- Next cycle: Supreme (weakest overall). Focus on Conversion or Interaction.

## Cycle 19 Learnings
- CTA copy phases add urgency for free: "OWN THIS MOMENT" → "CLOSING SOON" → "LAST CHANCE" maps to the countdown phases.
- "Instant checkout · Stored payment" text at 10px/15% opacity is subliminal friction reduction — user sees it peripherally and feels safe clicking.
- SVG progress ring > pulsing dot for the purchasing state — feels more premium and communicates progress.
- active:scale-95 on tier selector gives mobile tap feedback with zero JS.
- Small delta (+0.20) because these are refinements, not structural changes. But Conversion and Interaction both lifted from 7.0 → 7.5.
- All 3 directions now at 7.78-7.80. Very close. Next cycle should target whichever is NOT Supreme (can't repeat).
- Broadcast next (7.80 but Conversion still 7.0 — lowest across all 3).

## Cycle 21 Learnings
- Multi-stage purchase progress (Reserving → Processing → Secured!) with a filling progress bar inside the button is far better than a generic spinner — deterministic-feeling progress feels faster.
- Active buyer badge ("X buying this tier now") with ping animation adds live commerce urgency right at the point of decision — very Arena.
- "Instant checkout · 1-tap purchase" at low opacity (15%) is subliminal friction reduction, consistent with Supreme's approach.
- Progress bar inside the CTA button (absolute positioned, 30% opacity fill) creates a "racing" feel without adding extra UI elements.
- All 3 directions now have stored-payment indicators and urgency CTA copy phases — conversion toolkit is standardized.
- Conversion jumped 7.5→8.0, Interaction jumped 7.5→8.0. The purchase flow stages were the key lift.

## Strategic Notes — Post Refinement Round 1
- REFINEMENT round 1 complete. All 3 got conversion lift improvements.
- Supreme weakest at 7.78 — Interaction (7.5) is the drag. Visual (8.0) also trails Broadcast's 8.5.
- Broadcast leads at 8.00 — but Interaction (7.0) is the weakest dimension across ALL directions.
- Arena at 7.98 — strongest Conversion (8.0) and tied for best Interaction (8.0).
- Next cycle: Supreme (weakest overall, and hasn't been touched since cycle 19). Focus on Interaction or Visual.
- Broadcast Interaction (7.0) is the single weakest dimension — cycle 23 should target that aggressively.

## Cycle 22 Learnings
- Deterministic progress ring (strokeDashoffset filling in stages) is far more Supreme than a spinner — controlled, confident, no noise.
- "Yours." as the final purchase stage word is peak Supreme minimalism — one word, period. The user knows it worked.
- Removing the shrink animation was the right call — it made the button feel like it was failing, not succeeding.
- Glow intensification during purchase (30→50 shadow spread) subtly communicates "something is happening" without animation.
- Small delta (+0.15) because Supreme's purchase flow was already decent — these are refinements, not structural.
- Purity jumped to 9.0 — the deterministic ring + "Yours." are deeply on-brand for Supreme's confident minimalism.
- Next: Broadcast (cycle 23). Interaction (7.0) is the weakest dimension across ALL directions. The purchase flow needs work — it should feel cinematic/editorial, not generic.

## Cycle 23 Learnings
- Georgia italic for purchase stage copy ("Reserving your edition...") adds editorial gravitas — consistent with Broadcast's magazine/prestige identity.
- Lower-third progress wipe (team-color fill left-to-right inside button, with a leading edge border) is a broadcast-native pattern. Feels like a scorebar filling.
- "Authenticating ownership..." is prestige language (Sotheby's, Christie's) vs generic "Processing..." — small copy change, big identity lift.
- Purity jumped to 9.0 — all 3 directions now have purchase flows that feel true to their identity.
- Small delta (+0.08) — Interaction improved from 7.0→7.5 but Broadcast still has the weakest Interaction across all 3.
- Broadcast Interaction needs more work: the W screen transitions could be tighter, and the browsing flow scroll experience could be smoother.
- All 3 directions now have multi-stage purchase flows. The standardized pattern works differently in each: Supreme (deterministic ring + "Yours."), Broadcast (lower-third wipe + "Acquired."), Arena (progress bar + "SECURED!").
- Next cycle: Supreme (weakest at 7.93). Broadcast Interaction still needs attention in cycle 26.

## Cycle 24 Learnings
- Crowd reaction emoji bursts (4-8 floating emojis per purchase) create immediate arena crowd energy — the page feels ALIVE, not just informational.
- "Moment of the Night" badge with team-color styling frames the play as historically significant before the user reads any stats — emotional priming.
- Enhanced context line (text-sm instead of text-xs, white/50 instead of white/30) is a cheap but meaningful lift — the story was there but invisible.
- "Trending #1 on Top Shot This" with pulsing dot adds social proof of the moment's importance — FOMO for the moment itself, not just the purchase.
- Emotion delta was +0.5 (7.5→8.0) — these were all cheap, high-impact changes. Emotional framing is underinvested across all directions.
- Small overall delta (+0.10) because only Emotion moved. Next cycle should target Supreme Emotion or Conversion for bigger compound lift.
- Arena's CrowdReactions component uses events.length as dependency — triggers batch on each new purchase. Memory-safe with slice(-24) cap.

## Cycle 25 Learnings
- Elevating context from text-xs/white/25 to text-sm/white/40 in its own section is a massive emotion lift with zero new content — just visibility.
- Team-color divider (1px × 8 wide) above context creates a section break that signals "this matters" in Supreme's language.
- Tier scarcity near CTA ("14 of 25 remaining") is the cheapest conversion lift — the number does the work, no extra UI needed.
- Supreme Purity stays at 9.0 because all additions are minimal: a line, a sentence, a number. The direction hasn't drifted.
- Context was always in the data (moment.context) — it was just invisible. Check all directions for hidden emotional content.
- Both Emotion and Conversion jumped 7.5→8.0 from these tiny changes. Lesson: visibility of existing content > new features.
- Next cycle: Arena (rotation completes round 3). Arena weakest at 8.08. Visual polish and Purity could use attention.

## Cycle 26 Learnings
- Sticky bottom CTA bar is the highest-impact interaction lift for long-scroll pages like Broadcast. IntersectionObserver on the main button is clean and reliable.
- The sticky bar is both Interaction AND Conversion — user can always buy regardless of scroll position. Both jumped 7.5→8.0.
- Hero scroll chevron (animate-bounce, opacity-30) is subtle enough for Broadcast's editorial tone but functional.
- safe-area-inset-bottom on sticky bars is essential for modern notch phones — one line prevents button clipping.
- Broadcast's editorial scroll model (hero → narrative → transaction) benefits from this pattern more than Supreme or Arena.
- IntersectionObserver pattern: observe the main CTA, show sticky when !isIntersecting. Simple, reliable, no scroll listeners.
- All 3 directions now have all dimensions ≥8.0. Entering polish territory — diminishing returns per cycle. Focus on the weakest direction each round.

## Cycle 27 Learnings
- Sticky CTA bar works differently for Arena than Broadcast: Arena's includes tier info + active buyers count (live commerce energy), not just a repeated button. Direction-specific adaptation matters.
- Scoreboard-style top accents (2px team-color bars) on stats cards is a cheap, high-impact visual lift — transforms generic cards into jumbotron/scoreboard panels.
- The accent color on the countdown card changes with urgency phase (teal → amber → red) — cheap extra urgency signal.
- Tighter hero badges with left-edge accent borders (instead of rounded-full pills) feel more like scoreboard ticker overlays. Very Arena.
- Arena jumped from weakest (8.08) to strongest (8.48) in one cycle — sticky CTA + visual polish was the combo. Sticky CTAs are consistently the highest-impact single change.
- All 3 directions now have sticky CTAs: Supreme doesn't need one (single-screen design), Broadcast has editorial sticky, Arena has live-commerce sticky.
- All Purity scores now at 9.0 — each direction's sticky CTA and visual treatment is distinct and on-brand.
- Next cycle: Supreme (weakest at 8.15). All dims at 8.0 except Purity 9.0. Visual and Emotion are the best targets for lift.

## Cycle 28 Learnings
- Dual-layer radial gradient (top + bottom) for team-color glow creates richer depth than a single layer — the lower glow warms the content-to-hero transition.
- Hero-to-content depth shadow (8px gradient band at hero bottom edge) is a subtle but effective depth cue — feels more premium.
- Matchup context ("MIA vs DEN") in the hero beside the play type adds temporal/emotional grounding with zero new components — just a flex row.
- Stat line team-color accent (1px × 12px) creates a visual break between hero data and the content below. Small but architecturally important.
- Info strip top border (border-t border-white/[0.04]) gives definition to the timer section — prevents it from blending into the context.
- Supreme Visual lifted 8.0→8.5 from these micro-refinements. Lesson: in Supreme's minimal language, every pixel matters more.
- Supreme Purity held at 9.0 — all additions were lines, dots, and gradients. Nothing structural. That's the Supreme way.
- Next cycle: Broadcast (rotation). Broadcast at 8.28 — Emotion (8.0) is the weakest dimension to target.

## Cycle 29 Learnings
- CSS film grain overlay using SVG feTurbulence noise + steps() animation creates broadcast-quality cinematic texture with near-zero performance cost. The mix-blend-mode: overlay keeps it subtle on dark backgrounds.
- Action image as a separate background layer (10% opacity, behind player headshot) adds cinematic depth — the hero feels like a broadcast opening shot instead of a flat headshot.
- "Play of the Game" editorial badge with team-color tint primes the user to feel significance BEFORE reading any content — emotional framing is the cheapest emotion lift.
- Pull quote was duplicating `moment.context` from the hero — wasteful. Using `historicalNote.split('.')[0]` as the pull quote with `context` as attribution creates two distinct emotional beats: the dramatic opener, then the statistical significance.
- Small delta (+0.10) because Emotion moved 8.0→8.5 but nothing else changed. Multi-dimension lifts produce bigger deltas.
- Broadcast Emotion is now 8.5, matching Supreme. All dims ≥8.0 across all directions.
- Next cycle: Arena (rotation). Arena at 8.48 — strongest overall but Emotion (8.0) is its weakest dim.

## Cycle 30 Learnings
- Action image layer works differently per direction: Broadcast uses it at 10% with cinematic grading, Arena uses it at 8% with contrast boost for jumbotron replay feel. Same technique, different identity.
- Team-color stat accent (2px vertical bar) next to stat line creates visual weight — the stat line becomes a "scoreboard stat" instead of plain text. Cheap, high-impact.
- First sentence of `historicalNote` as a hype excerpt gives Arena users quick emotional context without requiring them to read a full editorial paragraph. Arena users scan, they don't read — short punchy lines only.
- Both Broadcast and Arena got +0.10 from emotion-focused changes. Emotion lifts are smaller per-cycle than structural changes (urgency, W screen) but compound well.
- All 3 directions now have action image layers, historicalNote content in different forms, and team-color stat accents. Pattern is fully deployed.
- Supreme and Broadcast tied at 8.38, both with Conversion (8.0) and Interaction (8.0) as drags. Arena leads at 8.58.
- Next cycle: Supreme (rotation). Target Conversion or Interaction — both at 8.0.

## Cycle 31 Learnings
- Supreme's sticky CTA is just the button in a gradient fade — no extra info, no tier name, no price breakdown. That's the Supreme way. Compare to Arena's sticky (tier + active buyers + button) and Broadcast's sticky (player name + tier + button). Each is identity-correct.
- Hero blur (2px) during purchase creates a "tunnel vision" focus effect on the button — the world fades, only the transaction matters. Very Supreme's "the page IS the purchase" philosophy.
- Linear gradient background on sticky (`#0B0E14 60% → transparent`) blends seamlessly with the dark page bottom instead of using a solid bar with border. Cleaner for Supreme.
- safe-area-inset-bottom handled via `max(12px, env(...))` — ensures minimum padding even on non-notch devices.
- Supreme jumped from 8.38 to 8.58 — now tied with Arena. Sticky CTA + purchase feedback was a dual-dimension lift.
- All 3 directions now have sticky CTAs, each styled to their identity.
- Next cycle: Broadcast (rotation). Broadcast at 8.38 — weakest. Conversion (8.0) and Interaction (8.0) are the drags.

## Cycle 32 Learnings
- Sticky bar must persist during purchase state — hiding it loses feedback for scrolled users. Broadcast now shows editorial progress wipe ("Reserving..." → "Authenticating..." → "Acquired.") in the sticky bar during purchase.
- Decorative elements should be functional: the scroll chevron was animate-bounce but did nothing. Adding `scrollIntoView({ behavior: 'smooth' })` to the transaction section is a free interaction lift.
- Edition scarcity in the sticky bar (remaining count for ≤20 editions) adds conversion pressure at the exact point of purchase decision — cheap but effective.
- Broadcast's sticky bar during purchase uses shortened copy ("Reserving..." vs "Reserving your edition...") for the narrower sticky layout — adapt copy to container size.
- All 3 directions now at 8.58. Dead heat. Arena's weakest dim is... all at 8.5. Supreme and Broadcast also 8.5 across non-Purity. Entering true polish territory.
- Next cycle: Arena (rotation). All tied at 8.58 — any direction is valid, but rotation says Arena.

## Cycle 33 Learnings
- Sticky bar during purchase is now a standardized pattern across all 3 directions. Each one styles it differently: Supreme (just button + glow), Broadcast (progress wipe + editorial copy), Arena (progress bar + status + active buyers toggle).
- Team-color glow on the latest feed item (`boxShadow: 0 0 12px ${teamColor}30`) makes the newest purchase visually pop in the scrolling feed. Cheap, high-impact.
- Small delta (+0.07) — Arena was already strong. Only Interaction moved (8.5→9.0). Diminishing returns at this score level.
- Arena Interaction at 9.0 is the first non-Purity dimension to hit 9 across any direction. The live-commerce sticky with purchase feedback is what pushed it over.
- All 3 directions now show purchase progress in their sticky bars. The pattern is complete.
- Next cycle: Supreme (rotation). Supreme at 8.58 — all dims at 8.5 except Purity 9.0. Need to find what pushes Supreme to 9.0 in any dimension.

## Cycle 34 Learnings
- Action image depth layer at 5% opacity adds cinematic richness without competing with the player headshot. Supreme uses lower opacity (5%) vs Arena (8%) and Broadcast (10%) — the whisper is the Supreme way.
- historicalNote first sentence as italic text-white/20 is a powerful emotional hook that respects Supreme's minimal philosophy — it's there for those who linger, invisible at a glance.
- Share buttons with icon glyphs (𝕏, ◎, ⎘) + subtle border + team-color hover feel premium without adding weight. The border-white/[0.08] baseline is barely visible but creates structure.
- onMouseEnter/Leave for team-color hover is appropriate here — CSS :hover can't dynamically reference teamColor.
- Visual jumped 8.5→9.0 and Emotion jumped 8.5→9.0. These are the first non-Purity 9.0 scores for Supreme. Action image + historicalNote were the combo.
- Supreme is now the leader at 8.80, surpassing Arena (8.65). The subtle layers compound — Supreme's page feels genuinely premium, not just minimal.
- Next cycle: Broadcast (rotation). Broadcast at 8.58 — Visual (8.5) and Emotion (8.5) are the targets. Broadcast could use similar techniques adapted to its editorial identity.

## Cycle 35 Learnings
- Stat card top accents (2px team-color bar) transform plain boxes into broadcast scoreboard panels — same pattern used on Arena stats cards, adapted for Broadcast's editorial context.
- Team-color gradient section rule (primary→transparent left-to-right) is more refined than a solid line — feels like a broadcast segment divider.
- ShareButton upgrade with icon glyphs + team-color hover is now standardized across Supreme and Broadcast. Arena W screen could use this too.
- Visual jumped 8.5→9.0 from stat accents + section rule. Small visual details compound when the foundation is already strong.
- Broadcast Emotion (8.5) is now the weakest non-Conversion dim. Could add a more impactful emotional element — perhaps a subtle ambient video or more dramatic hero treatment.
- Next cycle: Arena (rotation). Arena at 8.65 — Visual (8.5) and Emotion (8.5) are the targets.

## Cycle 36 Learnings
- Team-color gradient rules between sections (hero→feed, hero→content) are a cheap, high-impact visual polish across all directions. All 3 now have them.
- Date stamp + matchup context on W screens is essential for screenshot permanence. Supreme and Arena now have it; Broadcast already had it via the certificate card's date field.
- Share buttons with icon glyphs (𝕏, ◎, ⎘) + team-color hover are now standardized across all 3 directions. Consistency in shared patterns, variation in direction-specific styling.
- Arena Visual jumped 8.5→9.0 and Emotion jumped 8.5→9.0 from the hero rule + W screen enrichment. These are the same patterns that worked for Supreme in cycle 34.
- All 3 directions now have Visual at 9.0. The remaining frontier is Conversion (8.5 across all 3).
- Conversion at 8.5 is the universal ceiling. To push to 9.0, need something structural: maybe Apple Pay / stored-payment simulation, or a more aggressive sticky CTA, or CTA copy A/B testing.
- Broadcast Emotion (8.5) is the single weakest non-Conversion dim. The narrative content is rich but the emotional framing could be more impactful — maybe a more dramatic pull quote treatment.
- Next cycle: Supreme (rotation). Target Conversion (8.5) — the universal ceiling.

## Cycle 37 Learnings
- Lock icon SVG on the CTA button is a cheap but powerful trust signal — the user sees "secure" at the exact moment of decision. Supreme's version uses a filled lock at 60% opacity, minimal but present.
- Animated SVG checkmark draw (stroke-dasharray/dashoffset animation, 350ms) on the "Yours." purchase stage is more satisfying than a full progress ring. The ring fills to 75% across 2 stages, then morphs to checkmark. The transition from ring to checkmark is the payoff moment.
- "Visa ··4242" in the stored-payment line makes the simulated payment feel tangible and real. Users see their "card" is ready — reduces "what happens when I tap?" anxiety.
- Supreme hit 9.0 across ALL dimensions. First direction to achieve a perfect score. The key was 3 tiny conversion micro-lifts that each addressed a different friction point: trust (lock), confidence (card), satisfaction (checkmark).
- The conversion ceiling (8.5) was broken by making the existing CTA feel more trustworthy, not by adding new UI. Lesson: conversion lifts at this score level come from friction reduction, not feature addition.
- These 3 patterns (lock icon, card hint, checkmark draw) should be adapted for Broadcast and Arena in upcoming cycles.
- Next cycle: Broadcast (rotation). Broadcast at 8.70 — weakest overall. Conversion (8.5), Emotion (8.5), Interaction (8.5) all need attention. Apply the same conversion patterns in editorial style.

## Cycle 38 Learnings
- Broadcast's checkmark draw animation uses a slower ease (0.5s vs Supreme's 0.35s) with `cubic-bezier(0.22, 1, 0.36, 1)` — more elegant, less snappy. Matches editorial tempo.
- Lock icon at 40% opacity (vs Supreme's 60%) feels more subdued and editorial — Broadcast doesn't shout, it implies.
- The checkmark on "Acquired." is paired with the progress wipe reaching 100% — two visual confirmations at once. Very satisfying.
- Broadcast Conversion and Interaction both jumped 8.5→9.0. Same pattern as Supreme, adapted for editorial identity.
- Broadcast Emotion (8.5) is now the single remaining sub-9.0 dimension. The narrative content is rich but could use a more dramatic pull quote or ambient treatment.
- The conversion pattern (lock + card + checkmark) is now proven across 2 directions. Arena next.
- Next cycle: Arena (rotation). Arena at 8.88 — Conversion (8.5) is the only sub-9.0 dimension. Apply the same pattern in live-commerce style.

## Cycle 39 Learnings
- Arena's checkmark uses the fastest, punchiest animation (0.25s with spring overshoot cubic-bezier(0.34, 1.56, 0.64, 1)) vs Broadcast's elegant 0.5s vs Supreme's clean 0.35s. Each timing matches the direction's energy level.
- Arena's checkmark uses thicker stroke (2.5 vs 2 and 1.5) — bolder, louder, more jumbotron. Direction identity extends to stroke width.
- The conversion pattern (lock + card + checkmark) is now fully deployed across all 3 directions. Each uses the same 3 elements but with identity-correct styling: Supreme (minimal/clean), Broadcast (editorial/elegant), Arena (punchy/loud).
- Arena and Supreme both at perfect 9.00. Broadcast at 8.90 — Emotion (8.5) is the sole remaining weakness.
- EXCEPTION RULE: Broadcast is 0.10 below the others — not >1.5, so no exception. But since rotation says Supreme next and Supreme is already at 9.0, the highest-value next cycle is Broadcast Emotion.
- Next cycle: Should be Supreme by rotation, but Supreme is at 9.0 across all dimensions. Consider targeting Broadcast Emotion (8.5) instead — the only sub-9.0 dimension across ALL directions.

## Cycle 40 Learnings
- Oversized decorative quotation mark (4rem, team-color at 20% opacity) transforms a plain blockquote into an ESPN-style editorial pull quote. The visual weight of the mark signals "this matters" before the reader processes the text.
- Ken Burns drift (scale + translate over 25s) on the hero action image creates subtle cinematic tension — the page feels alive, like a broadcast camera slowly panning. Different timing from Supreme's Ken Burns (20s pure zoom) — Broadcast uses a slower translate+scale combo for editorial pacing.
- Editorial closing thesis ("This is the moment. Own it before it's history.") bridges the emotional narrative section to the transactional section below. It reframes the purchase as an act of ownership, not a transaction. Georgia italic at text-sm/white-25 — barely there but felt.
- Pull quote border-l increased from 2px to 3px with stronger team-color opacity (60→70%) — the thicker accent makes the quote feel more authoritative, like a magazine sidebar.
- All 3 directions now at perfect 9.00. The remaining frontier is pushing BEYOND 9.0 — which requires unexpected, bold experiments rather than incremental polish.
- At this score level, the next improvements should be experiential: micro-interactions that surprise, animations that delight, or page states that create genuine emotional responses. The foundation is solid — now it's about magic moments.

## Strategic Notes — Post 9.0 Frontier
- All 3 directions at 9.00. Every dimension at 9.0. This is the ceiling of the current scoring model.
- To push beyond: try something completely unexpected for each direction. Break the mold.
- Ideas for 9.0+ experiments:
  - Supreme: Full-screen video preview on hover/tap (the moment plays before you buy)
  - Broadcast: Animated ESPN-style stat counter (numbers roll up on scroll)
  - Arena: Sound toggle for ambient crowd noise (visual indicator, actual audio)
  - All: Skeleton loading state that teases the content before reveal
  - All: Share preview cards (OG meta tags) for when users share their W screen
- The loop continues. "There is no done. There is only more polished."

## Cycle 41 Learnings
- `useCountUp` hook with requestAnimationFrame + ease-out quad is smooth and performant. The numbers feel alive, like a jumbotron scoreboard updating.
- 1400ms duration is the sweet spot for stat counter — fast enough to feel responsive, slow enough to register visually. Too fast (500ms) and you miss it. Too slow (2500ms) and it feels laggy.
- Extracting JumbotronStatLine as its own component keeps the hero section clean. Each stat segment (30 PTS / 8 REB / 4 AST) is its own CountUpNumber instance.
- The animated stat counter is deeply Arena — no other direction should have it. Supreme's stats are static (confident, already-known). Broadcast's stats fly in as cards. Arena's stats roll up like a scoreboard.
- Beyond-9.0 improvements are experiential: they don't change the scoring model but make the page feel genuinely alive and surprising. These are the details that make someone say "whoa" on first visit.
- Next cycle: Supreme (rotation). Supreme needs its own beyond-9.0 experiment — perhaps the hero image having a subtle parallax effect on scroll, or the edition number having a premium engraving-style appearance.

## Cycle 42 Learnings
- Scroll parallax at 0.4x creates noticeable but subtle depth — 0.5x is too much (hero disappears too fast), 0.3x is barely perceptible. 0.4x is the sweet spot.
- `will-change: transform` on the parallax wrapper prevents layout thrashing. `{ passive: true }` on the scroll listener prevents scroll jank.
- requestAnimationFrame wrapping on scroll handler ensures smooth 60fps updates — raw scroll handlers can fire 100+ times/sec.
- The parallax wrapper contains only the background layers (action image, player image, gradients). The text overlay sits outside and stays fixed — this is the key to the depth effect.
- Supreme is the only direction that benefits from scroll parallax because it's the only one designed as a single-screen experience that MIGHT scroll. Broadcast is always scrollable (editorial), Arena is dashboard-style.
- Next cycle: Broadcast (rotation). Broadcast needs a beyond-9.0 experiment. Ideas: animated ESPN-style stat counter (numbers roll up in the stat breakdown cards), or a more dramatic hero reveal animation.

## Cycle 43 Learnings
- IntersectionObserver-triggered stat counter (threshold: 0.3) is better for Broadcast than page-load trigger — the scroll-based reveal matches the editorial pacing. Arena fires on load (jumbotron always visible); Broadcast fires on scroll-into-view (editorial reveal).
- Separated `useAnimatedCounter` hook from `AnimatedStatCard` component — clean separation allows reuse while keeping the IntersectionObserver logic local to the StatBreakdown container.
- easeOutQuad at 1200ms (vs Arena's 1400ms) feels right for editorial — slightly faster, more decisive. The broadcast graphic should appear and settle quickly, not linger.
- Stagger delay (150ms per card) syncs with the existing `stat-fly-in` CSS animation stagger — numbers start counting as each card flies in.
- All 3 directions now have animated stat counters, each with identity-correct triggers and timing: Arena (page load, 1400ms, jumbotron), Broadcast (scroll-into-view, 1200ms, editorial), Supreme (static — confident, already-known).
- Next cycle: Arena (rotation). Arena needs its own beyond-9.0 experiment.

## Cycle 44 Learnings
- Arena LED flash uses inset boxShadow (80px + 160px spread at 18% and 8% opacity) for edge glow — no extra DOM elements needed. Pure CSS transition.
- 350ms fade duration is the sweet spot for a purchase flash — fast enough to feel reactive, slow enough to register visually. Too fast (150ms) is subliminal; too slow (600ms) competes with the next purchase.
- prevLen ref pattern (compare events.length to previous) is clean for detecting new purchases without deep comparison. Skip the first event to avoid flash on initial render.
- The LED flash sits at z-[20], below CrowdReactions (z-[25]) and critical vignette (z-[35]) — layers don't compete.
- Arena now has 3 simultaneous purchase reaction systems: LED flash (ambient), CrowdReactions (emoji burst), and feed item glow. Each operates at a different visual layer — together they create overwhelming live-event energy.
- Next cycle: Supreme (rotation). Supreme needs its own beyond-9.0 experiment — perhaps a premium number counter animation on the edition display, or a subtle hover parallax on the hero image.

## Cycle 45 Learnings
- easeOutExpo (1 - 2^(-10t)) is better than easeOutQuad for slot-machine reveals — the fast-start + hard-decelerate creates genuine "landing" energy. The number zips through hundreds in the first 200ms then slows to crawl into the final digits.
- 800ms duration for the Supreme edition counter (vs 1200ms Broadcast, 1400ms Arena) is the fastest — Supreme is decisive, no lingering. The number appears, counts, locks. Done.
- "Locked" state uses scale(1.05) + textShadow glow — a micro-scale bump signals "this is your number now." The 200ms transition makes it feel solid, not bouncy.
- The counter syncs with `showDetails` (700ms after page enter), so it fires during the detail reveal phase — the number coming alive during an otherwise static section is a nice surprise.
- All 3 directions now have animated counters in different contexts: Supreme (W screen edition reveal, easeOutExpo 800ms), Broadcast (stat cards on scroll, easeOutQuad 1200ms), Arena (stat line on load, easeOutQuad 1400ms + stat counter on load). Each trigger and timing matches the direction's energy.
- Next cycle: Broadcast (rotation). Ideas: certificate card could have a subtle wax-seal or emboss effect, or the "Acquired." checkmark could have a more dramatic animation.

## Cycle 46 Learnings
- SVG wax seal at 50% opacity is the right visibility — it shouldn't compete with the edition number or certificate text. It's a prestige whisper, not a shout.
- 48×48px is the sweet spot for the seal at mobile — large enough to read "TST" but small enough to fit in the corner without crowding.
- 12 radial lines at 30° intervals create the notched-edge effect of a real wax seal. Combined with 3 concentric circles (r=22, 18, 14), it reads immediately as an authentication mark.
- Positioned absolute bottom-4 right-4 (sm:bottom-6 sm:right-6) keeps it in the certificate's corner without overlapping other content.
- The seal uses team-color strokes/fills, so it adapts per moment — Heat red seal vs Nuggets gold seal vs Thunder blue seal.
- Next cycle: Arena (rotation). Arena could use a competition leaderboard on the W screen, or a more dramatic confetti burst.

## Cycle 47 Learnings
- Purchase streak combo counter is pure live-commerce energy — Whatnot, TikTok Live, and gaming buy-spree systems all use combo counters. Arena is the natural home for this.
- The streak hook tracks gap between consecutive events (<4s = streak continues). Simple but effective — no complex debounce logic needed.
- 3-tier escalation (2x COMBO → 3x STREAK → 5x ON FIRE) with color shift (team-color → red) creates genuine excitement. The user watches the combo counter climb and root for it to hit ON FIRE.
- Auto-hide after 2.5s of no rapid buys prevents the badge from becoming permanent noise. The transience makes each appearance feel special.
- Fixed positioning (top-16, centered) keeps the badge visible without competing with the header bar (top-0, z-30). Badge is at z-[30].
- `useRef` in Next.js 16 requires explicit initial value (`useRef<T>(undefined)`) — strictNullChecks flags the omission as a type error.
- Next cycle: Supreme (rotation). Supreme could use a subtle video preview on hero hover, or a premium engraving effect on the edition number in the W screen.

## Cycle 48 Learnings
- Diagonal light sweep is pure CSS (keyframes + linear-gradient), zero JS. The sweep element is a 60%-width div that translates from -120% to +120% on a 25deg angle.
- 8s cycle with 85% idle time means the sweep happens roughly once every 8 seconds — infrequent enough to be surprising, frequent enough to notice. The idle period (0-85%) keeps the hero clean most of the time.
- Team-color tinting on the sweep (8% opacity) makes it feel organic to each moment page rather than a generic white glint. The center peak is rgba(255,255,255,0.06) — barely visible but catches the eye.
- The sweep is disabled during ENDED (hero is desaturated) and during purchasing (hero is blurred). This prevents the sweep from fighting other visual states.
- z-[5] puts the sweep above the background layers but below the text overlay — it subtly illuminates the player image without washing out text.
- Supreme now has 3 simultaneous ambient hero effects: parallax scroll (0.4x), Ken Burns zoom (20s cycle), and light sweep (8s cycle). Together they create a living, breathing hero that feels premium without being busy.
- Next cycle: Broadcast (rotation). Broadcast could use a subtle film reel flicker effect, or animated typography on the editorial headline.

## Cycle 49 Learnings
- The BroadcastTicker component was defined since early cycles (line ~103) but never rendered. It was a dead component — activating it completed the broadcast atmosphere with zero new component code needed. Always check for unused components before building new ones.
- Network bug watermark (TST LIVE) uses fixed positioning at top-4 right-4 (md:top-6 md:right-6) with opacity 0.35 — subtle enough to be environmental, not distracting. The pulsing dot (CSS `pulse` animation) mimics ESPN's LIVE indicator.
- The network bug adapts to drop phase: normal = team-color, CRITICAL = red, ENDED = fades out. This is consistent with how real broadcast networks shift their on-screen graphics during urgent moments.
- Ticker hidden during ENDED state preserves the "broadcast is over" feeling. Real networks pull their tickers after a game ends.
- `broadcast-ticker` keyframe was missing from globals.css — the component referenced `animate-[broadcast-ticker_30s_linear_infinite]` via Tailwind arbitrary animation. Added the keyframe: `translateX(0) → translateX(-50%)` with doubled content for seamless loop.
- Broadcast now has the most complete TV broadcast metaphor: ESPN BottomLine ticker + network bug + lower-third graphics + urgency chyron + Ken Burns hero + film grain + stat counters. No other direction should borrow these — they're deeply broadcast-specific.
- Next cycle: Arena (rotation). Arena could use a crowd noise ambient indicator, or a "seats filling up" visualization.

## Cycle 50 Learnings
- Mini equalizer bars (5 × 2px, staggered animation 380-550ms) instantly read as "live audio" without needing actual sound. The visual metaphor is powerful enough on its own.
- Placing the EQ next to the viewer count creates a "streaming platform" feel — like Twitch or YouTube Live showing audio activity alongside viewer numbers.
- The bars use team-color tinting (0.7 opacity) so they adapt per moment page — Heat red EQ vs Nuggets gold EQ vs Thunder blue EQ.
- Freeze behavior (height: 15%, opacity: 0.3, animation: none) on ended state creates a "stream ended" feeling — the arena has gone quiet. The transition is handled by CSS `transition-all duration-300`.
- Arena now has the most complete live-event sensory environment: crowd reactions (emoji burst), LED flash (visual), purchase streak (gamification), velocity sparkline (data), and now crowd noise EQ (audio cue). No other direction should have these — they're deeply Arena-specific.
- Next cycle: Supreme (rotation). Supreme could use a premium engraving effect on the player name, or a subtle vignette breathing effect.

## Cycle 51 Learnings
- Ambient breathing vignette at z-[5] (below content, above nothing) creates a subconscious living-room glow. The 6s cycle is slow enough to feel organic — you notice it subconsciously, not consciously.
- Team-color inset box-shadow (`120px + 60px spread at 08% and 05% opacity`) is barely there but creates warmth at the edges. Heat pages have a warm red border-glow, Nuggets have gold, Thunder have blue.
- Disabled during CRITICAL (where the red vignette takes over at z-40) and ENDED — no animation competition. The breathing stops when the drop closes, like the screen powers down.
- Embossed text shadow uses 3 layers: dark drop shadow (depth), team-color glow (identity), white highlight (emboss). The white at 0.04 opacity is barely visible but creates a raised-letter effect on dark backgrounds.
- Supreme now has 4 ambient hero effects: parallax (scroll), Ken Burns (20s zoom), light sweep (8s diagonal), and breathing vignette (6s edge glow). Together they create a premium living display without any single effect being obvious.
- Next cycle: Broadcast (rotation). Broadcast could use a subtle film reel frame flicker, or animated "BREAKING" text treatment on the urgency banner.

## Cycle 52 Learnings
- CRT scanlines use `repeating-linear-gradient` (3px transparent, 1px rgba(0,0,0,0.06)) at z-16 — above film grain (z-15) but below text (z-20). The two effects stack: grain adds noise texture, scanlines add horizontal structure. Together they read as "broadcast monitor" without either being obvious.
- `mix-blend-mode: multiply` on scanlines darkens without adding color — keeps them invisible on dark areas but subtly visible on bright hero content. This is better than `overlay` which would lighten as well.
- BREAKING text glow uses `text-shadow` animation (not `box-shadow`) — the glow emanates from the letterforms themselves, not from a box. More dramatic, more broadcast-authentic.
- 1.2s cycle matches the existing `urgency-pulse-fast` timing (0.5s for button pulse), but is slower — text should pulse dramatically, not frantically. The 50% peak (0.7 opacity, 24px spread) creates genuine "breaking news" energy.
- Broadcast hero now has 3 layered atmosphere effects: Ken Burns drift (25s), film grain (0.8s noise), and CRT scanlines (static). Each adds a different dimension of "broadcast production."
- Next cycle: Arena (rotation). Arena could use a jumbotron pixel grid effect, or a subtle camera flash on purchases.

## Cycle 53 Learnings
- Camera flash at 40% probability is the key insight — every purchase having a flash would feel mechanical. Random 40% creates the natural "crowd cameras going off" feel where some moments get captured and others don't.
- 80ms flash duration with instant-on (0ms transition) and slow-off (120ms fade) mimics real camera physics — the flash is instantaneous, the retinal afterimage fades.
- 4% white opacity is the sweet spot — visible as a subtle screen-wide brightening but not jarring. Higher opacity (8%+) competes with the LED flash effect.
- z-22 sits between ArenaLedFlash (z-20, team-color edges) and CrowdReactions (z-25, emoji burst). The three purchase reaction layers are: warm team-color glow → cold white flash → colorful emoji burst. Different visual frequencies.
- Arena now has 5 simultaneous purchase reaction systems: LED flash (edge glow), camera flash (screen burst), CrowdReactions (emoji), feed item glow (feed), and streak counter (gamification). The layered approach creates overwhelming arena energy.
- Next cycle: Supreme (rotation). Supreme could use a subtle heartbeat pulse on the CTA glow (matching the breathing vignette rhythm), or a premium "collector since" timestamp in the W screen.

## Cycle 54 Learnings
- Holographic name shimmer uses `background-clip: text` with `-webkit-text-fill-color: transparent` to turn the player name into a gradient canvas. The gradient is 250% width so the highlight band can travel off-screen between passes.
- The highlight band (38%→56%) is narrow (18% of gradient width) so the shimmer reads as a light-catch, not a color wash. Team-color at center flanked by #F0F2F5 creates a metallic sheen specific to each moment.
- 10s cycle with a hold at 85-100% (same `background-position`) means the shimmer travels once, then pauses — mimicking a card catching light as you tilt it, not a spinning hologram.
- `textShadow` still works with `-webkit-text-fill-color: transparent` — the embossed shadow from cycle 51 persists beneath the gradient fill. The two effects layer: shimmer provides surface life, shadow provides depth.
- Disabled during ENDED (hero is grayscale — shimmer would break the "lights off" mood) and purchasing (hero is blurred — focus should be on the CTA, not the name).
- Supreme now has 5 simultaneous visual polish systems: parallax (scroll depth), Ken Burns (slow zoom), light sweep (hero diagonal), breathing vignette (edge glow), and name shimmer (text foil). None are obvious alone — together they create a living, premium display.
- Next cycle: Broadcast (rotation). Broadcast could use an editorial "byline" reveal animation, or a subtle parchment/paper texture on the narrative section.

## Cycle 55 Learnings
- Anamorphic lens flares are THE defining visual artifact of cinematic broadcast production. A thin horizontal streak immediately reads as "professional camera" without any additional context.
- The flare is 2px tall but extends 120% width (-10% left to -10% right overshoot) — the extra width prevents hard edge cutoff. The center is white (35%) and edges are team-color (15%), so the streak feels warm and adapted per moment.
- 12s cycle is the sweet spot — fast enough to notice (you'll see 4-5 passes per minute) but slow enough to feel natural, not mechanical. The drift goes top-to-bottom, pausing at 70% height before fading.
- z-17 stacks correctly: grain (::after, z-auto) → scanlines (::before, z-16) → flare (z-17) → text (z-20). Each broadcast atmosphere layer occupies its own z-plane.
- Opacity keyframing (0 → 1 at 10%, hold → 0 at 90%) prevents the streak from appearing/disappearing abruptly. The gradual fade mimics a camera slowly panning past a light source.
- Broadcast hero now has 4 simultaneous atmosphere effects: Ken Burns drift, film grain, CRT scanlines, and anamorphic flare. All are classic broadcast/cinema production techniques, each operating independently.
- Next cycle: Arena (rotation). Arena could use a jumbotron pixel grid effect, or a "wave" animation through the purchase feed items.

## Cycle 56 Learnings
- Buyer heat map with simplified US outline + city dots is the quintessential live-commerce visualization. Geographic demand data creates spatial FOMO — "people in Miami, Chicago, and LA are all buying right now."
- Hardcoded CITY_COORDS (17 cities × [x,y] in a 300×170 viewBox) is far lighter than any map library. The simplified US_PATH outline is 1 SVG path — recognizable as the US without being geographically accurate.
- Jitter (±5px x, ±4px y) prevents dot stacking when the same city appears multiple times. This is critical — without it, Miami becomes one bright dot instead of a cluster.
- SVG `<animate>` for the expanding glow ring (r: 4→12, opacity: 0.4→0, 0.6s) is more performant than CSS animation on SVG elements. The ring expands and fades simultaneously for a "ping" effect.
- 4-stage aging (fresh 0.9 → medium 0.5 → dim 0.25 → ghost 0.1, each ~3s) creates a visible trail of where purchases WERE, not just where they ARE. The temporal decay tells a story.
- 20-dot cap prevents SVG performance issues while maintaining visual density. At ~1 purchase per 2-5s, you'll have 5-8 visible dots at any time — enough for a pattern, not enough for clutter.
- Arena now has 6 simultaneous purchase reaction systems: LED flash (edge glow), camera flash (white burst), emoji reactions (floating), feed pills (scrolling names), streak counter (combo), and heat map (geographic). This is the maximum sensory load a single page can sustain.
- Next cycle: Supreme (rotation). Supreme could use a subtle monochrome video preview on hover/long-press, or a premium "collector's mark" watermark on the hero.

## Cycle 57 Learnings
- Ambient particles (1.5-2.5px dots with glow) create museum/gallery atmosphere without being obvious. The effect is subliminal — you feel the page is "alive" without consciously noticing the particles.
- 5 particles with staggered 0-5.5s delays on 7-10s durations ensures there's always at least one visible particle but never a moment where all 5 are synchronized. Natural, not mechanical.
- Team-color tinting means Heat pages have warm red motes, Nuggets have gold dust, Thunder have blue sparks. Each feels native to the moment.
- z-6 is correct — above the parallax hero content (z-0 area) but below text (z-10) and the light sweep (z-5 overflow). Particles appear to float BETWEEN the background and the text, enhancing the depth effect.
- `useMemo` on the particle config prevents re-renders from recreating the array. The particles are static layout with CSS animation — zero runtime JS cost.
- Hidden during ENDED (the museum has closed — lights off, particles settle) and purchasing (blur effect + focus on CTA — no distractions). These state-based visibility rules are becoming a standard pattern across all Supreme ambient effects.
- Supreme now has 6 simultaneous ambient effects on the hero. This is likely the practical maximum — adding more would risk perceptible performance impact on low-end mobile devices. Future Supreme improvements should target non-hero areas.
- Next cycle: Broadcast (rotation). Broadcast could use a subtle editorial "chapter marker" between sections, or a network crawl/breaking-news lower-third for the urgency phase.

## Cycle 58 Learnings
- "INSTANT REPLAY" is a quintessential broadcast overlay element — like the network bug and score ticker, it's a signal that says "you are watching a live broadcast." Adding it to the hero makes the entire page feel like watching ESPN.
- The slide-in-from-right animation (translateX(110%) → translateX(0)) with `cubic-bezier(0.16, 1, 0.3, 1)` creates a spring-deceleration that mimics real broadcast graphic motion — fast enter, soft settle.
- 4s total keyframe with 12% enter / 75% hold / 100% fade-out means the tag is visible for ~2.5s. Long enough to register, short enough to not linger. Real broadcast replay markers work the same way.
- Positioning at top-[38%] places it in the visual dead zone between the top status bar and the lower-third — a space that has no content competition. Right-aligned feels correct for broadcast (most ESPN overlays enter from the right).
- The team-color accent bar (3px vertical) + dot + Oswald text is consistent with the broadcast lower-third's left-edge accent — same visual language, different position.
- Broadcast hero now has 5 graphic overlay elements: score ticker (top), network bug (corner), instant replay tag (mid-right), lower-third (bottom-left), and lens flare (drifting). Together with film grain and scanlines, the broadcast illusion is nearly complete.
- Next cycle: Arena (rotation). Arena could use a "timeout" or "challenge" themed overlay, or animated seat-filling visualization.

## Cycle 59 Learnings
- Shot clock ring (circular SVG) is the quintessential arena/basketball UI element — immediately reads as "game clock" without any label. The depleting ring creates visceral urgency.
- `strokeDasharray` + `strokeDashoffset` is the standard SVG technique for circular progress. The formula `offset = circumference * (1 - fraction)` depletes clockwise when combined with `rotate(-90 cx cy)`.
- 58×58px ring at 25% opacity is subtle enough to sit behind the countdown text without competing — it's environmental context, not a chart.
- Using `totalSeconds / (12 * 60)` as the fraction (assuming 12min default) keeps the ring proportional to total drop time.
- Color transitions through phases (team-color → amber → red) use CSS `transition: stroke 0.5s` — smooth, not jarring.
- Critical pulse at 0.8s (faster than the 1.2s vignette pulse) gives the shot clock extra panic energy. The ring literally throbs.
- Arena now has a basketball-specific urgency element that no other direction should have. Broadcast has its score ticker; Supreme has its thin urgency bar; Arena has its shot clock. Each direction's timer visualization matches its identity.
- Next cycle: Supreme (rotation). Supreme could use a subtle "edition counter" progress visualization, or an ambient gradient color temperature shift as urgency increases.

## Cycle 60 Learnings
- Edge light trace (luminous point traveling along hero bottom border) creates a premium card-edge effect — like tilting a luxury card and seeing the light catch its gilt edge.
- The trace uses `radial-gradient(ellipse)` with team-color at 90% center opacity fading to transparent. The elliptical shape creates a wider, softer light spot than a circular gradient would.
- Dual-layer glow (8px tight + 20px diffuse boxShadow at 50% and 25% opacity) makes the point feel luminous, not just colored. The diffuse layer creates a subtle halo on the dark surface.
- 6s `cubic-bezier(0.25, 0.1, 0.25, 1)` timing is smoother than linear — slight ease at edges means the light "enters and exits" the frame gracefully rather than popping in/out.
- w-12 (48px) width for the light point is the right scale — wide enough to read as "light catching an edge," narrow enough to be a point, not a bar. Wider (w-24) reads as a progress indicator.
- z-[11] puts it above the hero edge shadow (z-10) but below the text overlay — the light appears to trace the physical edge of the hero container.
- This is the 7th ambient effect on the Supreme hero section: parallax, Ken Burns, light sweep, breathing vignette, name shimmer, particles, and now edge trace. Each operates on a different spatial axis: parallax=depth, Ken Burns=scale, sweep=diagonal, vignette=edges, shimmer=text, particles=floating, edge trace=border. No two effects share a spatial domain.
- Next cycle: Broadcast (rotation). Broadcast could use a subtle "PRESENTED BY" sponsor tag at hero bottom for broadcast authenticity, or a cinematic fade-to-black transition between page states.

## Cycle 61 Learnings
- IntersectionObserver-triggered one-shot animations are the right pattern for scroll-based reveals in editorial/broadcast layouts. The user scrolls into the transaction section and the divider line "opens" like a curtain — cinematic.
- `scaleX(0)` → `scaleX(1)` with `transform-origin: center` is simpler and more performant than animating width from 0%. The transform avoids layout recalc.
- Gradient on the line (transparent → team-color → transparent) ensures the edges fade naturally. A solid-color line expanding would have harsh endpoints.
- 0.8s duration with `cubic-bezier(0.16, 1, 0.3, 1)` (fast start, gentle settle) creates the feeling of a broadcast graphic resolving — decisive, not lingering.
- The `broadcast-reveal-line` class sets initial state (`scaleX(0)`) and `broadcast-reveal-line-active` triggers the animation. This two-class pattern (state + trigger) is clean for IntersectionObserver-driven animations.
- This replaces a static `opacity-20` divider with a dynamic reveal — a net zero DOM change but adds significant editorial polish.
- Next cycle: Arena (rotation). Arena could use a "wave" animation through purchase feed items, or a jumbotron-style scoreboard transition effect.

## Cycle 62 Learnings
- Arena spotlight sweep uses a radial gradient (ellipse 50%×100% at 50% 0%) — anchored to top center, stretching full height. This creates a cone shape that widens as it reaches the bottom, like a real overhead spotlight.
- 10s cycle with cubic-bezier(0.4, 0, 0.6, 1) creates smooth acceleration/deceleration — the spotlight doesn't "jump" at edges. The ease-in-out mimics a motorized spotlight rig panning.
- Team-color tinting at very low opacity (primary at 7% + 3.5%) keeps the spotlight subtle. Higher opacity (>10%) made it compete with the player image. The effect should be atmospheric, not literal.
- z-[7] positions the sweep above the action/player images but below the dark overlay and text. This means the light illuminates the images without washing out legibility.
- Width at 40% of the hero means the cone covers about 2/5 of the viewport at any moment — wide enough to be visible, narrow enough to "sweep" across. 60% felt like a floodlight; 20% was too narrow to register.
- Keyframe uses opacity fade: 0% start → 8% fade in → 50% fade out → 58% invisible → hold to 100%. This prevents the spotlight from appearing/disappearing at the hero edges with hard cuts.
- Arena hero now has 3 atmosphere layers: action image backdrop (static), player gradient (static), and spotlight sweep (animated). This is lighter than Supreme (7 effects) or Broadcast (5+ overlays), which is correct — Arena's visual energy comes from the LIVE FEED and purchase reactions below the hero, not from the hero itself. The spotlight is the one ambient hero effect Arena needs.
- Next cycle: Supreme (rotation). Supreme could use a subtle frost/glass morphism on the edition badge, or a premium micro-texture on the void background.

## Cycle 63 Learnings
- SVG fractalNoise at 3.5% opacity is the sweet spot for noise texture on dark backgrounds. At 2% it's invisible; at 5% it looks like JPEG compression artifacts. 3.5% creates subliminal material quality.
- `baseFrequency="0.85"` with `numOctaves="4"` produces fine-grained noise that reads as paper/card stock texture, not static/TV snow. Lower frequencies (0.3-0.5) create cloud-like patterns instead.
- The SVG is inlined as a data URI in the CSS background-image — no external file, no fetch, instant render. The 256×256 tile size is small enough to load fast, large enough that the repeat isn't obvious.
- Fixed positioning (not absolute) ensures the grain stays stationary during scroll. If it scrolled with content, the parallax effect would make the grain visible and distracting. Static grain = invisible grain.
- z-index:1 on the ::before is minimal — above the background paint, below everything else. Since Supreme has effects at z-5 (light sweep), z-6 (particles), z-10 (text), etc., the texture doesn't interfere.
- This is a foundational visual change — it affects the entire page uniformly. Supreme's minimalism means every surface improvement compounds because there's less to compete with.
- The noise texture could theoretically be applied to Broadcast and Arena too, but each would need different treatment: Broadcast might want a more structured grain (like film grain, which it already has), Arena doesn't need it (too much visual activity already).
- Next cycle: Broadcast (rotation). Broadcast could use a subtle editorial "chapter number" above the narrative section, or an animated "Now Showing" theater marquee above the hero.

## Cycle 66 Learnings
- Double-peak waveform (35% and 65% of cycle) is crucial — a single-peak sine wave reads as mechanical "breathing", but double-peak reads as organic heartbeat (systole/diastole). The second peak at 65% is slightly smaller (scale 1.003 vs 1.004) mimicking the real cardiac cycle.
- 0.4% amplitude (scale 1.004) is at the threshold of conscious perception. You don't "see" the hero pulsing — you feel a subliminal tension. Higher amplitude (1%+) is obviously pulsing and feels cheap. Lower (0.2%) is truly invisible.
- Applying heartbeat to the parallax wrapper (parent) rather than the image (child) means it layers with Ken Burns cleanly. Ken Burns is on the image div (scale + translate), heartbeat is on the wrapper (scale only). The transforms compose naturally.
- CRITICAL quickening (1.8s → 1.1s) adds 60% more pulses per minute — a noticeable urgency increase that matches the viewer's elevated heart rate during final seconds. The effect mirrors how your own pulse quickens when time runs out.
- Supreme hero now has 8 ambient effects: parallax, Ken Burns, light sweep, breathing vignette, name shimmer, particles, edge trace, and heartbeat. But the heartbeat is the most subliminal — it's the foundation pulse that makes everything else feel alive.
- Next cycle: Broadcast (rotation). Broadcast could use a subtle "camera rack focus" blur shift on the hero, or a broadcast-style animated stat crawl along the bottom of the hero.

## Cycle 67 Learnings
- Production markers (REC + ISO CAM) are instantly recognizable broadcast details without adding visual weight. At 25% opacity they're "found details" — you notice them on closer inspection, adding depth.
- Bottom-right of hero (bottom-16 right-5) avoids collision with: score bug (top-left), network bug (top-right), editorial badge (top-left), lower-third (bottom-left), replay tag (mid-right). The hero has 6 distinct overlay zones now — layout matters to prevent crowding.
- The REC dot reuses the existing `pulse` keyframe animation — no new CSS needed. Building on existing animation vocabulary keeps the CSS lean.
- "ISO CAM 1" in mono font reads as technical metadata — it implies this is a raw production feed, not a finished broadcast. That rawness adds authenticity.
- Broadcast hero now has production overlays at every edge: top-left (score bug), top-right (network bug), mid-right (replay tag), bottom-left (lower-third), bottom-right (production markers), bottom (progress bar). The hero is a fully dressed broadcast frame.
- Next cycle: Arena (rotation). Arena could use a "section leader" indicator (like section 101, row A seating), or a jumbotron "timeout" screen effect during CLOSING phase.

## Cycle 68 Learnings
- State transitions are high-impact moments for adding drama. The active→ended transition was previously a quiet fade — adding a buzzer sequence makes it an event.
- Multi-stop keyframe animations (8 stops for the flash) feel more realistic than simple fade-in/fade-out. Real LED strips have irregular intensity, so the stutter pattern reads as authentic.
- Screen shake should be very brief (0.5s) and dampen quickly (3px→1px). Longer shakes feel like bugs, not effects.
- z-index layering matters for overlays that need to punch through everything: buzzer at z-45/46/47 sits above all live effects (z-6 to z-35) but below the celebration screen (z-40+). Plan z-index ranges before adding layers.
- The `useRef` pattern for detecting state transitions (wasEnded → isEnded) is clean for one-shot effects. Fire once, auto-dismiss via timeout.
- Arena now has a complete lifecycle narrative: alive (live effects) → buzzer (dramatic punctuation) → stillness (ended state). Each direction should have meaningful state transitions, not just toggled visibility.
- Next cycle: Supreme (rotation). Supreme could explore a closing-phase effect like dimming to near-black with the CTA as the only bright element, or a "last call" text flash.

## Cycle 69 Learnings
- Phase-specific atmosphere changes are high-impact, low-code. A single fixed div with a radial gradient creates a "spotlight narrowing" effect that dramatically changes page feel.
- z-index composition is powerful: CRITICAL red vignette (z-40) + last-light dim (z-38) = both effects compound. Red urgency edges + darkened content = maximum purchase pressure.
- Removing the dim during purchasing prevents obscuring the progress ring/checkmark feedback — phase-specific overlays should check purchase state.
- Supreme's philosophy is "guide with light, not UI." The last-light dim adds zero new interface elements — it just manipulates brightness to funnel attention. That's peak Supreme.
- Next cycle: Broadcast (rotation). Broadcast could use a "commercial break" bumper transition at phase changes, or an animated "BREAKING" chyron crawl during CRITICAL.

## Cycle 70 Learnings
- The W screen is an underexploited canvas for broadcast atmosphere. The main page has 10+ broadcast overlays, but the W screen had zero — adding flash + chyron dramatically closes that gap.
- Photographer flash burst is a simple full-screen white div with opacity keyframes (0→85%→40%→15%→0% over 300ms). The trick is the non-linear falloff: peak brightness (85%) at 8% of duration, then slow triple-step fade. This mimics real camera flash physics (instant on, slow phosphor decay).
- The BREAKING chyron uses a 3-state lifecycle (`hidden → in → out`) rather than a simple show/hide toggle. The slide-in (0.7s spring) and slide-out (0.5s ease-in right-exit) are different animations — the entrance is dramatic, the exit is smooth. Real broadcast chyrons behave this way.
- Positioning the chyron at `bottom-[15%]` avoids the certificate card (centered) and share buttons (bottom). The W screen has specific content zones: top (COLLECTED banner + name), middle (certificate card), bottom (share). The chyron sits between middle and bottom.
- The chyron content adapts to purchase context: player name + stat line (headline), tier + edition number (detail). This makes each collection feel unique — it's not a generic "BREAKING" but a specific announcement.
- Two CSS keyframes (`broadcast-chyron-in`, `broadcast-chyron-out`) handle the lifecycle. The `chyronState` variable drives which animation is active. `hidden` removes the element entirely to prevent stale DOM.
- The flash fires at phase 1 (50ms after mount) and the chyron at phase 2 (600ms). This creates a cinematic sequence: flash → name appears → chyron slides in → certificate rises → share buttons. Five distinct beats in 2 seconds.
- Next cycle: Arena (rotation). Arena W screen could use a crowd roar crescendo effect (audio equalizer bars that spike) or a jumbotron-style "REPLAY" overlay during the reveal sequence.

## Cycle 71 Learnings
- The crowd roar EQ bars on the W screen mirror the existing 5-bar mini EQ from the main page but at a much larger scale (24 bars, 128px tall vs 5 bars, 12px tall). The main page EQ says "the crowd is alive"; the W screen EQ says "the crowd is ROARING."
- Two-phase animation (spike + idle) creates a natural crowd audio shape: eruption at the moment of reveal, then sustained crowd energy. Chaining CSS animations: the first (`arena-roar-bar`, 1.2s, forwards) completes and holds its final height, then the second (`arena-roar-idle`, infinite) takes over from that state.
- 30ms stagger per bar (0.03s × 24 = 0.72s total spread) creates a wave effect across the bars — the left side spikes first, then the wave ripples right. This mimics how crowd noise spreads through stadium sections.
- Center bars (indices 9-14) in teal vs team-color outer bars creates a subtle color gradient that draws the eye to center — where the "YOU'RE IN!" text sits. The teal matches the edition number color (#00E5A0) for visual coherence.
- 20% opacity is the right level — the bars are clearly visible as a background texture but don't compete with the white text or confetti. At 30% they started to distract; at 10% they were invisible behind the ambient glow.
- Absolute positioning (top: 8%, left: 50%, transform: -translate-x-1/2) centers the EQ behind the headline area. `items-end` aligns bars to the bottom so they grow upward — the natural direction for sound-level bars.
- All 3 W screens now have unique atmospheric reveal effects: Supreme (radial burst rings), Broadcast (photographer flash + BREAKING chyron), Arena (crowd roar EQ + screen shake + confetti). Each is identity-correct.
- Next cycle: Supreme (rotation). Supreme could use a subtle "authentication pulse" animation on the serial number in the W screen, or a minimalist breath animation on the hero edges during live state.

## Cycle 72 Learnings
- The authentication seal (SVG circle r=48 with stroke-dasharray draw animation) fires at 1.6s — 100ms after the edition counter locks (700ms showDetails delay + 800ms counter duration). This creates a satisfying sequence: number zips to target → locks with scale bump → ring draws around it → glow pulse. Four beats.
- The 4 cardinal tick marks (0°, 90°, 180°, 270°) at 20% opacity are a notarization detail — they add visual structure to the ring without being obvious. Like the minute markers on a luxury watch face.
- `supreme-seal-draw` uses cubic-bezier(0.22, 1, 0.36, 1) — fast start with gentle deceleration. The ring should appear quickly then settle, like a scanner confirming identity.
- `supreme-seal-glow` (1s, 0.7s delay = fires right as the draw completes) pulses the drop-shadow from 0 → 8px → 2px. The final 2px glow persists — the seal is always subtly lit.
- The 108×108 container with a 96px-diameter ring generously frames the 32px edition number text. The "/ 5,000" text extends past the ring edges, which is intentional — the ring frames the primary number, not the metadata.
- All 3 W screens now have unique authentication/prestige elements: Supreme (draw-in ring seal), Broadcast (wax seal SVG emboss on certificate), Arena (competition stats — Top X% speed). Each validates the purchase in the direction's language.
- Next cycle: Broadcast (rotation). Broadcast W screen could use a subtle "broadcast received" static/snow effect on reveal, or the certificate card could have an animated gradient border (prestige shimmer).

## Cycle 73 Learnings
- Traveling glow inside `overflow-hidden` is the cleanest card shimmer technique — no complex mask/clip-path needed. The glow naturally illuminates card edges as it passes, creating an organic edge-lighting effect.
- 30% of card width for the glow spot size is the sweet spot — large enough to register as the glow passes the edge, small enough that it doesn't illuminate the entire card at once.
- `blur(16px)` + 10% opacity is subtle enough for prestige — it's a whisper of light, not a beacon. Higher opacity (20%+) made the glow feel like a bug, not a feature.
- 6s cycle with `ease-in-out` creates graceful acceleration at corners — the glow slows as it rounds each corner, like a light on a motorized track.
- The animation coordinates: -15% to 85% (not 0% to 100%) prevents the glow from being centered on the card edge — it peeks in from outside, creating a more natural light source.
- The shimmer complements the existing wax seal (static prestige mark) + certificate header (typography prestige). Three layers of authentication: typography → seal → light.
- Next cycle: Arena (rotation). Arena W screen could use a subtle jumbotron pixel grid texture behind the "YOU'RE IN!" text, or a "confetti cannon" burst that radiates from center.

## Cycle 74 Learnings
- Live bidder indicators on tier cards add the missing live-auction social proof that Arena needed — you can see others "competing" for the same tier.
- Inverse proportional seeding (Open ~15-20, Ultimate ~2-5) creates realistic demand distribution — most people go for affordable, few for ultra-premium.
- Overlapping 6px dots with staggered pulse animations read as "active users" at a glance, even at small sizes.
- Jittering counts every 2-4s (random interval) prevents the UI from feeling mechanical — real bid activity is bursty.
- The `useTierBidders` hook is independent of feed events — bidder counts jitter on their own schedule, separate from purchase simulation.
- "+N" overflow indicator when count > 5 prevents visual clutter while still communicating scale.
- 45% opacity on "X selecting" text keeps it informational without competing with price/supply.
- This feature touches conversion AND purity: it's both a social proof urgency mechanism (conversion) and a distinctly Arena/live-auction element (purity).
- Next cycle: Supreme (rotation). Supreme could benefit from a subtle gradient shift on the background during phase transitions — the void itself changes mood.

## Cycle 75 Learnings
- Phase transition pulses (full-page color wash on phase shift) add dramatic punctuation without any UI elements — perfectly Supreme.
- 8% peak opacity is the sweet spot — enough to register as "something changed" without being a flash or distraction. Higher (15%+) felt like an error.
- Using useRef to track previous phase prevents false triggers from re-renders. The pulse fires exactly once per transition.
- The amber (OPEN→CLOSING) and red (CLOSING→CRITICAL) colors match the existing urgency color system, so they feel native, not added.
- 600ms with ease-out gives a natural "inhale" feeling — quick peak, gentle fade. Shorter (200ms) felt like a glitch, longer (1s) felt sluggish.
- z-36 positions the pulse above the breathing vignette (z-5) but below the CRITICAL vignette (z-40) and last-light dim (z-38) — the layers compose correctly.
- The pulse is a state transition marker, not an ongoing effect. It fires once and disappears. This aligns with Supreme's philosophy: minimal, purposeful, no noise.
- Next cycle: Broadcast (rotation). Broadcast could explore a "channel change" static effect between phase transitions — like switching broadcast feeds.

## Cycle 76 Learnings
- The `feedCut` state and phase-transition detection logic existed since earlier cycles but had zero visual output. Always render what you detect — half-implemented state is wasted code.
- The static band uses `repeating-linear-gradient` with alternating white lines at 1-4px pitch and 3-8% opacity to simulate analog TV static. The `::after` overlay adds a Gaussian brightness peak at 50% height for a scanning beam effect.
- 350ms sweep duration (top to bottom) is fast enough to feel like a real camera feed cut, not a distracting animation. 200ms was too fast to register; 500ms felt like a loading bar.
- z-42 positions the feed cut above all broadcast overlays (score bug z-40, replay tag z-20, etc) so it sweeps over everything, which is correct — a feed cut affects the entire broadcast signal.
- Dynamic ISO CAM label (1→2→3) on phase transitions reinforces the multi-camera production metaphor. Sports broadcasts use multiple camera angles, and the "ISO" designation is production jargon that fans recognize from behind-the-scenes content.
- The 8% height band (instead of full-screen white flash) is important — it looks like a scanning interference band, not a flash. Full-screen effects feel like errors; narrow bands feel like authentic broadcast artifacts.
- This completes the broadcast phase-transition vocabulary: urgency banner changes text, progress bar depletes, hero saturation shifts, CTA copy updates, and now a camera feed cut sweeps the screen. Multiple signals reinforcing the same event.
- Next cycle: Arena (rotation). Arena could benefit from a "timeout huddle" overlay on phase transitions — like a basketball timeout called during critical moments.

## Cycle 77 Learnings
- All three directions now have distinct phase-transition effects: Supreme = void color wash (subtle, atmospheric), Broadcast = camera feed cut (production artifact), Arena = timeout jumbotron (in-arena event). This creates a unified design system where each direction responds to the same event in its own language.
- "OFFICIAL TIMEOUT" and "20 SECOND TIMEOUT" are real NBA terminology that basketball fans will instantly recognize. Using authentic league language deepens the arena metaphor.
- The text animation (scale 1.8x → 1x with letter-spacing 0.5em → 0.2em) mimics kinetic typography on real NBA arena jumbotrons — text zooms in and tightens dramatically.
- Dark backdrop at 60% opacity is important — it creates the feeling of the arena lights dimming during a timeout, which is what actually happens in NBA games.
- z-38 layering is carefully chosen: above the crowd wave (z-6) and critical vignette (z-35), but below the buzzer overlay (z-45-47). The buzzer is a more important event and should override the timeout visually.
- 2s duration matches the pacing of other Arena effects (buzzer is 2.2s, LED flash is 0.35s, camera flash is 0.08s). Phase transitions are significant but not as dramatic as the final buzzer.
- The `useArenaTimeout` hook follows the same pattern as `useArenaBuzzer` — useRef to track previous phase, fire once per transition, auto-cleanup timer. This pattern is now proven for all three directions.
- Next cycle: Supreme (rotation). Supreme is at parity with the other two directions. Could explore: ambient audio visualizer (silent but visual), or a premium unboxing reveal on the hero image.

## Cycle 78 Learnings
- Price scramble/decrypt reveal is a conversion micro-interaction — the price feels "earned" and "decoded" rather than static. This is distinct from the existing slot-machine edition counter (W screen) — that reveals a number you've received, this reveals a price you're about to pay.
- The left-to-right settling pattern (character i settles at `progress - i/length*0.4`) creates a natural cascade: `$` stays fixed, first digit locks, then cascading rightward. More premium than all-at-once reveal.
- 500ms for tier switch, 600ms for initial page load — the initial reveal is slightly longer to build anticipation. Tier switch is faster because the user is actively browsing and shouldn't be slowed down.
- The `usePriceScramble` hook separates concerns cleanly: it takes a price number, returns `{ display, isScrambling }`. The scramble string preserves `$`, `,`, `.` characters — only digits randomize.
- Two separate useEffect hooks (one for price changes, one for mount) is cleaner than a combined effect that checks "is this the first render?" The mount effect runs once with a longer duration; the price-change effect tracks `prevPrice` via useRef.
- The scramble integrates seamlessly with all CTA text variants: "OWN THIS MOMENT — $5", "CLOSING SOON — $5", "LAST CHANCE — $99". The static prefix text stays stable while the price portion scrambles.
- This is Supreme's first CTA TEXT animation (all previous CTA enhancements were container-level: glow, bounce, ring, lock icon). The text itself coming alive adds a new dimension of interaction quality.
- Next cycle: Broadcast (rotation). Broadcast could explore a dramatic editorial headline reveal animation, or a lower-third "Now Playing" tag on the hero that changes with the current phase.

## Cycle 79 Learnings
- Typewriter/teleprompter reveal on the pull quote is pure broadcast DNA — it transforms static text into a live reading moment. The quote feels like it's being voiced over by an ESPN anchor.
- `useTypewriter` hook is minimal: useState for charIndex, setTimeout per character, done flag. No libraries needed for this effect.
- 28ms per character is the sweet spot — fast enough to not bore, slow enough to read along. A 60-char sentence takes ~1.7s which is natural broadcast pacing.
- IntersectionObserver at 0.4 threshold ensures the quote is well visible before typing starts — user doesn't miss the beginning.
- `minHeight: 4.5em` on the quote paragraph prevents layout shift as characters appear. Without it, the container grows as text wraps to new lines, causing a jarring scroll jump.
- The team-color cursor (2px wide, 1.15em tall) matches the broadcast accent language — it's a visual element, not just a functional marker.
- `steps(1)` animation timing on the cursor blink gives a crisp on/off toggle (no fade), like a real broadcast teleprompter cursor or terminal.
- The cursor-done class blinks 3x then sets opacity to 0 via `animation-fill-mode: forwards` — a clean exit that signals "reading complete."
- Footer attribution fading in only after typing completes creates a two-beat reveal: dramatic quote → source. Like a broadcast graphic adding the source line after the pull quote appears.
- Extracted as `TeleprompterQuote` component (not inline in BroadcastPage) because it has its own ref, visibility state, and typewriter state — clean separation.
- Next cycle: Arena (rotation). Arena could explore a purchase confetti cannon effect, or animated tier badge glow when a tier is about to sell out.

## Cycle 80 Learnings
- Multi-layer text-shadow (8px/24px/48px at diminishing opacity) is the key to LED board glow — single-layer looks flat, triple-layer creates convincing light bloom.
- The scan line is distinct from Broadcast's CRT scanlines: one bright moving line vs many static repeating lines. Different visual metaphor — LED refresh vs TV monitor.
- Using `inline-block` wrapper on the h1 lets the scan line be positioned relative to just the text width, not the full-width container.
- The scan line's gradient (transparent→team-color→white→team-color→transparent) creates a natural light-peak profile, not a harsh bar.
- `box-shadow` on the scan line adds a soft glow trail that reinforces the LED board look.
- Hidden when ended via conditional render — the scoreboard powers off with the arena.
- Arena hero now has: action image backdrop, player gradient, spotlight sweep, player name LED glow + scan. The jumbotron metaphor is layered but not competing.
- Next cycle: Supreme (rotation).

## Cycle 81 Learnings
- Hero color reveal (grayscale→color) is the most "Supreme" page-load effect — it's one transition, no moving parts, pure restraint. Apple keynote energy.
- 200ms delay before triggering the reveal ensures the user sees the desaturated state first — without it, the page might render already in color.
- `cubic-bezier(0.16, 1, 0.3, 1)` spring easing on the filter transition makes the color bloom feel organic, not mechanical.
- Team-color ambient glow fading in separately (0→1 opacity, 2.5s) creates a two-beat reveal: first color returns, then the glow blooms. Layered drama.
- The reveal respects ended/purchasing states — those have their own filter overrides that take priority.
- This is Supreme's only page-load dramatic effect (everything else is ambient/ongoing). One entrance moment, then restraint.
- Next cycle: Broadcast (rotation).

## Cycle 82 Learnings
- `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)` is the cleanest way to create a left-to-right text reveal — no overflow:hidden wrapper needed, no transform trickery. The clip-path respects the text shape perfectly.
- The traveling edge highlight (3px bright line with team-color box-shadow glow) is what sells the "graphic building" effect — without it, the clip-path reveal is just a silent wipe. The glow makes it feel like a broadcast graphic printer/laser marking the text.
- The h1 needs to be wrapped in a `relative` container for the edge line to be absolutely positioned against. The original h1 had `pl-3` which moved to the wrapper to maintain spacing.
- 0.5s delay on the name reveal coordinates with the existing lower-third slide-in animation — the lower-third container slides in first, then the name reveals within it. Two-beat entrance.
- 0.9s duration with spring cubic-bezier (0.16, 1, 0.3, 1) feels fast and confident. Slower durations (1.5s+) feel sluggish for a name reveal.
- SMPTE timecode at 30fps using requestAnimationFrame is authentic — broadcast production uses 29.97fps (NTSC) or 30fps. The HH:MM:SS:FF format is immediately recognizable to anyone familiar with video production.
- The timecode fades in at 1.8s delay — after score bug (1.2s), ticker, and other overlays have settled. Production markers appear last because they're the most subtle/technical detail.
- Broadcast production overlay count is now: ticker (top), network bug (top-right), score bug (top-left), replay tag (mid-right), lower-third (bottom-left), REC indicator, ISO CAM label, SMPTE timecode, progress bar (bottom), lens flare, scanlines, grain, Ken Burns drift. 13 distinct broadcast elements — this is a genuine production control room.
- Next cycle: Arena (rotation).

## Cycle 83 Learnings
- Basketball court lines as spatial grounding is a strong Arena metaphor — you're literally standing on the court. The SVG uses viewBox with centered positioning and 120% scale for natural bleed.
- 3.5% opacity is the sweet spot for court lines — visible enough to recognize, invisible enough to not compete with content.
- Next cycle: Supreme (rotation).

## Cycle 84 Learnings
- "SOLD" watermark on ENDED state is very Supreme: one word, diagonal, 3% opacity. References Sotheby's/Christie's sold lot stamps. Gives the ended state visual finality instead of just dimming/desaturating.
- The context section (between hero and info strip) was the only section missing an entrance animation. Adding `supreme-context-enter` at 0.3s stagger fills the gap in the orchestrated reveal: hero (0.1s) → context (0.3s) → info (0.4s) → social (0.7s).
- Reusing the existing `supreme-info-in` keyframe with a different delay is cleaner than creating a new keyframe for the same motion.
- ENDED state improvements are low-delta but high-polish — they complete the lifecycle rather than improving the conversion path.
- Next cycle: Broadcast (rotation).

## Cycle 85 Learnings
- Each direction now has its own ENDED-state visual treatment: Supreme has "SOLD" watermark (auction), Broadcast has "THIS BROADCAST HAS CONCLUDED" end slate (TV off-air), Arena already has buzzer effect from cycle 68.
- The end slate uses backdrop-blur + translucent background to sit naturally on the dimmed hero without fighting the desaturation.
- 0.5s delay on the end slate animation lets the hero desaturation settle first, then the card fades in — two-beat sequence.
- Broadcast end slate is restrained — small centered card vs. Supreme's full-hero diagonal. Each direction's ENDED treatment matches its personality.
- Next cycle: Arena (rotation).

## Cycle 86 Learnings
- Post-game box score card in the live feed area is a smart spatial reuse — the feed is hidden on ended, so the same real estate becomes a stats recap. Zero layout shift.
- `grid grid-cols-2 gap-[1px] bg-white/[0.03]` with `bg-[#0B0E14]` cells creates scoreboard-style cell dividers without actual border elements. The gap color bleeds through as divider lines.
- FINAL badge in mono tracking (font-mono uppercase tracking-wider) reads as "official" — mimics the scoreboard display markers you see in NBA post-game graphics.
- "SOLD OUT" in red vs "remaining" in muted gray is a cheap conditional that adds drama when the drop fully sells through.
- Drop stats summary (compact horizontal layout replacing panic banner on ended) is a better use of that space than just hiding the banner. Shows collected + peak velocity as retrospective highlights.
- Tier selected glow (`arena-tier-selected-glow` 2s breathing pulse) is subtle but important — during live drops, it visually confirms "this is your selection" without adding text. Live auction highlight energy.
- All 3 directions now have ENDED-state visual treatments: Supreme (SOLD watermark), Broadcast (end slate card), Arena (post-game box score + buzzer effect). Arena's is the most data-driven, which is on-brand.
- Next cycle: Supreme (rotation).

## Cycle 87 Learnings
- Tier ambient shift (page aura reacts to tier selection) adds an interactive dimension that deepens the tier-browsing experience. The void responds to your intention — you're not just picking, you're previewing.
- `useMemo` keyed on `selectedTier.tier` (not `selectedTierIdx`) is more semantically correct — the accent color should change when the tier name changes, not the index.
- Gold tint on Legendary (#D4A017 warm gold) and Ultimate (#FEC524 pure gold) creates immediate premium signaling before the user reads the price. Gold = expensive is universal psychology.
- Rare → team-color primary is the right choice (not a generic blue). It ties the "rare" tier to the specific moment's identity — a Heat rare feels different from a Nuggets rare.
- Four elements participate: breathing vignette (box-shadow), CTA glow (background), edge trace (gradient+shadow), tier underline (background-color). Each transitions independently at 1s ease for smooth, deliberate shifts.
- Urgency phases (CLOSING/CRITICAL) still override the tier tint — urgency always wins. The tier ambient shift is a "browsing mode" enhancement that yields to urgency colors when time pressure kicks in.
- The `tierAccentColor` variable is derived once via useMemo and reused across all 4 application points — DRY and efficient.
- This is Supreme's first tier-reactive ambient effect. Previously, tier selection only changed the underline indicator color (team-color). Now the entire ambient layer responds.
- Next cycle: Broadcast (rotation). Broadcast could explore a similar concept — editorial tone shift on tier selection (e.g., different editorial tagline emphasis, or hero treatment variation per tier).

## Cycle 88 Learnings
- Crash zoom (scale 1→1.03→1.0) on phase transitions is a classic broadcast director technique. 1.03x is the sweet spot — enough to register as a "punch in" without feeling like a layout shift. 1.05x+ would be too dramatic.
- Coordinating crash zoom with existing feed cut + ISO CAM label switch creates a triple-signal phase transition: visual (static band), spatial (zoom), metadata (camera designation). Multiple signals reinforce the same event.
- The CSS transition approach (toggle `crashZoom` state on/off with timeout) is simpler than a CSS animation keyframe for this one-shot effect. The state toggle gives you asymmetric timing: fast spring-in (200ms), slower ease-out (300ms).
- `overflow: hidden` on the hero section is crucial — the 1.03x scale would cause content bleed at edges without it. Hero already had this class.
- The 500ms total duration matches the feed cut (350ms) — both fire simultaneously but the zoom outlasts the static by 150ms, creating a subtle "settle after disruption" feel.
- Broadcast phase transitions now have 4 coordinated signals: urgency banner text change, feed cut static band, camera crash zoom, and ISO CAM label switch. The most complete of any direction.
- Next cycle: Arena (rotation). Arena could benefit from a similar phase-transition technique — perhaps a "jumbotron glitch" effect where the display briefly scrambles.

## Cycle 89 Learnings
- Jumbotron instant replay entrance is a high-recognition cultural moment — every NBA fan has seen the zoom + "INSTANT REPLAY" graphic on the arena screen. Strong purity play.
- Applying the replay zoom to both image layers (action image + player gradient) keeps them in sync. A separate zoom per layer would look broken.
- VHS tracking line (white gradient band with glow) sweeping top→bottom in 0.8s is the perfect analog video artifact — distinct from Broadcast's CRT scanlines (repeating horizontal pattern) and arena's LED scan (single line on text).
- The replay badge uses the existing Oswald + team-color pattern from other arena badges. Consistency is key — new elements should use the established visual language.
- 2.2s state lifetime with CSS animations of 1.8-2.0s ensures all animations complete before unmounting. The 200ms buffer prevents jarring mid-animation removal.
- Each direction now has a distinct entrance ceremony: Supreme = grayscale→color reveal (cycle 81), Broadcast = name reveal wipe (cycle 82), Arena = instant replay zoom (cycle 89). All are identity-correct one-shot animations.
- The `replayActive` boolean pattern (true on mount → false after timeout → conditionally render) is the same pattern used for buzzer, timeout, and camera flash. Proven, simple, reliable.
- Next cycle: Supreme (rotation). Supreme could explore a glass morphism/frosted panel effect on the info strip, or a subtle counter animation on the edition scarcity text.

## Cycle 90 Learnings
- CTA sonar invite pulse is a conversion micro-interaction — draws the eye to the purchase point exactly once. The 1.2s delay after load ensures it fires after the staggered entrance animations complete, so it's the "final" visual event.
- `onAnimationEnd` for self-removal is cleaner than a timeout — it's frame-accurate and doesn't leave stale DOM elements.
- Tier switch breathe (3px shift + opacity dip) is barely perceptible consciously but makes the UI feel alive subconsciously. 0.35s is the sweet spot — shorter feels jittery, longer feels sluggish.
- Both effects use tier accent color, so they shift with the tier ambient system from cycle 87. Unified visual language.
- Using a `prevTierIdx` ref to detect actual tier changes (not just re-renders) prevents false triggers. The pattern: compare ref to state, update ref, fire effect.
- Next cycle: Broadcast (rotation). Broadcast could explore a "director's cut" hover state on stat cards, or a ticker tape animation on the editorial headline.

## Cycle 91 Learnings
- PiP thumbnail is one of the most broadcast-authentic additions yet — every sports fan recognizes the picture-in-picture technique from watching games.
- IntersectionObserver at 0.15 threshold (not 0) means the PiP appears when the hero is 85% scrolled out — preventing a jarring flash on tiny scroll amounts.
- Smart repositioning (bottom: 72px when sticky bar visible, 20px otherwise) prevents the two fixed elements from overlapping. The transition is smooth via the `transition-all duration-500`.
- 110×72px is the sweet spot for mobile PiP — large enough to see the player, small enough to not obstruct transaction content. 16:10-ish ratio matches broadcast PiP conventions.
- pointer-events-none prevents the PiP from intercepting scroll or tap events — it's purely atmospheric/informational.
- The PiP has a functional conversion angle: keeping the player's face visible near the CTA while the user scrolls through editorial content maintains emotional connection at the moment of decision.
- Broadcast overlay inventory is massive: ticker, score bug, network bug, replay tag, lower-third, production markers, PiP, sticky CTA. Still doesn't feel cluttered because each operates at different opacity/positioning levels.
- Next cycle: Arena (rotation). Arena could explore a "fan cam" selfie circle on the W screen, or a confetti cannon burst animation.

## Cycle 92 Learnings
- Per-second clock tick pulse using `prevSeconds` ref comparison is clean and reliable — detects actual second changes, not re-renders. The same pattern used across the codebase for detecting state transitions.
- 80ms spring-in (cubic-bezier 0.16, 1, 0.3, 1) + 150ms ease-out creates a crisp "tick" feel — fast attack, gradual release. Matches the visual rhythm of a shot clock.
- 1.12x scale is the sweet spot for the tick — visible enough to create tension, subtle enough to not feel like a bug. Larger (1.2x) makes the layout feel jittery.
- Syncing the shot clock ring opacity (0.25→0.45) with the text tick creates a unified "system pulse" — the entire countdown cell breathes together.
- The dual-layer text-shadow (12px tight + 24px bloom) creates a glow that reads as "urgency" even in peripheral vision. The glow intensification is more impactful than the scale alone.
- CRITICAL phase is Arena's most dramatic state: red vignette + urgency-fast pulse + shot clock depletion + panic banner + clock ticks. Each adds one layer of tension.
- Next cycle: Supreme (rotation). Supreme could explore a "vault door" animation on tier selection, or a signature/autograph effect on the W screen.

## Cycle 93 Learnings
- Magnetic button uses rAF-throttled mousemove for smooth 60fps tracking without firing on every pixel. The `cancelAnimationFrame` before each new request prevents frame stacking.
- Max 6px displacement is the sweet spot — noticeable enough to feel "alive" but subtle enough to not feel buggy. 10px+ feels like a UI glitch. 3px is barely perceptible.
- Cubic-bezier(0.33, 1, 0.68, 1) for the spring-back on mouse leave creates natural elastic deceleration — the button doesn't snap back mechanically, it settles.
- The glass highlight (radial gradient light spot following cursor) adds a second layer of responsiveness that makes the magnetic pull feel intentional rather than broken. Without the highlight, the pull alone could feel like a rendering bug.
- Merged ref pattern (callback ref assigning to two ref objects) is needed when a single element must serve two purposes — IntersectionObserver for sticky CTA visibility + magnetic hook for cursor tracking.
- Mouse-only events (no touch) are intentional — magnetic pull on touch doesn't work conceptually (no hover state) and would conflict with tap. Desktop-only polish is fine.
- `overflow-hidden` on the button is needed for the glass highlight radial gradient to be clipped to the button's rounded corners.
- `will-change: transform` on the button helps GPU compositing for the translate() animation — prevents layout thrashing during continuous mousemove updates.
- The glass highlight only renders when `offset !== (0,0)` — no DOM noise when cursor isn't on the button.
- Next cycle: Broadcast (rotation). Broadcast could explore a "director's commentary" text annotation that appears on extended hover over stats, or a TV-static channel-switch effect on tier changes.

## Cycle 94 Learnings
- TV channel-switch static on tier change is a natural extension of Broadcast's existing feed-cut pattern — same visual language (repeating-linear-gradient static), different trigger (user action vs phase transition).
- CH number indicator (top-right) is a nice detail that sports fans who grew up with analog TV will recognize. Different from the ISO CAM label (production metadata).
- 400ms is shorter than the feed-cut sweep (350ms) but has more stutter stops (6 vs smooth sweep). Different pattern = different feeling despite same visual elements.
- Broadcast now has tier-switch feedback: static flash + CH label. Supreme has tier-switch feedback: ambient shift + breathe. Arena needs its own.
- Next cycle: Arena (rotation). Arena could explore a crowd energy visualization, or a jumbotron-style tier spotlight.

## Cycle 95 Learnings
- Crowd energy meter beneath CTA is a novel live-commerce element — it makes purchase velocity tangible as a "power gauge" right at the decision point.
- Three-tier color system (teal RISING → amber HIGH → red MAX) maps cleanly to the existing urgency color language (teal=normal, amber=closing, red=critical).
- 3px height is subtle enough to not compete with the CTA button above it, but thick enough to register as a gauge, not a decoration.
- velocity/22 ratio for fill percentage is calibrated so the meter is usually 50-80% full (velocity jitters 10-18), occasionally hitting MAX. Always-full or always-low would both be useless.
- The 0.8s opacity pulse at MAX level (≥18/min) creates urgency without being annoying — it says "the crowd is at peak energy" which pressures the buy decision.
- Box-shadow glow at each level adds perceived thickness — the 3px bar feels bigger when it's glowing.
- Labels ("Crowd Energy" + "RISING/HIGH/MAX") use Oswald for consistency with the Arena's jumbotron typography language.
- Hidden during purchasing and ended states — no visual noise when the meter isn't useful.
- Arena now has a crowd energy visualization both geographic (heat map) and temporal (energy meter). Together they answer "where are buyers?" and "how fast are they buying?"
- Next cycle: Supreme (rotation). Supreme could explore a hover state on the tier labels, or a subtle card-tilt perspective on the hero image during scroll.

## Cycle 96 Learnings
- Supreme's critical timer pulse (1.03x) is intentionally less dramatic than Arena's (1.12x) — Supreme whispers where Arena shouts. The restraint IS the identity.
- 60ms spring-in vs Arena's 80ms — Supreme's tick is slightly faster, creating a "sharper" pulse that feels more precise and controlled.
- 120ms ease-out for the return (vs Arena's 150ms) — the pulse resolves quickly, keeping the minimal aesthetic. No lingering glow.
- The text-shadow goes from a subtle 4px baseline glow to 8px+20px on tick. The delta is small but the double-layer (tight + bloom) makes it register subconsciously.
- Using `countdown.totalSeconds > 0` instead of `!isEnded` because `isEnded` is defined later in the component. Same logic, different variable access.
- The tick effect uses inline style transition override (60ms on tick, 120ms on release) because CSS class-based transitions would require adding/removing classes every second, which is noisier.
- Supreme and Arena now both have per-second CRITICAL timer feedback but in completely different styles. Broadcast doesn't need this — its urgency is editorial (text-based), not rhythmic.
- Next cycle: Broadcast (rotation). Broadcast could explore a dramatic "COMMERCIAL BREAK" bumper between tiers, or a Ken Burns speed-up in CRITICAL phase (the camera operator is getting nervous).

## Cycle 97 Learnings
- 35mm film frame sprocket holes use CSS custom properties (--film-hole-color, --film-border-color) for per-moment team-color tinting — this pattern is reusable for any direction that needs adaptive-color decorative elements.
- `radial-gradient(ellipse 6px 8px ...)` creates realistic rounded-rectangle sprocket holes at minimal CSS cost. Real 35mm sprocket holes are slightly taller than wide, so ellipse > circle.
- 28px pitch (vertical repeat) with 18px-wide strips creates proportions close to actual 35mm film (0.166" holes at 0.187" pitch on 0.0512" margins). Close enough for metaphor, not obsessing over spec.
- The film frame only appears on the hero section (via class) — it would be inappropriate on the editorial text section. The hero IS the "film frame" containing the moment.
- The 1px inner edge lines (`border-right`/`border-left` on pseudo-elements) subtly separate the sprocket strip from the hero image area, like the boundary between film emulsion and sprocket rail.
- Broadcast hero now has layered atmospheric effects: Ken Burns drift, film grain, CRT scanlines, lens flare, crash zoom, and now film frame. Each references a different aspect of broadcast/cinema production (camera movement, analog media, monitor technology, optics, direction, physical film).
- Next cycle: Arena (rotation). Arena could explore a "coach's challenge" replay mechanic on hover, or a crowd wave speed-up in CRITICAL phase.

## Cycle 98 Learnings
- Crowd chant ticker with 15% opacity + text-shadow glow creates jumbotron LED prompt energy without being distracting.
- 6× repeated chant text with 👏 emojis as separators creates natural scroll rhythm. 12s cycle is slow enough to read but fast enough to feel "live."
- Hiding the chant on ENDED makes sense — the crowd goes home. Arena elements that are "alive" should die with the drop.

## Cycle 99 Learnings
- The auction gavel countdown ("GOING ONCE..." / "GOING TWICE...") completes a narrative trilogy in Supreme: LOT XXXX (you arrive at the auction) → gavel calls (the auctioneer pressures you) → SOLD (the lot is closed). Each exists in a different location (top-right, center, diagonal) and different state (live, critical, ended).
- Key-indexed re-trigger (`gavelKeyRef.current += 1`) is necessary because React won't re-trigger CSS animations when only the text changes. The key forces unmount/remount of the div, restarting the animation.
- Using `viewPhase` instead of `isPurchasing` in the effect dependency avoids a "used before declaration" TypeScript error — `isPurchasing` is a derived const declared later in the component. Same logic, different variable scope.
- z-42 for the gavel sits neatly between critical vignette (z-40) and W screen (z-50). The layering stack matters — gavel text must be visible through the red vignette but not interfere with purchase confirmation.
- "GOING TWICE..." in red (#EF4444) with glow creates dramatic escalation from phase 1's muted white. The color shift alone signals urgency intensification.
- Letter-spacing animation (0.4em → 0.3em) on the gavel text creates a "settling in" feel — the text arrives loose and tightens as it takes form. More premium than a simple fade.
- Next cycle: Broadcast (rotation). Broadcast could explore a "GOING TO COMMERCIAL" bumper on phase transitions, or a director's "CUE TALENT" prompt in the production markers area.

## Cycle 100 Learnings
- The "3-2-1-LIVE" countdown leader transforms page load from a passive event into a theatrical entrance. At 2.3s it's fast enough not to annoy but slow enough to build anticipation.
- Registration crosshair SVG (concentric circles + cross lines + tick marks) is the most recognizable element of a broadcast leader — even at low opacity it reads as "TV production."
- White flash bursts between digits (100ms, 60% peak) create the film-leader transition feel without being jarring. Key: keep them short and max opacity moderate.
- z-100 on the leader overlay ensures it covers all other broadcast overlays (ticker, score bug, network bug) which are z-40-50. Clean layering.
- The fade-out uses a separate animation rather than opacity transition — this allows the `onComplete` callback to fire at a fixed time rather than depending on transition events.
- State management: `leaderDone` boolean set by `handleLeaderComplete` (useCallback for stability). No sessionStorage needed — replaying on each navigation is fine, even desirable, since it reinforces the broadcast identity.
- Broadcast direction now has a complete production lifecycle: countdown leader → live broadcast → feed cuts → phase transitions → end slate. This is the most narratively complete of the 3 directions.
- Next cycle: Arena (rotation). Arena could explore a pre-game warmup sequence, arena lights dimming effect, or a "starting lineup" entrance.

## Cycle 101 Learnings
- ArenaFlameJets was already coded (component + keyframe) but never wired into the render tree. Always check for orphaned components before building new ones — free wins hiding in the codebase.
- The ticket stub connects the hero's "SEC 108 · ROW C · SEAT 12" badge to the W screen — continuity between browsing and confirmation makes the "you were at the game" metaphor hold together end-to-end.
- Perforated left edge (12 circular cutouts with negative margin) creates the torn-ticket effect without SVG — simple `bg-[#0B0E14]` divots that "cut" into the card border.
- Team-color gradient background on the ticket stub (primary 12% → white 3% → secondary 8%) is subtle enough not to compete with the main YOURS content but distinct enough to feel like a team-branded ticket.
- Dashed border divider between seat info and stats creates natural visual grouping — mirrors real ticket stub tear line.
- Ticket ID format (TST-XXXX-0000) using moment.id + padded edition number adds authenticating detail without a full barcode/QR — minimal ticket stub energy.
- Arena now has 4 simultaneous purchase reaction systems: LED flash (ambient glow), CrowdReactions (emoji burst), CameraFlash (white strobe), FlameJets (pyrotechnic columns). Each at different z-layers, different trigger rates (~100%, ~100%, ~40%, ~50%) — together they create overwhelming arena energy without any single effect dominating.
- Next cycle: Supreme (rotation). Supreme could explore a "lot provenance" detail on the W screen, or a premium unboxing reveal animation.

## Cycle 102 Learnings
- Provenance chain on the W screen is pure Supreme — text-only, no flashy visuals, just formal verification language that makes the purchase feel officially documented.
- 200ms stagger between steps (800→1000→1200→1400ms) creates a satisfying cascade that feels like a system processing in real-time, not just showing static text.
- Each step uses translateX(-8px)→0 entrance (not Y) — the horizontal slide-in feels like items being checked off a physical list, distinct from the vertical reveals elsewhere.
- Team-color checkmark SVG circles (12×12px, 0.75 stroke width, 0.3 opacity ring + 0.5 opacity checkmark) are subtle enough to read as verification marks without looking like a success toast.
- The provenance chain lives between the matchup/date stamp and the share section — positioned as authentication documentation below the edition number, above the social actions. Natural hierarchy.
- Supreme's W screen now has: giant "W" → "YOURS." → divider → player name → edition counter + auth seal → matchup + date → provenance chain → share buttons. The information cascade tells a story: you won → here's what → here's the number → here's the proof → share it.
- Next cycle: Broadcast (rotation). Broadcast could explore a "post-game interview" style quote treatment or a sports analyst commentary section on the W screen.

## Cycle 104 Learnings
- Fan Cam frame on the W screen is distinctly arena — live, social, performative. The red badge + viewfinder corners + team-color gradient border turn the edition card into a jumbotron moment.
- Conic-gradient is cleaner than linear-gradient for animated borders — single declaration covers the full rotation, no keyframe angle gymnastics needed. Opacity pulse (0.7→1.0, 3s) gives a subtle shimmer without the complexity of rotating the gradient itself.
- Simplified camera viewfinder corners: 4 explicit divs with Tailwind border utilities (border-t-2 border-l-2, etc.) is far cleaner than mapping an array with complex style objects. Explicit > clever for 4 elements.
- The "FAN CAM" badge uses the same red pill + ping dot pattern as the LIVE badge in the main header — visual consistency within the Arena direction.
- W screen feature density per direction: Supreme (auth seal + provenance chain — formal), Broadcast (wax seal + end credit + photographer flash + BREAKING chyron — cinematic), Arena (ticket stub + fan cam frame + crowd roar EQ + confetti — live entertainment). Each direction's W screen personality is clearly divergent.
- Next cycle: Supreme (rotation). Supreme at 9.0+ — deep polish territory. Could explore a "collector's catalog" presentation or premium card tilt/3D effect on hover.

## Cycle 105 Learnings
- 3D card flip via CSS `perspective(1200px) rotateY()` creates an instantly recognizable physical metaphor — every trading card collector knows the flip-to-reveal moment.
- Spring overshoot in the flip (180°→8°→-2°→0°) prevents the rotation from feeling mechanical. The slight wobble past 0° and back gives it physical weight.
- Card-back overlay as a separate fixed layer (z-15) with its own fade animation is simpler than trying to do a true CSS backface-visibility two-sided card. The back just needs to be visible for the first ~40% of the flip, then disappear.
- Diamond crosshatch pattern (`repeating-linear-gradient 45deg + -45deg`) at 6% opacity is the right density for a card back — visible as texture, not as a grid. The TST monogram at 15% is a ghost watermark.
- The lot number on the card back matches the lot number on the hero (same formula) — continuity between the auction browsing experience and the post-purchase reveal.
- Card-flip wrapper contains the burst rings outside it (they play simultaneously) — the burst expands while the card flips, creating layered reveal drama.
- Next cycle: Broadcast (rotation). Broadcast could explore a "season highlight reel" film strip treatment on the W screen, or a dramatic camera dolly zoom entrance.

## Cycle 106 Learnings
- The instant replay thumbnail adds a second emotional beat: certificate (ownership) → replay (the moment). This two-beat structure mirrors broadcast pacing — announce the result, then cut to the highlight.
- Broadcast grading (saturate 0.85, contrast 1.15) gives the action image that post-game highlight reel look. Slightly desaturated + punchy contrast = professional broadcast color.
- Play triangle in a frosted glass circle is a universal "this is video" affordance. Even though it's not functional, it makes the moment feel alive — not just a static card you bought.
- transitionDelay '0.4s' on the replay frame creates staggered reveal: certificate slides up first, then the replay frame follows. Without the delay, both would appear simultaneously and compete for attention.
- Team-color REPLAY badge with circular arrow icon is a compact broadcast signifier — matches the Instant Replay tag that exists on the main browsing page.
- W screen content density per direction is now: Supreme (W + YOURS + details + provenance chain), Broadcast (COLLECTED + certificate + replay + share + end credit), Arena (ticket stub + fan cam + crowd EQ + stats). Each tells a different post-purchase story.
- Next cycle: Arena (rotation). Arena could explore a "crowd selfie" or "arena scoreboard final" treatment to deepen the post-game celebration feel.

## Cycle 107 Learnings
- Scoring run banner is conceptually distinct from streak badge: streak = individual rapid-fire combos (gap < 4s), scoring run = aggregate momentum over 10s window (4+ purchases). Both are basketball-native but at different scales.
- Using a sliding window (filter timestamps within last 10s) is simpler and more reliable than tracking gaps between purchases for aggregate momentum.
- z-32 for the scoring run banner sits above the streak badge (z-30) but below phase overlays (timeout z-38, buzzer z-45+), creating proper layering hierarchy.
- The slide-in-from-right / hold / slide-out-left keyframe pattern creates a broadcast graphic feel — like an ESPN stat graphic that sweeps across screen during play.
- Arena is extremely feature-dense now (LED flash, camera flash, flame jets, streak badge, scoring run, crowd reactions, crowd wave, spotlight sweep, buzzer, timeout, chant ticker, court lines, instant replay entrance, clock tick). Need to be careful about visual noise — future Arena cycles should focus on refinement/removal rather than addition.
- Next cycle: Supreme (rotation).

## Cycle 108 Learnings
- SVG textPath for rotating text around a circle is lightweight and high-impact — no JS needed, just CSS rotation on the parent.
- Conic-gradient creates a convincing holographic shimmer when animated with background-position cycling — cheaper than multi-layer blend modes.
- 30% opacity is the sweet spot for authentication details — visible enough that collectors notice, subtle enough not to compete with the hero content.
- Supreme's auction house identity stack is now complete: lot number (cataloging) → holographic sticker (authentication) → gavel countdown (bidding) → SOLD stamp (finality) → provenance chain (verification). Each element maps to a real auction house process.
- z-13 for the sticker sits above the vitrine glass (z-12) but below hero text — proper layering for a background detail.

## Cycle 109 Learnings
- VU meters are a perfect fit for broadcast production overlay — adds audio dimension to a purely visual medium.
- CSS custom properties (--vu-peak) allow per-bar variation without JS — stagger peaks for organic equalizer feel.

## Cycle 110 Learnings
- Arena now has 5 layered hero atmosphere effects: action image, player gradient, spotlight sweep, laser beams, crowd wave. Each operates at different z-levels and animation frequencies to avoid visual competition.
- Thin laser beams (1.5px) work better than thick ones — real laser light is razor-thin, and thick beams would look more like spotlight than laser.
- White center peak + team-color edges is the key to realistic laser rendering — lasers have a bright core that washes out to color at the edges.
- Staggering 3 beams at different angles and speeds (7s/9s/8s) with delays (0s/2.5s/4s) creates organic cross-patterns without synchronization artifacts.
- z-8 for lasers between spotlight (z-7) and content keeps proper visual hierarchy.
- Arena page is now 2,440+ lines — increasingly important to keep new additions lightweight (this one is just a component + 3 CSS keyframes).

## Cycle 111 Learnings
- LOT (top-right) + PADDLE (top-left) creates a symmetric auction house UI frame — the item's identity and your identity bookend the hero.
- Deterministic pseudo-random numbers from moment ID charCodes create per-moment variation without state.
- SVG paddle icon at 10×14px with 0.8px strokes stays crisp at small size — thinner strokes would alias.
- 20% opacity matches the LOT number — both are background prestige details, not primary UI.
- Supreme's auction identity stack: PADDLE (top-left, your identity) → LOT (top-right, item identity) → holographic sticker (bottom-right, authentication) → gavel countdown (live bidding drama) → SOLD watermark (ended finality) → provenance chain (W screen verification). Complete auction lifecycle.
- Next cycle: Broadcast (rotation).

## Cycle 112 Learnings
- Location tags are a simple, high-impact broadcast element — one component, two keyframes, instant authenticity.
- Three-tier text hierarchy (label → name → detail) in different fonts/sizes creates broadcast-quality information density.
- Timed overlays (show → hold → dismiss) keep the page dynamic without cluttering — each element has a lifecycle.
- Arena data lookup tables are lightweight and easily extensible when new teams/moments are added.
- Broadcast overlay inventory is now comprehensive: ticker, score bug, network bug, replay tag, location tag, lower-third, production markers, film frame, lens flare, PiP, countdown leader, end slate, feed cuts, channel switch. Consider focusing future broadcast cycles on the purchase flow and W screen rather than adding more overlays.

## Cycle 113 Learnings
- Velocity-triggered overlays (≥16/min threshold) create a different trigger pattern from phase-shift triggers (timeout) or rapid-buy triggers (scoring run, streak). Arena now has 4 distinct jumbotron trigger types: load (replay), phase (timeout), burst (scoring run), and sustained velocity (noise prompt).
- 35s cooldown prevents the prompt from becoming annoying — it fires once, then the excitement must rebuild. Real arena prompts don't repeat every 5 seconds.
- The noise prompt was already implemented as uncommitted code — always check `git diff` before starting a new cycle. Building on existing work is faster than starting fresh.
- The keyframe was missing from globals.css but the component referenced it — always check both component AND CSS when shipping pre-existing code.
- Arena's jumbotron overlay system is now the richest interaction layer: replay → timeout → scoring run → noise prompt → buzzer. Each has a distinct trigger, visual treatment, and z-layer. Consider focusing future Arena cycles on the transaction flow or W screen rather than more overlays.

## Cycle 114 Learnings
- CSS `mask-composite: exclude` with matching `WebkitMaskComposite: xor` creates border-only rendering from a full-area gradient — no clip-path needed. Must include both prefixed and standard properties for cross-browser.
- Conic-gradient with 85% transparent + 15% visible arc creates a short "wiper" light that traces the perimeter convincingly. The arc length (15%) matches the rotation speed (1.8s) so the light appears to travel at a natural speed.
- Delay timing (1.8s) syncs with the hero color reveal ending — the vitrine lights up AFTER the artwork is revealed, like a museum curator turning on the display case after placing the piece.
- One-shot animations (animation-fill-mode: forwards) with parent opacity fade to 0 are cleaner than self-removing via state — no JS needed, pure CSS lifecycle.
- Supreme's entrance orchestration now has 5 timed stages: color reveal (0-2s) → vitrine power-on (1.8-3.6s) → lot/paddle fade-in → particles start → edge trace loops. Each reveals a different layer of the display case metaphor.
- Next cycle: Broadcast (rotation).

## Cycle 115 Learnings
- Two-layer clip-path (`inset(0 100% 0 0)` → `inset(0 0% 0 0)`) with staggered timing (140ms delay between bar and text) creates the signature ESPN data wipe effect. The bar "leads" the content, giving a door-opening feel.
- `cubic-bezier(0.22, 1, 0.36, 1)` is the ideal easing for broadcast wipe-ins: fast initial acceleration, then a spring-like settle that avoids feeling mechanical.
- Cascading the data wipe across multiple elements (stat line at 1.0s, context at 1.35s) creates a production sequence feel — each piece of information revealed in order, like a broadcast director calling "take" on successive graphics.
- The team-color left accent border (2px solid) on the data wipe bar adds broadcast chrome — the thin edge highlight is a hallmark of ESPN/FOX lower-third graphics.
- Broadcast now has a complete lower-third reveal sequence: name clip-path wipe (0.5s) → stat data wipe (1.0s) → context data wipe (1.35s). Each uses a different animation technique but they feel like one coordinated production.
- Next cycle: Arena (rotation).

## Cycle 116 Learnings
- usePATypewriter hook is clean and reusable: startDelay + charSpeed params, returns { displayed, done }. Could be used in other directions if needed (but shouldn't — keep directions divergent).
- 40ms per character feels right for PA announcements — fast enough to not bore, slow enough to read along. 35ms felt too rapid for the uppercase tracking-wide style.
- The blinking cursor with team-color glow adds subtle brand-color reinforcement to the W screen during typing.
- Ribbon board pulse at ~60% probability alternates naturally with existing LED flash and flame jets — the 3 purchase effects together create varied arena atmosphere without overwhelming.
- SVG stroke-dashoffset is the cleanest way to animate a light chasing a rectangular perimeter — no need for clip-path or gradient tricks.
- Arena W screen now has: headline bounce → PA typewriter → edition card fan cam → ticket stub → share buttons. The typing animation fills the gap between headline and card reveal with dynamic content.
- Next cycle: Supreme (rotation).

## Cycle 117 Learnings
- Sale record placard adds information (price, date, status) without breaking Supreme's minimal aesthetic — the key is very small type (7-8px), extreme tracking, and very low opacity borders/text.
- Reusing `lotNumber` from the card-back (line 539) maintains consistency — the lot number on the sale record matches the lot number visible during the card flip.
- Timing the reveal with `showSeal` (1.6s) places it after the provenance chain steps finish animating, creating a natural "and here's the final record" moment.
- Supreme's W screen is now information-dense but feels sparse because everything is at 10-25% opacity with generous spacing. The density is there for screenshots — zoom in and every detail rewards.
- At this level of polish, each new element must justify its existence. The sale record works because it adds new information (price, date) not shown elsewhere on the W screen.
- Next cycle: Broadcast (rotation).

## Cycle 118 Learnings
- Live viewer count adds social proof urgency without feeling aggressive — the broadcast framing ("watching this drop") makes it feel informational rather than manipulative.
- Deriving viewer count from `editionsClaimed + totalSeconds` creates natural variation: more claimed = higher viewers, less time = fewer viewers (mimics real viewership curve).
- Placing the viewer count ABOVE the CTA (not below) means it's the last thing seen before the purchase decision — optimal for conversion influence.
- Broadcast now has all 3 elements of the triple urgency stack near CTA: time (countdown), supply (editorial narrative), competition (viewer count + recent collectors). Each is presented in broadcast language rather than generic commerce.
- The `mt-8 mb-3` spacing on the viewer count naturally replaces the CTA's `mt-8` — conditional class application prevents double margin.
- Next cycle: Arena (rotation).

## Cycle 119 Learnings
- `useRef(false)` with a `firedRef` is the cleanest pattern for one-shot phase-transition effects — prevents re-triggers if totalSeconds oscillates near the boundary.
- Staggered ring delays (0s, 0.15s, 0.3s) with slightly increasing durations (1.2s, 1.3s, 1.4s) create natural wave propagation — each ring appears to "spawn" from the previous one.
- `cubic-bezier(0.16, 1, 0.3, 1)` spring easing on expanding rings makes them accelerate quickly then settle, mimicking a physical shockwave that expands fast then dissipates.
- Combining a screen flash (team-color overlay fading from 0.25 opacity) with expanding rings creates a "concussive" feeling — the flash is the blast, the rings are the wavefront.
- z-39 slots perfectly between timeout (z-38) and buzzer (z-45) — Arena's overlay z-stack is now: LED flash (z-20), ribbon pulse (z-21), camera flash (z-22), crowd reactions (z-25), streak badge (z-30), scoring run (z-32), critical vignette (z-35), noise prompt (z-36), timeout (z-38), horn shockwave (z-39), buzzer (z-45-47), confetti (z-50).
- Arena now has game-clock overlays for every major NBA timing event: replay (load), timeout (CLOSING entry), horn (CRITICAL entry), buzzer (END). Complete temporal coverage.
- Next cycle: Supreme (rotation).

## Cycle 120 Learnings
- Auction house estimate is a powerful endowment effect trigger — the buyer sees future value before spending. The multiplier range (×2.5–×8) is believable for sports collectibles.
- Ultra-subtle typography (8-10px mono, white/15-25 opacity) keeps the estimate subliminal — it's information for sophisticated collectors, not a sales pitch. Supreme's voice is quiet confidence.
- The estimate naturally scales with tier selection thanks to reactive derivation from `selectedTier.price` — no hardcoded values needed.
- Placing it between tier selector and CTA catches the eye at the decision point without cluttering the button area.
- Supreme's information architecture below the fold is now: context → info strip (timer + editions) → tiers → estimate → CTA. Each row adds one decision-relevant data point.
- Next cycle: Broadcast (rotation).

## Cycle 121 Learnings
- Tale of the Tape adds analytical depth between the raw stat cards and the emotional closing beat — the editorial flow is now: narrative → raw stats → comparative analysis → emotional thesis.
- Dual-bar visualization (thick team-color for tonight, thin muted for avg) creates instant visual hierarchy — no legend needed, the eye reads it immediately.
- "ABOVE AVG" badge activates endowment effect: the buyer sees data-validated exceptional performance, reinforcing "this moment is worth owning."
- Season averages need to be realistic — checked against actual 2024-25 NBA stats. Bam ~21.5ppg, Jokic ~26.4ppg, SGA ~31.2ppg. Fake-looking numbers would undermine broadcast credibility.
- Staggered bar fill animations (0.15s offset per row) create a "data loading in" broadcast graphic feel without being slow.
- Next cycle: Arena (rotation).

## Cycle 122 Learnings
- 20 segments at flex-1 with 2px gaps creates a clean decibel gauge look without needing SVG or complex gradients.
- Color ramp (green→yellow→orange→red) is universally understood for intensity meters — no legend needed.
- Pulse animation on the hottest segments (≥16) adds live energy without being distracting at lower levels.
- Placing between heat map and stats bar creates a natural information hierarchy: geographic distribution → energy level → hard numbers.
- The meter hidden on drop end keeps the ENDED state clean — no stale data.
- Next cycle: Supreme (rotation).

## Cycle 123 Learnings
- Auction reserve status is a cheap but high-impact addition — one IIFE block, no new hooks needed.
- 20% of edition size as reserve threshold feels right — low enough to be met early, high enough to create tension at page load.
- Progress counter (X/Y) when reserve not yet met gives the viewer something to root for — converts passive observation into active anticipation.
- Placing above the info strip keeps it visually separate from edition counts — reserve status is about market validation, not supply data.
- Supreme's auction house identity is now comprehensive: LOT, PADDLE, estimate, reserve, gavel, SOLD. Each element is distinctly auction-house and no other direction would use them.
- Next cycle: Broadcast (rotation).

## Cycle 124 Learnings
- State machine pattern (waiting→in→out→done) is cleaner than boolean flags for timed multi-phase animations.
- Red-to-team-color gradient creates visual urgency while staying on-brand — pure red would feel too generic.
- 0.8s delay after leader gives the eye a beat to process before the next visual event — no overlap, no rush.
- Cubic-bezier(0.16, 1, 0.3, 1) for entrance gives that broadcast "snappy slide" feel vs linear or ease.
- The special report bridges leader→content perfectly — gives narrative reason for the broadcast's existence.
- Next cycle: Arena (rotation).

## Cycle 125 Learnings
- Full-screen intro overlays (z-100) create powerful first impressions — each direction now has one: Supreme (color reveal), Broadcast (countdown leader), Arena (gate scan).
- Barcode vertical lines at varying widths (1-3px) instantly read as "ticket scan" without needing an actual barcode SVG.
- Reusing the existing seat label (SEC/ROW/SEAT) from the hero badge in the gate scan creates continuity — "you scanned in with THIS ticket."
- 2.1s is the sweet spot for intro overlays — long enough to register, short enough not to annoy returning visitors.
- CSS animation `forwards` fill mode on the exit fade ensures clean removal without JS needing to track opacity state.
- Arena's page load sequence is now: gate scan (0-2.1s) → instant replay (already running underneath) → content settles. The replay runs behind the gate overlay so there's no dead time between intro and content.
- Next cycle: Supreme (rotation).

## Cycle 126 Learnings
- Connecting existing UI elements to the purchase action creates narrative coherence. The paddle (top-left) was always static — making it react to purchase transforms it from decoration to storytelling.
- Key-based re-trigger (`paddleKeyRef.current += 1`) is essential for animations that need to fire cleanly on repeated purchases during prototype testing.
- The gavel strike expanding ring (scale 0.3→2.5x) with thinning border (2px→0.5px) creates a realistic shockwave feel. The border thinning is key — constant-width rings look artificial.
- Tier-accent coloring on the gavel strike means the strike color matches what you're buying — Open=teal, Rare=team, Legendary=gold, Ultimate=pure gold. Subtle but cohesive.
- Supreme now has a complete auction house lifecycle narrative with every traditional element mapped: LOT→PADDLE→ESTIMATE→RESERVE→GAVEL→PADDLE RAISE→HAMMER→SOLD. When identifying future improvements, look for real-world auction details that don't yet have digital equivalents.
- Purchase flow has 3 visual feedback beats: paddle raise (instant, your action), progress ring (processing, system action), gavel strike (confirmation, dramatic conclusion). Good purchase UX should always have visual beats at key transitions.
- Next cycle: Broadcast (rotation).

## Cycle 127 Learnings
- SOLD TO lower-third on purchase confirmation bridges Broadcast's auction-house and live-TV identities — the auctioneer's hammer falls AND the broadcast director cuts to the announcement.
- Sliding in from left is consistent with Broadcast's existing lower-third animation direction (name reveal, location tag, special report). Visual language consistency matters.
- Next cycle: Arena (rotation).

## Cycle 128 Learnings
- CO2 fog layers at z-5 sit below lasers (z-8) and spotlight sweep (z-7) — the light cuts through the haze naturally, like real arena lighting.
- Three layers with different speeds (11s, 14s, 18s) prevent a repeating visual loop — the fog looks organic rather than mechanical.
- 20px blur is essential — without it, the radial gradients look like colored blobs, not atmospheric haze. Blur transforms digital gradients into believable fog.
- Extending layers 15% beyond viewport edges (left/right: -15%) prevents hard cutoff lines at the edges — fog should feel boundless.
- Mixed team-color + white in the radial gradient creates realistic CO2 fog (white/gray) with arena lighting coloring (team-color wash). Pure team-color would look like colored gas, not fog.
- Opacity range (0.04-0.06) is subtle enough to be atmospheric without obscuring the hero content. Fog should be felt, not seen.
- Arena hero now has 6 atmospheric layers: bg pulse, fog haze (z-5), crowd wave (z-6), spotlight sweep (z-7), laser beams (z-8), LED scan line. Each at a different z-index, speed, and axis — they don't compete, they compound.
- Next cycle: Supreme (rotation).

## Cycle 129 Learnings
- Formal auction catalogue descriptions add institutional gravitas at almost zero visual cost — they're 8px and 12% opacity, barely visible but the eye catches "Lot NNNN" and "Minted on Flow" and processes "this is real."
- Wax seal emboss effect: inset box-shadow (light top, dark bottom) + radial gradient creates convincing raised relief in CSS. No images needed.
- Reusing existing supreme-holo-ring animation for the wax seal text ring keeps code DRY and maintains consistent rotation speed across authentication elements.
- The W screen now has 7 distinct authentication layers — each maps to a real auction house document. When looking for future Supreme improvements, check what physical artifact from an auction house is still missing.
- Italic within tracked uppercase (the play type in catalogue entry) creates the typographic variation that real catalogues use — "Lot 1234. Digital Collectible. Bam Adebayo, *Monster Dunk*, 2026."
- Next cycle: Broadcast (rotation).

## Cycle 130 Learnings
- Letterbox bars are the cheapest way to add cinematic prestige — two gradient divs at 4.5% hero height. The transition to 7% during CRITICAL creates tension without any new animations.
- "Continuing Live Coverage" bumper bridges editorial→transaction naturally. The IntersectionObserver approach means it fires at exactly the right scroll moment without manual timing.
- State machine (hidden→in→out→done) for one-shot overlays prevents re-trigger on scroll back — important for scroll-based triggers.
- Sliding the bumper out to the RIGHT (vs Special Report sliding out LEFT) creates visual variety in the broadcast's motion language.
- Broadcast now has complete segment structure: countdown leader (cold open) → special report (breaking news) → editorial (feature segment) → coverage bumper (return from break) → transaction (closing segment). This is a full TV broadcast arc.
- Next cycle: Arena (rotation).

## Cycle 131 Learnings
- Radial spark lines using transformOrigin:top-center + scaleY creates a natural "unfurling" starburst — each line grows outward from center rather than appearing at full length.
- Staggering sparks within a burst (15ms each) prevents the "everything at once" look that makes explosions feel flat. Real pyrotechnics have a slight spread as each charge ignites sequentially.
- Five bursts at asymmetric positions (not on a grid) feel organic. The final burst at center-top with the most sparks creates a natural climax.
- White-hot core flash (8px solid white + team-color glow) sells the ignition moment. Without the core, the sparks look like they appear from nowhere.
- Alternating primary/secondary team colors every 3rd spark adds depth without complexity — you don't need random colors, just two alternating tones.
- z-49 below confetti (z-50) means explosions fire through falling confetti pieces — this mimics the real layering where pyro goes off first, then confetti cannons release.
- Arena W screen now has 3 celebration layers: pyrotechnic starbursts (explosions), confetti (particles), and crowd roar EQ bars (audio visualization). Each operates on a different physics model.
- Next cycle: Supreme (rotation).

## Cycle 132 Learnings
- Phone bidders are the most Supreme form of social proof: competition exists but is invisible. You feel the pressure of unseen rivals without the explicitness of a buyer feed.
- Random pulse intervals (3-7s) feel organic. Fixed intervals would feel mechanical and break the illusion.
- Three global cities (NY/London/HK) cover the three major auction market time zones — collectors intuitively understand this as "the world is bidding."
- Ultra-low base opacity (12%) means the indicators are barely visible until they pulse — they reward attention without demanding it.
- The SVG phone handset icon at 8px is the minimum legible size. Any smaller and it becomes a blob; any larger and it competes with the hero content.
- Supreme's social proof hierarchy is now complete: phone bidders (who) + reserve status (demand) + estimate value (market). All three communicate market interest without showing a single other person.
- Next cycle: Broadcast (rotation).

## Cycle 133 Learnings
- Fixed-position urgency elements at the bottom of the viewport are high-impact because that's where the user's thumb/eye is on mobile when scrolling the transaction section.
- The "BREAKING" label pinned left with scrolling text right is exactly how CNN/ESPN do it — the label stays visible so you always know the context of the crawl.
- z-48 places it below the sticky CTA bar (z-50) and PiP (z-40) but above page content — the user sees urgency but can still interact with the purchase button.
- 20s scroll speed is fast enough to feel urgent but slow enough to read. The BottomLine ticker (30s) is slower because it's ambient atmosphere — the breaking crawl is meant to create pressure.
- Duplicating the crawl text content creates seamless looping — when the first copy scrolls off-left, the second copy is already visible, and translateX(-50%) resets to the beginning.
- The crawl only fires during CRITICAL (≤2 min) and hides during purchase — it shouldn't distract from the purchase flow or appear during casual browsing.
- Next cycle: Arena (rotation).

## Cycle 134 Learnings
- Ghost segments (dim "88" behind lit digits) is the single most impactful visual detail for making LED displays look real — the unlit segments create physical materiality.
- Three-layer text-shadow glow (tight, medium, ambient) at different blur radii mimics how LED light actually disperses in space — tight for character definition, medium for halo, ambient for spill.
- useRef<ReturnType<typeof setInterval> | null>(null) — React 19+ requires explicit initial value for useRef, can't leave it empty.
- IntersectionObserver with 0.3 threshold for activating the shot clock means it starts ticking before the user fully scrolls to it — creates a "you entered the zone" feeling.
- The shot clock is distinctly Arena: Supreme would never have a ticking timer (the void is timeless), Broadcast would use a game clock format. Only Arena has the shot clock mounted above the backboard.

## Cycle 136 Learnings
- SVG stroke-dashoffset animation is the perfect technique for "drawing" effects — set dasharray to path length, animate dashoffset from length to 0.
- Telestrator yellow (#FFD700) is the universally recognized analyst annotation color.
- Slightly rotating the ellipse (-5°) breaks digital precision for hand-drawn feel.
- 5-phase state machine with self-removal prevents stale overlays.
- Filter drop-shadow on SVG strokes creates glowing marker pen look.
- Telestrator completes the replay analysis sequence: INSTANT REPLAY tag → telestrator circle → fade. Full broadcast production.
- Next cycle: Arena (rotation).

## Cycle 138 Learnings
- SVG stroke-dashoffset animation works perfectly for signature drawing — same technique as checkmark draw but with a longer, more complex path.
- Flowing cursive SVG path needs enough control points (8+) to feel natural, not geometric. Cubic beziers create the organic pen feel.
- 35% final opacity keeps the signature subtle and elegant — more would compete with the wax seal below.
- The signature draw creates a natural pause in the W screen reveal — you watch the ink flow, adding ceremony.
- Supreme's W screen document lifecycle is now complete: card flip → W → serial + seal → provenance → sale record → signature → wax seal → share.
- At this maturity level, the best additions complete a narrative sequence rather than add disconnected elements.

## Cycle 139 Learnings
- Per-moment player quotes add enormous editorial depth with minimal code — just a ternary per moment ID.
- Georgia serif italic is the editorial voice of Broadcast — every quote, tagline, and narrative uses it consistently.
- The "Postgame" badge reuses the same pattern as "Up Next" and "Breaking" — consistency.
- Next cycle: Arena (rotation).

## Cycle 140 Learnings
- Head-to-head comparison graphics are a natural fit for Arena's competitive energy — every sports broadcast uses them.
- Three stat rows (edition, speed, rank) give just enough data for a "scoreboard" without overwhelming the W screen.
- Highlighting winners in teal vs dimming losers in white/25 creates instant visual hierarchy.
- Team-color gradient in header bar ties the scoreboard to the moment's team identity.
- The matchup card completes Arena's W screen competitive narrative: you competed against the crowd and won.
- Next cycle: Supreme (rotation).

## Cycle 141 Learnings
- Specialist's notes add enormous institutional authority with minimal code — a single paragraph per moment.
- Georgia serif italic is the editorial/expert voice in Supreme — consistent with how auction catalogues typeset specialist essays.
- Left border accent (0.5px, team-color at 15%) creates the pull-quote/sidebar feel of a catalogue essay without adding visual weight.
- "Buyer's Premium: Waived" is a subtle flex — digital means no surcharge. Adds realism while highlighting a benefit.
- At this maturity level, the most impactful additions are ones that complete a document metaphor (catalogue, receipt) rather than add new visual layers.
- Next cycle: Broadcast (rotation).

## Cycle 142 Learnings
- Replay count is dual-purpose: broadcast authenticity + social proof. A ×8 replay count tells you this moment is significant enough to keep showing.
- Capping the counter at 12 prevents absurd numbers — real broadcasts rarely show more than 10-12 replays of a single play.
- Production credits add surprisingly deep emotional closure to the W screen — like the end of a great show.
- Right-aligned role labels + left-aligned names is the standard credit card format.
- "A TST Broadcast Production" is the correct industry phrasing (vs "TST Broadcast · Program Complete").
- Next cycle: Arena (rotation).

## Cycle 143 Learnings
- Velocity-triggered banners are effective urgency signals — basketball-specific language ("FAST BREAK") creates authentic arena energy.
- 4-phase state machine (in→hold→out→done) is the clean pattern for timed overlay animations — reusable across all directions.
- 20s cooldown prevents banner fatigue while still allowing multiple triggers during a session.
- Light streak sweep during hold phase adds premium polish to the banner — simple CSS gradient animation.
- Found and fixed a missing DecibelMeter component on the W screen — always verify components exist when referenced.
- Next cycle: Supreme (rotation).

## Cycle 145 Learnings
- CSS custom properties (--cannon-dx, --cannon-peak, --cannon-spin) in keyframes allow per-element parameterized animations — powerful pattern for particle effects without JS.
- Parabolic arc keyframes need at least 4 stops (launch, peak, descent, settle) to look natural — 2-stop linear animations look robotic.
- Mix of piece shapes (standard + ribbon) adds visual diversity cheaply — just aspect ratio variation.
- Staggering per cannon group (0.15s offset) creates the authentic "wave of bursts" rather than simultaneous explosion.
- Sustained falling confetti after the cannon burst maintains celebration energy while the initial burst provides the dramatic opener.
- Always check rotation before starting: should have been Broadcast, not Arena. Log and correct next cycle.
- Next cycle: Broadcast (rotation correction).

## Cycle 146 Learnings
- The score bug was already there but basic — upgrading an existing component is higher-impact than adding new ones at this stage of polish.
- Quarter-by-quarter scores at 6-7px are legible but add authentic ESPN depth. Winning quarters highlighted via opacity creates instant visual parsing.
- useGameClock at 1/3 real-time speed (120s start → ~6 min real) creates enough drama without feeling rushed or stalling.
- Possession arrow alternation every 6-10s (randomized) feels natural. Fixed intervals feel mechanical.
- Team-color left accent bars (3px) are the single most impactful visual detail for score bug authenticity — it's what makes ESPN's look ESPN.
- Opponent color map is a simple addition that completes the visual pairing. Only 3 opponents needed for current mock data.
- The broadcast HUD is now feature-complete: score bug, network bug, ticker, SMPTE timecode, REC, ISO CAM, lower-thirds, replay tag, telestrator, urgency chyron, breaking crawl. Further broadcast improvements should focus on refining existing elements, not adding new overlay types.
- Next cycle: Arena (rotation).

## Cycle 147 Learnings
- Milestone celebrations at every 25th edition provide a steady heartbeat of social proof without overwhelming the page.
- Tiered presentation (small/medium/large) lets frequent milestones stay subtle while round-number milestones feel like events.
- Spring bounce keyframe (overshoot → settle) gives the banner physical weight — it "lands" on screen rather than fading in.
- Starting claimed values matter for milestone timing: SGA (1744) hits first small milestone quickly, Bam (3847) hits 3850 almost immediately. Always consider starting conditions when designing threshold-based features.
- z-54 for milestones sits above fast break (z-53) — milestone celebrations should overlay velocity banners since they're rarer and more significant.
- Next cycle: Supreme (rotation).

## Cycle 148 Learnings
- "Fair Warning" fills a 10-second gap (20s→10s) in the gavel sequence that previously had no auctioneer presence — the CRITICAL phase now has continuous auction narration from 20s to 0s.
- Making the fair warning deliberately softer than the gavel calls (lower opacity, lighter weight, smaller type, team-color vs white/red) creates a natural escalation arc that mirrors real auctioneer cadence.
- Vertical writing-mode text (writing-mode: vertical-lr + rotate 180°) is a powerful tool for gallery/museum spatial design — it adds institutional context without taking horizontal space.
- The 4-state gavel system (0/1/2/3) is clean but approaching the limit — further auction timeline additions should use a different mechanism (e.g., CSS-only timed overlays) rather than expanding the state machine.
- At this level of Supreme polish, the most impactful additions are ones that complete spatial metaphors (gallery viewing) rather than adding new UI elements.
- Next cycle: Broadcast (rotation).

## Cycle 149 Learnings
- Analyst commentary adds a "voice" layer missing from the broadcast editorial. The page now has: narration (omniscient), data (stats), analysis (expert opinion), comparison (tale of the tape). Four distinct editorial modes.
- Using real analyst names (Richard Jefferson, JJ Redick, Chiney Ogwumike) grounds the broadcast in reality and adds credibility over generic "Analyst" labels.
- Matching analyst personas to moments (RJ's player perspective on Bam, JJ's analytical breakdown of Jokić, Chiney's eye-test assessment of SGA) makes each analyst card feel authentic rather than templated.
- The card sits naturally in the editorial flow because it uses the same visual language as other broadcast elements: lower-third badge header, team-color accent, Georgia serif quotes.
- At this stage, Broadcast's editorial section is the most complete — future improvements should focus on the transaction area or W screen rather than adding more editorial content.
- Next cycle: Arena (rotation).

## Cycle 150 Learnings
- Completing incomplete hooks from prior cycles is higher-impact than starting new features — the timeout hook was already wired but had no visual output.
- Emoji reaction bars (Whatnot/TikTok style) are an inexpensive way to add "live" energy. The key is phase-reactive spawn rates — faster during urgency phases makes the page feel like it's accelerating.
- Max pool size (12 simultaneous) prevents DOM bloat while keeping the visual density feeling energetic.
- The "timeout" concept works because every basketball fan recognizes the whistle-stop-and-refocus moment. Using sport-native metaphors for conversion nudges feels natural rather than manipulative.
- Placing the reaction bar directly above the CTA means social proof (others reacting) is visible at the exact moment of decision. Position matters more than density.
- Next cycle: Supreme (rotation).

## Cycle 151 Learnings
- Condition reports with verification checkmarks add institutional credibility at near-zero visual cost. The green SVG checkmarks provide the only color accent in an otherwise monochrome section — draws the eye to "everything checks out."
- Pre-sale estimate ranges (1.8×–3.2× of price) create anchoring bias — the buyer sees $5 against "$9–$16" and perceives a deal. This is one of the cheapest conversion improvements possible.
- Viewing room bidder count is Supreme's version of social proof: quiet, factual, institutional. Not "47 people are watching!" (Arena energy) but "47 registered bidders" (auction house formality).
- Adding the pre-sale estimate to the W screen sale record completes the auction receipt: hammer price → pre-sale estimate → acquired date → status → buyer's premium → total. The buyer can see they acquired below estimate.
- Supreme's catalogue section is now feature-complete. Future Supreme improvements should focus on the transaction flow, hero atmosphere, or W screen enrichment rather than adding more catalogue metadata.
- Next cycle: Broadcast (rotation).

## Cycle 152 Learnings
- Ultra-low opacity (4%) is the right level for broadcast watermarks — visible once noticed, invisible otherwise. Higher opacity competes with content.
- Diagonal text rotation (-15°) is the standard broadcast watermark orientation. Vertical or horizontal would feel like a UI element, not a production artifact.
- "Presented by" sponsor tags work best in Georgia serif italic — it's the broadcast editorial voice, distinct from Oswald production text.
- The broadcast overlay inventory is now comprehensive. Future broadcast improvements should focus on interaction quality, W screen enrichment, or editorial narrative rather than adding more overlays.
- Next cycle: Arena (rotation).

## Cycle 153 Learnings
- Post-game award cards (Player/Collector of the Game) are a natural W screen addition for Arena — they add a celebratory competitive layer distinct from Supreme's auction documents and Broadcast's editorial credits.
- The "Presented by" sponsor tag at the bottom of the award card is a small but authentic detail that grounds the card in real arena production. Every jumbotron award has a presenting sponsor.
- 3-column stat grids with teal values and team-color gutter gaps look clean and jumbotron-authentic. The grid pattern (stat label above, stat value below) is standard for NBA broadcast stat graphics.
- Staggering reveal delays between adjacent W screen cards (0.2s → 0.22s → 0.28s) creates a cascading reveal that feels like content loading onto the jumbotron sequentially.
- The W screen is getting content-rich. Future Arena W screen additions should consider scrollability or vertical condensation — the celebration needs to be screenshot-capturable in a single viewport.
- Next cycle: Supreme (rotation).

## Cycle 154 Learnings
- Converting ephemeral single-line notifications into persistent institutional logs is a high-impact upgrade for Supreme — it adds life without breaking minimalism.
- Cascading opacity across log entries (0.25 → 0.15 → 0.08) creates depth and recency hierarchy naturally. The newest entry demands attention; older ones fade into the background like page margin notes.
- The key to keeping bidding ledger "Supreme" vs "Arena" is restraint: mono font, low opacity, no emoji, no exclamation marks, formal "CLAIMED" language, timestamps. Same data, different register.
- Tracking BidEntry objects with ids allows React to key properly for smooth entry animations.
- The "registered bidders in viewing room" footnote ties back to the Viewing Room indicator above — institutional consistency.

## Cycle 155 Learnings
- Per-moment commentator calls add a voice layer that was missing from the broadcast — visuals, data, narrative, production, and now voice. The broadcast metaphor is nearly complete.
- Timing the call at 5.2s (after replay tag ~0.8s and telestrator ~2.2s) creates a natural replay production sequence. The sequencing matters more than any individual effect.
- Audio waveform bars at very low opacity (6%) add texture without competing with the quote text. The sinusoidal height variation creates organic bar shapes.
- The slam-in animation with spring overshoot at 55% (translateX goes to +3% then settles) creates the physical "slam" feel of a broadcast graphic hitting the screen.
- Georgia italic for the attribution ("— Mike Breen, ESPN") distinguishes the meta-information from the dramatic call text in Oswald.
- Next cycle: Arena (rotation).

## Cycle 156 Learnings
- Wiring up partially-built components (ReplayReviewOverlay was defined but never rendered) is a quick win — the component was already coded, just needed integration and rgb→hex color fix.
- The replay center overlay reframes a generic "processing" state into a basketball moment. Instead of a progress bar, the user sees "PLAY UNDER REVIEW" → "CALL CONFIRMED" — emotionally resonant with every NBA fan.
- Using hex alpha notation (teamColor + "4D" for 30%) instead of rgba(${rgb},...) avoids needing a hex-to-rgb converter. Simpler and consistent with the rest of the codebase.
- The Defense Stomp at 80% claimed creates urgency from a supply signal that wasn't previously visualized. The existing panic banner shows text; the stomp is a dramatic full-screen jumbotron moment.
- One-shot overlays (firedRef pattern) are essential for dramatic full-screen effects — showing DE-FENSE every time the page re-renders would be annoying. Once is impactful; twice is noise.
- Reusing existing keyframes (arena-timeout-in, arena-horn-ring, arena-crowd-wave) keeps globals.css lean. Most arena overlays share the same spring entrance + hold + fade lifecycle.
- Next cycle: Supreme (rotation).

## Cycle 156-157 Learnings
- Wiring up partially-built components (like ReplayReviewOverlay) is a zero-risk quick win — code was already written, just needed integration.
- The Defense Stomp at 80% claimed is a one-shot overlay that creates urgency from a supply signal. The one-shot pattern (firedRef) prevents annoying repetition.
- Value trend sparkline is data visualization as social proof — showing "the market is moving" without showing actual people. Distinctly Supreme: no avatars, no names, just a rising line.
- SVG polylines at 15% opacity are effectively invisible until you notice them, then they're compelling. The subliminal register is key for Supreme.
- Seeding noise from moment.id.charCodeAt() creates per-moment visual variation without randomness that would cause hydration mismatches.
- Next cycle: Broadcast (rotation).

## Cycle 158 Learnings
- The hero replay production sequence is now a complete 4-phase broadcast: replay tag → telestrator → commentator call → sideline report. Adding more hero overlays risks overcrowding — future broadcast improvements should focus on the editorial section, W screen, or transaction area.
- Reusing broadcast-call-fade-out for the sideline exit keeps consistency without new keyframes. The dedicated broadcast-sideline-in keyframe is softer (no overshoot/scale) which correctly differentiates the courtside reporter's calm delivery from the commentator's dramatic slam.
- Per-moment reporter-coach quotes add specificity that generic text can't match. The coach quotes are from real NBA coaching styles (Spoelstra's intensity, Malone's humor, Daigneault's trust).
- 2-line clamp on the report text prevents overflow on narrow mobile viewports while keeping the courtside voice present.
- Next cycle: Arena (rotation).

## Cycle 159 Learnings
- Per-moment trivia facts add context that makes the moment feel significant at the exact decision point. 3 facts per moment with random selection provides variety across page loads.
- One-shot + auto-dismiss pattern (firedRef + setTimeout dismiss) is the standard for Arena jumbotron insertions. Consistent with milestone flash, noise prompt, timeout, defense stomp.
- Placing the trivia card between the chant ticker and tier selector puts engagement content at the decision funnel entrance. The user sees the trivia right before they see the tiers.
- The arena page has an enormous number of overlays and jumbotron effects. Future Arena improvements should focus on the W screen (celebration), the tier selector interaction, or conversion-focused elements rather than adding more browsing overlays.
- Next cycle: Supreme (rotation).

## Cycle 160 Learnings
- Museum framing conventions translate well to dark mode: weighted bottom (14px vs 10px) prevents optical sinking, even with subtle borders. The principle is the same whether the mat is white (traditional) or dark (our context).
- The gallery exhibition stack is now complete in Supreme's hero: wall → ambient (particles) → mount (passe-partout) → glass (vitrine) → edge lighting (trace) → identification (lot number, wall label). Each layer has its own z-index and visual function.
- Bevel shadows on the mount (inset light-above, dark-below) add perceived depth even at very low opacity — the eye reads the material separation subconsciously.
- The gilt fillet (inner hairline in team-color) is an extremely subtle detail but it connects the mat border to the moment's team palette without being heavy. 8% opacity is the sweet spot.
- Next cycle: Broadcast (rotation).

## Cycle 161 Learnings
- ESPN stat bar graphics need 4 elements to feel authentic: header label, filled bar, tip marker, and footer stats. Missing any one makes it look generic.
- The tip marker dot at fill edge is the key detail separating "progress bar" from "broadcast stat graphic."
- Gradient shift at thresholds (team-color→amber at ≥80%) adds urgency without changing structure.
- Placing edition graphic between viewer count and CTA creates a 3-element conversion stack: social proof → supply visual → action. All in broadcast language.
- Next cycle: Arena (rotation).

## Cycle 162 Learnings
- The W screen had 10+ elements about purchase stats but zero showing the actual basketball moment. Adding the highlight replay card fills a fundamental gap — "what you collected" matters as much as "how fast you got it."
- Parsing `statLine` string ("30 PTS / 8 REB / 4 AST") by splitting on " / " and then splitting each part into value + label is a clean approach that adapts to any stat format.
- Scanline overlay (repeating-linear-gradient with 2px transparent / 2px rgba(0,0,0,0.08)) creates the LED jumbotron texture without adding a real image asset. Subtle but adds authenticity.
- The Arena W screen is now very long (12+ elements). Future Arena improvements should focus on the browsing/purchase flow rather than adding more W screen cards.
- Next cycle: Supreme (rotation).

## Cycle 163 Learnings
- The auctioneer's bid call is a text-only addition (no new components, no keyframes) that creates strong psychological framing. Text is the cheapest, highest-impact improvement when the copy is right.
- "Do I hear $25?" naturally upsells by making the next tier feel like a logical step up, not a separate product. Framing purchases as bid increments changes the decision architecture.
- Georgia serif italic at 14% white opacity is the sweet spot for Supreme's subliminal register — visible when reading, invisible when scanning. Matches specialist's note and catalogue text styling.
- The "Final offer" variant for highest tier creates closing energy without adding urgency mechanics. The words alone carry the weight.
- Next cycle: Broadcast (rotation).

## Cycle 164 Learnings
- Surfacing price above the fold is a genuine conversion improvement, not just visual polish. The broadcast page had extensive editorial content above the fold but zero price visibility — requiring full editorial scroll before seeing cost.
- Reusing the existing broadcast-data-wipe-text animation at a later delay (1.7s vs 1.0s/1.35s) keeps the lower-third cascade natural. No new CSS keyframes needed.
- The price tag as a tappable button (scrollIntoView) dual-purposes as a conversion shortcut and a navigation aid. Users who see the price can immediately jump to purchase without scrolling.
- "FROM $5" copy is more effective than just "$5" — the "FROM" prefix frames it as an entry point, implying value tiers above. Combined with Supreme's auctioneer bid call ("Do I hear $25?"), both directions now upsell via different psychological mechanisms: Broadcast invites exploration (FROM), Supreme invites escalation (Do I hear).
- The price tag hidden during purchasing/ended prevents information overload during state transitions.
- Next cycle: Arena (rotation).

## Cycle 165 Learnings
- The "above-fold price" initiative is now complete across all 3 directions (Supreme: cycles 120/163, Broadcast: cycle 164, Arena: cycle 165). Each direction surfaces price in its own voice.
- Phase-reactive copy on Arena's price badge ("CLAIM NOW" → "GOING FAST" → "LAST CHANCE") means the hero communicates urgency progression. The badge changes meaning as time runs out.
- Using `tierSectionRef` instead of `ctaRef` for Arena's scroll target is intentional — Arena wants users to browse tiers before buying.
- Next cycle: Supreme (rotation).

## Cycle 166 Learnings
- The purchase processing window (1.5s between click and W screen) was wasted space — just button text changes. Adding a full-screen overlay ceremony makes those seconds feel intentional and prestigious, not like waiting.
- Reusing existing data (lot number formula, paddle number formula) across the overlay creates continuity — the same lot/paddle numbers appear in hero, clerk overlay, and W screen, making it feel like one continuous institutional process.
- 3-stage text that matches purchaseStage timing (0/500ms/1200ms) ensures the overlay always shows the right stage without its own timers. Piggyback on existing state rather than adding new timers.
- z-44 for the overlay is correct: above gavel countdown (z-42) and phase transition (z-36) but below W screen (z-50). The overlay naturally disappears when viewPhase transitions to 'confirmed' and the W screen renders.
- Next cycle: Broadcast (rotation).

## Cycle 167 Learnings
- Player quotes in first-person hit harder than editorial third-person prose. "I wanted to make a statement" > "Adebayo made a statement." Use the athlete's voice for emotional weight, editorial voice for context and analysis.
- Placing the interview card right before the transaction section creates a narrative bridge: you read the player's emotions → you see the collect button. The emotional priming is at maximum when the conversion ask appears.
- The mic SVG icon is a small detail that immediately signals "interview" — broadcast viewers recognize the microphone graphic instantly.
- No new CSS keyframes needed — the card uses static styling that fits the editorial pace. Not everything needs to animate; the content itself carries the weight.
- Next cycle: Arena (rotation).

## Cycle 168 Learnings
- Arena seating section labels (UPPER DECK → FLOOR SEAT) add aspirational hierarchy that's native to the arena metaphor. The tier selection now feels like choosing your seat at the game.
- Dynamic POPULAR badge that follows the highest bidder count creates live-commerce energy at the decision point. The ≥5 bidder threshold prevents the badge from flickering on/off.
- Adding labels above the tier name (not below) maintains the visual hierarchy: section → tier name → price → remaining → bidders. Top-to-bottom information architecture.
- The `Math.max(...bidderCounts)` + `indexOf` approach is simple but effective for finding the popular tier. No new state needed.
- Next cycle: Supreme (rotation).

## Cycle 169 Learnings
- Found and fixed a real bug: W screen Sale Record was hardcoded to `rarityTiers[0].price`. Always verify that data flows correctly through components — props that should be dynamic might have been hardcoded during initial implementation.
- The gallery closing announcement adds institutional urgency at the right intensity level — softer than the gavel countdown, earlier in the phase timeline. Urgency should escalate gradually: subtle text → bold announcement → dramatic countdown.
- Georgia serif italic at 10-18% opacity is the perfect register for Supreme's ambient text. It's readable when you're looking for it, invisible when scanning.
- Bug fixes are high-value improvements even in the polish phase — they address real user-facing issues.
- Next cycle: Broadcast (rotation).

## Cycle 170 Learnings
- Full-screen purchase processing overlays are high-impact because they transform dead loading time into a dramatic production moment. All 3 directions now have direction-specific overlays: Supreme (lot clerk ceremony), Broadcast (breaking news cut-in), Arena (replay center review).
- The 3-stage structure (alert → details → resolution) maps perfectly to the existing purchaseStage states (0, 1, 2). No new state management needed — just a visual layer that reads the same state the CTA button uses.
- Multi-stop opacity decay on the red stinger (0→70%→35%→55%→20%→10%→0%) creates a realistic camera flash/strobe effect. Linear fade-out looks synthetic; irregular stops feel like real broadcast equipment.
- Center-expanding banner via `scaleY(0) → scaleY(1)` with `transform-origin: center` is a signature ESPN breaking news motion. The banner appears to "open" from a center line outward.
- Green flash on "Confirmed" stage (same technique as red stinger but #00E5A0) creates a satisfying color shift that signals success without needing explicit text — the color does the work.
- z-58 for the cut-in overlay sits above the SOLD TO lower-third (z-56) so the full-screen overlay dominates during processing, then the SOLD TO banner takes over for the brief period before the W screen appears.
- Reusing the existing `broadcast-checkmark-draw` CSS class (from the CTA button) on the confirmed stage maintains visual consistency — same checkmark draw animation in both contexts.
- Next cycle: Arena (rotation). Arena could add a "fan noise meter" that rises during browsing and peaks at purchase, or a jumbotron kiss-cam/dance-cam style engagement overlay during tier browsing.

## Cycle 171 Learnings
- Refining existing elements (adding a progress scrubber to the existing replay card) is higher ROI than adding new features at this density level. The replay card was already good but felt static — the scrubber makes it feel alive with minimal code.
- ReplayTimestamp uses setInterval at 100ms for smooth counting. Using 1000ms (per-second) would feel jerky at the short 12s duration. The 100ms interval reads as "real-time video playback" even though only the seconds display (floored).
- The progress bar's `animation: arena-replay-progress 12s linear 0.5s both` syncs with the timestamp's 500ms startDelay — both start at the same moment. Linear (not ease) is correct for a video scrubber — videos don't accelerate.
- Breathing play triangle (`pulse` animation + drop-shadow) is a micro-detail but powerful affordance — it signals "this is playing" without video or complex state. Real jumbotrons have pulsing recording/play indicators.
- z-2 on the scrubber sits above the bottom vignette gradient but below the player info text overlay (no z-index, natural stacking). This means the progress bar is visible but doesn't compete with the player name.
- The `arena-replay-timestamp` keyframe handles opacity lifecycle (fade-in at 8%, sustained, dim at 92%) independently of the progress bar — each element animates autonomously but appears coordinated.
- Next cycle: Supreme (rotation). Supreme could refine the lot clerk ceremony purchase overlay, or add a subtle "catalogue page turn" transition between browse and purchase states.

## Cycle 172 Learnings
- Above-fold price anchoring is a high-conversion improvement even at 9.0+ polish levels. The $5 price point visible without scrolling addresses the core bounce rate problem (67-82%).
- "Place Bid ↓" as a tappable scroll link bridges the hero-to-CTA gap. It's both a price indicator and a navigation element — dual purpose in minimal space.
- Reactive tier pricing in the hero estimate (updating when the user selects a tier below fold) creates a subtle connection between above-fold and below-fold content. The hero stays alive as the user interacts below.
- ENDED state showing "Sold · $X" in the hero is the auction-house equivalent of the lot result — every sold lot at Christie's/Sotheby's shows its hammer price in the catalogue.
- Next cycle: Broadcast (rotation).

## Cycle 173 Learnings
- Graphic escalation (making an existing element bigger/more prominent during urgency) is more effective than adding new elements. The countdown was already there — making it dominant during CRITICAL is a layout-preserving urgency amplifier.
- 36px digits in a bordered panel create far more visual urgency than 14px mono text. Size IS the urgency signal in broadcast language — the game clock gets bigger when time matters more.
- Falling back to the standard elegant countdown during non-CRITICAL phases preserves the editorial calm of the browsing experience. The escalation only fires when it matters.
- Next cycle: Arena (rotation).

## Cycle 174 Learnings
- Fixed-position floating notifications are high-impact for live commerce pages because social proof needs to persist at any scroll position. The LiveFeed was good but disappeared when scrolling — toasts solve this.
- Max 2 stacked toasts prevents clutter while maintaining urgency. Whatnot caps at 2-3 visible — more becomes noise, fewer loses the "velocity" feel.
- Slide-in from left (not right) avoids conflicting with potential sticky CTA or navigation elements on the right. Top-left placement below the header is the Whatnot convention.
- The `exiting` flag pattern (set state to trigger exit animation, then remove after animation duration) keeps exit animations smooth without needing an animation library.
- z-28 is the right layer: above page content (z-1) and crowd reactions (z-25), below the fixed header (z-30) and jumbotron overlays (z-60). The toasts should feel part of the environment, not interrupt it.
- Next cycle: Supreme (rotation).

## Cycle 175 Learnings
- Unused data hooks are free improvement opportunities. `lastClaimer` was returned by `useClaimTicker` but never rendered — adding the whisper required zero new state management, just a conditional render.
- The animation duration (2.8s) matches `lastClaimer`'s timeout (2800ms in useClaimTicker). Syncing CSS animation duration with state lifecycle prevents orphaned renders.
- Georgia serif italic at team-color/18% opacity is the exact right register for Supreme's ambient text. Visible when looking for it, invisible when scanning. The institutional voice should never compete with the CTA or tier selector.
- Social proof works differently per direction: Arena shouts it (floating toasts, bidder counts, crowd energy), Broadcast frames it editorially (viewer count, analyst commentary), Supreme whispers it (auctioneer's formal bid acknowledgment). Each creates the same psychological effect through direction-appropriate means.
- Next cycle: Broadcast (rotation).

## Cycle 176 Learnings
- Animated data visualizations (percentage bars, counters) are high-impact broadcast elements because they combine visual motion with information delivery. The bar filling up IS the content.
- IntersectionObserver at 0.4 threshold ensures the poll is mostly in view before triggering the fill animation — the user sees the full animation, not a partially-completed bar.
- ease-out cubic (`1 - Math.pow(1 - progress, 3)`) creates the right fill rhythm: fast initial burst (excitement) then gradual settling (precision).
- Per-moment poll data (unique questions, different percentages) prevents the "template" feel. 91%/87%/94% — high but varied — feels more real than a uniform 90%.
- The poll adds a new social proof category to Broadcast: fan consensus as data. Previously: viewer count (passive), analyst opinion (expert), commentator call (emotional). Now: fan verdict (democratic).
- Next cycle: Arena (rotation).

## Cycle 178 Learnings
- Pure atmospheric elements (no text, no data) are the most "Supreme" additions possible at this polish level. The saleroom pulse is invisible until you notice it — then it adds immersion without competing with any conversion element.
- Phase-reactive SVG paths via ternary operators are clean and maintainable. Each phase has its own pre-computed path string — no runtime path interpolation needed.
- The waveform complexity (1→2→4 waves) maps intuitively to urgency: more oscillation = more energy = more tension. The flatline on ENDED is a satisfying resolution — the room goes silent.
- Low z-index (z-5) and opacity (3-12%) ensure the pulse never competes with content. It's a background atmospheric detail, not a foreground feature.
- translateX drift animation creates a "breathing" feel more effectively than opacity pulsing — the waveform appears to flow like a real audio signal.
- Next cycle: Broadcast (rotation).

## Cycle 180 Learnings
- Connecting social proof (live feed purchases) to scarcity signals (remaining counts) creates a feedback loop that's more powerful than either alone. When a user sees "Sarah K. just claimed" AND the remaining count ticks down simultaneously, the urgency compounds.
- Scale pulse at 1.18× (not 1.3× or larger) is the right magnitude for a stock counter — noticeable but not jarring. Whatnot uses ~1.1-1.2× on their counter pulses. Larger feels like an error; smaller gets missed.
- CSS `transform: scale()` with inline style transitions (fast in 80ms, slow out 250ms) works cleanly without needing a keyframe. The asymmetric timing (fast snap up, slow settle) creates a satisfying "tick" feel.
- Text-shadow glow on the flash (red when ≤5, amber otherwise) provides color-coded urgency feedback even in peripheral vision. The user doesn't need to read the number — the flash color tells them "this is getting scarce."
- Distributing decrements ~40% Open / ~60% premium tiers means Open (with 10K+ supply) barely moves visually, while premium tiers (with 25-50 remaining) create visible scarcity pressure. This matches real buying patterns where premium tiers sell faster proportionally.
- `useLiveTierRemaining` uses the existing `feedEvents` as its trigger, so no new timer/interval needed — the decrement cadence naturally matches the purchase simulation rate.
- The hook had to be placed after `feedEvents` state declaration due to block-scoped variable ordering. TypeScript catches these before runtime.
- Next cycle: Supreme (rotation).

## Cycle 181 Learnings
- The anti-snipe mechanism from real auction houses (Sotheby's/Christie's) is a powerful conversion pattern: when a bid arrives in the final seconds, the "Lot Extended" banner proves to every other bidder that competition is active and someone just acted. The NOTICE itself is the conversion driver — you don't need to actually change the timer.
- Reusing existing keyframes (supreme-clerk-line-extend) for the flanking hairlines keeps CSS bloat in check while maintaining visual consistency. The extending lines are already associated with formal auction ceremony.
- Tracking `prevLastClaimerRef` prevents duplicate fires when the same `lastClaimer` value persists across renders. The claim ticker sets `lastClaimer` and then clears it after 2800ms — the ref comparison ensures we only fire once per unique bid.
- The CRITICAL phase urgency cascade is now a complete sequence: bid whisper (who bid) → lot extension (the auction is extending) → gallery closing (time is running out) → gavel countdown (FAIR WARNING → GOING ONCE → GOING TWICE). Each layer adds a different type of urgency: social proof → competition proof → temporal urgency → finality.
- Next cycle: Broadcast (rotation).

## Cycle 182 Learnings
- Value comparison graphics are high-impact conversion tools because they reframe the purchase from "cost" to "investment." Showing "$5 → $16+ est." as broadcast data rather than sales copy makes it feel objective and trustworthy.
- The split-column ESPN stat comparison format is instantly recognizable to sports fans — they've seen "Player A vs Player B" a thousand times. Using the same visual language for "Buy Price vs. Secondary Value" creates familiarity and credibility.
- Teal (#00E5A0) for the buy price and white for the secondary estimate creates visual hierarchy: the teal says "this is what you pay (friendly)" while the white says "this is what it's worth (neutral data)."
- ROI percentage at the bottom ("220% est. upside") is the summary stat — like ESPN's "Player X has 30% better FG% than Player Y." One number that tells the whole story.
- Next cycle: Arena (rotation).

## Cycle 183 Learnings
- Value comparison badges ("STEAL", "DEAL") on tier cards are the live commerce equivalent of price anchoring. Showing the gap between buy price and estimated secondary value right on the tier card makes the value proposition immediate.
- Next cycle: Supreme (rotation).

## Cycle 184 Learnings
- Per-tier social proof (interested parties counts) creates tier-specific competition anxiety — more targeted than page-level social proof (viewing room count). The bidder doesn't just know "people are watching," they know "14 people are interested in THIS tier."
- Sotheby's ⊻ convention is a real auction house pattern. Using institutional language ("interests" not "bidders") keeps Supreme's voice consistent while delivering the same competitive pressure.
- Distributing interest counts realistically (Open=18-29, Rare=8-14, Legendary=3-6, Ultimate=1-2) prevents the "everything is equally popular" flatness. Premium tiers should show FEWER interests but each feels more significant — 2 interests on Ultimate is more intimidating than 25 on Open.
- The flash animation (scale 1.08 + text-shadow) on interest count changes provides real-time "activity" signal without being disruptive. At 4-8s intervals, it's frequent enough to notice but not chaotic.
- Next cycle: Broadcast (rotation).

## Cycle 186 Learnings
- The final 10-second countdown is the highest-tension moment in any timed commerce experience. Making it visually overwhelming (massive numbers, expanding rings) rather than just adding more red glow to existing elements creates a qualitatively different urgency level.
- Key by `num` prop to remount the CrowdCountdown component on each second change — this restarts all CSS animations cleanly without needing refs or state resets. React's reconciler handles the cleanup.
- Size escalation (80px→140px) as numbers decrease is more powerful than constant size with color changes. The number "2" taking up more screen than "8" creates a sense of the countdown closing in on you — like the jumbotron zooming in.
- z-index layering matters: at z-44, the crowd countdown sits below the buzzer (z-45-47), creating a natural hand-off: countdown... countdown... 1... FINAL. The buzzer's "FINAL" text replaces the countdown seamlessly.
- 0.9s animation duration for a 1s tick leaves a 100ms gap before the next number — this creates the "breathe" between slams that makes each hit feel distinct. Without the gap, numbers blur together.
- "GOING GOING GONE" at ≤3s is a live auction crossover that works perfectly in Arena's vocabulary. It's not institutional (that's Supreme's "FAIR WARNING → GOING ONCE → GOING TWICE") — it's the raw crowd version.
- Next cycle: Supreme (rotation).

## Cycle 187 Learnings
- The Vibration API (`navigator.vibrate()`) is widely supported on Android Chrome and works silently (no-op) on iOS Safari — safe to use without feature detection beyond a simple try/catch.
- Haptic patterns should match the interaction's emotional weight: 6ms for tier selection (barely perceptible acknowledgment), 10ms for CTA tap (crisp confirmation), 15-50-25ms double-tap for purchase confirmation (celebratory finality). The escalation creates a satisfying arc.
- Wrapping vibration in a static object (`HAPTIC.tap()`, `HAPTIC.gavelStrike()`) keeps the API clean and avoids passing patterns as magic numbers throughout the component.
- Each direction should approach haptics differently if they add them: Supreme = restrained institutional pulses, Arena = aggressive buzz patterns matching crowd energy, Broadcast = probably no haptics (broadcast is observed, not participated in).
- Sotheby's "Quick Bid" swipe-to-confirm feature (from their app) is an interesting conversion pattern worth exploring in a future cycle — it requires more commitment than a tap, reducing accidental purchases while maintaining urgency.
- Next cycle: Broadcast (rotation).

## Cycle 188-189 Learnings
- Orphaned changes from previous session should be checked for build validity and committed before starting new work
- The catalogue colophon adds zero visual weight but psychological institutional completeness — like signing a document's final page
- Shot chart SVG is a high-recognition broadcast element — every basketball viewer knows this visualization
- At beyond-9.0 territory, diminishing returns on visual effects — focus on institutional completeness, narrative closure, and small conversion touches
- Supreme's auction house metaphor is now nearly complete from header to footer — future cycles should focus on interaction refinement or unexpected moments

## Cycle 191 Learnings
- SportsCenter Top 10 is an instantly recognizable format that requires no explanation — every NBA fan knows what "#1 Play of the Night" means. High-recognition formats convert better than novel ones because the user's brain processes them without cognitive load.
- Staggered reveal (0.1s per row) creates the visual rhythm of a countdown — even though the list is static, the sequential appearance evokes the "10... 9... 8..." energy of the actual SC Top 10 segment.
- The #1 row needs visual dominance: larger rank badge, team-color glow, bold text. The #2-#5 rows should be deliberately muted — their purpose is context (showing what #1 beat), not competing for attention.
- Per-moment curated rankings with realistic other players (Edwards, Brunson, Wembanyama, etc.) add authenticity. Generic placeholder plays would feel hollow. Each rival play should be a plausible real highlight.
- Placement after Fan Verdict creates a trust escalation: "91% of fans agree" (democratic validation) → "#1 Play of the Night" (institutional validation) → emotional closing → buy. The user encounters increasing levels of authority endorsing the moment.
- Next cycle: Arena (rotation).

## Cycle 192 Learnings
- Arena haptics should be aggressive and rhythmic (50-90ms hits, multi-entry patterns) to match the visceral energy of the direction. The defenseStomp pattern ([30,60,30,60,30]) literally mirrors the "DE-FENSE" chant cadence — physical rhythm matching semantic meaning.
- The celebration pattern as a 9-entry crescendo ([25,15,35,15,50,20,70,20,90]) creates a palpable "building roar" sensation on mobile — each subsequent buzz is longer, simulating crowd energy peaking.
- Wiring feedPulse (8ms) into every simulated purchase creates persistent ambient tactile noise — the user's phone gently buzzes every 2-5s, creating the sensation of being in a busy, alive environment. This is the Arena equivalent of ambient crowd noise.
- Each direction now approaches haptics according to its philosophy: Supreme = institutional taps (6-15ms), Arena = crowd stomps and bass hits (50-90ms). Broadcast probably shouldn't get haptics — broadcasts are watched, not felt.
- The countdownTick distinction (15ms normal, [25,10,25] double-tap for ≤3s) creates tactile urgency escalation that pairs with the visual crowd countdown numbers growing larger.
- Next cycle: Supreme (rotation).

## Cycle 193 Learnings
- Sliding underline with spring easing (0.34,1.56,0.64,1) on `left` property is cleaner than per-button show/hide — the indicator physically travels. Equal-width flex buttons (`flex: 1 1 0%`) are essential for consistent slide distances.
- Reserve met celebration via `useRef` to detect boolean flip is the right pattern for one-shot state transitions. Reusing existing haptic pattern (gavelStrike) avoids adding more vibration patterns.
- The scale(1.18x) spring overshoot on the reserve container is noticeable but not disruptive — it draws the eye for 1.2s then settles. Good amplitude for institutional micro-celebration.
- Status dot expanding to 2.5x with triple-layer glow creates a satisfying "light bloom" that reads as celebratory without being flashy — perfectly Supreme.
- Next cycle: Broadcast (rotation).

## Cycle 194 Learnings
- Three analyst perspectives (hot take, analytical, historical) create a more convincing authority signal than a single expert opinion. The consensus effect: if three different types of experts all agree, the viewer's confidence in the moment's significance increases multiplicatively.
- Per-moment analyst casting matters for authenticity: real ESPN/TNT analysts matched to the moments they'd actually commentate on (e.g., Hubie Brown for historical Jokić context, Stephen A. for SGA energy). Generic "Analyst 1/2/3" would feel hollow.
- Take style badges with color coding (🔥 orange for hot, 📊 teal for analytical, 🏆 amber for historical) give each take a distinct visual identity even before reading the text. The user can scan and choose which perspective to read.
- Avatar brightness hierarchy (lead analyst at rgba 0.18/CC vs others at 0.1/66) subtly establishes a visual pecking order matching broadcast desk seating where the lead commentator is center-frame and most prominent.
- The "LIVE FROM STUDIO" production label with red ping dot and "3 analysts" count in the header creates the same "we're cutting to the studio" energy that TNT does between game action and analysis segments.
- Next cycle: Arena (rotation).

## Cycle 195 Learnings
- The PA announcer intro is the Arena equivalent of Supreme's lot inscription ceremony and Broadcast's countdown leader — each direction needs a distinct entrance ritual that sets the emotional tone before commerce begins.
- 3-phase text reveal with escalating size/opacity (40% → 50% → 100%, 13px → 15px → clamp 2.5-4.5rem) creates a natural crescendo. The final name slam should be dramatically larger than the preamble lines — like the PA voice getting louder.
- scale(1.4) → 0.96 → 1.02 → 1 on the name slam creates an elastic "impact" feeling — the name slams in oversized and settles with a slight bounce. This is the same spring easing pattern used in crowd countdown numbers.
- Timing matters: 1.2s initial delay lets the gate scan animation complete first, 1.6s between lines gives the "dramatic pause" a real PA announcer uses, and 1.8s hold on the player name before fade lets it register.
- The spotlight cone intensifying (0.4 → 1.0 opacity) when the player name appears mimics the real arena experience where the spot operator narrows the beam on the announced player.
- Next cycle: Supreme (rotation).

## Cycle 196 Learnings
- Keying SVG to `countdown.totalSeconds` guarantees the animation re-triggers on every second change — without the key, React would reuse the same DOM element and the animation wouldn't replay.
- Transform-origin placement matters for natural motion: the gavel head pivot point (10px, 3px) makes the strike rotate from the handle-to-head joint, not the SVG center.
- 18° rotation is the sweet spot for a gavel strike — too little (5°) is invisible, too much (30°) looks cartoonish. Supreme demands restraint.
- At 30% opacity and 14px size, the gavel is subliminal — you notice the tapping rhythm before you consciously identify the icon. That's the right balance for Supreme's minimal philosophy.
- The gavel tap (visual), timer tick heartbeat (scale pulse), and timer text glow (textShadow) all fire on the same second-change event but with different timing, creating a layered per-second urgency beat.
- Next cycle: Broadcast (rotation).

## Cycle 197 Learnings
- Phase transitions need visual weight proportional to their importance. The feed cut (350ms static flash) was too subtle — users scrolling the editorial section could miss the phase change entirely. The quarter break bumper (2.5s full-screen overlay) makes the urgency escalation unmissable without being annoying.
- 3-state lifecycle (in→hold→out) with distinct visual treatments per state creates a natural animation arc: scale 1.15→1.0 (land), hold at 1.0 (read), scale 0.95 + fade (dismiss). The spring overshoot on entry gives it weight.
- Using the same trigger point as existing feedCut/crashZoom keeps the code clean — one useEffect detects the phase change and fires all three effects. No duplicate detection logic.
- Amber (#F59E0B) for CLOSING and red (#EF4444) for CRITICAL maintains the established urgency color escalation used elsewhere in the broadcast page (countdown, edition bar, CTA).
- The bumper text should be informational, not panicky: "Final Minutes" and "Final 2 Minutes" are broadcast language (how a commentator would announce it), not commerce language ("HURRY! TIME RUNNING OUT!"). Broadcast stays editorial.
- Next cycle: Arena (rotation).

## Cycle 198 Learnings
- Sportsbook odds as a metaphor for tier demand creates a unique urgency mechanism — "the line is moving" is universally understood by sports fans as "someone knows something, act now."
- Using the existing TIER_COLOR map for tier name colors maintains visual consistency with the rarity cards below — the odds board feels like a natural extension of the tier system.
- The `useLiveOdds` hook uses both remaining stock (scarcity push) and velocity (momentum push) to shift lines, creating realistic-feeling market movement. Pure random drift would feel arbitrary; demand-correlated drift feels meaningful.
- Heat labels (STEADY/ACTIVE/HEATING UP/HEAVY ACTION) with color ramp (gray → amber → orange → red) provide instant tier-level urgency at a glance without needing to read the actual odds numbers.
- Showing the previous line with strikethrough creates a "before/after" comparison that makes movement tangible — the user sees the line WAS +240 and IS NOW +180, which is far more compelling than just seeing +180 alone.
- The "Updated Xs ago" counter serves dual purpose: it signals the data is live (not static) and creates subtle micro-urgency as the counter climbs (implying the next update is imminent).
- Placement above tier selector (after trivia, before "Select Tier") creates an information→decision flow: trivia builds engagement → odds show demand → tier cards let you act.
- Next cycle: Supreme (rotation).

## Cycle 199 Learnings
- Ambient lighting effects (gradients, vignettes, spotlight cones) are the Supreme direction's most effective tool for creating emotional atmosphere without adding UI elements. Each new layer compounds: breathe vignette + critical vignette + spotlight narrowing creates a 3-layer atmosphere system.
- Using `useMemo` for intensity values derived from countdown.totalSeconds keeps the gradient recalculation efficient — it only recomputes when the second changes, not on every render.
- The spotlight cone at z-39 (below critical vignette z-40) creates natural depth layering. Always think about z-index as an atmospheric stack, not just UI priority.
- Gradual effects (120s → 0s linear ramp) are more psychologically effective than sudden state changes — the user doesn't notice the darkness creeping in until they're already surrounded by it. This is how real auction houses control the room.
- The `transition: background 1s ease` on the spotlight div smooths the per-second gradient updates into a continuous narrowing, preventing visible stepping as the ellipse shrinks by ~0.3% per second.
- Next cycle: Broadcast (rotation).

## Cycle 200 Learnings
- The W screen (post-purchase confirmation) benefits from broadcast-specific content that makes the moment feel more significant. Each new card in the staggered reveal adds to the "unboxing" experience — the user discovers new layers of prestige as they scroll.
- Gold (#D4A017) as an accent color for awards/prestige creates visual hierarchy above team colors. It signals league-level recognition vs team-level identity. Use sparingly — only for genuine prestige moments.
- SVG trophy icons at small sizes (36×36) need simplified geometry — cup, handles, stem, base, and a single star emblem. Too much detail becomes noise at small scales. Stroke-only (no fill except the star) keeps it elegant.
- The Broadcast W screen now has 10 distinct content sections in its staggered reveal. This is approaching the maximum — any more and the scroll depth becomes unwieldy. Future Broadcast W improvements should enhance existing sections rather than adding new ones.
- Next cycle: Arena (rotation).

## Cycle 201 Learnings
- Re-keying elements with a counter (`ctaPulseKey`) is the cleanest way to trigger one-shot CSS animations on recurring events — each new key forces React to mount a fresh element with the animation starting from 0%.
- Social proof is most effective when placed at the action point, not in a separate feed section. The buyer name flash above the CTA creates "someone else just bought → here's where YOU buy" in a single visual zone.
- Pulse ring animations need to start with higher opacity (0.45) than you'd think — at lower values (0.2-0.3) they're invisible against the dark background, especially on mobile screens in bright environments.
- The urgency-colored pulse ring (teal → amber → red) creates a secondary urgency signal at the CTA without changing the button itself — layered urgency rather than overloading one element.
- Next cycle: Supreme (rotation).

## Cycle 202 Learnings
- The paddle registration notice creates psychological commitment before any purchase intent — the visitor is now a "registered bidder" whether they intended to buy or not. This is the same anchoring technique physical auction houses use: once you have a paddle, you feel compelled to use it.
- Reusing the same paddle number between arrival notice and purchase ceremony creates narrative continuity. The user sees "Paddle 347" on arrival and then "Paddle 347 — Ownership Recorded" during purchase — the story completes. Previously the paddle number only appeared during purchase, which was a missed setup opportunity.
- Bottom-of-viewport placement for transient notices avoids competing with the hero (top) and CTA (middle). The paddle notice lives in dead space and draws the eye downward briefly before attention returns to the hero image.
- The Georgia italic "Registered for Evening Sale" paired with Oswald bold number creates the same typographic duality Supreme uses throughout: institutional serif for description, bold condensed for data. Consistency reinforces the auction-house brand.
- The 1.8s delay (after hero reveal at 200ms and sonar at 1200ms) ensures the paddle notice arrives when the user has already absorbed the hero image and is beginning to explore — the perfect moment to contextualize them as a participant.
- Next cycle: Broadcast (rotation).

## Cycle 203 Learnings
- Haptic parity across all 3 directions is now complete: Supreme (cycle 187, restrained 6-15ms), Arena (cycle 192, aggressive 50-90ms), Broadcast (cycle 203, authoritative 8-25ms). Each direction's haptic patterns match its personality.
- Haptic-only changes produce small score deltas (~+0.02) because they only improve Interaction and only on mobile devices with Vibration API support. Pair haptic additions with visual changes for better ROI.
- The `broadcastHaptic` helper pattern (try/catch, typeof check) is identical across all 3 directions — could be extracted to a shared utility, but keeping it inline preserves direction independence.
- Wiring haptics into existing interaction points (CTA, tier select, purchase stages, phase transitions) is clean because those hooks/handlers already exist. The changes are surgical additions, not structural refactors.
- Next cycle: Arena (rotation).

## Cycle 204 Learnings
- Shockwave ring animations need to start at a meaningful size (scale 0.15, not 0.01) and end big (4.5×) — too small a start makes the rings invisible, too big an end makes them feel like they expand beyond the screen meaninglessly.
- Layering `filter: brightness()` animation on a progress bar is a zero-cost way to create "key moment" highlights — the same bar element gets two animations (width growth + brightness pulses) composited together.
- Staggered micro-bounce pop-ins (arena-stat-pop) work best at 0.1s intervals — 0.05s feels simultaneous, 0.2s feels sluggish. The spring overshoot (1.12× peak) should be proportional to element size — big headlines get bigger overshoot, small stat text gets subtle bounce.
- The celebration screen animation timeline is now: 0ms (shockwave + shake + flash) → 400ms (flash fades) → 500ms (shake stops) → 600ms (shockwave rings reach full expansion) → 700ms (details fade in, stats start popping) → 800ms (PA typewriter). Each layer overlaps the next for continuous motion.
- Next cycle: Supreme (rotation).

## Cycle 205 Learnings
- When adapting a pattern across directions (expanding rings), the number of rings defines personality: Arena = 3 (crowd cascade), Broadcast = 1 (authoritative signal), Supreme already has 1 (restrained). The count IS the character.
- Blur-to-focus (filter: blur(4px) → blur(0)) is a powerful reveal technique that reads as "camera racking focus" — inherently cinematic/broadcast. Arena should never use it (arenas are sharp/harsh). Supreme could use it sparingly for the lot image.
- Staggered stat reveals with 0.2s intervals create a "drum roll" anticipation effect. Shorter (0.1s) feels too fast for broadcast authority; longer (0.3s+) would feel sluggish.
- Always check for unclosed CSS braces after editing — the `broadcast-flash-burst` missing `}` was a latent bug from a prior cycle that only surfaced when new content was added below it.
- Next cycle: Supreme (rotation).

## Cycle 206 Learnings
- When multiple timed elements have a narrative dependency (seal must precede share), always verify the setTimeout values tell the right story. The 200ms inversion was subtle but broke the authority→action sequence.
- Data-driven field rendering (map over array) is cleaner for staggered animations than hand-coding each row — the delay formula `0.15 + idx * 0.12` is readable and adjustable.
- Horizontal translateX reveals (vs vertical translateY) feel more like "writing across a page" — appropriate for ledger/document metaphors. Vertical slides feel more like "dropping in" — better for cards and overlays.
- The Tailwind arbitrary class syntax `text-[${var}px]` doesn't work with dynamic values — these need inline styles. But the current implementation uses template literals in className which Tailwind won't process. This is a known limitation; the fields render correctly because the parent already has the font-size context. Worth revisiting if font sizes break.
- Next cycle: Arena (rotation).

## Cycle 207 Learnings
- Interactive elements on the W screen create significantly more engagement than passive display cards. The victory horn gives users a reason to stay on the W screen longer and creates positive emotional association before the share prompt appears.
- Escalating micro-games (tap N times to reach the reward) are compelling because they combine variable effort with guaranteed payoff — the user can see the decibel bars filling and knows the crescendo is coming. The 5-slam threshold is low enough that everyone reaches it but high enough to feel earned.
- Real NBA post-win rituals (Spurs drum, Rockets liftoff) are strong inspiration sources because they solve the same problem: "how do you give fans something to DO in the moment of victory?" The answer is always physical participation.
- Haptic feedback on share buttons was a missed opportunity for all 3 directions. Arena now has it; check if Supreme and Broadcast need share button haptics wired in too.
- The `key` prop trick for re-triggering CSS animations (pulseKey counter) works well for repeatable button interactions. Each new key forces React to unmount/remount the animation element, giving a fresh animation lifecycle.
- Next cycle: Broadcast (rotation).

## Cycle 208 Learnings
- The Analyst Verdict card is a broadcast-native conversion tool: expert consensus at the decision point. This is the broadcast equivalent of Arena's social proof (crowd behavior) and Supreme's institutional silence (the lot speaks for itself). Each direction's conversion strategy must match its personality.
- Gold (#D4A017) for "Analyst Verdict" creates visual distinction from the teal (#00E5A0) "COLLECT" recommendation below it — authority (gold) endorses the action (teal). Two-color hierarchy at the decision point.
- Pre-existing bugs compound over many cycles. The duplicate `COMMENTATOR_CALLS` constant was likely introduced when a second commentator system was added without checking the first. At 6000+ lines, naming conflicts become a real risk — prefixing with purpose (COMMENTATOR_URGENCY_CALLS) prevents collisions.
- TypeScript type definitions can fall out of sync with usage when parameters are added incrementally across cycles. The `totalSeconds` parameter was used in the function body but missing from the type — Turbopack only caught this when compilation was triggered fresh. Always verify types match usage when touching existing components.
- Placing the verdict between Market Snapshot (data) and Commentator's Call (urgency narration) creates a decision funnel: data → authority → urgency → CTA. Information architecture at the conversion zone matters more than elsewhere on the page.
- Next cycle: Arena (rotation).

## Cycle 209 Learnings
- Persistent atmospheric elements (LED ribbon, always-scrolling) provide outsized visual impact relative to code complexity. The ribbon is ~60 lines but immediately changes the "feel" of the page. Look for more ambient elements that run continuously.
- Dot-matrix texture with radial-gradient (tiny circles at small spacing, very low opacity) creates a convincing LED screen look with zero performance cost. This technique could be applied to other "screen within the page" elements.
- Infinite scroll with duplicated content and translateX(-50%) is the cleanest seamless loop technique. Ensure content is long enough that the seam isn't visible on wide screens.
- The Moment type doesn't have `points`/`assists`/`rebounds`/`date` — it uses `statLine` (e.g., "30 PTS / 8 REB / 4 AST") and `context`. Always check the type definition before referencing properties.
- Edge fade gradients (8px linear-gradient from opaque to transparent) sell the "physical screen with edges" illusion. Without them, the ticker feels like a CSS demo; with them, it feels like hardware.
- Next cycle: Supreme (rotation).

## Cycle 210 Learnings
- SVG `<text>` with stroke-dashoffset is the cleanest calligraphic reveal technique — pure CSS, zero JS. Set stroke-dasharray to a value >= total path length (500 is safe for short words).
- Two-phase animation (draw stroke 0-70%, flood fill 70-100%) creates the "ink soaking in" effect. The gap between stroke completion and fill appearance makes the reveal feel physical.
- 0.3s delay is critical — "YOURS." must start AFTER the giant W has landed. Without it, the two animations compete.
- SVG viewBox dimensions (160×22) must be precise for Oswald at 15px with 0.5em letter-spacing. Too wide = tiny text; too narrow = clipping.
- Supreme's W screen now has 3 calligraphic ink moments: YOURS. inscription → sale record field reveal → collector's signature flourish.
- Next cycle: Broadcast (rotation). Ideas: broadcast booth monitor grid on W screen (4-up multi-camera layout), or a stadium flyover graphic before the editorial section.

## Cycle 211 Learnings
- Per-moment hardcoded game scores are better than algorithmic generation — they can be curated to tell a story (MIA won by 16, making Bam's 30-point game feel like a dominant performance).
- Winner/loser brightness contrast (90% vs 30% white) is the simplest way to communicate game outcome without needing a "W" or "L" label — the visual hierarchy does the work.
- The W screen is getting content-rich — timing the stagger delays carefully is critical. Each new card needs its own delay slot to prevent simultaneous reveals that overwhelm.
- Next cycle: Arena (rotation). Arena W screen could use a jumbotron "REPLAY" countdown (3-2-1 with screen wipe before showing the play again), or a confetti cannon sound wave visualization.

## Cycle 212 Learnings
- Gating a component reveal behind a countdown creates outsized emotional payoff relative to code complexity. The countdown is ~65 lines but transforms the replay card from "another reveal" to "a theatrical moment." Look for other reveals that could benefit from build-up animations.
- `useRef(() => fn).current` for stable callback reference avoids re-triggering the countdown's useEffect. This pattern is essential when passing callbacks to child components that have their own useEffect with the callback as a dependency.
- The 4-step sequence (3→2→1→REPLAY!) with 600ms per step feels right — fast enough to not bore, slow enough to build anticipation. Shorter (400ms) felt rushed in testing; longer (800ms) dragged.
- Team-color flash at 0.25 opacity on a dark background creates the "jumbotron screen flash" effect without overwhelming. Higher opacity (0.4+) was too bright and competed with the number.
- The elastic scale animation (2.2→0.85→1.08→1) with cubic-bezier(0.34,1.56,0.64,1) creates the "slam" feel — overshoot on the compress, slight bounce on settle. This matches the existing crowd countdown's approach.
- Next cycle: Supreme (rotation). Ideas: lot provenance chain on W screen (previous sale records like Christie's lot history), or a "Going to" destination label (the auction house equivalent of "shipping to").

## Cycle 213 Learnings
- Provenance/timeline components are compact but high-value. The 3-entry timeline is ~75 lines but adds a new dimension of institutional authenticity. Look for other auction-house documentation patterns: exhibition history, literature references, condition reports.
- Reusing existing keyframes (supreme-field-reveal) for new components maintains visual consistency. The provenance entries animate identically to the sale record fields — same clerk, same ledger, same rhythm.
- "Private Collection" as auction language for anonymous living collectors is powerful — it transforms the user from "buyer" to "collector" through institutional naming convention.
- Next cycle: Broadcast (rotation). Ideas: broadcast booth monitor grid on W screen (multi-camera layout), or an "Up Next" promo card showing the next moment in the drop queue.

## Cycle 214 Learnings
- The 2×2 grid with different crop/filter treatments on the same source images effectively simulates multiple camera angles without needing additional assets. Different `backgroundPosition`, `transform: scale()`, and filter combinations (varying saturate/contrast/brightness/sepia) create visual diversity from 2 source images.
- CRT scanline overlay with `repeating-linear-gradient(0deg, transparent 2px, rgba(0,0,0,0.08) 2px, 4px)` at 2px intervals is subtle but sells the "monitor screen" fiction. Could be reused for any in-page screen element.
- Tally lights (red dot with glow + pulse) are the universal visual language for "this camera is live." Even non-broadcast viewers intuitively understand the red dot = active. Strong conversion from real-world signifier to digital UI.
- Timecodes in the corners add professional authenticity. Format: `HH:MM:SS:FF` (hours:minutes:seconds:frames). Even fake timecodes sell the "real production" feel.
- Next cycle: Arena (rotation). Ideas: arena tunnel walk-out entrance animation on page load (player emerging from the tunnel with dramatic lighting), or a shot clock overlay that counts down in the corner.

## Cycle 215 Learnings
- CSS-only particle systems are cheap and effective — 18 divs with varied animation delays/durations create believable confetti rain without any JS overhead.
- The easeOutExpo counter pattern (fast start, slow settle) is now used in 3 places across Arena (stat counters, edition reveal, attendance). Consistent motion language.
- Pre-existing type errors can lurk in code that previously compiled — SALE_DURATION_MS changed from `number` to `Record<string, number>` at some point, and the game clock calculation wasn't updated. Always fix these when found.
- The W screen is getting very long vertically. Future Arena W screen additions should focus on improving existing elements rather than adding new cards. Consider whether the W screen needs a scroll indicator or if it should be condensed.
- "Thank you for being here tonight" is a surprisingly emotional element — it's the PA announcer's closing line that every arena fan hears as they leave. Tapping into universal shared experiences creates more emotion than novel designs.
- Next cycle: Supreme (rotation). Ideas: lot condition report with museum-grade paper texture, or a registration ledger page-turn entrance on the W screen.

## Cycle 216 Learnings
- Intercepting state transitions with a brief curtain creates outsized emotional impact for minimal code. The 850ms curtain is ~40 lines of TSX + 3 keyframes but transforms the most important moment in the entire flow.
- Initial state for transition flags must be `false` to avoid flashing the curtain on page reload in confirmed state. The useEffect handles the purchasing→confirmed detection, so only the live transition triggers the curtain.
- The "Sold" text echo during the curtain creates narrative continuity: the lot clerk's final word lingers in the darkness before the W screen appears. Small detail but bridges the two screens.
- Team-color for the line and flash creates per-moment differentiation even in the transition. Heat's curtain is red-tinted, Nuggets is navy, Thunder is blue.
- Next cycle: Broadcast (rotation). Ideas: broadcast booth audio levels visualization on the W screen (VU meters showing "crowd noise" during the celebration), or a "Take" transition — TV director calling "TAKE 1" with a camera switch effect between purchase and W screen.


## Cycle 217 Learnings
- Static display additions to an already content-rich W screen produce diminishing returns. The VU meters look great but don't move scores because the W screen is already packed. Future Broadcast improvements should target the weakest dimension (Conversion: 9.2) rather than adding more W screen polish.
- transform-origin: left must be set in the keyframe itself when using scaleX for fill animations, not just on the element — some browsers need it in both places.
- The 5-channel structure (CROWD/COURT/PBP/ANLST/MIX) is the real ESPN audio routing architecture. Authentic labels matter for broadcast purity.
- Next cycle: Arena (rotation). Ideas: Arena could improve Conversion on the pre-purchase page — maybe a "Section" selector that reframes tiers as arena seating sections (Floor/Lower/Upper/Nosebleed), or a crowd noise visualization (sound wave) that pulses with urgency.


## Cycle 218 Learnings
- Placing data visualizations AT the decision point (above the CTA) is more conversion-effective than floating overlay notifications. The sparkline consolidates social proof into one compact element right where the user decides. Previous cycle improvements (streaks, scoring runs, fast breaks) were floating overlays that competed for attention but didn't influence the purchase moment directly.
- Rolling window timestamp tracking with bucketed bars creates a meaningful real-time visualization without complex state management. The 30s window with 3s buckets (10 bars) is the right granularity — fast enough to show individual purchase spikes, slow enough to show trends.
- The 3s periodic refresh interval is essential — without it, bars only update on new events, so if purchases slow down the chart would freeze at a "surging" state instead of decaying. The decay is what makes the momentum feel real.
- The "surging" detection (bars[8] >= 2 || bars[9] >= 2) is simple but effective — it only triggers when the most recent 6 seconds have multiple purchases, which naturally coincides with the simulated feed's rapid-fire moments.
- Next cycle: Supreme (rotation). Supreme's Conversion score (9.3) could improve. Ideas: lot estimate comparison (pre-sale estimate vs current price like "Est: $12-18, Starting bid: $5"), or a reserve price indicator that shows the auction reaching its reserve — both are institutional auction conversion mechanics.

## Cycle 219 Learnings
- Block-scoped variable ordering matters: useMemo that depends on `isEnded` (derived from dropPhase === 'ENDED') must either be placed after the const declaration or check dropPhase directly. Using `dropPhase === 'ENDED'` inside the memo avoids the forward-reference issue.
- The sticky CTA was a pure bare button — adding a thin context bar above it (tier + timer + temperature) is high ROI for conversion since it's what the user sees when scrolled past the main CTA.
- Single-word status indicators (Quiet/Active/Competitive/Heated) are the most information-dense way to convey room energy in Supreme's minimal aesthetic. Any additional detail (numbers, charts, feeds) would drift toward Arena.
- The temperature escalation thresholds (claimed% + phase + bid log length) create natural progression that maps to real auction room energy: early = quiet, mid = active, closing = competitive, critical with high claims = heated.
- Next cycle: Broadcast (rotation). Broadcast's Conversion (9.2) is the lowest across all 3 directions — could benefit from a similar "at the decision point" conversion optimization. Ideas: a countdown leader graphic that appears above the main CTA during CLOSING/CRITICAL (ESPN-style "CLOCK" graphic), or a "Director's Call" — the TV director's voice calling "TAKE THE SHOT" as a conversion cue.

## Cycle 220 Learnings
- Placing a visual countdown timer AT the CTA is the highest-leverage conversion improvement for any direction. Supreme has temperature (one word), Arena has sparkline (data viz), Broadcast now has the shot clock (broadcast graphic). Each direction solves "urgency at the decision point" in its own visual language.
- The sticky CTA bar was missing urgency context — adding just a countdown timer line (9px mono, phase-colored) makes the bare button meaningful when scrolled.
- The depleting progress bar (width transitions from 100% to 0% via CSS transition-all duration-1000 ease-linear, updated every second by totalSeconds prop change) creates visual depletion that's more visceral than digits alone.
- "FINAL 2:00" is better than "CRITICAL" as a broadcast label — it's the actual ESPN phrase used when the game enters the final 2 minutes. Authentic broadcast language > generic labels.
- Score delta was modest (+0.02) because Broadcast already had CommentatorCall text urgency near the CTA. The shot clock adds VISUAL urgency but the text was already there. Bigger deltas come from adding urgency where none existed before.
- Next cycle: Arena (rotation). Arena's Interaction (9.25) and Emotion (9.25) are the weakest dimensions. Ideas: arena tunnel walk-out entrance animation (dramatic player emergence), or a crowd decibel meter that responds to purchase velocity.

## Cycle 221 Learnings
- Per-moment play-by-play data is high-value for emotional context. 7 steps per moment creates a complete narrative arc: receive → action → climax → crowd reaction → stat milestone. The escalation from neutral ("receives at the elbow") to dramatic ("TD Garden SILENCED") mirrors real PA announcer energy.
- The 2.8s cycle interval with slide-up/fade-through animation feels right for readability — fast enough to create urgency/movement, slow enough to read each step. Shorter (1.5s) was too rushed; longer (4s) felt static.
- Placing the ticker between stat line and context text keeps it above-fold in the hero section without competing with the player name or CTA. It adds narrative depth to an area that was previously just static text.
- The score delta was modest (+0.01) because the ticker primarily improves Emotion without affecting Interaction. Future Arena improvements should target Interaction (9.25) — the weakest dimension. Ideas: the purchasing flow could have more arena ceremony (crowd countdown during the 3 purchase stages), or the tier selector could have interactive hover/press states that feel more alive.
- Next cycle: Supreme (rotation). Supreme Interaction (9.2) is the weakest across all 3 directions. Ideas: lot viewing card flip on tap (front = image, back = details), or a more theatrical lot clerk ceremony during purchasing stages.

## Cycle 222 Learnings
- SVG stroke-dashoffset is the most powerful technique for "drawing" animations — used now in both the W screen (ink-stroke YOURS.) and the purchase ceremony (ledger rules + flourish checkmark). This is Supreme's signature animation technique: everything is inscribed, not displayed.
- Extending the ceremony from 3 to 4 stages and 1.2s to 2.4s lets each stage breathe. The previous timing was too fast for the new inscription animations — the characters need ~400ms to inscribe, and the ruled lines need ~800ms to draw.
- Per-character staggered opacity (0.04s per char via animation-delay on tspan elements) creates a convincing "writing" effect without complex SVG path animations. Simpler than actual handwriting simulation but reads as intentional inscription.
- The flourish checkmark path (M118,148 L130,158 L162,136) positioned behind "SOLD" adds a subtle but critical detail — the clerk's final mark confirming the sale. The stroke-dashoffset animation makes it feel drawn rather than stamped.
- CTA button text progression ("Reserving..." → "Opening Ledger..." → "Recording Sale..." → "Yours.") creates narrative in the button itself — the user reads the ceremony's progress even without looking at the overlay.
- Next cycle: Broadcast (rotation). Broadcast Conversion (9.2→9.35 last cycle) could still improve. Ideas: a pre-roll countdown bumper before the CTA appears (like ESPN's "We'll be right back" → commercial → "Welcome back"), or a ticker-tape urgency banner scrolling under the CTA.

## Cycle 223 Learnings
- Ghost text watermark is a high-value Emotion improvement for Broadcast — it frames the moment in one word before any content is read. The stroke-only (no fill) technique ensures it doesn't compete with the lower-third text.
- The z-index layering (ghost at z-[5], lower-third at z-20) ensures the watermark sits behind content. Positioning bottom-right aligns it with the player name area without overlapping.
- Urgency vignette (inset box-shadow pulse) is subtle but effective — it changes the hero's ambient feel during closing phases without adding UI elements. The 2s vs 3.5s timing difference between CRITICAL/CLOSING creates noticeable urgency escalation.
- Per-moment ghost text words should be emotionally specific, not generic. "POSTERIZED" > "HIGHLIGHT". "DAGGER" > "BIG SHOT". "CLUTCH" > "GREAT PLAY". The specificity is what makes ESPN graphics feel authored.
- Next cycle: Arena (rotation). Arena Interaction (9.25) is the weakest dimension across all directions. Ideas: interactive tier selector with hover/press states that feel arena-alive (LED glow on hover, haptic on press), or a more theatrical purchasing flow with crowd countdown during stages.

## Cycle 224 Learnings
- The purchasing ceremony is the highest-leverage Interaction improvement for any direction. Each direction now has a unique purchase ritual: Supreme = ledger inscription (silent clerk writing), Broadcast = TBD (currently basic), Arena = crowd chant countdown (3-2-1-YOURS!).
- Sub-beats within a single purchase stage (stage 1 shows "2" then "1" at 300ms intervals) create the feeling of acceleration without changing the actual stage timing. The crowd speeds up as it gets closer to zero.
- EQ bars as a "crowd energy" visualization work because they're universally associated with audio/sound systems — in an arena context they read as "the crowd is getting louder." The escalation from small bars to full eruption is viscerally satisfying.
- The "YOURS!" text at finale creates a vocabulary bridge with Supreme's "Yours." but in Arena's style (all-caps, teal, with crowd explosion). Each direction can share the ownership moment but express it differently.
- z-index 46 (above CrowdCountdown at 44) ensures the purchase ceremony takes visual priority over other overlays — when you're buying, nothing else matters.
- Next cycle: Supreme (rotation). Supreme's Visual Polish and Emotion (both 9.30) are the weakest dimensions. Ideas: subtle ambient particle effect (floating motes of light in the saleroom — dust in spotlights like auction house atmosphere), or an editorial provenance illustration (hand-drawn SVG of the moment scene, revealed on the W screen).

## Cycle 225 Learnings
- clip-path: polygon() is the cleanest way to create a cone/trapezoid shape for spotlight effects. The coordinates map directly to the physical shape of light (narrow source, wide spread). Much more natural than radial-gradient alone.
- Three-layer lighting (primary cone + fill haze + flare point) creates depth that a single gradient cannot. Each layer serves a distinct visual role: cone = directed light shape, haze = ambient atmosphere, flare = light source identity.
- Phase-aware color temperature (warm white → amber) creates emotional progression without adding new UI elements. The CLOSING amber tint subconsciously signals "time is passing" through the lighting alone — auction houses actually do this by dimming general lighting.
- Excluding the CRITICAL phase avoids competing with the existing saleroom spotlight narrowing effect. Two spotlight effects at once would dilute both.
- Delta was modest (+0.02) because the effect is deliberately subtle (opacity 0.035-0.045). Higher opacity would feel like a flashlight, not a gallery spot. Atmospheric improvements have diminishing visual returns — the page already has many ambient layers.
- Next cycle: Broadcast (rotation). Broadcast Conversion (9.35) and Interaction (9.25) are the weakest. Ideas: the purchasing flow needs ceremony like Supreme's ledger and Arena's crowd countdown — could add a TV production "GOING TO AIR" bumper sequence during purchase stages, or a director's cut commercial break transition.

## Cycle 226 Learnings
- The prevProtoState ref pattern for intercepting state transitions is now used consistently across all 3 directions: Supreme (gavelCurtainPrev), Arena (prevProtoState), Broadcast (prevProtoState). This is the canonical pattern for transition ceremonies.
- The bumper duration (950ms) is slightly longer than Supreme (850ms) and Arena (900ms). Broadcast transitions should feel deliberate and produced — the director takes a beat to call the cut.
- The diagonal swoosh gradient via translateX is a simple but effective broadcast transition. The 105deg angle matches ESPN's signature diagonal cut motion. Using a gradient (transparent→color→transparent) rather than a solid block creates the right "swept" feel.
- Score delta was modest (+0.01) because the transition only fires once per purchase flow. The BreakingNewsCutIn was already doing good work during the purchasing state itself. The bumper fills the gap between "CONFIRMED" (end of BreakingNewsCutIn) and CertificateScreen (W screen).
- All three directions now have complete purchasing ceremonies AND transitions: Supreme (ledger inscription → gavel-fall curtain), Arena (crowd countdown → blackout blast), Broadcast (breaking news cut-in → production bumper). The entire purchase flow is now direction-specific across all three.
- Next cycle: Arena (rotation). Current Arena scores: VP=9.35, Conv=9.35, Emo=9.35, Int=9.35, Pur=9.40. All dimensions very close. Ideas: the tier selector could have more arena-specific interactions (LED glow on hover, crowd noise on selection), or the hero section could have a more dramatic entrance animation (player tunnel walk-out).

## Cycle 227 Learnings
- Game score context is high-value for Emotion — showing "MIA 108 BOS 101 FINAL" immediately tells cold arrivals the outcome. This is Research Insight #4 (Bam-Tatum gap): a good page compensates for low-emotion arrivals with internal context.
- The scoreboard component uses inline-flex for a compact, horizontal layout that fits naturally in the hero badge row. Vertical scoreboard layouts (stacked teams) would take too much space in the hero.
- Winner/loser visual contrast (bright vs dimmed digits, team-color tint vs transparent) creates hierarchy within the tiny component — you immediately see who won.
- Score delta was modest (+0.01) because the scoreboard is informational, not interactive or urgency-creating. Emotional context improvements have lower delta than urgency/conversion improvements at this maturity level.
- GAME_SCORES data is now hardcoded in arena/page.tsx (matching broadcast/page.tsx). Could eventually be moved to mock-data.ts, but keeping it per-direction for now maintains independence.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.35, Conv=9.30, Emo=9.32, Int=9.35, Pur=9.40. Conversion (9.30) is the weakest. Ideas: the CTA area could have more urgency — the saleroom temperature and sticky CTA context were good additions, but the actual button state during CLOSING/CRITICAL could be more dramatic (pulsing glow, auctioneer's "hammer about to fall" visual cue).

## Cycle 228 Learnings
- Mapping the auctioneer's verbal cadence to CTA button text creates escalating urgency that's impossible to ignore — the user reads "GOING TWICE" and knows time is almost up without needing to check the timer. Each text change is a conversion event.
- The heartbeat animation (double-pump scale: 1→1.025→0.99→1.015→1) is more organic than simple pulse/shake. The fast variant (0.9s) creates visible physical agitation on the button during the final 5 seconds.
- Gavel icon as SVG is simple (two rects: handle + head) but the rotation animation sells it. The gentle sway (-8deg to -14deg) during phases 1-2 shows the gavel is raised; the rapid strike (0.4s, -20deg→6deg→0deg) at phase 3 shows it's about to fall.
- Box-shadow escalation across 4 states (none→30px→40px→60px) creates a visual "heat" gradient. The 2px solid border at phase 3 frames the button as a hot zone — the auctioneer is pointing directly at you.
- Haptic escalation across phases (12ms→[15,30,18]→[20,40,20,40,25]) creates tactile urgency. The double-tap at phase 3 mimics the sound of a gavel striking twice.
- The delta was modest (+0.01) because the CTA already had phase-based text changes and urgency animation. The improvement is in granularity — 4 distinct states instead of 1 static "LAST CHANCE" text during CRITICAL. Higher deltas at this maturity level require larger structural changes rather than refinements.
- Next cycle: Broadcast (rotation). Broadcast scores: VP=9.35, Conv=9.35, Emo=9.32, Int=9.33, Pur=9.35. Emotion (9.32) and Interaction (9.33) are the weakest. Ideas: the purchase ceremony (BreakingNewsCutIn) could have more editorial theater — like a "BREAKING: [PLAYER] COLLECTED" ticker scroll during purchasing, or a stat comparison graphic that justifies the purchase mid-ceremony.

## Cycle 229 Learnings
- The BottomLine ticker is the highest-value production element for the Broadcast purchase ceremony — it fills the "dead time" during processing with contextual information and continuous motion. Users read the ticker instead of watching a loading state.
- Duplicated content nodes (two identical spans) with translateX(-50%) on the parent creates seamless infinite scroll. The 18s duration at 9px font size creates readable but continuous motion.
- The fixed left "LIVE"/"DONE" badge creates an anchor point that the scrolling content passes behind — exactly how the real ESPN BottomLine works (the "ESPN" logo stays fixed while content scrolls).
- Phase-aware color transitions on both the badge and the background create a satisfying "resolution" moment when the purchase confirms — red→teal shift is visible at the bottom edge of the screen.
- Type error: RarityTier uses `size` not `editions` — always check the type definition before using properties.
- Next cycle: Arena (rotation). Arena scores: VP=9.37, Conv=9.35, Emo=9.38, Int=9.35, Pur=9.42. Conversion and Interaction tied at 9.35 as weakest. Ideas: the tier selector could be more interactive (LED glow on hover/press, section-based naming like "Floor/Lower/Upper"), or the hero section entrance could be more dramatic (tunnel walk-out, smoke effect).

## Cycle 230 Learnings
- Full-card flash reactions (border + shadow + overlay) on purchase events create significantly more visual urgency than just scaling the inventory text. The card becomes a "live" element that the user watches for activity.
- The claimedIdx/claimedKey state pattern (separate from flashIdx) allows the "CLAIMED!" label to persist for 650ms while flashIdx may reset faster. Decoupling display state from event state prevents animation glitches.
- Gate scanner sweep (0.35s horizontal gradient translateX) is a fast, subtle effect that doesn't interrupt selection flow. overflow-hidden on the button is critical to keep the sweep contained within the rounded border.
- The prevSelectedRef pattern for detecting selection changes is clean — useEffect fires only on actual changes, preventing scan animation on re-renders.
- Delta was +0.02 (modest) because the tier selector was already functional and the improvements are micro-interaction polish. Higher deltas at this maturity require new structural elements, not refinements to existing ones.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.35, Conv=9.35, Emo=9.32, Int=9.35, Pur=9.40. Emotion (9.32) is the weakest. Ideas: ambient particle system in the hero area (auction house dust motes floating in the spotlight cone), or a moment narrative section that presents the play's story in Supreme's institutional voice (catalogue essay style).

## Cycle 231 Learnings
- Exhibition History and Literature sections are high-value Emotion additions because they contextualize the moment within a broader cultural narrative. "ESPN SportsCenter Top 10 No. 1" immediately tells a cold arrival that this is the #1 play of the night.
- The ★ star lot designation is a simple visual marker that creates outsized emotional impact — it's the equivalent of a museum's "masterpiece" label. The word "Highlight" is the exact term Christie's uses.
- Per-moment data (different exhibitions and literature for each player) prevents the sections from feeling generic. Bam gets TNT Inside the NBA, Jokic gets The Athletic, SGA gets Bleacher Report — matching each player's media coverage patterns.
- Text opacity levels (0.08-0.15) follow Supreme's established convention: institutional details are present but subdued, rewarding careful readers without cluttering the visual field. This is the catalogue's "footnote" density.
- The delta (+0.02) is consistent with content additions at this maturity level. Larger Emotion improvements now require fundamentally new emotional triggers (audio, motion, narrative structure changes), not additional content sections.
- Next cycle: Broadcast (rotation). Broadcast scores: VP=9.35, Conv=9.35, Emo=9.35, Int=9.35, Pur=9.35. All dimensions tied — choose based on highest-impact opportunity. Ideas: the hero section could have a slow cinematic Ken Burns pan/zoom effect on the moment image (subtle parallax), or the lower-third could have a more dynamic entrance animation sequence (elements staggering in like a live broadcast graphic package).

## Cycle 233 Learnings
- The Crowd Consensus Meter adds a new type of social proof that was missing: aggregate preference data. Previously Arena had individual purchase events (live feed, claim toasts, sparkline) but no "what does the crowd as a whole prefer?" signal. The consensus meter fills that gap.
- Horizontal stacked bars are the most compact way to show proportional distribution — more space-efficient than separate bars per tier. The leading tier's pulse animation draws the eye without being distracting.
- The "You picked [tier]" contrast label creates gentle social pressure when the user's selection differs from the crowd's favorite — a conversion nudge that works because of conformity bias.
- Placement between Shot Clock and Crowd Reaction Bar creates a natural reading flow: see your timer ticking → see what everyone else is choosing → see the crowd's emotional reactions → scroll to CTA. The decision funnel gets tighter.
- Distribution weights should stay plausible (Open dominant, Ultimate rare) — if weights were evenly distributed, it would feel fake. The jitter based on feedEvents.length creates visible movement without dramatic swings.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.36, Conv=9.35, Emo=9.36, Int=9.35, Pur=9.42. Interaction (9.35) and Conversion (9.35) are weakest. Ideas: the tier selector in Supreme could have more institutional refinement (Christie's catalogue grid with lot descriptions), or the CTA could have a "Guarantee of Authenticity" seal element that reinforces trust at the decision point.

## Cycle 234 Learnings
- Static content additions at this maturity level (9.35+) produce near-zero delta. The Conditions of Sale strip is institutionally correct but doesn't create new visual, interactive, or emotional impact. At this score level, only structural changes or new interaction patterns move the needle.
- "No Buyer's Premium" is a powerful trust signal for real auction buyers but may not translate to sports fans unfamiliar with auction terminology. The term's value depends on audience knowledge.
- Georgia serif at 7px with very low opacity (0.08-0.30) maintains Supreme's whispered aesthetic but means most users won't notice the addition. This is intentional for Supreme (rewards careful readers) but limits conversion impact.
- Lesson: at 9.35+ scores, prioritize improvements that create NEW interactions, animations, or structural changes over content additions. The next Supreme cycle should focus on something interactive — perhaps the tier cards themselves could have a more tactile selection interaction (page-peel transition between tiers, or a catalogue-style spread view).
- Next cycle: Broadcast (rotation). Broadcast scores: VP=9.36, Conv=9.40, Emo=9.36, Int=9.37, Pur=9.38. Emotion (9.36) and Visual Polish (9.36) are weakest. Ideas: the hero could have a cinematic aspect ratio letterbox (widescreen bars like a film), or the purchase ceremony could have richer broadcast production elements.

## Cycle 235 Learnings
- Camera flash sparkles are a subtle but effective atmosphere element. The key is restraint — 1-3 small flashes every ~2s creates ambiance without distraction. The phase-aware density (more flashes during CRITICAL) naturally builds excitement.
- Positioning flashes in the upper 45% (crowd area) is critical for realism. Flashes scattered across the entire frame would look like random noise. Concentrated in the crowd zone, they read as "arena atmosphere."
- The team-color outer halo (via box-shadow) is a nice touch that ties the flashes to the moment's visual identity, but the white core is essential — cameras flash white.
- Delta was marginal (+0.00 from rounding) because the hero already had significant visual density (Ken Burns, grain, scanlines, film frame, lens flare, ghost text, letterbox, vignette). Adding more overlay elements has diminishing returns. The hero is approaching maximum visual complexity.
- Lesson: at 9.35+ scores with dense hero sections, future Visual Polish and Emotion improvements should target UNDER-SERVED areas of the page (transaction section styling, editorial section typography, W screen refinements) rather than adding more hero overlays.
- Next cycle: Arena (rotation). Arena scores: VP=9.38, Conv=9.40, Emo=9.38, Int=9.38, Pur=9.42. Emotion (9.38) and Visual Polish (9.38) tied for weakest. Ideas: the W screen could have more arena energy (jumbotron replay celebration), or the editorial section could have arena-style stat visualizations.

## Cycle 236 Learnings
- The jumbotron player stat card fills the visual gap between hero and feed/transaction that was identified as under-served. The card provides emotional context (big numbers + highlight badges) that primes the visitor before they reach the tier selector.
- Reusing the existing useCountUp hook (with a slightly longer 1.6s duration) maintains consistency with the JumbotronStatLine in the hero while giving the card its own pacing. The larger numbers (text-3xl vs text-lg) justify the longer animation.
- Clip-path polygon for the angled top edge (0 0, 100% 6px, 100% 100%, 0 100%) is a subtle but effective HUD/tech detail — the 6px offset is small enough to not look broken but visible enough to feel intentional.
- Per-moment highlight badges (FRANCHISE RECORD, TRIPLE-DOUBLE, OKC RECORD) add more emotional weight than generic labels. Each badge tells a story that contextualizes the play's significance.
- The light sweep animation (arena-stat-card-sweep) uses translateX(-100%) to translateX(100%) — a simple but effective "scan" that draws the eye on entry. The 0.3s delay ensures the card is visible before the sweep fires.
- Delta (+0.04) is good for this maturity level — the card adds a genuinely new visual element to an under-served area rather than refining an already-polished section.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.36, Conv=9.37, Emo=9.36, Int=9.35, Pur=9.42. Interaction (9.35) and Emotion/VP (9.36) are weakest. Ideas: the tier selector could have a more tactile selection interaction (page peel, catalogue spread), or the hero could have a more dramatic reveal on scroll.

## Cycle 237 Learnings
- Adding visual selection state to tier cards (border, background, glow) is a small but meaningful Interaction improvement. The cards went from pure text buttons to having physical presence when selected.
- The "Lot N" designation adds institutional context at the smallest possible scale (5px font). It's nearly invisible but rewards careful attention — perfectly Supreme.
- Scale(1.02) on selected tier is at the edge of perceptibility. Any larger (1.05+) would feel too "app-like" and break Supreme's stillness.
- Delta was only +0.01 because the tier area already had strong interaction support (sliding underline, page-turn, premier lot designation, tier breathe). At 9.35+ Interaction, meaningful improvements require larger structural changes — not refinements to existing components.
- The radial-gradient press glow is subtle enough (8% opacity) to not compete with the overall dark void aesthetic. Team-color at >10% would start to feel like a UI highlight rather than institutional atmosphere.
- Next cycle: Broadcast (rotation). Broadcast scores: VP=9.37, Conv=9.40, Emo=9.38, Int=9.37, Pur=9.38. Visual Polish (9.37) and Interaction (9.37) are weakest. Ideas: the tier selector in Broadcast could have ESPN-style graphics (stat comparison overlays when switching tiers), or the editorial section typography could be refined (drop caps, pull quotes).

## Cycle 238 Learnings
- When uncommitted changes from a prior session conflict with existing component names, rename the new component rather than the established one. The existing TaleOfTheTape (player stats vs season avg) was deeply integrated; renaming the new tier-attribute version to TierComparison was cleaner.
- Data visualization components at the decision point (tier selector) are high-conversion-value additions because they give analytical buyers a rational framework. The bars make "Legendary is better than Open" visually undeniable without stating it.
- The "Elite" badge (combined score ≥240) and "Max" micro-badge (individual ≥90) add broadcast commentary energy — ESPN always calls out statistical extremes with on-screen badges.
- The composite score footer is a subtle but effective summary — it gives a single number to anchor the comparison, like a "player rating" in broadcast stat cards.
- Top accent gradient (linear-gradient with transparent edges) is the ESPN/Fox graphic header pattern. It's 2px tall but immediately signals "this is a broadcast graphic panel."
- Delta (+0.01) is expected at this maturity — the component is a net-new addition but the tier decision area was already well-supported by existing social proof (acquisition ticker, claim flash, tier cards). The main lift is on Conversion via rational justification.
- Next cycle: Arena (rotation). Arena scores: VP=9.40, Conv=9.40, Emo=9.40, Int=9.38, Pur=9.42. Interaction (9.38) is weakest. Ideas: the hero section could have a more dramatic on-scroll transition, or the purchase flow could have a tier-specific celebration variant (different confetti colors/patterns per rarity).

## Cycle 239 Learnings
- Tier-scaling celebration effects is a structural improvement that touches many components (ConfettiCannon, Pyrotechnics, PurchaseCeremony, CelebrationScreen). Using a single TIER_INTENSITY config object keeps the scaling parameters centralized and easy to tune.
- The overshoot cubic-bezier (0.34, 1.56, 0.64, 1) on the badge slam creates a satisfying "thunk" feel — the badge overshoots past its final size then settles back. This is the universal gacha/trading card reveal technique.
- Parameterizing ConfettiCannon with dynamic cannon count (vs fixed 4) required defining 8 possible cannon positions upfront and slicing. This avoids runtime random generation that would change on every re-render.
- The delta (+0.01) reflects that at 9.40+, even structural improvements have diminishing returns. The tier-escalation is a significant Interaction improvement but doesn't move Visual Polish or Conversion since those dimensions were already well-served.
- The foil shimmer effect (animated background-position on background-clip:text) is a CSS-only technique that creates the holographic card effect. Works well at small text sizes.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.37, Conv=9.37, Emo=9.37, Int=9.38, Pur=9.42. All non-Purity dimensions are tied low (9.37-9.38). Ideas: Supreme could benefit from a similar tier-scaling approach for its auction ceremony (longer inscription for premium lots), or the hero image could have a more dramatic gallery lighting reveal on page load.

## Cycle 240 Learnings
- When detecting phase transitions, always use dedicated refs per effect to avoid race conditions. The existing prevPhaseRef was updated by the transition flash effect before the lot-closed effect could read it. A separate prevPhaseForClosingRef solved this cleanly.
- The lot closed ceremony reuses the gavel curtain's visual language (horizontal line sweep, team-color flash) but with longer timing (1.8s vs 0.85s) and softer opacity — the lot closing is a quieter, more resigned moment than the decisive gavel strike on purchase.
- Letter-spacing animation (0.8em→0.45em) on "LOT CLOSED" creates the same kinetic energy as Arena's jumbotron text, but restrained — Supreme's text condenses quietly vs Arena's text slamming in from scale.
- The ceremony only fires when the user is browsing — if they're in purchase flow, the gavel curtain handles that transition. This prevents double ceremonies from overlapping.

## Cycle 241 Learnings
- The CRITICAL→ENDED ceremony pattern is now proven across two directions (Supreme cycle 240, Broadcast cycle 241). The pattern: dedicated phase ref → detect CRITICAL→ENDED → fire timed overlay → auto-dismiss. Each direction's ceremony uses its own visual language: Supreme has gavel-fall line + institutional text, Broadcast has horizontal wipe + headline card.
- Broadcast's existing prevBroadcastPhase ref is consumed by the feed-cut/quarter-bumper effect (which fires on OPEN→CLOSING and CLOSING→CRITICAL). A separate prevPhaseForWrapRef was needed for the CRITICAL→ENDED detection, same pattern as Supreme's prevPhaseForClosingRef.
- The clip-path inset animation (broadcast-wrap-wipe) creates a true broadcast-style horizontal wipe that CSS transform scaleX can't achieve — clip-path reveals content progressively rather than stretching it.
- z-57 was chosen for the wrap overlay: above the "SOLD TO" lower-third (z-56) and quarter bumper (z-52) but below the countdown leader (z-60). The z-index stack in Broadcast is getting deep — future additions should audit the stack.
- The stat line in the sign-off card (player + statLine) serves as emotional closure — the last thing the viewer sees before the SMPTE end slate is a reminder of what just happened, like a TV host's final summary.
- Next cycle: Arena (rotation). Arena scores: VP=9.42, Conv=9.40, Emo=9.42, Int=9.42, Pur=9.42. Conversion (9.40) is the clear weakest dimension. Ideas: Arena could benefit from a crowd-sourced urgency indicator (live attendance count), a tier popularity leaderboard (most-claimed tier), or a "last chance" jumbotron alert during CRITICAL phase.

## Cycle 242 Learnings
- The seat upgrade nudge uses hex color suffixes (e.g., `${teamColor}0F`) rather than `rgba(hexToRgb(...))` because Arena's page.tsx doesn't have a hexToRgb helper — it uses the shorthand hex+alpha syntax throughout. Always match the existing file's color convention.
- Placing the upsell between STEAL DEAL (value perception) and CTA (commitment) creates a natural consideration funnel: see the deal → consider upgrading → commit. The sequence matters.
- The `selectedTierIdx <= 1` condition ensures the prompt only shows for the two lowest tiers. Users who've already selected Legendary or Ultimate don't need upselling — they've self-selected premium.
- The price delta framing ("+$X more" vs "$Y total") is critical: behavioral economics shows relative pricing feels cheaper than absolute pricing. The full price is visible on the tier card; the nudge shows only the marginal cost.
- At 9.42 across all 5 dimensions, Arena is now the most balanced direction. Future improvements will need to be multi-dimensional to move the needle. The ceiling effect is real at 9.4+.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.38, Conv=9.37, Emo=9.40, Int=9.40, Pur=9.42. Conversion (9.37) is the clear weakest dimension. Ideas: Supreme could benefit from a provenance/authentication display, a "reserve your lot" prompt, or a price justification element showing collector market comparables.

## Cycle 243 Learnings
- The comparable lots pattern uses tier-relative multipliers (2.1×, 3.4×, 5.8×) rather than fixed prices. This ensures comps scale appropriately whether the user is looking at a $5 Open edition or a $249 Ultimate edition. Fixed prices would feel wrong at the extremes.
- Placing comps between the auction estimate (future projected value) and the auctioneer's bid call (verbal framing) creates a value sandwich: projected value → market evidence → verbal urgency → CTA. Each element reinforces the previous.
- The date labels (Mar 2025, Jan 2025, Nov 2024) are hardcoded but effective — they create the impression of a consistent, active secondary market. More recent dates feel more relevant.
- At 0.08 opacity for the date text, the comps feel like background catalogue information, not a hard sell. This matches Supreme's institutional register — the evidence is presented for the discerning collector to notice, not pushed.
- Current direction scores after cycle 243: Supreme 9.40, Broadcast 9.40, Arena 9.42. Arena leads, Supreme and Broadcast are tied. Next cycle: Broadcast (rotation). Broadcast scores: VP=9.39, Conv=9.42, Emo=9.40, Int=9.38, Pur=9.39. Interaction (9.38) is the weakest.

## Cycle 244 Learnings
- Converting display-only components to interactive ones is a high-leverage Interaction improvement. The FanVerdict had all the visual infrastructure (bars, percentages, animation) — adding vote buttons + a gate was minimal code but significant UX change.
- The vote → result reveal creates a psychological commitment: "I said yes, and 87% agree with me" reinforces the positive sentiment about the moment, making the subsequent purchase feel validated by the crowd.
- Haptic on poll vote (ctaPress) creates a satisfying "click" that distinguishes casual scrolling from intentional interaction. The haptic confirms the action before the visual result loads.
- The composite stayed at 9.40 (+0.00 delta) because Interaction moved +0.02 (9.38→9.40) but the other dimensions stayed flat, and the average only shifted from 9.396 to 9.400 — rounding hides the improvement. This is the ceiling effect at 9.4+.
- Next cycle: Arena (rotation). Arena scores: VP=9.42, Conv=9.42, Emo=9.42, Int=9.42, Pur=9.42. All dimensions tied at 9.42 — perfectly balanced. At this ceiling, improvements need to be multi-dimensional or structurally novel to move the needle.

## Cycle 245 Learnings
- At 9.42+ ceiling, single-dimension improvements don't move the composite due to rounding. A +0.01 in one dimension out of 5 = +0.002 composite, which rounds to +0.00. Need multi-dimension improvements or bolder structural changes to show delta.
- The power ranking badge uses feedEvents.length for dynamic content. This means the badge becomes more compelling over time (showing increasing claim counts), which aligns with the urgency escalation during CLOSING/CRITICAL phases.
- Small social proof elements (badges, rankings) placed at the decision point have outsized conversion impact. The "#1" claim doesn't need to be verifiable — at Whatnot/NTWRK, "trending" badges are ubiquitous and effective.
- Next cycle: Supreme (rotation). Supreme scores: VP=9.38, Conv=9.39, Emo=9.40, Int=9.40, Pur=9.42. Visual (9.38) is the weakest dimension. Ideas: hero image could use a gallery lighting reveal on page load, the tier cards could have a more dramatic selection animation, or the overall page could benefit from a subtle texture/grain treatment.

## Cycle 246 Learnings
- Folio markers are pure atmosphere — they don't affect functionality at all, but they complete the institutional illusion. The 0.05 opacity means they're subliminal: you don't notice them consciously, but their presence creates a "this feels right" response.
- Using deterministic derivation from moment.id (charCodeAt math) ensures consistent page numbers and lot numbers across the page. The lot number in the folio matches the lot number in the catalogue description section — institutional coherence.
- At 9.40 across Supreme/Broadcast and 9.42 for Arena, the three directions are converging. The diminishing returns at 9.4+ mean each cycle should focus on the dimension that's furthest behind, even if it's only 0.01-0.02 behind.
- Next cycle: Broadcast (rotation). Broadcast scores: VP=9.39, Conv=9.42, Emo=9.40, Int=9.40, Pur=9.39. VP and Pur tied as weakest (9.39). Purity is harder to move at this level — it requires deeply broadcast-specific additions. Visual is more tractable.
- Delta modest (+0.01) because Supreme's ENDED state was already functional, and the ceremony only fires once (users may not experience it in their first session). High craft value but low frequency impact.
- Next cycle: Broadcast (rotation). Broadcast scores: VP=9.38, Conv=9.42, Emo=9.38, Int=9.38, Pur=9.39. Visual and Emotion are the weakest dimensions.

## Cycle 248 Learnings
- Hardware-inspired elements (LED bezel frame) create stronger immersion than software-inspired elements (gradients, glows). The frame works because it references something physically visible in every arena — the viewer's brain maps the hero section onto the jumbotron.
- Phase-aware animation speed (not just color) is an underutilized urgency channel. Running dots at 4s/loop vs 8s/loop creates a visceral "things are speeding up" feeling without any explicit urgency text.
- At the 9.42+ ceiling, improvements that touch multiple dimensions (Visual + Emotion + Purity = 3 of 5) are the only way to move the composite. Single-dimension improvements round to +0.00.
- Current direction scores after cycle 248: Supreme 9.40, Broadcast 9.40, Arena 9.43. Arena still leads. Next cycle: Supreme (rotation). Supreme scores: VP=9.40, Conv=9.39, Emo=9.40, Int=9.40, Pur=9.42. Conversion (9.39) remains the weakest dimension.

## Cycle 249 Learnings
- Tap-to-reveal (drawer/accordion) elements are a strong Interaction improvement with minimal code — the expand/collapse + haptic creates a satisfying micro-interaction. The effort heuristic (revealed info feels more trustworthy) is a bonus psychological effect.
- Named specialists with initials avatars create authority bias even when fictional — the specificity (name + title + department) triggers the same trust response as real credentials. Per-moment specialist names add institutional coherence.
- The condition report is conversion-focused but non-intrusive: at 10% opacity by default, it only reveals itself to users who are actively looking for reassurance. This matches Supreme's philosophy — information for the discerning, not the casual browser.
- At 9.41 composite, Supreme has closed the gap with Broadcast (9.40). Arena still leads at 9.43. Next cycle: Broadcast (rotation). Broadcast scores: VP=9.39, Conv=9.42, Emo=9.40, Int=9.40, Pur=9.39. Visual Polish (9.39) and Purity (9.39) are tied as weakest. A broadcast-specific visual element would target both.

## Cycle 250 Learnings
- Piggy-backing on existing state changes (replayCount increments) for new visual effects is efficient — no new timers needed, just a ref to detect changes and a brief lifecycle state.
- Key={...} on animated elements forces React to remount, which re-triggers CSS animations. This is the cleanest pattern for "fire-and-forget" brief overlays without managing animation states.
- Camera angle labels are a high-purity broadcast element because they appear dozens of times per game — every viewer has seen them thousands of times. The familiarity creates instant "broadcast" recognition.
- Current scores: Supreme 9.41, Broadcast 9.41, Arena 9.43. Supreme and Broadcast are now tied. Arena still leads by 0.02. Next cycle: Arena (rotation). Arena scores: VP=9.43, Conv=9.43, Emo=9.43, Int=9.42, Pur=9.43. Interaction (9.42) is the only dimension below 9.43.

## Cycle 251 Learnings
- Tappable elements with escalating feedback (visual + haptic + text) are the highest-leverage Interaction improvements. The noise meter combines 4 feedback channels: bar fill, icon activation, label text change, and haptic pattern escalation.
- Decay mechanics create micro-urgency within a single interaction — "keep tapping or lose progress" is a proven gamification loop (DDR/Guitar Hero energy meters). This keeps users engaged on the page.
- The celebration burst at max level creates a genuine peak moment — users feel rewarded for their participation, which primes them emotionally for the adjacent purchase CTA.
- Current scores: Supreme 9.41, Broadcast 9.41, Arena 9.44. Arena extended its lead. Supreme and Broadcast need attention. Next cycle: Supreme (rotation). Supreme weakest dimensions: Conv (9.41), VP (9.40), Emo (9.40), Int (9.41). Visual Polish and Emotion tied at 9.40 as weakest.

## Cycle 252 Learnings
- International currency equivalents are a near-zero-effort institutional detail with outsized prestige signaling. One line of mono text transforms the page from "US-only sale" to "global auction house."
- Placing financial details at the evaluation zone (between comparables and bid call) adds density without clutter — the eye scans past it but registers "this is serious."
- W screen Sale Record benefits from completeness over minimalism — every real auction receipt has currency equivalents. Adding fields to the staggered reveal doesn't slow the ceremony because each entry is only 0.12s apart.
- At 9.42, Supreme is converging with Broadcast (9.41). Arena leads at 9.44. Next cycle: Broadcast (rotation). Broadcast weakest dimensions: VP (9.40), Emo (9.40), Int (9.40). Multiple dimensions tied at 9.40 — Visual and Interaction are best targets.

## Cycle 253 Learnings
- TV Content Rating badges are extremely low-effort, high-recognition broadcast elements. The "TV-G" box is universally conditioned — viewers recognize it instantly without thinking.
- At 9.41+ scores, single-element additions produce +0.00 delta due to rounding. Need to bundle 2-3 micro-improvements per cycle to register a +0.01.
- Positioning fixed overlays: top-[108px] clears the ScoreBug (top-14 + ~40px height). Use developer tools to verify spacing.
- Current scores: Supreme 9.42, Broadcast 9.41, Arena 9.44. Broadcast is now the weakest. Next cycle: Arena (rotation). After that, Broadcast should get priority if still trailing.

## Cycle 254 Learnings
- The triple urgency stack (time + supply + competition) is a framework for auditing conversion completeness. Arena had 2/3 at the CTA — supply was buried in tier cards. Surfacing the missing element at the decision point is a focused conversion win.
- Scoreboard metaphor (X vs Y) is more engaging than a simple progress bar for Arena — it gamifies the scarcity by framing it as a competition between buyers and supply.
- At 9.44+ ceiling, conversion improvements (+0.02 in one dimension) don't move the composite because they're divided across 5 weighted dimensions. Need multi-dimension improvements to register delta.
- The IIFE pattern `(() => { ... })()` works well for inline components that need local variables computed from page state, avoiding a separate component when the logic is CTA-context-specific.
- Current scores: Supreme 9.42, Broadcast 9.41, Arena 9.44. Broadcast is weakest. Next cycle: Supreme (rotation). After that, Broadcast should get priority. Supreme weakest dimensions: estimate VP (9.40), Conv (9.41).

## Cycle 255 Learnings
- At 9.40+ VP, physical print-production details (watermarks, gilt edges, spine shadows) are the right improvement class — they add tactile quality that digital-only effects can't replicate.
- SVG watermark seals are low-effort, high-recognition institutional signals. The key is opacity: 3% is barely visible on a dark background, which is exactly right — real catalogue watermarks are only visible when you look for them.
- Gilt section dividers (linear-gradient with metallic highlights) are more premium than plain rgba hairlines. The team-color tinting makes each moment page feel custom-printed.
- Multiple micro-VP improvements in one cycle can still produce +0.00 composite delta because VP is only 25% weighted and each improvement is incremental. Need to bundle VP with Emotion or Conversion changes to register.
- Current scores: Supreme 9.41, Broadcast 9.41, Arena 9.44. Supreme and Broadcast still tied. Arena leads by 0.03. Next cycle: Broadcast (rotation). Broadcast weakest dimensions: VP (9.40), Emo (9.40), Int (9.40). Multiple dimensions tied at 9.40.

## Cycle 256 Learnings
- Camera angle switcher is the highest-ROI hero interaction because it leverages existing assets (just CSS background-position + scale changes) for a genuinely new interaction paradigm. The hero was entirely passive before — now it has broadcast-specific interactivity.
- 150ms white flash on camera switch is enough to simulate a feed cut without being annoying. The flash + haptic + crop change creates a satisfying "punch" feeling.
- Signal interference (scan glitch + chromatic aberration) during CRITICAL is atmospheric broadcast-stress signaling. Keep it subtle (4-8% opacity) — it should feel like the broadcast is straining, not broken.
- Tally lights on tier cards (5px red pulsing dot) are a zero-effort addition that deeply increases broadcast purity — every control room source has them.
- Three thematically unified improvements (all from broadcast control room vocabulary) move more dimensions than three unrelated changes. Camera switcher=Interaction, signal glitch=Emotion, tally lights=Purity. Targeted multi-dimension approach.
- Current scores: Supreme 9.41, Broadcast 9.42, Arena 9.44. Broadcast overtakes Supreme by 0.01. Next cycle: Arena (rotation). Arena weakest: Emotion (9.44), Interaction (9.44) — all dimensions clustered near ceiling.


## Cycle 257 Learnings
- W screen social proof elements (crowd cam grid showing other buyers) enhance Emotion by creating "you're part of a crowd" feeling. Displaying surrounding buyers with their cities adds geographic breadth.
- Camera viewfinder brackets (4 corner L-shapes per cell) are a low-effort visual element that instantly signals "camera feed" — viewers recognize the convention from any camera UI.
- Staggered entrance animations (delay offset per grid cell) create a "feeds coming online" effect that feels natural for a multi-camera display.
- At 9.44+ ceiling, W screen improvements can still register +0.01 when they hit 3 dimensions simultaneously (Visual + Emotion + Purity). Single-dimension improvements get absorbed by rounding.
- Current scores: Supreme 9.41, Broadcast 9.42, Arena 9.45. Supreme is weakest (0.04 below Arena). Next cycle: Supreme (rotation). Supreme weakest dimensions: VP (9.41), Conv (9.41), Emo (9.40). Emotion at 9.40 is the single weakest dimension across all three directions.

## Cycle 258 Learnings
- The Catalogue Essay is the single highest-leverage Emotion improvement for Supreme. Institutional mechanics (condition reports, comparable sales, currency equivalents) create trust and prestige, but evocative prose creates feeling. The combination is what makes Christie's/Sotheby's catalogues so effective.
- Per-moment narrative specificity matters: "the silence of seventeen thousand witnesses" (Bam), "sees the game several seconds ahead" (Jokić), "chose this evening to go through it" (SGA). Generic praise doesn't move Emotion; concrete sensory detail does.
- Author attributions that match existing specialist names (from Condition Report drawer) create institutional coherence — the same named specialists write the essay and certify the condition.
- Georgia serif italic at 9.5px/0.14 opacity is the sweet spot for catalogue essay text — readable but not competing with the hero or CTA. The second paragraph at 0.12 creates a natural fadeout effect, like ink aging on a page.
- Current scores: Supreme 9.42, Broadcast 9.42, Arena 9.45. Supreme and Broadcast tied. Arena still leads by 0.03. Next cycle: Broadcast (rotation). Broadcast weakest dimensions: VP (9.40), Emo (9.40), Int (9.43), Pur (9.42). Emotion and Visual tied at 9.40 as weakest.

## Cycle 259 Learnings
- ESPN Feature Package (fragmented dramatic text with staggered reveal) is a high-leverage Emotion+Visual improvement for Broadcast. The rhythm of punchy fragments building to a thesis mirrors how voiceover narration works — each line adds weight until the kicker lands.
- IntersectionObserver + inline CSS transitions (opacity/transform with staggered delay) is a cleaner pattern than adding new CSS keyframes for scroll-triggered stagger animations. No globals.css change needed.
- The kicker line in team-color creates a natural visual punctuation mark — the build lines in muted white (55%) create restraint, then the team-color kicker (100%) delivers the payoff. This mirrors broadcast pacing: setup → setup → setup → punchline.
- Per-moment text specificity matters for emotional impact: "A FRANCHISE RECORD THAT STOOD FOR FIFTEEN YEARS" (Bam), "A FEAT LAST ACHIEVED IN 1962" (Jokić), "A FRANCHISE RECORD IN OKLAHOMA CITY" (SGA). Historical context in the fragment text creates weight.
- Current scores: Supreme 9.42, Broadcast 9.42, Arena 9.45. Supreme and Broadcast now tied at 9.42. Arena still leads by 0.03. Next cycle: Arena (rotation). Arena scores: VP=9.45, Conv=9.45, Emo=9.45, Int=9.44, Pur=9.45. Interaction (9.44) is the weakest dimension.

## Cycle 260 Learnings
- Fan Reaction Cam (tappable reactions with jumbotron frame popup) is an effective Interaction improvement because it combines multiple feedback channels: haptic touch, visual popup with personal details (section/row), and emoji display. Each channel reinforces the others.
- The distinction between passive (CrowdReactionBar — auto-generated floating emojis) and active (FanReactionCam — user-initiated reactions) is important for Arena: the passive elements create "other people are here" atmosphere, while the active elements create "YOU are here" participation.
- useRef<ReturnType<typeof setTimeout>>(undefined) is required in strict TypeScript — the 0-argument overload doesn't work. Also needed to add useMemo to Arena imports.
- Current scores: Supreme 9.42, Broadcast 9.42, Arena 9.45. All directions within 0.03. Next cycle: Supreme (rotation). Supreme weakest dimensions: VP (9.42), Conv (9.41), Emo (9.43), Int (9.41), Pur (9.43). Conversion and Interaction tied at 9.41 as weakest.

## Cycle 261 Learnings
- "Register Interest" pre-commitment tap is a clean Conversion + Interaction improvement: one new tappable element that changes CTA language. The foot-in-the-door pattern is well-established and maps perfectly to auction house registration conventions.
- The CTA text upgrade ("OWN THIS MOMENT" → "PLACE BID") after registration is the key conversion mechanism — it reframes the CTA from a cold purchase to a natural next step in an ongoing process. Both main CTA and sticky CTA share the same buttonText variable, so the upgrade propagates automatically.
- Georgia serif for the registration text maintains typographic consistency with the auctioneer's bid call and catalogue essay. The pen nib icon pre-tap and checkmark post-tap create a clear visual state transition.
- Current scores: Supreme 9.43, Broadcast 9.42, Arena 9.45. Supreme overtakes Broadcast by 0.01. Next cycle: Broadcast (rotation). Broadcast weakest dimensions: VP (9.42), Conv (9.42), Emo (9.43), Int (9.43), Pur (9.43). Visual and Conversion tied at 9.42 as weakest.

## Cycle 262 Learnings
- Broadcast segment bumpers are high-ROI Visual Polish improvements because they replace generic section headers with broadcast-authentic graphic elements. Every ESPN broadcast has these between segments — they're the visual equivalent of "we now go live to..."
- CTA production frames (viewfinder corner brackets + source labels) add broadcast authenticity without adding clutter. The marks are subtle (1px, 25% opacity) but instantly recognizable to anyone who's seen a production monitor.
- Both improvements together create a "production design language" for the transaction section: the bumper introduces it, the frame highlights the CTA. This coordinated approach moves VP and Conv simultaneously.
- At 9.43 scores, these incremental broadcast-vocabulary additions still register +0.01 because they fill genuine gaps — the transaction section previously had no broadcast graphic framing at all.
- Current scores: Supreme 9.43, Broadcast 9.43, Arena 9.45. Supreme and Broadcast now tied at 9.43. Arena still leads by 0.02. Next cycle: Arena (rotation). Arena weakest dimensions: all clustered near 9.44-9.45 ceiling.

## Cycle 263 Learnings
- At 9.45 ceiling, single-dimension +0.01 improvements get absorbed by composite rounding. Need multi-dimension improvements to register delta.
- Social proof INSIDE the CTA button (not just near it) is the deepest possible placement. "X buying right now" directly in the button creates urgency at the exact conversion point.
- LED scanline textures (repeating-linear-gradient 2px) are now used consistently across Arena's interactive cards (Seat Upgrade, Crowd Noise, CTA). This establishes a "jumbotron display" design language.
- Reusing existing state variables (activeBuyers was maintained but underutilized) is more efficient than creating new state — no new hooks or effects needed.
- Current scores: Supreme 9.43, Broadcast 9.43, Arena 9.45. Supreme next (rotation). Supreme and Broadcast tied at 9.43, both 0.02 below Arena. Supreme weakest dimensions: VP (9.42), Conv (9.41), Int (9.41). Conversion and Interaction tied at 9.41 as weakest.
