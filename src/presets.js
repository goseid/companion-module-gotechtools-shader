// Ready-to-drop presets for common Companion surfaces.
//
// For each control we expose two presets:
//
//   1. "<Label> button"  — a regular button: shows label + current value,
//      press = reset that knob. Pair with two more buttons (delta +1 and
//      delta -1) if you want fine control without a rotary.
//
//   2. "<Label> encoder" — an encoder/rotary preset: turn left/right sends
//      delta ±1, press resets. Drop this on a Stream Deck XL Plus or
//      Loupedeck Live rotary slot and the surface's LCD will show the
//      current value via the `text` field.
//
// Plus a global "Reset All" button preset.

const { CONTROLS } = require('./controls');

const BLACK = 'rgb(0,0,0)';
const WHITE = 'rgb(255,255,255)';
const PRIMARY = 'rgb(37,99,235)';

function buttonStyle(label, varKey) {
  return {
    text: `${label}\\n$(shader:${varKey}_signed)`,
    size: '14',
    color: WHITE,
    bgcolor: BLACK,
    alignment: 'center:center',
  };
}

module.exports = function buildPresets() {
  const presets = {};

  for (const c of CONTROLS) {
    // Standard button — press resets that knob.
    presets[`btn_${c.key}`] = {
      type: 'button',
      category: 'Knobs (button)',
      name: `${c.label} reset button`,
      style: buttonStyle(c.label, c.key),
      steps: [
        {
          down: [{ actionId: 'reset', options: { knob: c.key } }],
          up: [],
        },
      ],
      feedbacks: [],
    };

    // Encoder preset for a rotary slot.
    presets[`enc_${c.key}`] = {
      type: 'button',
      category: 'Knobs (encoder)',
      name: `${c.label} encoder`,
      style: buttonStyle(c.label, c.key),
      options: {
        // Mark as an encoder/rotary on supported surfaces.
        rotaryActions: true,
      },
      steps: [
        {
          // Button push: reset.
          down: [{ actionId: 'reset', options: { knob: c.key } }],
          up: [],
          // Encoder turn: delta ±1.
          rotate_left: [{ actionId: 'delta', options: { knob: c.key, delta: -1 } }],
          rotate_right: [{ actionId: 'delta', options: { knob: c.key, delta: 1 } }],
        },
      ],
      feedbacks: [],
    };
  }

  presets['reset_all'] = {
    type: 'button',
    category: 'Global',
    name: 'Reset All',
    style: {
      text: 'RESET\\nALL',
      size: '18',
      color: WHITE,
      bgcolor: 'rgb(180,30,30)',
      alignment: 'center:center',
    },
    steps: [
      {
        down: [{ actionId: 'reset_all', options: {} }],
        up: [],
      },
    ],
    feedbacks: [],
  };

  return presets;
};
