import { IconCalendar, IconLock, IconReceipt, IconVideo } from './Icons';

const ITEMS = [
  { icon: IconLock, text: 'Veilig betalen via Stripe, met iDEAL of kaart' },
  { icon: IconReceipt, text: 'Direct een factuur met btw' },
  { icon: IconCalendar, text: 'Foto als bewijs van plaatsing' },
  { icon: IconVideo, text: '3 maanden gegarandeerd op de muur' },
];

export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ITEMS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-2.5 text-sm font-medium text-navy">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lichtblauw text-oranje">
            <Icon className="h-5 w-5" />
          </span>
          <span className="pt-1">{text}</span>
        </li>
      ))}
    </ul>
  );
}
