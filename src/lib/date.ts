const BR_TIMEZONE = "America/Sao_Paulo";

export function todayInBR(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BR_TIMEZONE }).format(
    new Date(),
  );
}

function brDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value),
    day: Number(parts.find((p) => p.type === "day")!.value),
  };
}

export function weekdayInBR(): number {
  const { year, month, day } = brDateParts(new Date());
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + delta));
  return dt.toISOString().slice(0, 10);
}

export function currentWeekRangeBR(): {
  start: string;
  end: string;
  days: string[];
} {
  const today = todayInBR();
  const weekday = weekdayInBR();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  const start = addDaysISO(today, -daysFromMonday);
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
  return { start, end: days[6]!, days };
}

export function currentMonthBoundsBR(): {
  year: number;
  month: number;
  first: string;
  last: string;
} {
  const { year, month, day: _day } = brDateParts(new Date());
  void _day;
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { year, month: month - 1, first, last };
}
