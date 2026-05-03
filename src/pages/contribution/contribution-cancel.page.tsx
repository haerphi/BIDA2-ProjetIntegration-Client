import { Link } from 'react-router-dom';

export default function ContributionCancelPage() {
  return (
    <>
      <header className="bg-white border-bottom border-stone-200 px-4 py-3 d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0 fw-semibold text-stone-800">
          💳 Cotisation
        </h2>
      </header>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div
          className="card bg-white rounded-4 border-0 shadow-sm text-center w-100"
          style={{ maxWidth: '480px' }}
        >
          <div className="card-body p-4 p-sm-5">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
              style={{
                width: '72px',
                height: '72px',
                fontSize: '32px',
                backgroundColor: '#fefce8',
                color: '#ca8a04',
              }}
            >
              ⚠️
            </div>
            <h3 className="h4 fw-bold text-stone-800 mb-3">Paiement annulé</h3>
            <p className="text-stone-600 mb-4">
              Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
              Vous pouvez réessayer à tout moment.
            </p>
            <Link
              to="/contribution/pay"
              className="btn btn-emerald-600 btn-lg text-white fw-semibold rounded-3 px-5 py-2"
            >
              Retour au paiement
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
