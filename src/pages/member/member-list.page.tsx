import { useEffect, useState } from 'react';
import type { Member } from '../../interfaces/member.interface';
import { memberService } from '../../api/member.service';

export default function MemberListPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    memberService.getAll().then((members) => {
      setMembers(members);
    });
  }, []);

  return (
    <>
      <h1>Member List</h1>
      {members.map((member) => (
        <div key={member.id}>
          <p>
            {member.firstname} {member.lastname} {member.email} {member.contribution_paid ? 'Paid' : 'Not Paid'}
          </p>
        </div>
      ))}
    </>
  );
}
