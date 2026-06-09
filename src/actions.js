// Companion action definitions. Each action calls back into the Instance to
// send the corresponding WebSocket message to the goTech shading relay.
//
// Knob-targeted actions accept the control key as a dropdown so the same
// action serves all eight controls — preset definitions hardcode each one
// for the user, but custom buttons can pick any key.

const { CONTROLS, MIN_VALUE, MAX_VALUE } = require('./controls');

function knobChoices() {
  return CONTROLS.map((c) => ({ id: c.key, label: c.label }));
}

module.exports = function buildActions(instance) {
  return {
    set: {
      name: 'Knob — set absolute value',
      description: 'Set a knob to an exact value between −99 and +99.',
      options: [
        {
          type: 'dropdown',
          id: 'knob',
          label: 'Knob',
          default: 'rg',
          choices: knobChoices(),
        },
        {
          type: 'number',
          id: 'value',
          label: 'Value',
          default: 0,
          min: MIN_VALUE,
          max: MAX_VALUE,
          step: 1,
        },
      ],
      callback: async (event) => {
        instance.sendSet(event.options.knob, event.options.value);
      },
    },

    delta: {
      name: 'Knob — change by delta',
      description: 'Add a signed delta to the current knob value. Use −1 / +1 for fine, −10 / +10 for coarse.',
      options: [
        {
          type: 'dropdown',
          id: 'knob',
          label: 'Knob',
          default: 'rg',
          choices: knobChoices(),
        },
        {
          type: 'number',
          id: 'delta',
          label: 'Delta',
          default: 1,
          min: -99,
          max: 99,
          step: 1,
        },
      ],
      callback: async (event) => {
        instance.sendDelta(event.options.knob, event.options.delta);
      },
    },

    reset: {
      name: 'Knob — reset to 0',
      description: 'Set a single knob back to neutral.',
      options: [
        {
          type: 'dropdown',
          id: 'knob',
          label: 'Knob',
          default: 'rg',
          choices: knobChoices(),
        },
      ],
      callback: async (event) => {
        instance.sendReset(event.options.knob);
      },
    },

    reset_all: {
      name: 'Reset All',
      description: 'Set every knob (all six matrix coefficients, Level, and Phase) back to neutral.',
      options: [],
      callback: async () => {
        instance.sendResetAll();
      },
    },
  };
};
