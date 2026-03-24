import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SPORT_CATEGORIES } from '../../domain/config/competitions';
import type { CompetitionCategory } from '../../domain/models';

function CategoryCard({ category }: { category: CompetitionCategory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 active:bg-gray-100"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={category.label}>
            {category.icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{category.label}</h2>
            <p className="text-sm text-gray-500">
              {category.competitions.length}{' '}
              {category.competitions.length === 1 ? 'competition' : 'competitions'}
            </p>
          </div>
        </div>
        <span
          className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>

      {expanded && (
        <ul className="border-t border-gray-100" role="list">
          {category.competitions.map(comp => (
            <li key={comp.id}>
              <Link
                to={`/sports/${comp.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 active:bg-blue-100"
              >
                <span>{comp.name}</span>
                <span className="text-gray-300">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Sports</h1>
        {SPORT_CATEGORIES.map(cat => (
          <CategoryCard key={cat.sport} category={cat} />
        ))}
      </div>
    </div>
  );
}
