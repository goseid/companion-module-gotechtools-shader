# companion-module-gotech-shader

Bitfocus Companion module for the [goTech Camera Shading Simulator](https://gotech.tools/shading/).

Pairs a Companion control surface (Stream Deck XL Plus, Loupedeck Live, etc.) with a logged-in shading-simulator session so you can drive the eight linear-matrix controls (R-G, R-B, G-R, G-B, B-R, B-G, Level, Phase) from rotaries and buttons instead of mouse + keyboard.

## How it works

1. Log in at <https://gotech.tools/shading/>.
2. The page generates a per-user *pairing GUID* and shows it in the "Connect Bitfocus Companion" panel.
3. You paste that GUID into this module's instance config.
4. The module opens a WebSocket to `wss://gotech.tools/api/shading/ws?guid=<your-guid>`, the page is already connected on the other side, and the relay routes messages between the two.

State always lives in the page. The module sends `set` / `delta` / `reset` / `reset_all` commands; the page applies them and broadcasts back its current state, which the module mirrors into Companion variables (used by feedbacks and button labels).

## Install (as a custom module)

Until this is published to the Bitfocus module registry, install it as a Companion *custom module*.

1. **Clone** this repo somewhere your Companion install can reach:

   ```bash
   git clone https://github.com/goseid/companion-module-gotech-shader.git
   cd companion-module-gotech-shader
   npm install
   ```

2. In Companion's web UI (`http://localhost:8000`), go to **Settings** → enable **Developer modules path**, set it to the parent directory of this clone. Restart Companion.

3. Add the module: **Connections** → **Add connection** → search for "goTech Camera Shader".

4. **Configure the instance:**
   - **Host:** `gotech.tools` (or `dev.gotech.tools` while testing against dev)
   - **Pairing GUID:** paste from the shading page's Connect Companion panel
   - **Use plain `ws://`:** leave unchecked unless you're testing against a local HTTP-only dev server

5. The instance status should switch to **Connected** once the WebSocket opens. If it says **Pairing GUID rejected**, double-check the GUID matches the page and that you're logged in.

## What the module exposes

### Actions

| Action | Notes |
|---|---|
| **Knob — set absolute value** | Picks a knob (dropdown) + a value (−99..+99). Useful for snap-to-preset buttons. |
| **Knob — change by delta** | Adds a signed delta to the current value. Default ±1 for fine; bind ±10 for coarse. |
| **Knob — reset to 0** | One knob. |
| **Reset All** | All eight controls. |

### Variables

For each knob (R-G, R-B, G-R, G-B, B-R, B-G, Level, Phase):

- `$(shader:<key>)` — raw integer (`-3`, `0`, `25`, …)
- `$(shader:<key>_signed)` — with leading sign (`-3`, `0`, `+25`, …) — use this on button labels

### Presets

- **Knobs (button)** category — one button per control: shows the label and current value, press to reset that knob.
- **Knobs (encoder)** category — one encoder preset per control: turn left/right = ±1, press = reset. Drop these on rotary slots of a Stream Deck XL Plus or Loupedeck Live and the surface's LCD shows the current value.
- **Global** category — **Reset All** button.

## Development

```bash
npm install
```

This module follows the standard Bitfocus module layout (`companion/manifest.json` + `src/main.js`). When iterating:

1. Edit files under `src/`.
2. In Companion, **Settings** → **Reload modules** (or restart the process).
3. Watch Companion's log panel for module-side `log()` output.

The server side lives in the [goTechTools](https://github.com/goseid/goTechTools) repo at `src/tools/shading/ws.js` (relay) and `html/shading/app.js` (browser client). The wire protocol is JSON over WebSocket, documented at the top of those files.

## License

ISC
