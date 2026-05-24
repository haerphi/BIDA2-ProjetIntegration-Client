import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { contributionService } from '../../api/contribution.service';
import CustomIcon from '../../components/common/Icons/custom-icon';
import Header from '../../layout/header';

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
    setLoading(true);
    try {
      await contributionService.pay();
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite");
      }
    }
  };

  return (
    <>
      <Header pageName="Payer ma cotisation" icon="CreditCard" />

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="card bg-white rounded-4 border-0 shadow-sm text-center w-100" style={{ maxWidth: '480px' }}>
          <div className="card-body p-4 p-sm-5">
            {loading ? (
              <div className="py-4">
                <div className="spinner-border text-emerald-600 mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="text-stone-500 mb-0">Chargement du montant...</p>
              </div>
            ) : error ? (
              <div className="py-3">
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-0">
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="d-flex align-items-center justify-content-center bg-emerald-100 text-emerald-600 rounded-circle mx-auto mb-4"
                  style={{ width: '72px', height: '72px', fontSize: '32px' }}
                >
                  <CustomIcon iconName="CreditCard" className="w-50 h-50" />
                </div>
                <h3 className="h4 fw-bold text-stone-800 mb-3">Payer votre cotisation</h3>
                <p className="text-stone-600 mb-4">
                  Pour accéder à l'application et réserver des terrains, veuillez régler votre cotisation annuelle.
                </p>
                <div className="bg-stone-50 rounded-3 p-3 mb-4 d-inline-block" style={{ minWidth: '200px' }}>
                  <p className="text-stone-500 small mb-1 text-uppercase fw-medium" style={{ letterSpacing: '0.05em' }}>
                    Montant à payer
                  </p>
                  <p className="h2 fw-bold text-emerald-600 mb-0">{amount} €</p>
                </div>
                <div>
                  <button
                    onClick={handlePay}
                    className="btn btn-emerald-600 btn-lg text-white fw-semibold rounded-3 px-5 py-2"
                  >
                    Payer la cotisation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
