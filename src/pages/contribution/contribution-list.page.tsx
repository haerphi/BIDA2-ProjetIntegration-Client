import { useEffect, useState } from 'react';
import { contributionService } from '../../api/contribution.service';
import type { ContributionList } from '../../interfaces/contribution.interface';

export default function ContributionListPage() {
  const [contributions, setContributions] = useState<ContributionList[]>([]);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchStatus, setSearchStatus] = useState('completed');

  const fetchContributions = (targetPage: number = page) => {
    setIsLoading(true);
    contributionService
      .list({
        first_name: searchFirstName,
        last_name: searchLastName,
        email: searchEmail,
        year: searchYear,
        status: searchStatus,
        page: targetPage,
        limit: limit,
      })
      .then((response) => {
        setContributions(response.data);
        setTotal(response.total);
        setPage(response.page);
        setTotalPages(response.total_pages);
        setLoadingError('');
      })
      .catch((error) => {
        setLoadingError(
          typeof error === 'string' ? error : 'Impossible de charger les contributions. Veuillez réessayer.',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchContributions(1);
  }, [searchFirstName, searchLastName, searchEmail, searchYear, searchStatus, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchContributions(newPage);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success-subtle text-success fw-medium">Payée</span>;
      case 'pending':
        return <span className="badge bg-warning-subtle text-warning fw-medium">En attente</span>;
      case 'cancelled':
        return <span className="badge bg-danger-subtle text-danger fw-medium">Annulée</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary fw-medium">{status}</span>;
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <section>
      <header className="bg-white border-bottom border-stone-200 px-4 py-3">
        <h2 className="h4 mb-1 fw-semibold text-stone-800">Historique des contributions</h2>
        <div className="text-stone-500 small">Consultez et recherchez les paiements des membres</div>
      </header>

      <div className="p-4 overflow-auto mx-auto w-100" style={{ maxWidth: '1200px' }}>
        {/* Filters */}
        <div className="card bg-white rounded-3 border-stone-200 mb-4 shadow-sm border-0 p-4">
          <div className="d-flex gap-3 align-items-end flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: '160px' }}>
              <label htmlFor="searchFirstName" className="form-label fw-medium small mb-1">
                Prénom
              </label>
              <input
                id="searchFirstName"
                type="text"
                className="form-control custom-input"
                placeholder="Ex: Jean"
                value={searchFirstName}
                onChange={(e) => setSearchFirstName(e.target.value)}
              />
            </div>

            <div className="flex-grow-1" style={{ minWidth: '160px' }}>
              <label htmlFor="searchLastName" className="form-label fw-medium small mb-1">
                Nom
              </label>
              <input
                id="searchLastName"
                type="text"
                className="form-control custom-input"
                placeholder="Ex: Dupont"
                value={searchLastName}
                onChange={(e) => setSearchLastName(e.target.value)}
              />
            </div>

            <div className="flex-grow-1" style={{ minWidth: '180px' }}>
              <label htmlFor="searchEmail" className="form-label fw-medium small mb-1">
                Email
              </label>
              <input
                id="searchEmail"
                type="text"
                className="form-control custom-input"
                placeholder="Ex: jean@email.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '110px' }}>
              <label htmlFor="searchYear" className="form-label fw-medium small mb-1">
                Année
              </label>
              <input
                id="searchYear"
                type="text"
                className="form-control custom-input"
                placeholder="2026"
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '140px' }}>
              <label htmlFor="searchStatus" className="form-label fw-medium small mb-1">
                Statut
              </label>
              <select
                id="searchStatus"
                className="form-select custom-select"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="completed">Payée</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card bg-white rounded-3 border-stone-200 shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-start align-middle">
              <thead className="bg-stone-50 border-stone-200 text-stone-700">
                <tr>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Nom & Prénom</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Email</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium text-end">Montant</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium text-center">Statut</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium text-center">Année</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Date de création</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Dernière mise à jour</th>
                </tr>
              </thead>
              <tbody className="border-stone-100">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-stone-400">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Chargement…</span>
                      </div>
                      Chargement des contributions…
                    </td>
                  </tr>
                )}

                {!isLoading && loadingError && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {loadingError}
                    </td>
                  </tr>
                )}

                {!isLoading && !loadingError && contributions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-stone-400">
                      Aucune contribution ne correspond aux critères sélectionnés.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !loadingError &&
                  contributions.map((contribution) => (
                    <tr key={contribution.id}>
                      <td className="py-3 px-4">
                        <div className="fw-medium text-stone-800">
                          {contribution.last_name} {contribution.first_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 small">{contribution.email}</td>
                      <td className="py-3 px-4 text-end fw-semibold text-stone-800">
                        {formatAmount(contribution.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(contribution.status)}</td>
                      <td className="py-3 px-4 text-center text-stone-600">{contribution.created_at.format('YYYY')}</td>
                      <td className="py-3 px-4 text-stone-500 small">
                        {contribution.created_at.format('YYYY-MM-DD HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-stone-500 small">
                        {contribution.updated_at.format('YYYY-MM-DD HH:mm')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer with pagination */}
          <div className="p-3 d-flex justify-content-between align-items-center border-top border-stone-200 bg-stone-50 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <div className="text-stone-500 small">
                {total === 0
                  ? 'Aucun résultat'
                  : `${startItem}–${endItem} sur ${total} contribution${total !== 1 ? 's' : ''}`}
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="pageSizeSelect" className="text-stone-500 small mb-0">
                  Lignes :
                </label>
                <select
                  id="pageSizeSelect"
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <nav aria-label="Pagination des contributions">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(1)}
                    disabled={page <= 1}
                    aria-label="Première page"
                  >
                    «
                  </button>
                </li>
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Page précédente"
                  >
                    ‹
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                  .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push('ellipsis');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <li key={`ellipsis-${idx}`} className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    ) : (
                      <li key={item} className={`page-item ${page === item ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(item)}>
                          {item}
                        </button>
                      </li>
                    ),
                  )}

                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Page suivante"
                  >
                    ›
                  </button>
                </li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page >= totalPages}
                    aria-label="Dernière page"
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
