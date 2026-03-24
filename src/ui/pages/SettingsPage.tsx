import { useState, useEffect } from 'react';
import { SPORT_CATEGORIES } from '../../domain/config/competitions';

const API_KEY_STORAGE_KEY = 'sport-tracker-api-key';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const hasKey = apiKey.trim().length > 0;

  function handleSave() {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* API Configuration */}
        <section className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">API Configuration</h2>

          <div className="space-y-1">
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
              API-SPORTS Key
            </label>
            <div className="flex gap-2">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm ${hasKey ? 'text-green-600' : 'text-amber-600'}`}>
              {hasKey ? 'Key configured ✓' : 'No key set'}
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
            >
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Get your free API key at{' '}
            <a
              href="https://api-sports.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              api-sports.io
            </a>
          </p>
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
          <p className="text-xs text-gray-500">Version 1.0.0</p>
          <a
            href="https://github.com/AlejandroEsquivel/sport-tracker-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-blue-600 underline"
          >
            GitHub Repository
          </a>
        </section>
      </div>
    </div>
  );
}
