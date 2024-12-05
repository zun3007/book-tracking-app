import { LucideIcon } from 'lucide-react';

export interface IconMapping {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface FeatureIcon extends IconMapping {
  description: string;
}

export interface StatIcon extends IconMapping {
  value: number;
  trend?: number;
}
