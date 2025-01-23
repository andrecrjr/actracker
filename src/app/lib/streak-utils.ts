import type { Habit } from '@/app/types/habits';
import { formatDate } from './date-utils';
import { pluginManager } from './plugins';

/**
 * Calcula o streak de um hábito.
 *
 * A lógica principal é:
 * 1. Iterar dia a dia para trás, iniciando em currentDate.
 * 2. Verificar se o hábito está ativo no dia (isHabitActiveForDate).
 * 3. - Se estiver ativo e NÃO estiver completado nem ignorado, interrompe o streak.
 * 4. - Se estiver ativo e completado (ou ignorado), incrementa o streak.
 * 5. - Se não estiver ativo, apenas ignora e continua.
 */
export function calculateStreak(
  habit: Habit,
  currentDate: string,
  ignoredDates: string[] = [],
): number {
  let streak = 0;
  const currentDateObj = new Date(currentDate);

  while (true) {
    const dateStr = formatDate(currentDateObj);

    // Se a data é anterior ao startDate do hábito, paramos.
    if (dateStr < habit.startDate) {
      break;
    }

    // Se tiver endDate e essa data exceder, apenas continue para a data anterior
    // (porque não conta para o streak, mas não deve quebrar)
    if (habit.endDate && dateStr > habit.endDate) {
      currentDateObj.setDate(currentDateObj.getDate() - 1);
      continue;
    }

    // Verifica se o hábito está ativo para essa data
    if (isHabitActiveForDate(habit, dateStr)) {
      // Se está ativo mas não completou (e não está ignorado), quebramos o streak
      if (
        !habit.completedDates.includes(dateStr) &&
        !ignoredDates.includes(dateStr)
      ) {
        if (streak > 0) {
          pluginManager.executeHook('onHabitStreak', habit, streak);
        }
        break;
      } else {
        // Está ativo e foi completado ou está ignorado, incrementamos o streak
        streak++;
      }
    }

    // Retrocede 1 dia
    currentDateObj.setDate(currentDateObj.getDate() - 1);
  }

  return streak;
}

/**
 * Verifica se o hábito está ativo na data passada.
 */
/**
 * Verifica se o hábito está ativo na data passada.
 */
export function isHabitActiveForDate(habit: Habit, date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const currentDate = new Date(year, month - 1, day);
  currentDate.setUTCHours(0, 0, 0, 0); // Define a hora como 00:00 no horário local
  const dayOfWeek = currentDate.getUTCDay();
  const dayOfMonth = currentDate.getUTCDate();

  // Verifica se a data está dentro do intervalo (startDate <= date <= endDate se existir endDate)
  if (date < habit.startDate) return false;
  if (habit.endDate && date > habit.endDate) return false;

  // Verifica se o hábito foi arquivado e se a data é após a archiveDate
  if (habit.archived && habit.archiveDate && date > habit.archiveDate)
    return false;

  switch (habit.frequency) {
    case 'daily':
      return true;

    case 'weekly':
      // Se daysOfWeek estiver definido, retorna true se dayOfWeek estiver no array
      return habit.daysOfWeek?.includes(dayOfWeek) ?? false;

    case 'monthly':
      // Para monthly, retornamos true se o dia do mês bater com o specificDayOfMonth
      // (ou seja, esse é o "dia do mês" em que se repete).
      if (!habit.specificDayOfMonth) return false;
      return dayOfMonth === habit.specificDayOfMonth;

    default:
      return false;
  }
}
