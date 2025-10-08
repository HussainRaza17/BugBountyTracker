import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { VulnerabilityCard } from '../components/VulnerabilityCard'
import { StatsCards } from '../components/StatsCards'
import { RecentActivity } from '../components/RecentActivity'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/users/stats')
      return response.data
    },
  })

  const { data: vulnerabilities, isLoading: vulnsLoading } = useQuery({
    queryKey: ['recent-vulnerabilities'],
    queryFn: async () => {
      const response = await api.get('/vulnerabilities?limit=5&sortBy=createdAt&sortOrder=desc')
      return response.data
    },
  })

  if (statsLoading || vulnsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your bug bounty reports.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/vulnerabilities/new"
            className="btn btn-primary btn-md"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Report
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Vulnerabilities */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
            <p className="text-sm text-gray-500">Your latest vulnerability submissions</p>
          </div>
          <div className="card-content">
            {vulnerabilities?.vulnerabilities?.length > 0 ? (
              <div className="space-y-4">
                {vulnerabilities.vulnerabilities.map((vuln: any) => (
                  <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
                ))}
                <div className="text-center">
                  <Link
                    to="/vulnerabilities"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all reports →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No reports yet</p>
                <Link
                  to="/vulnerabilities/new"
                  className="mt-2 text-primary-600 hover:text-primary-500 text-sm"
                >
                  Create your first report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  )
}
