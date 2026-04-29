import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { contributionService } from '../../api/contribution.service';

export default function ContributionPayPage() {
  const { tokenPayload } = useAppSelector((state) => state.auth);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const data = await contributionService.getAmount();
        setAmount(data.amount);
      } catch (err) {
        setError('Failed to load contribution amount.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!tokenPayload || !tokenPayload.contribution_paid) {
      fetchAmount();
    }
  }, [tokenPayload]);

  if (tokenPayload && tokenPayload.contribution_paid) {
    return <Navigate to="/" replace />;
  }

  const handlePay = async () => {
    try {
      await contributionService.pay();
    } catch (err) {
      setError('Failed to pay contribution.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Pay Your Contribution</h1>
      {loading ? (
        <p>Loading amount...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>
          Please pay your contribution of <strong>{amount} EUR</strong> to continue using the application.
        </p>
      )}

      <button onClick={handlePay}>Pay contribution</button>
    </div>
  );
}
