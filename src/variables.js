// Companion variable definitions. Each knob is exposed as two variables:
//   - $(shader:<key>)         — raw integer (e.g., 25, -3, 0)
//   - $(shader:<key>_signed)  — human-friendly with leading sign (e.g., +25, -3, 0)
//
// Use the `_signed` form on button text so the value reads naturally; use the
// raw form when feeding into expressions or feedbacks that need a number.

const { CONTROLS } = require('./controls');

module.exports = function buildVariables() {
  const defs = [];
  for (const c of CONTROLS) {
    defs.push({
      variableId: c.key,
      name: `${c.label} — current value`,
    });
    defs.push({
      variableId: `${c.key}_signed`,
      name: `${c.label} — current value with sign`,
    });
  }
  return defs;
};
