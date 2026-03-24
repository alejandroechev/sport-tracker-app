import { useParams } from 'react-router-dom';

export default function CompetitionPage() {
  const { competitionId } = useParams<{ competitionId: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900">Competition</h1>
      <p className="mt-2 text-gray-600">ID: {competitionId}</p>
    </div>
  );
}
