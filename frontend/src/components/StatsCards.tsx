import { 
  BugAntIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { getSeverityColor, getSeverityLabel } from '../lib/utils'

interface StatsCardsProps {
  stats: {
    totalVulnerabilities: number
    vulnerabilitiesByStatus: Array<{ status: string; _count: { status: number } }>
    vulnerabilitiesBySeverity: Array<{ cvssScore: number; _count: { cvssScore: number } }>
  } | undefined
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const getStatusCount = (status: string) => {
    return stats?.vulnerabilitiesByStatus?.find(s => s.status === status)?._count?.status || 0
  }

  const getSeverityCount = (minScore: number, maxScore: number = 10) => {
    return stats?.vulnerabilitiesBySeverity?.filter(s => 
      s.cvssScore >= minScore && s.cvssScore < maxScore
    ).reduce((sum, s) => sum + s._count.cvssScore, 0) || 0
  }

  const cards = [
    {
      name: 'Total Reports',
      value: stats?.totalVulnerabilities || 0,
      icon: BugAntIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Verified',
      value: getStatusCount('VERIFIED'),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Fixed',
      value: getStatusCount('FIXED'),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'High Severity',
      value: getSeverityCount(7),
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.name} className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
