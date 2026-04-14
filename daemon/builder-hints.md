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
