import { motion } from 'framer-motion';
import { featureIcons } from '../../config/icons';

export default function FeaturesSection() {
  return (
    <section className='py-24 bg-white dark:bg-slate-900'>
      <div className='container mx-auto p-4 pt-20'>
        <div className='text-center mb-20'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='space-y-6'
          >
            <h2 className='text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight'>
              Your Personal Reading Companion
            </h2>
            <p className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
              Discover a new way to track, explore, and enjoy your reading
              journey
            </p>
          </motion.div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {Object.values(featureIcons).map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className='relative group'
            >
              <div
                className='bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 shadow-lg hover:shadow-xl 
                transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 
                hover:border-slate-300 dark:hover:border-slate-600'
              >
                <div
                  className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                  dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500'
                />
                <div className='relative space-y-6'>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 
                      transition-transform group-hover:scale-110 ${feature.bgColor}`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3'>
                      {feature.name}
                    </h3>
                    <p className='text-slate-600 dark:text-slate-300 leading-relaxed'>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
