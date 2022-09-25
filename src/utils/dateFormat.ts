import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface IFormatDateProps {
  date: Date | string | number;
  formatDate: string;
}

const FormatDate = ({ date, formatDate }: IFormatDateProps) =>
  format(new Date(date), formatDate, { locale: ptBR });

export { FormatDate };
