const BR_TIMEZONE = "America/Sao_Paulo";

export function todayInBR(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BR_TIMEZONE }).format(
    new Date(),
  );
}

export function weekdayInBR(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  const day = Number(parts.find((p) => p.type === "day")!.value);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
