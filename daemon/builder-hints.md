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
