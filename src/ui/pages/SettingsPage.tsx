import { useState, useEffect } from 'react';
import { SPORT_CATEGORIES } from '../../domain/config/competitions';

const STUB_MODE_KEY = 'sport-tracker-use-stub';

export default function SettingsPage() {
  const [useStub, setUseStub] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STUB_MODE_KEY);
    if (stored === 'true') setUseStub(true);
  }, []);

  function handleToggleStub() {
    const newValue = !useStub;
    setUseStub(newValue);
    if (newValue) {
      localStorage.setItem(STUB_MODE_KEY, 'true');
    } else {
      localStorage.removeItem(STUB_MODE_KEY);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Data Source */}
        <section className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Data Source</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {useStub ? 'Using stub data (offline)' : 'Using ESPN live data'}
              </p>
              <p className="text-xs text-gray-500">
                ESPN provides free live data — no API key needed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleStub}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                useStub ? 'bg-amber-500' : 'bg-green-500'
              }`}
              role="switch"
              aria-checked={useStub}
              aria-label="Toggle stub data mode"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  useStub ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {saved && (
            <p className="text-sm text-green-600">Saved ✓ — reload the page to apply.</p>
          )}
        </section>

        {/* Tracked Competitions */}
        <section className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Tracked Competitions</h2>
          {SPORT_CATEGORIES.map((category) => (
            <div key={category.sport}>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {category.icon} {category.label}
              </h3>
              <ul className="space-y-1 ml-6">
                {category.competitions.map((comp) => (
                  <li key={comp.id} className="text-sm text-gray-700">
                    {comp.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">About</h2>
          <p className="text-sm text-gray-700">
            <strong>Sport Tracker</strong> — Track live scores, standings, and upcoming events
            across football, Formula 1, and tennis.
          </p>
          <p className="text-xs text-gray-500">
            Powered by ESPN — free, no API key required.
          </p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
          <a
            href="https://github.com/AlejandroEsquivel/sport-tracker-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 underline min-h-12"
          >
            GitHub Repository
          </a>
        </section>
      </div>
    </div>
  );
}
