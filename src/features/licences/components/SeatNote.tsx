import { formatCurrency } from '../../../lib/currency';
import type { SoftwareProduct } from '../../../types/software';
import type { SeatAvailability } from '../types/seatAvailability';

interface SeatNoteProps {
  product: SoftwareProduct;
  availability: SeatAvailability | undefined;
  /** The person already holds this licence, so no seat is needed. */
  held: boolean;
  /** Ticked for assignment: only then is a seat purchase flagged (amber). */
  selected: boolean;
}

/** Explains what assigning this licence does to the client's seat pool. */
export function SeatNote({ product, availability, held, selected }: SeatNoteProps) {
  if (held) return <span className="text-slate-500">Assigned</span>;
  const cost = `+${formatCurrency(product.monthlyPricePerSeat)}/mo`;
  const willBuy = selected ? ` · 1 seat will be added (${cost})` : '';
  const tone = selected ? 'text-amber-700' : 'text-slate-500';

  if (!availability) {
    return (
      <span className={tone}>
        {selected ? `Not licensed yet · first seat will be bought (${cost})` : 'Not licensed at this client yet'}
      </span>
    );
  }
  if (availability.free === 0) {
    return (
      <span className={tone}>
        {availability.seats === 1 ? 'The only seat is' : `All ${availability.seats} seats are`} in use{willBuy}
      </span>
    );
  }
  return (
    <span className="text-slate-500">
      {availability.free} of {availability.seats} seats free
    </span>
  );
}
