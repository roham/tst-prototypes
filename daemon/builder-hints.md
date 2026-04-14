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
