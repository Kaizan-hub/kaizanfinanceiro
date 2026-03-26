import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, DollarSign, TrendingDown, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthKey, PLATFORMS, STRUCTURE_TYPES } from '@/types/finance';

interface TransactionFormProps {
  month: MonthKey;
  onAddEntry: (entry: { date: string; value: number; origin: string; observation?: string }) => void;
  onAddAdExpense: (expense: { date: string; platform: 'Meta Ads' | 'Google Ads' | 'Outros'; value: number; clientsServed: number; observation?: string }) => void;
  onAddStructureCost: (cost: { category: 'ferramentas' | 'assinaturas' | 'plataformas' | 'outros'; date: string; value: number; isRecurring: boolean; observation?: string }) => void;
}

export const TransactionForm = ({
  month,
  onAddEntry,
  onAddAdExpense,
  onAddStructureCost,
}: TransactionFormProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('entry');

  // Entry state
  const [entryDate, setEntryDate] = useState('');
  const [entryValue, setEntryValue] = useState('');
  const [entryOrigin, setEntryOrigin] = useState('Venda X1 – WhatsApp');
  const [entryObservation, setEntryObservation] = useState('');

  // Ad expense state
  const [adDate, setAdDate] = useState('');
  const [adPlatform, setAdPlatform] = useState<'Meta Ads' | 'Google Ads' | 'Outros'>('Meta Ads');
  const [adValue, setAdValue] = useState('');
  const [adClientsServed, setAdClientsServed] = useState('');
  const [adObservation, setAdObservation] = useState('');
  const [adIncludeTax, setAdIncludeTax] = useState(false);
  // Structure cost state
  const [structureType, setStructureType] = useState<'ferramentas' | 'assinaturas' | 'plataformas' | 'outros'>('ferramentas');
  const [structureDate, setStructureDate] = useState('');
  const [structureValue, setStructureValue] = useState('');
  const [structureRecurring, setStructureRecurring] = useState(false);
  const [structureObservation, setStructureObservation] = useState('');

  const resetForms = () => {
    setEntryDate('');
    setEntryValue('');
    setEntryOrigin('Venda X1 – WhatsApp');
    setEntryObservation('');
    setAdDate('');
    setAdPlatform('Meta Ads');
    setAdValue('');
    setAdClientsServed('');
    setAdObservation('');
    setStructureType('ferramentas');
    setStructureDate('');
    setStructureValue('');
    setStructureRecurring(false);
    setStructureObservation('');
  };

  const handleAddEntry = () => {
    if (!entryDate || !entryValue) return;
    onAddEntry({
      date: entryDate,
      value: parseFloat(entryValue),
      origin: entryOrigin,
      observation: entryObservation || undefined,
    });
    resetForms();
    setOpen(false);
  };

  const handleAddAdExpense = () => {
    if (!adDate || !adValue || !adClientsServed) return;
    onAddAdExpense({
      date: adDate,
      platform: adPlatform,
      value: parseFloat(adValue),
      clientsServed: parseInt(adClientsServed, 10),
      observation: adObservation || undefined,
    });
    resetForms();
    setOpen(false);
  };

  const handleAddStructureCost = () => {
    if (!structureDate || !structureValue) return;
    onAddStructureCost({
      category: structureType,
      date: structureDate,
      value: parseFloat(structureValue),
      isRecurring: structureRecurring,
      observation: structureObservation || undefined,
    });
    resetForms();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entry" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Entrada
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <TrendingDown className="w-4 h-4" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="structure" className="gap-2">
              <Settings className="w-4 h-4" />
              Estrutura
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry-date">Data</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-value">Valor (R$)</Label>
                <Input
                  id="entry-value"
                  type="number"
                  placeholder="0,00"
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-origin">Origem</Label>
              <Input
                id="entry-origin"
                value={entryOrigin}
                onChange={(e) => setEntryOrigin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-observation">Observação (opcional)</Label>
              <Textarea
                id="entry-observation"
                value={entryObservation}
                onChange={(e) => setEntryObservation(e.target.value)}
              />
            </div>
            <Button onClick={handleAddEntry} className="w-full">
              Adicionar Entrada
            </Button>
          </TabsContent>

          <TabsContent value="ads" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-date">Data</Label>
                <Input
                  id="ad-date"
                  type="date"
                  value={adDate}
                  onChange={(e) => setAdDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-value">Valor (R$)</Label>
                <Input
                  id="ad-value"
                  type="number"
                  placeholder="0,00"
                  value={adValue}
                  onChange={(e) => setAdValue(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-platform">Plataforma</Label>
              <Select value={adPlatform} onValueChange={(v: any) => setAdPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-clients">Clientes Atendidos *</Label>
              <Input
                id="ad-clients"
                type="number"
                placeholder="0"
                min="0"
                value={adClientsServed}
                onChange={(e) => setAdClientsServed(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-observation">Observação (opcional)</Label>
              <Textarea
                id="ad-observation"
                value={adObservation}
                onChange={(e) => setAdObservation(e.target.value)}
              />
            </div>
            <Button onClick={handleAddAdExpense} className="w-full" variant="secondary">
              Adicionar Gasto com Ads
            </Button>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="structure-date">Data</Label>
                <Input
                  id="structure-date"
                  type="date"
                  value={structureDate}
                  onChange={(e) => setStructureDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure-value">Valor (R$)</Label>
                <Input
                  id="structure-value"
                  type="number"
                  placeholder="0,00"
                  value={structureValue}
                  onChange={(e) => setStructureValue(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-type">Tipo de Custo</Label>
              <Select value={structureType} onValueChange={(v: any) => setStructureType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRUCTURE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="structure-recurring">Custo Recorrente</Label>
              <Switch
                id="structure-recurring"
                checked={structureRecurring}
                onCheckedChange={setStructureRecurring}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="structure-observation">Observação (opcional)</Label>
              <Textarea
                id="structure-observation"
                value={structureObservation}
                onChange={(e) => setStructureObservation(e.target.value)}
              />
            </div>
            <Button onClick={handleAddStructureCost} className="w-full" variant="secondary">
              Adicionar Custo de Estrutura
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
