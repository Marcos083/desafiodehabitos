type GreetingCardProps = {
  name: string;
  subtitle?: string;
};

export function GreetingCard({
  name,
  subtitle = "Pronto pra manter o ritmo hoje?",
}: GreetingCardProps) {
  const firstName = name.split(" ")[0] ?? name;

  return (
    <div className="rounded-[20px] border border-border bg-surface p-6 lg:p-8">
      <h1 className="text-3xl font-medium tracking-tight text-ink lg:text-4xl">
        Oi, <span className="text-signal">{firstName}</span>!
      </h1>
      <p className="mt-2 text-base text-muted-foreground lg:text-lg">
        {subtitle}
      </p>
    </div>
  );
}
