import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Member, MemberListQueryParams, Category } from '../../interfaces/member.interface';
import { memberService } from '../../api/member.service';
import { DataTable } from '../../components/common/data-table';
import type { ColumnDef, FilterFieldDef } from '../../components/common/data-table';
import { PaymentBadge } from './components/payment-badge';
import { Link } from 'react-router-dom';
import CustomIcon from '../../components/common/Icons/custom-icon';
import Header from '../../layout/header';
import { MemberRanking } from '../../enums/member-ranking.enum';

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
    key: 'categories',
    header: 'Catégories',
    render: (m) => (
      <div className="d-flex flex-wrap gap-1">
        {m.categories && m.categories.length > 0 ? (
          m.categories.map((cat) => (
            <span
              key={cat}
              className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-pill px-2 py-1 small"
            >
              {cat}
            </span>
          ))
        ) : (
          <span className="text-stone-400 small">-</span>
        )}
      </div>
    ),
  },
  {
    key: 'ranking',
    header: 'Classement',
    render: (m) => <span className="text-stone-600">{m.ranking}</span>,
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

export default function MemberListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterValues, setFilterValues] = useState<MemberListQueryParams>({
    affiliation_number: '',
    birth_date: '',
    country: '',
    email: '',
    first_name: '',
    gender: undefined,
    is_active: undefined,
    last_name: '',
    phone: '',
    postal_code: '',
    ranking: '',
    search: '',
    category: '',
  });

  useEffect(() => {
    memberService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const filterFields = useMemo<FilterFieldDef[]>(
    () => [
      {
        key: 'search',
        label: 'Recherche par nom, prénom, Email',
        type: 'text',
        placeholder: 'Ex: Dupont ou toto@mail.com',
        minWidth: '200px',
      },
      {
        key: 'category',
        label: 'Catégorie',
        type: 'select',
        minWidth: '200px',
        options: [
          { value: '', label: 'Toutes' },
          ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
        ],
      },
      {
        key: 'ranking',
        label: 'Classement',
        type: 'select',
        minWidth: '200px',
        options: [
          {
            value: '',
            label: 'Tous',
          },
          ...Object.values(MemberRanking).map((ranking) => ({
            value: ranking,
            label: ranking,
          })),
        ],
      },
    ],
    [categories],
  );

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    memberService
      .getAll(filterValues)
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
  }, [filterValues]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

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
        filterValues={filterValues as Record<string, string>}
        onFilterChange={handleFilterChange}
        columns={columns}
        data={members}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="Aucun membre ne correspond aux critères sélectionnés."
        loadingLabel="des membres"
        renderFooter={() => (
          <div className="p-3 d-flex justify-content-between align-items-center border-top border-stone-200 bg-stone-50">
            <div className="text-stone-500 small">
              {members.length} membre{members.length !== 1 ? 's' : ''} affiché
              {members.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      />
    </>
  );
}
