import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Member } from '../../interfaces/member.interface';
import { memberService } from '../../api/member.service';
import { MemberRow } from './components/member-row';

type SortOrder = 'alpha-asc' | 'alpha-desc';

interface Filters {
  search: string;
  ranking: string;
  sort: SortOrder;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  ranking: 'all',
  sort: 'alpha-asc',
};

export default function MemberListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    memberService
      .getAll()
      .then((data) => {
        if (!cancelled) setMembers(data);
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

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (filters.search.trim()) {
      const needle = filters.search.trim().toLowerCase();
      result = result.filter(
        (m) => m.lastname.toLowerCase().includes(needle) || m.firstname.toLowerCase().includes(needle),
      );
    }

    if (filters.ranking !== 'all') {
      result = result.filter((m) => m.ranking === filters.ranking);
    }

    result.sort((a, b) => {
      const cmp = a.lastname.localeCompare(b.lastname, 'fr');
      return filters.sort === 'alpha-asc' ? cmp : -cmp;
    });

    return result;
  }, [members, filters]);

  return (
    <section>
      <header className="bg-white border-bottom border-stone-200 px-4 py-3">
        <h2 className="h4 mb-1 fw-semibold text-stone-800">Annuaire des membres</h2>
        <div className="text-stone-500 small">Trouvez des partenaires de jeu</div>
      </header>

      <div className="p-4 overflow-auto mx-auto w-100" style={{ maxWidth: '1200px' }}>
        {/* Filters */}
        <div className="card bg-white rounded-3 border-stone-200 mb-4 shadow-sm border-0 p-4">
          <div className="d-flex gap-3 align-items-end flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: '200px' }}>
              <label htmlFor="filter-search" className="form-label fw-medium small mb-1">
                Recherche par nom
              </label>
              <input
                id="filter-search"
                type="text"
                className="form-control custom-input"
                placeholder="Ex: Dupont"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="flex-grow-1" style={{ minWidth: '200px' }}>
              <label htmlFor="filter-ranking" className="form-label fw-medium small mb-1">
                Classement
              </label>
              <select
                id="filter-ranking"
                className="form-select custom-select"
                value={filters.ranking}
                onChange={(e) => handleFilterChange('ranking', e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="A">A</option>
                <option value="B">Série B</option>
                <option value="C">Série C</option>
                <option value="NC">N.C</option>
              </select>
            </div>

            <div className="flex-grow-1" style={{ minWidth: '200px' }}>
              <label htmlFor="filter-sort" className="form-label fw-medium small mb-1">
                Trier par
              </label>
              <select
                id="filter-sort"
                className="form-select custom-select"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value as SortOrder)}
              >
                <option value="alpha-asc">Ordre alphabétique (A-Z)</option>
                <option value="alpha-desc">Ordre alphabétique (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card bg-white rounded-3 border-stone-200 shadow-sm overflow-hidden border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-start align-middle">
              <thead className="bg-stone-50 border-stone-200 text-stone-700">
                <tr>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Nom & Prénom</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Statut de paiement</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium">Email</th>
                  <th className="py-3 px-4 bg-stone-50 border-stone-200 fw-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="border-stone-100">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-stone-400">
                      Chargement…
                    </td>
                  </tr>
                )}

                {!isLoading && error && (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-danger">
                      {error}
                    </td>
                  </tr>
                )}

                {!isLoading && !error && filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-stone-400">
                      Aucun membre ne correspond aux critères sélectionnés.
                    </td>
                  </tr>
                )}

                {!isLoading && !error && filteredMembers.map((member) => <MemberRow key={member.id} member={member} />)}
              </tbody>
            </table>
          </div>

          <div className="p-3 d-flex justify-content-between align-items-center border-top border-stone-200 bg-stone-50">
            <div className="text-stone-500 small">
              {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} affiché
              {filteredMembers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
