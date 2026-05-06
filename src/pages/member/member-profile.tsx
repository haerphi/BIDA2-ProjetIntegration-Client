import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { memberService } from '../../api/member.service';
import { contributionService } from '../../api/contribution.service';
import type { Member, MemberUpdateData } from '../../interfaces/member.interface';
import type { ContributionList } from '../../interfaces/contribution.interface';
import { useAppSelector } from '../../store/hooks';
import { selectIsAdmin } from '../../store/slices/auth.slice';
import type { MemberContributionListQueryParams } from '../../interfaces/contribution.interface';
import { ContributionStatus } from '../../enums/contribution.enum';
import {
  Person,
  Envelope,
  Phone,
  GeoAlt,
  CalendarEvent,
  Award,
  Hash,
  ClockHistory,
  PencilSquare,
  XCircle,
  CheckCircle,
  Save,
  ArrowLeft,
  GenderAmbiguous,
  ShieldLock,
} from 'react-bootstrap-icons';
import CustomIcon from '../../components/Common/Icons/custom-icon';
import DebouncedInput from '../../components/form/debounced-input';

const memberSchema = z.object({
  firstname: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de naissance invalide (AAAA-MM-DD)'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Veuillez sélectionner un genre' }),
  street: z.string().min(5, "L'adresse est trop courte"),
  city: z.string().min(2, 'La ville est invalide'),
  postal_code: z.string().min(4, 'Code postal invalide'),
  country: z.string().min(2, 'Le pays est invalide'),
  affiliation_number: z.string().min(1, "Numéro d'affiliation requis"),
  ranking: z.string().min(1, 'Classement requis'),
  role: z.string().min(1, 'Rôle requis'),
  is_active: z.boolean(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useAppSelector(selectIsAdmin);
  const targetId = id || 'me';

  const [member, setMember] = useState<Member | null>(null);
  const [contributions, setContributions] = useState<ContributionList[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contributions pagination and filters
  const [contribParams, setContribParams] = useState<MemberContributionListQueryParams>({
    page: 1,
    limit: 5,
  });
  const [contribPagination, setContribPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [isContribLoading, setIsContribLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const memberData = await memberService.getProfile(targetId);
      setMember(memberData);
      reset({
        firstname: memberData.firstname,
        lastname: memberData.lastname,
        email: memberData.email,
        phone: memberData.phone,
        birth_date: memberData.birth_date,
        gender: memberData.gender as any,
        street: memberData.street,
        city: memberData.city,
        postal_code: memberData.postal_code,
        country: memberData.country,
        affiliation_number: memberData.affiliation_number,
        ranking: memberData.ranking,
        role: memberData.role,
        is_active: memberData.is_active,
      });

      await fetchContributions();
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async (params: MemberContributionListQueryParams = contribParams) => {
    setIsContribLoading(true);
    // Create a copy of params to avoid mutating state
    const cleanParams = { ...params };
    if (cleanParams.year === '' || cleanParams.year === '0' || cleanParams.year === 0) {
      delete cleanParams.year;
    }
    try {
      const response = await contributionService.memberContributions(
        targetId === 'me' ? undefined : Number(targetId),
        cleanParams,
      );
      setContributions(response.data);
      setContribPagination({
        total: response.total,
        totalPages: response.total_pages,
      });
    } catch (err: any) {
      console.error('Error fetching contributions:', err);
    } finally {
      setIsContribLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetId]);

  useEffect(() => {
    if (!loading) {
      fetchContributions();
    }
  }, [contribParams.page, contribParams.limit, contribParams.status, contribParams.year]);

  const handleContribParamChange = (key: keyof MemberContributionListQueryParams, value: any) => {
    setContribParams((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 when filter changes
    }));
  };

  const onSubmit = async (data: MemberFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const updatedMember = await memberService.update(targetId, data as MemberUpdateData);
      setMember(updatedMember);
      setIsEditing(false);
      // Optional: show success toast
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!member && error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          <ArrowLeft className="me-2" /> Retour
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-bottom border-stone-200 px-4 py-3 sticky-top z-3">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h4 mb-0 fw-semibold text-stone-800 d-flex align-items-center">
            <CustomIcon iconName="Person" className="w-50 h-50 me-2 text-primary" />
            Profil de {member?.firstname} {member?.lastname}
          </h2>
          <div className="d-flex gap-2">
            {!isEditing ? (
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setIsEditing(true)}>
                <PencilSquare /> Modifier
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => setIsEditing(false)}
              >
                <XCircle /> Annuler
              </button>
            )}
            {id && (
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => navigate('/members')}
              >
                <ArrowLeft /> Retour
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="row">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {error && <div className="alert alert-danger mb-4">{error}</div>}

              {/* Main Info Card */}
              <div className="card border-0 shadow-sm mb-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center">
                    <Person className="me-2 text-primary" /> Informations Personnelles
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Prénom</label>
                      <input
                        {...register('firstname')}
                        disabled={!isEditing}
                        className={`form-control ${errors.firstname ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.firstname?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Nom</label>
                      <input
                        {...register('lastname')}
                        disabled={!isEditing}
                        className={`form-control ${errors.lastname ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.lastname?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center">
                        <Envelope className="me-2" /> Email
                      </label>
                      <input
                        {...register('email')}
                        disabled={!isEditing || !isAdmin}
                        className={`form-control ${errors.email ? 'is-invalid' : ''} ${!isEditing || !isAdmin ? 'border-0 bg-light' : ''}`}
                        title={!isAdmin ? "Seul un administrateur peut modifier l'email" : ''}
                      />
                      <div className="invalid-feedback">{errors.email?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center">
                        <Phone className="me-2" /> Téléphone
                      </label>
                      <input
                        {...register('phone')}
                        disabled={!isEditing}
                        className={`form-control ${errors.phone ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.phone?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center">
                        <CalendarEvent className="me-2" /> Date de Naissance
                      </label>
                      <input
                        type="date"
                        {...register('birth_date')}
                        disabled={!isEditing}
                        className={`form-control ${errors.birth_date ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.birth_date?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center">
                        <GenderAmbiguous className="me-2" /> Genre
                      </label>
                      <select
                        {...register('gender')}
                        disabled={!isEditing}
                        className={`form-select ${errors.gender ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      >
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="other">Autre</option>
                      </select>
                      <div className="invalid-feedback">{errors.gender?.message}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center">
                    <GeoAlt className="me-2 text-danger" /> Adresse
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold text-uppercase">Rue</label>
                      <input
                        {...register('street')}
                        disabled={!isEditing}
                        className={`form-control ${errors.street ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.street?.message}</div>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label text-muted small fw-bold text-uppercase">Ville</label>
                      <input
                        {...register('city')}
                        disabled={!isEditing}
                        className={`form-control ${errors.city ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.city?.message}</div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Code Postal</label>
                      <input
                        {...register('postal_code')}
                        disabled={!isEditing}
                        className={`form-control ${errors.postal_code ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.postal_code?.message}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold text-uppercase">Pays</label>
                      <input
                        {...register('country')}
                        disabled={!isEditing}
                        className={`form-control ${errors.country ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.country?.message}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional/Club Info */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center">
                    <ShieldLock className="me-2 text-warning" /> Club & Statut
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center">
                        <Hash className="me-2" /> Numéro d'Affiliation
                      </label>
                      <input
                        {...register('affiliation_number')}
                        disabled={!isEditing || !isAdmin}
                        className={`form-control ${errors.affiliation_number ? 'is-invalid' : ''} ${!isEditing || !isAdmin ? 'border-0 bg-light' : ''}`}
                        title={!isAdmin ? 'Seul un administrateur peut modifier ce champ' : ''}
                      />
                      <div className="invalid-feedback">{errors.affiliation_number?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center">
                        <Award className="me-2" /> Classement
                      </label>
                      <input
                        {...register('ranking')}
                        disabled={!isEditing}
                        className={`form-control ${errors.ranking ? 'is-invalid' : ''} ${!isEditing ? 'border-0 bg-light' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.ranking?.message}</div>
                    </div>

                    {/* TODO: show only for admin */}
                    {isAdmin && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label text-muted small fw-bold text-uppercase">Rôle</label>
                          <select
                            {...register('role')}
                            disabled={!isEditing || !isAdmin}
                            className={`form-select ${errors.role ? 'is-invalid' : ''} ${!isEditing || !isAdmin ? 'border-0 bg-light' : ''}`}
                          >
                            <option value="member">Membre</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Administrateur</option>
                          </select>
                          <div className="invalid-feedback">{errors.role?.message}</div>
                        </div>
                        <div className="col-md-6 d-flex align-items-end pb-2">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              role="switch"
                              {...register('is_active')}
                              disabled={!isEditing || !isAdmin}
                              className="form-check-input"
                              id="isActiveSwitch"
                            />
                            <label
                              className="form-check-label fw-bold text-muted small text-uppercase"
                              htmlFor="isActiveSwitch"
                            >
                              Compte Actif
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-5">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-success px-5 py-2 fw-bold d-flex align-items-center gap-2"
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <Save />
                    )}
                    Enregistrer les modifications
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="col-lg-4">
            {/* Summary / Status Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center p-4">
                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                  <Person size={48} className="text-primary" />
                </div>
                <h4 className="fw-bold mb-1">
                  {member?.firstname} {member?.lastname}
                </h4>
                <p className="text-muted small mb-3">{member?.role.toUpperCase()}</p>
                <div className="d-flex justify-content-center gap-2">
                  {member?.is_active ? (
                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                      <CheckCircle /> Actif
                    </span>
                  ) : (
                    <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                      <XCircle /> Inactif
                    </span>
                  )}
                  {member?.contribution_paid ? (
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                      <CheckCircle /> Cotisation OK
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                      <ClockHistory /> Cotisation à payer
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contributions History Card */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold d-flex align-items-center">
                    <ClockHistory className="me-2 text-info" /> Historique
                  </h5>
                  <div className="d-flex gap-2">
                    <DebouncedInput
                      id="year"
                      value={contribParams.year || ''}
                      onChange={(value) => handleContribParamChange('year', Number(value))}
                      debounceMs={300}
                      type="number"
                      className="form-control form-control-sm border-stone-200"
                      placeholder="Année"
                    />
                    <select
                      className="form-select form-select-sm border-stone-200"
                      style={{ width: 'auto' }}
                      value={contribParams.status || ''}
                      onChange={(e) => handleContribParamChange('status', e.target.value || undefined)}
                    >
                      <option value="">Statut</option>
                      <option value={ContributionStatus.COMPLETED}>Payé</option>
                      <option value={ContributionStatus.PENDING}>En attente</option>
                      <option value={ContributionStatus.FAILED}>Échoué</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0 position-relative">
                {isContribLoading && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-1"
                    style={{ minHeight: '100px' }}
                  >
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  </div>
                )}

                {contributions.length === 0 && !isContribLoading ? (
                  <div className="p-4 text-center text-muted italic">Aucun historique de paiement</div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th className="small border-0 px-3">Date</th>
                            <th className="small border-0 px-3">Status</th>
                            <th className="small border-0 text-end px-3">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contributions.map((c) => {
                            let color = 'secondary';
                            let label = c.status;

                            if (c.status === ContributionStatus.COMPLETED) {
                              color = 'success';
                              label = 'Payé';
                            } else if (c.status === ContributionStatus.PENDING) {
                              color = 'warning';
                              label = 'En attente';
                            } else if (c.status === 'failed' || c.status === 'cancelled') {
                              color = 'danger';
                              label = 'Échoué';
                            }

                            return (
                              <tr key={c.id}>
                                <td className="small px-3">{c.created_at.format('DD/MM/YYYY')}</td>
                                <td className="small px-3">
                                  <span className={`badge bg-${color} bg-opacity-10 text-${color}`}>{label}</span>
                                </td>
                                <td className="small text-end fw-bold px-3">{c.amount} €</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-2 border-top bg-stone-50 d-flex justify-content-between align-items-center">
                      <div className="small text-muted px-2">Total: {contribPagination.total}</div>
                      <nav aria-label="Contribution pagination">
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${contribParams.page === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handleContribParamChange('page', (contribParams.page || 1) - 1)}
                            >
                              ‹
                            </button>
                          </li>
                          <li className="page-item active">
                            <span className="page-link">{contribParams.page}</span>
                          </li>
                          <li
                            className={`page-item ${contribParams.page === contribPagination.totalPages ? 'disabled' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handleContribParamChange('page', (contribParams.page || 1) + 1)}
                            >
                              ›
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
