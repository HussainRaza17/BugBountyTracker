import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import StatsCards from '../components/StatsCards';
import RecentActivity from '../components/RecentActivity';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/vulnerabilities/analytics/overview').then(res => res.data)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Error loading dashboard data.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Security Overview</h1>
          <p className="text-gray-500 mt-1">Track and manage your reported vulnerabilities and platform analytics.</p>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <StatsCards stats={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Recent Reports</h2>
          </div>
          <RecentActivity vulnerabilities={data?.recentVulnerabilities} />
        </div>

        {/* Sidebar Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Severity Distribution</h2>
            <div className="space-y-3">
              {data?.vulnerabilitiesBySeverity?.map((sev: any) => (
                <div key={sev.cvssScore} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">CVSS {sev.cvssScore.toFixed(1)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold">
                    {sev._count.cvssScore}
                  </span>
                </div>
              ))}
              {(!data?.vulnerabilitiesBySeverity || data.vulnerabilitiesBySeverity.length === 0) && (
                <p className="text-gray-400 text-sm italic">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;