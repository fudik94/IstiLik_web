# IstiLik Web 🔥

A heating power calculator web app — the web version of the [IstiLik Android app](https://github.com/fudik94/IstiLik_app).

Open the site and instantly calculate the required boiler capacity, number of radiator sections, and heating power for any residential space.

---

## Features

- **Real-time calculation** — results update as you type, no button needed
- **Glassmorphism UI** — dark theme with orange accents, modern frosted-glass cards
- **Three languages** — Azerbaijani, Russian, English (Estonian coming soon)
- **PDF export** — download a formatted heating report via browser print
- **Advanced parameters** — wall type, insulation level, floor type, DHW points, underfloor heating
- **PWA** — install on mobile or desktop, works offline
- **Responsive** — two-column layout on desktop, single column on mobile

---


## Calculation Parameters

| Parameter | Range | Default |
|---|---|---|
| Room area | 5 – 1000 m² | — |
| Ceiling height | 2 – 6 m | — |
| Housing type | Apartment / House | Apartment |
| Heating system | Radiators / Underfloor / Mixed | Radiators |
| Insulation | Good / Medium / Poor | Medium |
| Wall type | 1 – 4 external walls | 1 |
| Floor type | Standard / Attic | Standard |
| Radiator section power | 50 – 500 W | 180 W |
| DHW points | 1 – 5 | 1 |

**Output:** Boiler capacity (kW), recommended boiler size, number of radiator sections, required heat load.

---

## Project Structure

```
IstiLik_web/
├── index.html              # Page markup
├── css/
│   └── style.css           # All styles (glassmorphism, layout, print)
├── js/
│   ├── calculator.js       # Heating calculation logic (pure functions)
│   ├── translations.js     # UI strings — AZ / RU / EN
│   ├── app.js              # DOM wiring, i18n, PDF, reset
│   └── calculator.test.js  # Node.js tests for calculation logic
├── assets/
│   └── icon-192.png        # PWA icon
├── manifest.json           # PWA manifest
└── service-worker.js       # Offline cache
```

---


## Mobile App

The Android version is available here: [IstiLik Android App](https://github.com/fudik94/IstiLik_app)

---

## License

MIT
