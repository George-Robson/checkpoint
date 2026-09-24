import type { CatalogSpec } from '../../../types/catalog';

interface SpecListProps {
  specs: CatalogSpec[];
}

/** A compact two-column spec sheet (label / value). */
export function SpecList({ specs }: SpecListProps) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      {specs.map((spec) => (
        <div key={spec.label} className="contents">
          <dt className="text-slate-500">{spec.label}</dt>
          <dd className="text-slate-900">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
