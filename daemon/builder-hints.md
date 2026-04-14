# TST Build Daemon — Builder Hints

## Cycle 1 Learnings
- Using Oswald font-display for player names is a massive visual upgrade — should apply to Broadcast and Arena too in their own style
- Team-color ambient glow behind hero creates emotional depth without adding clutter — perfect for Supreme's minimal approach
- The confetti on W screen needs more polish — particles are simple rectangles, could use varied shapes
- Game context line ("5th 30-pt game • Franchise record") adds emotional weight cheaply
- CTA glow that intensifies with urgency phase is good but needs testing — does the red glow in CRITICAL phase feel premium or alarming?
- Remote was SSH with denied deploy key — switched to HTTPS, works now

## Cycle 2 Learnings
- Upstream changes happened between cycles — API changed (getSaleEndsAt → SALE_DURATION_MS, useCountdown takes duration, added playerImageUrl/actionImageUrl). Always pull before starting a cycle.
- Broadcast's left-edge accent line + animated lower-third creates genuine ESPN broadcast energy — very on-brand
- The LIVE badge with pulse dot in the hero bar is a subtle but effective urgency signal
- Staggered entrance on certificate (growing accent line, sequential fade-ins) makes the W screen feel more theatrical
- Broadcast is the richest direction (editorial narrative, tier selector, certificate) — needs polish more than new features now
- playerImageUrl is now available in mock data — use it for hero backgrounds instead of just gradients
