import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { contributionService } from '../../api/contribution.service';
import { DataTable } from '../../components/common/data-table';
import type { ColumnDef, FilterFieldDef } from '../../components/common/data-table';
import type { ContributionList } from '../../interfaces/contribution.interface';
import Header from '../../layout/header';

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <span className="badge bg-success-subtle text-success fw-medium">Payée</span>;
    case 'pending':
      return <span className="badge bg-warning-subtle text-warning fw-medium">En attente</span>;
    case 'failed':
    case 'cancelled':
      return <span className="badge bg-danger-subtle text-danger fw-medium">Échouée</span>;
    default:
      return <span className="badge bg-secondary-subtle text-secondary fw-medium">{status}</span>;
  }
};

const columns: ColumnDef<ContributionList>[] = [
  {
    key: 'name',
    header: 'Nom & Prénom',
    render: (c) => (
      <div className="fw-medium text-stone-800">
        {c.last_name} {c.first_name}
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (c) => <span className="text-stone-600 small">{c.email}</span>,
  },
  {
    key: 'amount',
    header: 'Montant',
    className: 'text-end',
    render: (c) => <span className="fw-semibold text-stone-800">{formatAmount(c.amount)}</span>,
  },
  {
    key: 'status',
    header: 'Statut',
    className: 'text-center',
    render: (c) => getStatusBadge(c.status),
  },
  {
    key: 'year',
    header: 'Année',
    className: 'text-center',
    render: (c) => <span className="text-stone-600">{c.created_at.format('YYYY')}</span>,
  },
  {
    key: 'created_at',
    header: 'Date de création',
    render: (c) => <span className="text-stone-500 small">{c.created_at.format('YYYY-MM-DD HH:mm')}</span>,
  },
  {
    key: 'updated_at',
    header: 'Dernière mise à jour',
    render: (c) => <span className="text-stone-500 small">{c.updated_at.format('YYYY-MM-DD HH:mm')}</span>,
  },
];

const filterFields: FilterFieldDef[] = [
  { key: 'first_name', label: 'Prénom', type: 'text', placeholder: 'Ex: Jean' },
  { key: 'last_name', label: 'Nom', type: 'text', placeholder: 'Ex: Dupont' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'Ex: jean@email.com', minWidth: '180px' },
  { key: 'year', label: 'Année', type: 'text', placeholder: '2026', minWidth: '110px', grow: false },
  {
    key: 'status',
    label: 'Statut',
    type: 'select',
    minWidth: '140px',
    grow: false,
    options: [
      { value: '', label: 'Tous' },
      { value: 'completed', label: 'Payée' },
      { value: 'pending', label: 'En attente' },
      { value: 'failed', label: 'Échouée' },
    ],
  },
];

const amountSchema = z.coerce
  .number({ error: 'Le montant doit être un nombre.' })
  .min(0, 'Le montant doit être supérieur ou égal à 0.');

export default function ContributionListPage() {
  const [contributions, setContributions] = useState<ContributionList[]>([]);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState('');

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    first_name: '',
    last_name: '',
    email: '',
    year: '',
    status: '',
  });

  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchContributions = (targetPage: number = page) => {
    setIsLoading(true);
    contributionService
      .list({
        first_name: filterValues.first_name,
        last_name: filterValues.last_name,
        email: filterValues.email,
        year: filterValues.year,
        status: filterValues.status,
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
    contributionService.getAmount().then((res) => {
      setCurrentAmount(res.amount);
      setNewAmount(res.amount.toString());
    });
  }, [filterValues, limit]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const onUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();

    const result = amountSchema.safeParse(newAmount);

    if (!result.success) {
      setUpdateError(z.treeifyError(result.error).errors.join('. '));
      return;
    }

    const amount = result.data;

    setUpdateError('');
    setUpdateSuccess(false);
    setIsUpdatingPrice(true);
    contributionService
      .updatePrice(amount)
      .then(() => {
        setCurrentAmount(amount);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      })
      .catch((error) => {
        setUpdateError(typeof error === 'string' ? error : 'Impossible de mettre à jour le prix. Veuillez réessayer.');
      })
      .finally(() => {
        setIsUpdatingPrice(false);
      });
  };

  return (
    <>
      <Header pageName="Gérer Cotisations" icon="CreditCard" />

      <div className="bg-white border-bottom border-stone-200 px-4 py-3">
        <form onSubmit={onUpdatePrice} className="row g-3 align-items-center">
          <div className="col-auto">
            <label htmlFor="contributionPrice" className="form-label mb-0 fw-medium text-stone-700">
              Prix de la cotisation annuelle :
            </label>
          </div>
          <div className="col-auto">
            <div className="input-group input-group-sm">
              <input
                type="number"
                step="0.01"
                id="contributionPrice"
                className="form-control"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Ex: 50.00"
                style={{ maxWidth: '100px' }}
                required
              />
              <span className="input-group-text">€</span>
            </div>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-sm btn-primary px-3" disabled={isUpdatingPrice}>
              {isUpdatingPrice ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </button>
          </div>

          <div className="col-auto ms-auto text-stone-500 small">
            Prix actuel :{' '}
            <span className="fw-bold text-stone-800">
              {currentAmount !== null ? formatAmount(currentAmount) : 'Chargement...'}
            </span>
          </div>
        </form>
        {updateSuccess && (
          <div className="col-auto">
            <span className="text-success small fw-medium">
              <i className="bi bi-check-circle-fill me-1"></i> Prix mis à jour !
            </span>
          </div>
        )}
        {updateError && (
          <div className="col-auto">
            <span className="text-danger small fw-medium">
              <i className="bi bi-x-circle-fill me-1"></i> {updateError}
            </span>
          </div>
        )}
      </div>

      <DataTable<ContributionList>
        filters={filterFields}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        columns={columns}
        data={contributions}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        error={loadingError || null}
        emptyMessage="Aucune contribution ne correspond aux critères sélectionnés."
        loadingLabel="des contributions"
        page={page}
        total={total}
        limit={limit}
        totalPages={totalPages}
        onPageChange={(p) => fetchContributions(p)}
        onLimitChange={setLimit}
        itemLabel="contribution"
      />
    </>
  );
}
