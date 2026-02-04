import { 
  BugAntIcon, 
  CheckBadgeIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

const StatsCards = ({ stats }: { stats: any }) => {
  const findCount = (status: string) => 
    stats?.vulnerabilitiesByStatus?.find((s: any) => s.status === status)?._count?.status || 0;

  const cardItems = [
    { label: 'Total Reports', value: stats?.totalVulnerabilities || 0, icon: BugAntIcon, color: 'blue' },
    { label: 'Verified', value: findCount('VERIFIED'), icon: CheckBadgeIcon, color: 'amber' },
    { label: 'Fixed', value: findCount('FIXED'), icon: WrenchScrewdriverIcon, color: 'green' },
    { label: 'Reported', value: findCount('REPORTED'), icon: ShieldCheckIcon, color: 'slate' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardItems.map((item) => (
        <div key={item.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
            <item.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;