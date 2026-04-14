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
