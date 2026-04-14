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

## Strategic Notes
- Cycles 4-6 = POLISH. Focus on typography, spacing, animation timing, above-fold experience
- Supreme is weakest → gets Cycle 4
- Broadcast has highest Emotion (5.5) — its editorial narrative is working
- Arena has highest Interaction (5.0) — its live feed simulation is engaging
- All three are strong on Purity (7.0) — directions remain distinct
