import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecordChallengeCardProps {
  currentProfit: number;
  recordProfit: number;
  recordDate?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const RecordChallengeCard = ({ 
  currentProfit, 
  recordProfit, 
  recordDate 
}: RecordChallengeCardProps) => {
  const isNewRecord = currentProfit > recordProfit && currentProfit > 0;
  const progressPercentage = recordProfit > 0 
    ? Math.min((currentProfit / recordProfit) * 100, 150) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={cn(
        "stat-card overflow-hidden",
        isNewRecord && "border-primary bg-primary/5"
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className={cn(
              "w-5 h-5",
              isNewRecord ? "text-primary fill-primary/20" : "text-muted-foreground"
            )} />
            Desafio do Recorde
            {isNewRecord && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current vs Record */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lucro Atual</p>
              <p className={cn(
                "text-xl font-bold",
                currentProfit >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(currentProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Recorde Histórico</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(recordProfit)}
              </p>
              {recordDate && (
                <p className="text-xs text-muted-foreground">{recordDate}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso até o recorde</span>
              <span className={cn(
                "font-semibold",
                isNewRecord ? "text-primary" : "text-muted-foreground"
              )}>
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  isNewRecord 
                    ? "bg-gradient-to-r from-primary to-warning" 
                    : "bg-primary"
                )}
              />
            </div>
          </div>

          {/* Insights Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-primary" />
              <span>Ritmo</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="w-3 h-3 text-success" />
              <span>Precisão</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-chart-structure" />
              <span>Clareza</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
