import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { courtService } from '../../api/court.service';
import { useState } from 'react';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import Header from '../../layout/header';

const courtSchema = z.object({
  name: z.string().min(1, 'Le nom du terrain est requis'),
});

type CourtFormValues = z.infer<typeof courtSchema>;

export default function CourtCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourtFormValues>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: CourtFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await courtService.create(data);
      navigate('/courts');
    } catch (err: any) {
      const fieldErrors = err.response?.data?.name;
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        setError(`Erreur : ${fieldErrors[0]}`);
      } else {
        setError(err.response?.data?.detail || 'Une erreur est survenue lors de la création du terrain.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header pageName="Ajout d'un terrain" icon="PlusCircle" />
      <div className="container-fluid py-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            type="button"
            onClick={() => navigate('/courts')}
            className="btn btn-outline-secondary d-flex align-items-center gap-2 hover-bg-stone-50 transition"
          >
            <ArrowLeft /> Retour aux terrains
          </button>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        <div className="card shadow-sm border-0 bg-white rounded-3 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <h5 className="card-title mb-4 border-bottom pb-3 fw-semibold text-stone-800">
              Détails du terrain
            </h5>

            <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-4">
              <div>
                <label className="form-label fw-medium text-stone-700">Nom du terrain</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`form-control custom-input py-2 px-3 ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Ex: Terrain A"
                />
                <div className="invalid-feedback">{errors.name?.message}</div>
                <div className="form-text text-stone-500 mt-1">
                  Saisissez un nom unique pour identifier ce terrain de sport.
                </div>
              </div>

              <div className="pt-3 border-top">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-emerald-600 bg-emerald-600 border-0 w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold shadow-sm transition"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save /> Enregistrer le terrain
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
