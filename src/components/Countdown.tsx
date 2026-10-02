function part(n: number) {
  return String(n).padStart(2, '0');
}

export function Countdown({ end, now }: { end: number; now: number }) {
  const total = Math.max(0, Math.floor((end - now) / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const units: [string, string][] = [
    [String(days), days === 1 ? 'dag' : 'dagen'],
    [part(hours), 'uur'],
    [part(minutes), 'min'],
    [part(seconds), 'sec'],
  ];
  return (
    <div
      className="flex gap-2"
      role="timer"
      aria-label={`Nog ${days} dagen, ${hours} uur en ${minutes} minuten`}
    >
      {units.map(([value, label]) => (
        <div
          key={label}
          className="min-w-14 rounded-lg bg-stone-900 px-2 py-1.5 text-center text-white"
        >
          <div className="text-2xl font-extrabold tabular-nums" aria-hidden="true">
            {value}
          </div>
          <div className="text-xs text-stone-300" aria-hidden="true">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
