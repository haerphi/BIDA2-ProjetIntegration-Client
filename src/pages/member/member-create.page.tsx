import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../../api/member.service';
import type { MemberCreateData } from '../../interfaces/member.interface';
import { useState } from 'react';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import CustomIcon from '../../components/Common/Icons/custom-icon';

const memberSchema = z.object({
  firstname: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.email('Email invalide'),
  phone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de naissance invalide (AAAA-MM-DD)'),
  gender: z.enum(['male', 'female', 'other'], {
    error: 'Veuillez sélectionner un genre',
  }),
  street: z.string().min(5, "L'adresse est trop courte"),
  city: z.string().min(2, 'La ville est invalide'),
  postal_code: z.string().min(4, 'Code postal invalide'),
  country: z.string().min(2, 'Le pays est invalide'),
  affiliation_number: z.string().min(1, "Numéro d'affiliation requis"),
  ranking: z.string().min(1, 'Classement requis'),
  role: z.string().min(1, 'Rôle requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MemberCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      birth_date: '',
      street: '',
      city: '',
      postal_code: '',
      country: '',
      affiliation_number: '',
      ranking: '',
      role: '',
      password: '',
    },
  });

  const onSubmit = async (data: MemberFormValues) => {
    setLoading(true);
    setError(null);
    try {
      // Nettoyage du mot de passe si vide
      const submitData = { ...data };

      await memberService.create(submitData as MemberCreateData);
      navigate('/members');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de la création du membre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {' '}
      <header className="bg-white border-bottom border-stone-200 px-4 py-3">
        <h2 className="h4 mb-1 fw-semibold text-stone-800">
          <CustomIcon iconName="PersonAdd" className="w-50 h-50 me-2 text-emerald-600" />
          Ajouter un membre
        </h2>
      </header>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h3 mb-1 fw-bold text-dark">Nouveau Membre</h2>
            <p className="text-muted small mb-0">Remplissez les informations pour inscrire un nouveau membre.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
          >
            <ArrowLeft /> Retour
          </button>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="row g-4">
          {/* Informations Personnelles */}
          <div className="p-4 d-flex flex-column gap-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4 border-bottom pb-2">Informations Personnelles</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Prénom</label>
                    <input
                      {...register('firstname')}
                      className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                      placeholder="Jean"
                    />
                    <div className="invalid-feedback">{errors.firstname?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Nom</label>
                    <input
                      {...register('lastname')}
                      className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                      placeholder="Dupont"
                    />
                    <div className="invalid-feedback">{errors.lastname?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="jean.dupont@example.com"
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Téléphone</label>
                    <input
                      {...register('phone')}
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="06 12 34 56 78"
                    />
                    <div className="invalid-feedback">{errors.phone?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Date de naissance</label>
                    <input
                      type="date"
                      {...register('birth_date')}
                      className={`form-control ${errors.birth_date ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.birth_date?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Genre</label>
                    <select {...register('gender')} className={`form-select ${errors.gender ? 'is-invalid' : ''}`}>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                    <div className="invalid-feedback">{errors.gender?.message}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4 border-bottom pb-2">Adresse</h5>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">Rue</label>
                    <input
                      {...register('street')}
                      className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                      placeholder="123 rue de la Paix"
                    />
                    <div className="invalid-feedback">{errors.street?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Ville</label>
                    <input
                      {...register('city')}
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      placeholder="Paris"
                    />
                    <div className="invalid-feedback">{errors.city?.message}</div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-medium">Code Postal</label>
                    <input
                      {...register('postal_code')}
                      className={`form-control ${errors.postal_code ? 'is-invalid' : ''}`}
                      placeholder="75000"
                    />
                    <div className="invalid-feedback">{errors.postal_code?.message}</div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-medium">Pays</label>
                    <input
                      {...register('country')}
                      className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                      placeholder="France"
                    />
                    <div className="invalid-feedback">{errors.country?.message}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4 border-bottom pb-2">Club & Sécurité</h5>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">Numéro d'affiliation</label>
                    <input
                      {...register('affiliation_number')}
                      className={`form-control ${errors.affiliation_number ? 'is-invalid' : ''}`}
                      placeholder="AFF-2024-001"
                    />
                    <div className="invalid-feedback">{errors.affiliation_number?.message}</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Classement / Ranking</label>
                    <input
                      {...register('ranking')}
                      className={`form-control ${errors.ranking ? 'is-invalid' : ''}`}
                      placeholder="15/1"
                    />
                    <div className="invalid-feedback">{errors.ranking?.message}</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Rôle</label>
                    <select {...register('role')} className={`form-select ${errors.role ? 'is-invalid' : ''}`}>
                      <option value="member">Membre</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <div className="invalid-feedback">{errors.role?.message}</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Mot de passe (optionnel)</label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="••••••••"
                    />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </div>
                </div>

                <div className="pt-4 border-top">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Création...
                      </>
                    ) : (
                      <>
                        <Save /> Enregistrer le membre
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
