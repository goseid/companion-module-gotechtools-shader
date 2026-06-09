## goTech Camera Shader

Drive the [goTech Camera Shading Simulator](https://gotech.tools/shading/) from a Bitfocus Companion control surface — rotaries on a Stream Deck XL Plus or Loupedeck Live can replace the mouse + keyboard for the eight linear-matrix controls.

### Setup

1. Open **https://gotech.tools/shading/** in a browser and log in.
2. In the page's **Connect Bitfocus Companion** panel, copy the pairing GUID.
3. Configure this Companion connection:
   - **Host** — `gotech.tools` for production, `dev.gotech.tools` while testing.
   - **Pairing GUID** — paste from the page.
   - **Use plain `ws://`** — leave off unless pointing at a local HTTP-only dev server.
4. The connection status should switch to **Connected** within a couple of seconds.
   - **Pairing GUID rejected** — double-check the GUID and that you're logged in on the page. You can regenerate the GUID from the same panel if you suspect it was shared.
   - **Disconnected — retrying** — the page tab isn't open, or the server is unreachable. Open `gotech.tools/shading/` (you do need to be logged in there) and the connection should come up.

State always lives in the browser tab. Companion sends commands; the page applies them and broadcasts back its current state.

### Variables

For each control there are two variables:

| Variable | Format | Use |
|---|---|---|
| `$(shader:rg)` | raw integer (`-3`, `0`, `25`) | feeding expressions or feedbacks |
| `$(shader:rg_signed)` | with leading sign (`-3`, `0`, `+25`) | button labels (reads naturally) |

Same pattern for `rb`, `gr`, `gb`, `br`, `bg`, `level`, `phase`.

### Actions

- **Knob — set absolute value** — pick a knob, set it to a specific value (−99..+99).
- **Knob — change by delta** — add a signed delta. Default ±1 for fine adjustment; you can clone the action with delta=±10 for a coarse button.
- **Knob — reset to 0** — one knob back to neutral.
- **Reset All** — all eight controls back to neutral.

### Presets

- **Knobs (button)** — one preset per control. Shows label + current value. Press resets that knob.
- **Knobs (encoder)** — one preset per control, suitable for a Stream Deck XL Plus or Loupedeck Live rotary slot. Turn = ±1, press = reset.
- **Global → Reset All** — single button, all eight controls back to neutral.

### Layout suggestion

A Stream Deck XL Plus (4 rotaries + 32 buttons):

- Rotaries 1–4: encoder presets for **R-G**, **R-B**, **G-R**, **G-B**.
- Rotaries on a second profile page: **B-R**, **B-G**, **Level**, **Phase**.
- Top-row buttons: **Reset All**, and one button per "Snap to solution" preset (coming in a future release).

### Sign convention

Positive knob values push the affected color **outward** on the vectorscope; negative pulls toward neutral. Matches Sony BRC-X400 shading-desk convention.
