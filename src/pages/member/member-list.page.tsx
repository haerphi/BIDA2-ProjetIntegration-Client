import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Member } from '../../interfaces/member.interface';
import { memberService } from '../../api/member.service';
import { DataTable } from '../../components/Common/DataTable';
import type { ColumnDef, FilterFieldDef } from '../../components/Common/DataTable';
import { PaymentBadge } from './components/payment-badge';
import { Link } from 'react-router-dom';
import CustomIcon from '../../components/Common/Icons/custom-icon';
import Header from '../../layout/header';

/* ── Column definitions ───────────────────────────── */
const columns: ColumnDef<Member>[] = [
  {
    key: 'name',
    header: 'Nom & Prénom',
    render: (m) => (
      <div className="fw-medium text-stone-900">
        {m.lastname}, {m.firstname}
      </div>
    ),
  },
  {
    key: 'payment',
    header: 'Statut de paiement',
    render: (m) => <PaymentBadge paid={m.contribution_paid} />,
  },
  {
    key: 'email',
    header: 'Email',
    render: (m) => <span className="text-stone-600">{m.email}</span>,
  },
  {
    key: 'actions',
    header: 'Actions',
    className: 'text-center',
    render: (m) => (
      <Link
        to={`/members/${m.id}`}
        className="btn btn-sm btn-outline-success text-emerald-600 border-emerald-500 hover-bg-emerald-50 px-3 py-1 rounded-2"
      >
        <CustomIcon iconName="Pencil" className="me-2" />
        Editer
      </Link>
    ),
  },
];

/* ── Filter definitions ───────────────────────────── */
const filterFields: FilterFieldDef[] = [
  { key: 'search', label: 'Recherche par nom', type: 'text', placeholder: 'Ex: Dupont', minWidth: '200px' },
  {
    key: 'ranking',
    label: 'Classement',
    type: 'select',
    minWidth: '200px',
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'A', label: 'A' },
      { value: 'B', label: 'Série B' },
      { value: 'C', label: 'Série C' },
      { value: 'NC', label: 'N.C' },
    ],
  },
  {
    key: 'sort',
    label: 'Trier par',
    type: 'select',
    minWidth: '200px',
    options: [
      { value: 'alpha-asc', label: 'Ordre alphabétique (A-Z)' },
      { value: 'alpha-desc', label: 'Ordre alphabétique (Z-A)' },
    ],
  },
];

/* ── Page component ───────────────────────────────── */
export default function MemberListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: '',
    ranking: 'all',
    sort: 'alpha-asc',
  });

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    memberService
      .getAll()
      .then((response) => {
        if (!cancelled) setMembers(response.data);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger la liste des membres. Veuillez réessayer.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredMembers = useMemo(() => {
    let result = [...members];

    const search = filterValues.search?.trim().toLowerCase();
    if (search) {
      result = result.filter(
        (m) => m.lastname.toLowerCase().includes(search) || m.firstname.toLowerCase().includes(search),
      );
    }

    if (filterValues.ranking !== 'all') {
      result = result.filter((m) => m.ranking === filterValues.ranking);
    }

    result.sort((a, b) => {
      const cmp = a.lastname.localeCompare(b.lastname, 'fr');
      return filterValues.sort === 'alpha-asc' ? cmp : -cmp;
    });

    return result;
  }, [members, filterValues]);

  return (
    <>
      <Header pageName="Liste des membres" icon="Person" />

      <div className="container mt-2">
        <Link to="/members/create" className="btn btn-success float-end">
          <CustomIcon iconName="PlusCircle" className="" /> Ajouter un membre
        </Link>
      </div>

      <DataTable<Member>
        filters={filterFields}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        columns={columns}
        data={filteredMembers}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="Aucun membre ne correspond aux critères sélectionnés."
        loadingLabel="des membres"
        renderFooter={() => (
          <div className="p-3 d-flex justify-content-between align-items-center border-top border-stone-200 bg-stone-50">
            <div className="text-stone-500 small">
              {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} affiché
              {filteredMembers.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      />
    </>
  );
}
