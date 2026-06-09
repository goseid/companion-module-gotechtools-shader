// Shared metadata for the eight controls — kept in one place so actions,
// variables, and presets stay consistent.

const CONTROLS = [
  { key: 'rg',    label: 'R-G',   group: 'matrix' },
  { key: 'rb',    label: 'R-B',   group: 'matrix' },
  { key: 'gr',    label: 'G-R',   group: 'matrix' },
  { key: 'gb',    label: 'G-B',   group: 'matrix' },
  { key: 'br',    label: 'B-R',   group: 'matrix' },
  { key: 'bg',    label: 'B-G',   group: 'matrix' },
  { key: 'level', label: 'Level', group: 'chroma' },
  { key: 'phase', label: 'Phase', group: 'chroma' },
];

const CONTROL_KEYS = CONTROLS.map((c) => c.key);

const ZERO_STATE = Object.fromEntries(CONTROL_KEYS.map((k) => [k, 0]));

const MIN_VALUE = -99;
const MAX_VALUE = 99;

module.exports = { CONTROLS, CONTROL_KEYS, ZERO_STATE, MIN_VALUE, MAX_VALUE };
