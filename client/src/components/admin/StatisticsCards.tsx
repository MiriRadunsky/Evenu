import { Users, CheckCircle, Clock, Calendar } from 'lucide-react';

interface StatisticsCardsProps {
  pendingSuppliers: number;
  activeSuppliers: number;
  totalUsers: number;
  activeEvents: number;
}

export function StatisticsCards({ 
  pendingSuppliers, 
  activeSuppliers, 
  totalUsers, 
  activeEvents 
}: StatisticsCardsProps) {
  const stats = [
    {
      title: 'ספקים ממתינים',
      value: pendingSuppliers,
      icon: Clock,
      color: 'text-[#d4a960]',
      bgColor: 'bg-[#faf8f3]',
      borderColor: 'border-[#d4a960]/30'
    },
    {
      title: 'ספקים פעילים',
      value: activeSuppliers,
      icon: CheckCircle,
      color: 'text-[#b8935a]',
      bgColor: 'bg-[#f5f3ed]',
      borderColor: 'border-[#b8935a]/30'
    },
    {
      title: 'סך משתמשים',
      value: totalUsers,
      icon: Users,
      color: 'text-[#c9a55f]',
      bgColor: 'bg-[#f8f6f0]',
      borderColor: 'border-[#c9a55f]/30'
    },
    {
      title: 'אירועים פעילים',
      value: activeEvents,
      icon: Calendar,
      color: 'text-[#dbb76d]',
      bgColor: 'bg-[#fcfaf6]',
      borderColor: 'border-[#dbb76d]/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-light mb-2">{stat.title}</p>
                <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
