import {
  // Main Navigation
  Library,
  BookMarked,

  // Stats & Metrics
  BookOpen,
  CheckCircle,
  Heart,

  // Features
  Bookmark,
  Sparkles,
  Users,

  // Interactive Elements
  ThumbsUp,
  ThumbsDown,
  Star,
  ArrowRight,

  // Indicators
  Flame,
} from 'lucide-react';
import { IconMapping, FeatureIcon, StatIcon } from '../types/icons';

export const navigationIcons: Record<string, IconMapping> = {
  library: {
    name: 'Browse Library',
    icon: Library,
    color: 'text-blue-500',
    bgColor: 'bg-white',
  },
  readingList: {
    name: 'Reading List',
    icon: BookMarked,
    color: 'text-white',
    bgColor: 'bg-blue-500',
  },
};

export const statIcons: Record<string, StatIcon> = {
  totalBooks: {
    name: 'Total Books',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    value: 0,
    trend: 10,
  },
  reading: {
    name: 'Currently Reading',
    icon: BookMarked,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    value: 0,
    trend: 5,
  },
  completed: {
    name: 'Completed',
    icon: CheckCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    value: 0,
    trend: 15,
  },
  favorites: {
    name: 'Favorites',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    value: 0,
    trend: 8,
  },
};

export const featureIcons: Record<string, FeatureIcon> = {
  tracking: {
    name: 'Track Your Progress',
    icon: Bookmark,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    description:
      'Keep track of your reading journey with detailed statistics and insights.',
  },
  recommendations: {
    name: 'Smart Recommendations',
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    description:
      'Get personalized book recommendations based on your reading history.',
  },
  community: {
    name: 'Join Book Clubs',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    description:
      'Connect with fellow readers, join discussions, and share your thoughts.',
  },
};

export const interactiveIcons = {
  like: ThumbsUp,
  dislike: ThumbsDown,
  rating: Star,
  arrow: ArrowRight,
  streak: Flame,
};
