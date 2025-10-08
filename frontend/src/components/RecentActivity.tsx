import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { formatRelativeTime } from '../lib/utils'
import { 
  BugAntIcon, 
  ChatBubbleLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

export const RecentActivity: React.FC = () => {
  const { data: vulnerabilities, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await api.get('/vulnerabilities?limit=10&sortBy=updatedAt&sortOrder=desc')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        </div>
      </div>
    )
  }

  const activities = vulnerabilities?.vulnerabilities?.slice(0, 5) || []

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return CheckCircleIcon
      case 'FIXED':
        return CheckCircleIcon
      case 'REPORTED':
        return ExclamationTriangleIcon
      default:
        return BugAntIcon
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-blue-600'
      case 'FIXED':
        return 'text-green-600'
      case 'REPORTED':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500">Latest updates on vulnerability reports</p>
      </div>
      <div className="card-content">
        {activities.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((vuln: any, index: number) => {
                const Icon = getActivityIcon(vuln.status)
                const color = getActivityColor(vuln.status)
                
                return (
                  <li key={vuln.id}>
                    <div className="relative pb-8">
                      {index !== activities.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{vuln.title}</span>
                              {' '}status updated to{' '}
                              <span className="font-medium">{vuln.status.toLowerCase()}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={vuln.updatedAt}>
                              {formatRelativeTime(vuln.updatedAt)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as reports are updated.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
