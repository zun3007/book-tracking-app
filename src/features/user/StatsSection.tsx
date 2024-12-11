import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { statIcons, interactiveIcons } from '../../config/icons';
import StatCard from '../../components/StatCard';
import { UserStats } from '../../types/stats';

interface StatsSectionProps {
  stats: UserStats | null;
  isLoading: boolean;
}

const COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#6366F1',
];

export default function StatsSection({ stats, isLoading }: StatsSectionProps) {
  return (
    <section className='py-24 bg-slate-50 dark:bg-slate-800/50'>
      <div className='container mx-auto p-4 pb-4 pt-16'>
        <div className='text-center mb-20'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='space-y-6'
          >
            <h2 className='text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight'>
              Your Reading Statistics
            </h2>
            <p className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
              Track your progress and see how your reading journey evolves
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
              >
                <div className='h-14 w-14 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-6' />
                <div className='h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4' />
                <div className='h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg' />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
              {Object.entries(statIcons).map(([key, stat], index) => {
                const statKey = key as keyof UserStats;
                const colors = {
                  totalBooks: 'blue',
                  reading: 'green',
                  completed: 'purple',
                  favorites: 'red',
                } as const;
                const color = colors[key as keyof typeof colors];

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StatCard
                      title={stat.name}
                      value={stats?.[statKey] || 0}
                      icon={stat.icon}
                      color={color}
                      trend={stat.trend}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Reading Progress Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
              >
                <h3 className='text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-8'>
                  Monthly Reading Progress
                </h3>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={stats?.monthly_progress || []}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                      <XAxis
                        dataKey='month'
                        stroke='#64748B'
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#CBD5E1' }}
                      />
                      <YAxis
                        stroke='#64748B'
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#CBD5E1' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '1rem',
                          border: 'none',
                          boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Bar
                        dataKey='books_read'
                        fill='url(#colorGradient)'
                        radius={[6, 6, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id='colorGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='0%'
                            stopColor='#3B82F6'
                            stopOpacity={1}
                          />
                          <stop
                            offset='100%'
                            stopColor='#60A5FA'
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Genre Distribution Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
              >
                <h3 className='text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-8'>
                  Genre Distribution
                </h3>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          stats?.genres_distribution || {}
                        ).map(([name, value]) => ({
                          name,
                          value,
                        }))}
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey='value'
                      >
                        {Object.entries(stats?.genres_distribution || {}).map(
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '1rem',
                          border: 'none',
                          boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Genre Legend */}
                <div className='grid grid-cols-2 gap-4 mt-8'>
                  {Object.entries(stats?.genres_distribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([genre, count], index) => (
                      <div key={genre} className='flex items-center gap-3'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className='text-sm text-slate-600 dark:text-slate-300 truncate'>
                          {genre}
                        </span>
                        <span className='text-sm text-slate-400 dark:text-slate-500 ml-auto'>
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </motion.div>
            </div>

            {/* Reading Streak Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='mt-8 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2'>
                    Reading Streak
                  </h3>
                  <p className='text-slate-600 dark:text-slate-300'>
                    You've been reading consistently for{' '}
                    <span className='font-semibold text-blue-600 dark:text-blue-400'>
                      {stats?.reading_streak || 0} months
                    </span>
                  </p>
                </div>
                <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center'>
                  <interactiveIcons.streak className='w-8 h-8 text-blue-500 dark:text-blue-400' />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
