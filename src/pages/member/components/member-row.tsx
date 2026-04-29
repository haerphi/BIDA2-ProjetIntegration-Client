import type { Member } from '../../../interfaces/member.interface';
import { PaymentBadge } from './payment-badge';

export interface MemberRowProps {
  member: Member;
}

export function MemberRow({ member }: MemberRowProps) {
  return (
    <tr key={member.id}>
      <td className="p-4">
        <div className="fw-medium text-stone-900">
          {member.lastname}, {member.firstname}
        </div>
      </td>
      <td className="p-4">
        <PaymentBadge paid={member.contribution_paid} />
      </td>
      <td className="p-4 text-stone-600">{member.email}</td>
      <td className="p-4 text-center">
        <button className="btn btn-sm btn-outline-success text-emerald-600 border-emerald-500 hover-bg-emerald-50 px-3 py-1 rounded-2">
          Editer membre
        </button>
      </td>
    </tr>
  );
}
