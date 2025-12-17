import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, MousePointer, Clock } from 'lucide-react';

export default function AnalyticsDashboard({ projectId }) {
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState({
    totalViews: 0,
    totalVisitors: 0,
    avgBounceRate: 0,
    avgDuration: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [projectId]);

  const loadAnalytics = async () => {
    const data = await base44.entities.Analytics.filter({ project_id: projectId }, '-date', 30);
    
    // Если нет данных, генерируем демо-данные
    if (data.length === 0) {
      const demoData = generateDemoData();
      setAnalytics(demoData);
      calculateSummary(demoData);
    } else {
      setAnalytics(data);
      calculateSummary(data);
    }
  };

  const generateDemoData = () => {
    const days = 7;
    const demo = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      demo.push({
        date: date.toISOString().split('T')[0],
        page_views: Math.floor(Math.random() * 500) + 100,
        unique_visitors: Math.floor(Math.random() * 300) + 50,
        bounce_rate: Math.floor(Math.random() * 40) + 20,
        avg_session_duration: Math.floor(Math.random() * 180) + 60,
        traffic_sources: {
          direct: Math.floor(Math.random() * 100),
          search: Math.floor(Math.random() * 100),
          social: Math.floor(Math.random() * 100),
          referral: Math.floor(Math.random() * 100)
        }
      });
    }
    return demo;
  };

  const calculateSummary = (data) => {
    const total = data.reduce((acc, day) => ({
      totalViews: acc.totalViews + (day.page_views || 0),
      totalVisitors: acc.totalVisitors + (day.unique_visitors || 0),
      totalBounce: acc.totalBounce + (day.bounce_rate || 0),
      totalDuration: acc.totalDuration + (day.avg_session_duration || 0)
    }), { totalViews: 0, totalVisitors: 0, totalBounce: 0, totalDuration: 0 });

    setSummary({
      totalViews: total.totalViews,
      totalVisitors: total.totalVisitors,
      avgBounceRate: data.length > 0 ? Math.round(total.totalBounce / data.length) : 0,
      avgDuration: data.length > 0 ? Math.round(total.totalDuration / data.length) : 0
    });
  };

  const trafficSourceData = analytics.length > 0 ? [
    { name: 'Прямые', value: analytics[0].traffic_sources?.direct || 0, color: '#3b82f6' },
    { name: 'Поиск', value: analytics[0].traffic_sources?.search || 0, color: '#10b981' },
    { name: 'Соцсети', value: analytics[0].traffic_sources?.social || 0, color: '#f59e0b' },
    { name: 'Ссылки', value: analytics[0].traffic_sources?.referral || 0, color: '#ef4444' }
  ] : [];

  const chartData = analytics.map(day => ({
    date: new Date(day.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    views: day.page_views,
    visitors: day.unique_visitors
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <TrendingUp className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">Аналитика</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-400">Просмотры</span>
              </div>
              <div className="text-xl font-bold text-white">{summary.totalViews.toLocaleString()}</div>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-400">Посетители</span>
              </div>
              <div className="text-xl font-bold text-white">{summary.totalVisitors.toLocaleString()}</div>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-400">Отказы</span>
              </div>
              <div className="text-xl font-bold text-white">{summary.avgBounceRate}%</div>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-400">Время</span>
              </div>
              <div className="text-xl font-bold text-white">{Math.floor(summary.avgDuration / 60)}м {summary.avgDuration % 60}с</div>
            </div>
          </div>

          {/* Views Chart */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="text-sm text-white mb-3">Просмотры за неделю</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
            <div className="text-sm text-white mb-3">Источники трафика</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {trafficSourceData.map((source) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: source.color }} />
                  <span className="text-xs text-gray-400">{source.name}: {source.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}