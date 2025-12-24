import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
}

export const YearSelector = ({ selectedYear, availableYears, onSelectYear }: YearSelectorProps) => {
  const currentYear = new Date().getFullYear();
  
  // Generate years from 2020 to current year + 5
  const allYears = Array.from(
    { length: (currentYear + 5) - 2020 + 1 },
    (_, i) => currentYear + 5 - i
  );

  return (
    <Select value={selectedYear.toString()} onValueChange={(value) => onSelectYear(Number(value))}>
      <SelectTrigger className="w-[130px] bg-secondary/50">
        <Calendar className="w-4 h-4 mr-2 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allYears.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
