import { useEffect, useState } from 'react';
import { contributionService } from '../../api/contribution.service';
import { Link } from 'react-router-dom';
import { authService } from '../../api/auth.service';

export default function ContributionSuccessPage() {
  const [checkingPaid, setCheckingPaid] = useState<boolean>(true);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [tries, setTries] = useState<number>(0);
  const maxTries = 5;

  useEffect(() => {
    setCheckingPaid(true);
    setTries(0);
    checkContributionStatus();
  }, []);

  const checkContributionStatus = async () => {
    setTries((tries) => tries + 1);
    const status = await contributionService.status();
    setHasPaid(status.has_paid);
    if (status.has_paid) {
      await authService.refreshToken();
      setCheckingPaid(false);
      return;
    }
    if (tries < maxTries) {
      setCheckingPaid(true);
      setTimeout(checkContributionStatus, 1000);
    } else {
      setCheckingPaid(false);
    }
  };

  return (
    <>
      <header className="bg-white border-bottom border-stone-200 px-4 py-3 d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0 fw-semibold text-stone-800">💳 Cotisation</h2>
      </header>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="card bg-white rounded-4 border-0 shadow-sm text-center w-100" style={{ maxWidth: '480px' }}>
          <div className="card-body p-4 p-sm-5">
            {checkingPaid ? (
              <div className="py-4">
                <div className="spinner-border text-emerald-600 mb-3" role="status">
                  <span className="visually-hidden">Vérification...</span>
                </div>
                <p className="text-stone-500 mb-0">Vérification de votre paiement...</p>
              </div>
            ) : hasPaid ? (
              <>
                <div
                  className="d-flex align-items-center justify-content-center bg-emerald-100 text-emerald-600 rounded-circle mx-auto mb-4"
                  style={{ width: '72px', height: '72px', fontSize: '32px' }}
                >
                  ✅
                </div>
                <h3 className="h4 fw-bold text-stone-800 mb-3">Cotisation confirmée !</h3>
                <p className="text-stone-600 mb-4">
                  Votre paiement a bien été enregistré. Vous pouvez maintenant accéder à l'ensemble des fonctionnalités
                  de l'application.
                </p>
                <Link to="/" className="btn btn-emerald-600 btn-lg text-white fw-semibold rounded-3 px-5 py-2">
                  Accéder au planning
                </Link>
              </>
            ) : (
              <>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: '72px',
                    height: '72px',
                    fontSize: '32px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                  }}
                >
                  ❌
                </div>
                <h3 className="h4 fw-bold text-stone-800 mb-3">Paiement non confirmé</h3>
                <p className="text-stone-600 mb-4">
                  Nous n'avons pas pu confirmer votre paiement. Veuillez réessayer ou contacter l'administration du
                  club.
                </p>
                <Link to="/contribution/pay" className="btn btn-outline-secondary fw-semibold rounded-3 px-4 py-2">
                  Réessayer le paiement
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
