import { useState } from 'react';
import { Target, Pencil, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonthKey } from '@/types/finance';

interface MonthlyGoalBarProps {
  month: MonthKey;
  adjustedGoal: number;
  actualProfit: number;
  remaining: number;
  exceeded: number;
  percentage: number;
  isAchieved: boolean;
  carryOver: number;
  onUpdateGoal: (month: MonthKey, value: number) => void;
  baseGoal: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const MonthlyGoalBar = ({
  month,
  adjustedGoal,
  actualProfit,
  remaining,
  exceeded,
  percentage,
  isAchieved,
  carryOver,
  onUpdateGoal,
  baseGoal,
}: MonthlyGoalBarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(baseGoal.toString());

  const handleSave = () => {
    const value = parseFloat(editValue.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(value) && value >= 0) {
      onUpdateGoal(month, value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(baseGoal.toString());
    setIsEditing(false);
  };

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Meta Mensal de Lucro</h3>
        </div>
        <div className="flex items-center gap-3">
          {isAchieved ? (
            <span className="text-success font-semibold">
              +{formatCurrency(exceeded)} excedente
            </span>
          ) : (
            <span className="text-destructive font-semibold">
              -{formatCurrency(remaining)} ({(100 - percentage).toFixed(0)}%) restantes
            </span>
          )}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>Meta atingida:</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-28 h-7 text-sm"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
                  <Check className="w-4 h-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{formatCurrency(adjustedGoal)}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={percentage} 
            className={`h-3 ${isAchieved ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>0%</span>
            <span className="ml-4">Meta: {formatCurrency(adjustedGoal)}</span>
            {carryOver !== 0 && (
              <span className={carryOver > 0 ? 'text-destructive' : 'text-success'}>
                ({carryOver > 0 ? '+' : ''}{formatCurrency(carryOver)} ajuste)
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>{percentage.toFixed(0)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
