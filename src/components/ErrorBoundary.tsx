import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { animations } from '../config/animations';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center min-h-screen gap-4 p-4'>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-2xl font-bold text-red-500'
          >
            Something went wrong
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-gray-600 dark:text-gray-400 text-center'
          >
            {this.state.error?.message}
          </motion.p>
          <motion.button
            whileHover={animations.hover}
            whileTap={animations.tap}
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg'
          >
            Refresh Page
          </motion.button>
        </div>
      );
    }

    return this.props.children;
  }
}
