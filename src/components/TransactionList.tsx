import { Entry, AdExpense, StructureCost, STRUCTURE_TYPES } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Trash2, DollarSign, TrendingDown, Settings, Calendar, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  entries: Entry[];
  adExpenses: AdExpense[];
  structureCosts: StructureCost[];
  onRemoveEntry: (id: string) => void;
  onRemoveAdExpense: (id: string) => void;
  onRemoveStructureCost: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export const TransactionList = ({
  entries,
  adExpenses,
  structureCosts,
  onRemoveEntry,
  onRemoveAdExpense,
  onRemoveStructureCost,
}: TransactionListProps) => {
  const allTransactions = [
    ...entries.map((e) => ({ ...e, txType: 'entry' as const })),
    ...adExpenses.map((e) => ({ ...e, txType: 'ad' as const })),
    ...structureCosts.map((c) => ({ ...c, txType: 'structure' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Nenhuma transação neste mês</p>
        <p className="text-sm text-muted-foreground mt-1">
          Clique em "Nova Transação" para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allTransactions.map((transaction) => {
        if (transaction.txType === 'entry') {
          const entry = transaction as Entry & { txType: 'entry' };
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20 animate-fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{entry.origin}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(entry.date)}
                    {entry.observation && (
                      <span className="ml-2">• {entry.observation}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-success">
                  +{formatCurrency(entry.value)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveEntry(entry.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        }

        if (transaction.txType === 'ad') {
          const ad = transaction as AdExpense & { txType: 'ad' };
          return (
            <div
              key={ad.id}
              className="flex items-center justify-between p-4 rounded-xl bg-warning/5 border border-warning/20 animate-fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TrendingDown className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{ad.platform}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(ad.date)}
                    {ad.observation && (
                      <span className="ml-2">• {ad.observation}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-warning">
                  -{formatCurrency(ad.value)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveAdExpense(ad.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        }

        const structure = transaction as StructureCost & { txType: 'structure' };
        const typeLabel = STRUCTURE_TYPES.find((t) => t.value === structure.category)?.label || structure.category;

        return (
          <div
            key={structure.id}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{typeLabel}</p>
                  {structure.isRecurring && (
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <RefreshCw className="w-3 h-3" />
                      Recorrente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(structure.date)}
                  {structure.observation && (
                    <span className="ml-2">• {structure.observation}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground">
                -{formatCurrency(structure.value)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveStructureCost(structure.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
