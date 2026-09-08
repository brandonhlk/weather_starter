import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "weather-starter-theme";
const APPLE_THEME = "apple";
const OBSERVATORY_THEME = "observatory";
const COASTAL_THEME = "coastal";
const STORM_THEME = "storm";
const ALPINE_THEME = "alpine";
const SOLAR_THEME = "solar";
const RAINROOM_THEME = "rainroom";
const CITY_THEME = "city";
const ALMANAC_THEME = "almanac";
const FRESH_THEME = "fresh";
const RADAR_THEME = "radar";
const PAPER_THEME = "paper";
const MONSOON_THEME = "monsoon";
const FROSTLINE_THEME = "frostline";
const SUNSET_THEME = "sunset";
const CONTROL_THEME = "control";
const GARDEN_THEME = "garden";

export function ThemeSelector() {
  const [theme, setTheme] = useState(APPLE_THEME);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (
      savedTheme === APPLE_THEME ||
      savedTheme === OBSERVATORY_THEME ||
      savedTheme === COASTAL_THEME ||
      savedTheme === STORM_THEME ||
      savedTheme === ALPINE_THEME ||
      savedTheme === SOLAR_THEME ||
      savedTheme === RAINROOM_THEME ||
      savedTheme === CITY_THEME ||
      savedTheme === ALMANAC_THEME ||
      savedTheme === FRESH_THEME ||
      savedTheme === RADAR_THEME ||
      savedTheme === PAPER_THEME ||
      savedTheme === MONSOON_THEME ||
      savedTheme === FROSTLINE_THEME ||
      savedTheme === SUNSET_THEME ||
      savedTheme === CONTROL_THEME ||
      savedTheme === GARDEN_THEME
    ) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <label className="pointer-events-auto fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65 shadow-lg backdrop-blur-xl">
      <span>Theme</span>
      <select
        aria-label="Theme"
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-semibold normal-case tracking-normal text-white outline-none"
      >
        <option value={APPLE_THEME}>Apple</option>
        <option value={OBSERVATORY_THEME}>Atmospheric Observatory</option>
        <option value={COASTAL_THEME}>Coastal Morning</option>
        <option value={STORM_THEME}>Storm Watch</option>
        <option value={ALPINE_THEME}>Alpine Field Notes</option>
        <option value={SOLAR_THEME}>Solar Noon</option>
        <option value={RAINROOM_THEME}>Rainroom</option>
        <option value={CITY_THEME}>City Forecast Terminal</option>
        <option value={ALMANAC_THEME}>Weather Almanac</option>
        <option value={FRESH_THEME}>Fresh Air</option>
        <option value={RADAR_THEME}>Radar Grid</option>
        <option value={PAPER_THEME}>Paper Sky</option>
        <option value={MONSOON_THEME}>Monsoon Atlas</option>
        <option value={FROSTLINE_THEME}>Frostline</option>
        <option value={SUNSET_THEME}>Sunset Service</option>
        <option value={CONTROL_THEME}>Climate Control Room</option>
        <option value={GARDEN_THEME}>Garden Weather</option>
      </select>
    </label>
  );
}
