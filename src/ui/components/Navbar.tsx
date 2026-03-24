import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Live', icon: '🔴' },
  { to: '/sports', label: 'Sports', icon: '📋' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around max-w-lg mx-auto">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
