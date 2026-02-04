import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = ({ vulnerabilities }: { vulnerabilities: any[] }) => {
  if (!vulnerabilities || vulnerabilities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {vulnerabilities.map((v) => (
          <li key={v.id} className="hover:bg-gray-50 transition-colors">
            <Link to={`/vulnerabilities/${v.id}`} className="block p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{v.title}</span>
                  <span className="text-sm text-gray-500 line-clamp-1">{v.asset}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    v.cvssScore >= 7 ? 'bg-red-100 text-red-700' : 
                    v.cvssScore >= 4 ? 'bg-orange-100 text-orange-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    CVSS {v.cvssScore.toFixed(1)}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;