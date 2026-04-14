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
