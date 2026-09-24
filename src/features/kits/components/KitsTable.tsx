import type { ReactNode } from 'react';
import type { Kit } from '../../../types/kit';
import { KitsTableRow } from './KitsTableRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';

interface KitsTableProps {
  kits: Kit[];
  templateNameById: Map<string, string>;
  showClient: boolean;
  showOrigin: boolean;
  highlightKitId: string | null;
  empty: ReactNode;
}

export function KitsTable({ kits, templateNameById, showClient, showOrigin, highlightKitId, empty }: KitsTableProps) {
  if (kits.length === 0) return <>{empty}</>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Kit
            </th>
            {showClient && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            {showOrigin && (
              <th scope="col" className={HEADER_CELL}>
                Based on
              </th>
            )}
            <th scope="col" className={`${HEADER_CELL} text-right`}>
              Price
            </th>
            <th scope="col" className={HEADER_CELL}>
              Last updated
            </th>
            <th scope="col" className={HEADER_CELL}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {kits.map((kit) => (
            <KitsTableRow
              key={kit.id}
              kit={kit}
              templateName={kit.sourceTemplateId ? templateNameById.get(kit.sourceTemplateId) : undefined}
              showClient={showClient}
              showOrigin={showOrigin}
              isHighlighted={kit.id === highlightKitId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
