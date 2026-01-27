import { motion } from 'framer-motion';
import { Crown, Target as TargetIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    ? Math.min((currentProfit / recordProfit) * 100, 100) 
    : 0;
  const amountToRecord = Math.max(recordProfit - currentProfit, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="stat-card overflow-hidden border-2 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Crown className="w-5 h-5 text-warning" />
              Desafio do Recorde
            </CardTitle>
            <TargetIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current vs Record - Side by Side */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                LUCRO HOJE
              </p>
              <p className={`text-2xl font-bold ${currentProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(currentProfit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                MELHOR DIA
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(recordProfit)}
              </p>
              {recordDate && (
                <p className="text-xs text-muted-foreground">{recordDate}</p>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Progresso para o recorde
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isNewRecord 
                    ? "bg-gradient-to-r from-success to-primary" 
                    : "bg-success"
                }`}
              />
            </div>
          </div>

          {/* Amount to Record */}
          <div className="bg-secondary/50 rounded-lg p-3 border border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TargetIcon className="w-4 h-4 text-muted-foreground/70" />
              <span>
                {isNewRecord ? (
                  <span className="text-success font-semibold">🎉 Novo recorde alcançado!</span>
                ) : (
                  <>
                    Faltam <span className="font-bold text-foreground">{formatCurrency(amountToRecord)}</span> para bater o recorde
                  </>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
