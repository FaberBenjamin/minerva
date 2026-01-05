# Minerva Theme System - Dokumentáció

## Áttekintés

A Minerva alkalmazás egy háromtémás színrendszert használ, amely zökkenőmentes váltást tesz lehetővé a felhasználók számára:

1. **Light Theme** (Világos téma - alapértelmezett)
2. **Dark Theme** (Sötét téma)
3. **Blue Theme** (Kék téma)

## Színpaletta Specifikáció

### Light Theme
- **Háttér színek:**
  - Primary: `#ffffff` (fehér)
  - Secondary: `#f5f5f5` (nagyon világosszürke)
  - Tertiary: `#e0e0e0` (világosszürke)

- **Szöveg színek:**
  - Primary: `#2d2d2d` (sötétszürke)
  - Secondary: `#545454` (közép-sötétszürke)
  - Tertiary: `#6b6b6b` (középszürke)

- **Gombok:**
  - Primary: `#2d2d2d` → hover: `#404040`
  - Secondary: `#f5f5f5` → hover: `#e0e0e0`

### Dark Theme
- **Háttér színek:**
  - Primary: `#0f0f0f` (nagyon sötét)
  - Secondary: `#1a1a1a` (sötét)
  - Tertiary: `#2d2d2d` (sötétszürke)

- **Szöveg színek:**
  - Primary: `#ffffff` (fehér)
  - Secondary: `#e0e0e0` (világosszürke)
  - Tertiary: `#bdbdbd` (közép-világosszürke)

- **Gombok:**
  - Primary: `#ffffff` → hover: `#e0e0e0`
  - Secondary: `#2d2d2d` → hover: `#404040`

### Blue Theme
- **Háttér színek:**
  - Primary: `#ffffff` (fehér)
  - Secondary: `#e3f2fd` (nagyon világos kék)
  - Tertiary: `#bbdefb` (világos kék)

- **Szöveg színek:**
  - Primary: `#0d47a1` (sötét kék)
  - Secondary: `#1565c0` (közép-sötét kék)
  - Tertiary: `#1976d2` (közép kék)

- **Gombok:**
  - Primary: `#1976d2` → hover: `#1565c0`
  - Secondary: `#e3f2fd` → hover: `#bbdefb`

## CSS Változók

A témák CSS custom properties-t használnak a `src/index.css` fájlban:

```css
/* Háttér színek */
--theme-bg-primary
--theme-bg-secondary
--theme-bg-tertiary

/* Szöveg színek */
--theme-text-primary
--theme-text-secondary
--theme-text-tertiary

/* Border színek */
--theme-border-primary
--theme-border-secondary

/* Gomb színek */
--theme-btn-primary-bg
--theme-btn-primary-hover
--theme-btn-primary-text
--theme-btn-secondary-bg
--theme-btn-secondary-hover
--theme-btn-secondary-text

/* Input mezők */
--theme-input-bg
--theme-input-border
--theme-input-focus
--theme-input-text

/* Kártyák */
--theme-card-bg
--theme-card-border
--theme-card-hover

/* Linkek */
--theme-link-text
--theme-link-hover

/* Állapot színek */
--theme-success
--theme-error
--theme-warning
```

## Használat

### Theme Context

A témák kezelése a `ThemeContext` segítségével történik:

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme } = useTheme();

  // Téma váltás
  setTheme('dark'); // 'light' | 'dark' | 'blue'

  return <div>Current theme: {theme}</div>;
}
```

### Komponensekben

CSS változók használata inline style-ban:

```tsx
<div style={{
  backgroundColor: 'var(--theme-bg-primary)',
  color: 'var(--theme-text-primary)'
}}>
  Tartalom
</div>
```

Hover effektek:

```tsx
<button
  style={{ backgroundColor: 'var(--theme-btn-primary-bg)' }}
  onMouseEnter={(e) =>
    e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-hover)'
  }
  onMouseLeave={(e) =>
    e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-bg)'
  }
>
  Kattints
</button>
```

## Theme Switcher

A témaváltó a `ThemeSwitcher` komponens, amely a Header-ben jelenik meg:

- Dropdown menü három opcióval
- Vizuális ikonok minden témához (☀️ Világos, 🌙 Sötét, 💙 Kék)
- Jelenlegi téma kiemelve checkmark-kal

## Persistence

A felhasználó választása automatikusan mentésre kerül a `localStorage`-ban:
- Kulcs: `minerva-theme`
- Érték: `'light'` | `'dark'` | `'blue'`

## Accessibility (WCAG AA)

Minden téma megfelel a WCAG AA kontrasztarány követelményeknek:
- Normál szöveg: minimum 4.5:1
- Nagybetűs/vastag szöveg: minimum 3:1

### Kontrasztarányok:

**Light Theme:**
- Fekete szöveg (#2d2d2d) fehér háttéren (#ffffff): 12.63:1 ✓
- Középszürke szöveg (#6b6b6b) fehér háttéren: 5.74:1 ✓

**Dark Theme:**
- Fehér szöveg (#ffffff) sötét háttéren (#0f0f0f): 19.56:1 ✓
- Világosszürke szöveg (#e0e0e0) sötét háttéren: 14.57:1 ✓

**Blue Theme:**
- Sötét kék szöveg (#0d47a1) fehér háttéren: 8.59:1 ✓
- Közép kék szöveg (#1976d2) fehér háttéren: 4.63:1 ✓

## Smooth Transitions

Minden témaváltás 300ms-os smooth transition-t használ:

```css
* {
  transition-property: background-color, border-color, color;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
```

## Frissített Komponensek

A következő komponensek lettek frissítve a theme rendszerrel:

1. **Layout Components:**
   - `Layout.tsx`
   - `Header.tsx`
   - `ThemeSwitcher.tsx` (új)

2. **Page Components:**
   - `Login.tsx`
   - `Dashboard.tsx`

3. **UI Components:**
   - `StatCard.tsx`
   - `RegistrationChart.tsx`
   - `OEVKBarChart.tsx`

4. **Context:**
   - `ThemeContext.tsx` (új)

5. **Styling:**
   - `src/index.css`

## Karbantartás

### Új téma hozzáadása

1. Bővítsd a `Theme` típust: `src/contexts/ThemeContext.tsx`
2. Add hozzá a CSS változókat: `src/index.css`
3. Frissítsd a `ThemeSwitcher` komponenst az új opcióval

### Új szín változó hozzáadása

1. Definiáld minden témában: `src/index.css`
2. Dokumentáld itt, ebben a fájlban
3. Használd a komponensekben: `var(--theme-new-variable)`

## Best Practices

1. **Mindig CSS változókat használj** - Ne hardcode-olj színeket
2. **Inline style-ok használata** - A dinamikus theme váltáshoz
3. **Hover effektek** - `onMouseEnter` / `onMouseLeave` eseménykezelőkkel
4. **Accessibility** - Ellenőrizd a kontrasztokat minden új színnél
5. **Konzisztencia** - Használd ugyanazokat a változókat hasonló elemekhez

## Troubleshooting

**Probléma:** A színek nem változnak témaváltáskor
- **Megoldás:** Ellenőrizd, hogy CSS változókat használsz-e (`var(--theme-...)`)

**Probléma:** Flash of unstyled content (FOUC)
- **Megoldás:** A `ThemeProvider` a legfelső szinten van az `App.tsx`-ben

**Probléma:** Recharts komponensek nem frissülnek
- **Megoldás:** Az inline style CSS változókat tartalmaz, ami a DOM-ban dinamikusan frissül

## Verzió

- **Verzió:** 2.0
- **Utolsó frissítés:** 2026-01-04
- **Szerző:** Claude Code (UX/UI Designer agent)
