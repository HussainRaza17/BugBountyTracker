import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  UsersIcon, 
  BugAntIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { formatDate, getSeverityColor, getSeverityLabel, getStatusColor, getStatusLabel } from '../lib/utils'

export const AdminPage: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get('/vulnerabilities/analytics/overview')
      return response.data
    },
  })

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['admin-leaderboard'],
    queryFn: async () => {
      const response = await api.get('/users/leaderboard')
      return response.data.leaderboard
    },
  })

  if (analyticsLoading || leaderboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all vulnerability reports and researcher performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-100">
                  <BugAntIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Reports
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.totalVulnerabilities || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reported
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.vulnerabilitiesByStatus?.find(s => s.status === 'REPORTED')?._count?.status || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-100">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Verified
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.vulnerabilitiesByStatus?.find(s => s.status === 'VERIFIED')?._count?.status || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-100">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Fixed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.vulnerabilitiesByStatus?.find(s => s.status === 'FIXED')?._count?.status || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Reports */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
            <p className="text-sm text-gray-500">Latest vulnerability submissions</p>
          </div>
          <div className="card-content">
            {analytics?.recentVulnerabilities && analytics.recentVulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentVulnerabilities.map((vuln: any) => (
                  <div key={vuln.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {vuln.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          by {vuln.reporter.name}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`badge ${getStatusColor(vuln.status)}`}>
                            {getStatusLabel(vuln.status)}
                          </span>
                          <span className={`text-xs font-medium ${getSeverityColor(vuln.cvssScore)}`}>
                            {getSeverityLabel(vuln.cvssScore)} ({vuln.cvssScore})
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(vuln.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BugAntIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New vulnerability reports will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Researchers */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Top Researchers</h3>
            <p className="text-sm text-gray-500">Most active researchers</p>
          </div>
          <div className="card-content">
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.slice(0, 5).map((researcher: any, index: number) => (
                  <div key={researcher.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {researcher.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {researcher.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {researcher.vulnerabilityCount} reports
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        Score: {researcher.totalScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No researchers yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Researcher activity will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Severity Distribution</h3>
          <p className="text-sm text-gray-500">Breakdown of vulnerabilities by severity</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Critical', min: 9, max: 10, color: 'text-red-600', bgColor: 'bg-red-100' },
              { label: 'High', min: 7, max: 8.9, color: 'text-orange-600', bgColor: 'bg-orange-100' },
              { label: 'Medium', min: 4, max: 6.9, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
              { label: 'Low', min: 0, max: 3.9, color: 'text-green-600', bgColor: 'bg-green-100' },
            ].map(({ label, min, max, color, bgColor }) => {
              const count = analytics?.vulnerabilitiesBySeverity?.filter(s => 
                s.cvssScore >= min && s.cvssScore <= max
              ).reduce((sum, s) => sum + s._count.cvssScore, 0) || 0
              
              const total = analytics?.totalVulnerabilities || 1
              const percentage = Math.round((count / total) * 100)
              
              return (
                <div key={label} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${color}`}>
                    {label}
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{percentage}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
