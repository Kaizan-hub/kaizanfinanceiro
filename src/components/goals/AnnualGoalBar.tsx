import { useState } from 'react';
import { Target, Pencil, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AnnualGoalBarProps {
  totalNetProfit: number;
  annualGoal: number;
  remaining: number;
  exceeded: number;
  percentage: number;
  isAchieved: boolean;
  onUpdateGoal: (value: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const AnnualGoalBar = ({
  totalNetProfit,
  annualGoal,
  remaining,
  exceeded,
  percentage,
  isAchieved,
  onUpdateGoal,
}: AnnualGoalBarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(annualGoal.toString());

  const handleSave = () => {
    const value = parseFloat(editValue.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(value) && value >= 0) {
      onUpdateGoal(value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(annualGoal.toString());
    setIsEditing(false);
  };

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Progresso da Meta Anual</h3>
        </div>
        <div className="flex items-center gap-3">
          {isAchieved ? (
            <span className="text-success font-semibold">
              +{formatCurrency(exceeded)} excedente
            </span>
          ) : (
            <span className="text-foreground font-semibold">
              {formatCurrency(remaining)} ({(100 - percentage).toFixed(0)}%) restantes
            </span>
          )}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>Meta total:</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32 h-7 text-sm"
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
                <span className="font-semibold text-foreground">{formatCurrency(annualGoal)}</span>
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
            className={`h-3 ${isAchieved ? '[&>div]:bg-success' : '[&>div]:bg-success'}`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Gerado: {formatCurrency(totalNetProfit)} | {formatCurrency(annualGoal * 0.1)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-destructive">-{formatCurrency(remaining)}</span>
            <span>| {formatCurrency(annualGoal * 0.1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
