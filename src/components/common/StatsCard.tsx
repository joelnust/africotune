import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = '',
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-namsa text-primary-foreground';
      case 'success':
        return 'bg-namsa-success text-white';
      case 'warning':
        return 'bg-namsa-warning text-white';
      case 'error':
        return 'bg-namsa-error text-white';
      default:
        return 'bg-card text-card-foreground';
    }
  };

  return (
    <Card className={`stats-card ${getVariantClasses()} ${className} shadow-card hover:shadow-elegant transition-all duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${variant === 'default' ? 'text-muted-foreground' : 'text-current opacity-90'}`}>
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={`h-5 w-5 ${variant === 'default' ? 'text-muted-foreground' : 'text-current opacity-90'}`} />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-3xl font-bold animate-fade-in">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {description && (
            <p className={`text-sm ${variant === 'default' ? 'text-muted-foreground' : 'text-current opacity-80'}`}>
              {description}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center space-x-2">
              <Badge 
                variant={trend.isPositive ? 'default' : 'destructive'}
                className={`text-xs ${
                  trend.isPositive 
                    ? 'bg-namsa-success text-white' 
                    : 'bg-namsa-error text-white'
                } animate-pulse-glow`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Badge>
              <span className={`text-xs ${variant === 'default' ? 'text-muted-foreground' : 'text-current opacity-80'}`}>
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;