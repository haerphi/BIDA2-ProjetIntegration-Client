import { useEffect, useState } from 'react';
import { contributionService } from '../../api/contribution.service';
import { Link } from 'react-router-dom';

export default function ContributionSuccessPage() {
  const [checkingPaid, setCheckingPaid] = useState<boolean>(true);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);

  useEffect(() => {
    contributionService.status().then((status) => {
      setHasPaid(status.has_paid);
      setCheckingPaid(false);
    });
  }, []);

  return (
    <>
      {checkingPaid ? (
        <h1>Checking your status...</h1>
      ) : hasPaid ? (
        <div>
          <h1>You're contribution is confirmed.</h1>
          <Link to="/">Go to home page</Link>
        </div>
      ) : (
        <div>
          <h1>You're contribution is not confirmed.</h1>
          <Link to="/contribution/pay">Pay your contribution here</Link>
        </div>
      )}
    </>
  );
}
