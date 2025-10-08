import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { formatDate, getSeverityColor, getSeverityLabel, getStatusColor, getStatusLabel } from '../lib/utils'
import { 
  UserIcon, 
  CalendarIcon, 
  BugAntIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile')
      return response.data.user
    },
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/users/stats')
      return response.data
    },
  })

  if (profileLoading || statsLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your account information and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
            </div>
            <div className="card-content">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900">{profile?.name}</h4>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{profile?.role?.toLowerCase()}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Joined {formatDate(profile?.createdAt)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BugAntIcon className="h-4 w-4 mr-2" />
                  {profile?._count?.vulnerabilities || 0} vulnerability reports
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {profile?._count?.comments || 0} comments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Statistics Overview</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.totalVulnerabilities || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.vulnerabilitiesByStatus?.find(s => s.status === 'VERIFIED')?._count?.status || 0}
                  </div>
                  <div className="text-sm text-gray-500">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.vulnerabilitiesByStatus?.find(s => s.status === 'FIXED')?._count?.status || 0}
                  </div>
                  <div className="text-sm text-gray-500">Fixed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.vulnerabilitiesBySeverity?.filter(s => s.cvssScore >= 7).reduce((sum, s) => sum + s._count.cvssScore, 0) || 0}
                  </div>
                  <div className="text-sm text-gray-500">High Severity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Reports by Severity</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {[
                  { label: 'Critical (9.0+)', min: 9, max: 10, color: 'text-red-600' },
                  { label: 'High (7.0-8.9)', min: 7, max: 8.9, color: 'text-orange-600' },
                  { label: 'Medium (4.0-6.9)', min: 4, max: 6.9, color: 'text-yellow-600' },
                  { label: 'Low (0.0-3.9)', min: 0, max: 3.9, color: 'text-green-600' },
                ].map(({ label, min, max, color }) => {
                  const count = stats?.vulnerabilitiesBySeverity?.filter(s => 
                    s.cvssScore >= min && s.cvssScore <= max
                  ).reduce((sum, s) => sum + s._count.cvssScore, 0) || 0
                  
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <span className={`text-sm font-medium ${color}`}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
            </div>
            <div className="card-content">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((vuln: any) => (
                    <div key={vuln.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {vuln.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your recent vulnerability reports will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
