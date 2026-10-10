import { Check } from "@phosphor-icons/react/dist/ssr";

const stages = ["Choose time", "Review", "Confirmed"];

export function BookingProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Booking progress">
      {stages.map((stage, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;
        return (
          <li key={stage} className="min-w-0">
            <div className={`h-1 rounded-full ${number <= current ? "bg-[#327eaf]" : "bg-[#dcecf6]"}`} />
            <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold sm:text-xs ${active || complete ? "text-[#245f87]" : "text-[var(--muted)]"}`} aria-current={active ? "step" : undefined}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-md ${number <= current ? "bg-[var(--surface-strong)]" : "bg-[var(--surface)]"}`}>
                {complete ? <Check size={12} weight="bold" /> : number}
              </span>
              <span className="truncate">{stage}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
