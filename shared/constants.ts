// Shared enums used by both the frontend (client/) and backend (cloudflare-workers/).
// Single source of truth — see docs/superpowers/specs/2026-05-09-backend-features-design.md.

/** Player strengths. Locked enum; revisit when the recommendation engine work begins. */
export const STRENGTHS = [
  'POWER_KICKER', //     kicks deep
  'PLACEMENT_KICKER', // bunts, hits gaps
  'FAST', //             good baserunner
  'STRONG_ARM', //       long, accurate throw
  'RELIABLE_CATCHER', // catches popups consistently
  'QUICK_HANDS', //      infield reaction time
  'OUTFIELD_RANGE', //   covers ground
  'LEADERSHIP', //       vocal, organizes the field
] as const;

export type Strength = (typeof STRENGTHS)[number];

/** The 10 field positions, matching the order already used by client/App.jsx. */
export const FIELD_POSITIONS = [
  'Pitcher',
  'Catcher',
  '1st Base',
  '2nd Base',
  '3rd Base',
  'Shortstop',
  'Left Field',
  'Left Center',
  'Right Center',
  'Right Field',
] as const;

export type FieldPosition = (typeof FIELD_POSITIONS)[number];

export function isStrength(value: string): value is Strength {
  return (STRENGTHS as readonly string[]).includes(value);
}

export function isFieldPosition(value: string): value is FieldPosition {
  return (FIELD_POSITIONS as readonly string[]).includes(value);
}
