// helpers.ts
import { ChangeAction, EntityType, IChangeLog } from '../models/ChangeLog';

export function formatTimestamp(ts: Date) {
  const date = ts.toISOString().split('T')[0];            // YYYY-MM-DD
  const time = ts.toISOString().split('T')[1].substr(0,8); // HH:MM:SS
  return { date, time };
}

export function makeDescription(log: IChangeLog): string {
  const name = `${log.snapshot.firstName || ''} ${log.snapshot.lastName || ''}`.trim() || '–';
  switch (log.action) {
    case ChangeAction.CREATE:
      return `Dodano osobę: ${name}`;
    case ChangeAction.UPDATE:
      return `Zaktualizowano dane: ${name}`;
    case ChangeAction.DELETE:
      return `Usunięto: ${name}`;
    case ChangeAction.RESTORE:
      return `Przywrócono: ${name}`;
    case ChangeAction.ADD_RELATION: {
          const name = `${log.snapshot.person.firstName || ''} ${log.snapshot.person.lastName || ''}`.trim() || '–';
      const rel = log;
      const otherName = rel
        ? `${(rel as any).snapshot?.relatedPerson.firstName} ${(rel as any).snapshot?.relatedPerson.lastName}`.trim()
        : '–';
      return `Dodano relację ${name} <-> ${otherName}`;
    }
    case ChangeAction.REMOVE_RELATION: {
          const name = `${log.snapshot.person.firstName || ''} ${log.snapshot.person.lastName || ''}`.trim() || '–';
      const rel = log;
      const otherName = rel
        ? `${(rel as any).snapshot?.relatedPerson.firstName} ${(rel as any).snapshot?.relatedPerson.lastName}`.trim()
        : '–';
      return `Usunięto relację ${name} <-> ${otherName}`;
    }
    default:
      return '';
  }
}
