import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CalendarCheck, Save } from 'react-bootstrap-icons';

import Header from '../../layout/header';
import { courtService } from '../../api/court.service';
import { memberService } from '../../api/member.service';
import { useAppSelector } from '../../store/hooks';
import { selectIsAdmin } from '../../store/slices/auth.slice';
import MultipleInput, { type Choice } from '../../components/form/multiple-input';
import type { Court } from '../../interfaces/court.interface';
import { BookingType } from '../../enums/booking-type.enum';

const bookingSchema = z.object({
  type: z.enum(BookingType, {
    error: 'Le type de réservation est requis',
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// TODO : MANAGE BLOCAGE_ADMIN

export default function CourtReservePage() {
  const { courtId } = useParams<{ courtId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isAdmin = useAppSelector(selectIsAdmin);
  const currentUserId = useAppSelector((state) => state.auth.tokenPayload?.user_id);

  const [court, setCourt] = useState<Court | null>(null);
  const [memberChoices, setMemberChoices] = useState<Choice[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<Choice[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const defaultHour = parseInt(searchParams.get('hour') || '8', 10);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: BookingType.SIMPLE,
    },
  });

  const selectedType = watch('type');

  // Load court details on mount
  useEffect(() => {
    const loadCourt = async () => {
      try {
        const courtsData = await courtService.getAll();
        const foundCourt = courtsData.find((court) => String(court.id) === courtId);
        if (!foundCourt) {
          navigate('/');
          return;
        }
        setCourt(foundCourt);
      } catch (err) {
        console.error('Erreur lors du chargement des données de réservation', err);
        setError('Impossible de charger le terrain.');
      }
    };
    loadCourt();
  }, [courtId, navigate]);

  // Handle debounced search for partners
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      try {
        const membersData = await memberService.getAll({
          search: memberSearch.trim() !== '' ? memberSearch : undefined,
        });
        // Filter out current user from partners list
        const activePartners = (membersData.data || [])
          .filter((m) => String(m.id) !== String(currentUserId))
          .map((m) => ({
            value: m.id,
            label: `${m.firstname} ${m.lastname}`,
          }));
        setMemberChoices(activePartners);
      } catch (err) {
        console.error('Erreur lors du chargement des membres', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [memberSearch, currentUserId]);

  const onSubmit = async (data: BookingFormValues) => {
    setLoading(true);
    setError(null);

    // Manual partners count validations based on type
    if (data.type === BookingType.SIMPLE) {
      if (selectedPartners.length !== 1) {
        setError('Une réservation simple requiert exactement 1 partenaire.');
        setLoading(false);
        return;
      }
    } else if (data.type === BookingType.DOUBLE) {
      if (selectedPartners.length !== 3) {
        setError('Une réservation double requiert exactement 3 partenaires.');
        setLoading(false);
        return;
      }
    }

    try {
      const date_time = defaultDate + 'T' + defaultHour + ':00';
      const duration = selectedType === BookingType.SIMPLE ? 60 : 120;

      const bookingPayload = {
        type: data.type,
        duration,
        date_time,
        members: data.type === BookingType.BLOCAGE_ADMIN ? [] : selectedPartners.map((p) => p.value as number),
      };

      await courtService.book(Number(courtId), bookingPayload);
      navigate('/courts');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const serverErrors = err.response.data;
        if (serverErrors.members) {
          setError(Array.isArray(serverErrors.members) ? serverErrors.members[0] : serverErrors.members);
        } else if (serverErrors.type) {
          setError(Array.isArray(serverErrors.type) ? serverErrors.type[0] : serverErrors.type);
        } else {
          setError(serverErrors.detail || 'Une erreur est survenue lors de la réservation.');
        }
      } else {
        setError('Une erreur réseau ou serveur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header pageName="Réserver un terrain" icon="CalendarCheck" />
      <div className="container-fluid py-4" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            type="button"
            onClick={() => navigate('/courts')}
            className="btn btn-outline-secondary d-flex align-items-center gap-2 hover-bg-stone-50 transition"
          >
            <ArrowLeft /> Retour au planning
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
            <h5 className="card-title mb-4 border-bottom pb-3 fw-semibold text-stone-800 d-flex align-items-center gap-2">
              <CalendarCheck className="text-emerald-500" /> Formulaire de réservation pour "{court?.name}"
            </h5>

            {/* Reservation Date and Time */}
            <div className="d-flex justify-content-around mt-2">
              <p className="mt-2">
                Date: <span className="fw-semibold">{defaultDate}</span>
              </p>
              <p className="mt-2">
                Heure de début: <span className="fw-semibold">{defaultHour}h</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-4">
              {/* Reservation Type */}
              <div>
                <label className="form-label fw-medium text-stone-700">Type de réservation</label>
                <select
                  {...register('type')}
                  className={`form-select custom-select py-2 px-3 ${errors.type ? 'is-invalid' : ''}`}
                >
                  <option value={BookingType.SIMPLE}>Simple (1h - 1 partenaire)</option>
                  <option value={BookingType.DOUBLE}>Double (2h - 3 partenaires)</option>
                  {isAdmin && <option value={BookingType.BLOCAGE_ADMIN}>Blocage Administratif</option>}
                </select>
                <div className="invalid-feedback">{errors.type?.message}</div>
              </div>

              {/* Duration (Only editable for admin blockages) */}
              {selectedType === BookingType.BLOCAGE_ADMIN && (
                <div>
                  <label className="form-label fw-medium text-stone-700">Durée du blocage</label>
                  <p>TODO</p>
                </div>
              )}

              {/* Partners selection (Hide for admin blocks) */}
              {selectedType !== BookingType.BLOCAGE_ADMIN && (
                <div className="border-top pt-4 mt-2">
                  <label className="form-label fw-semibold text-stone-800 mb-1">Sélection des partenaires</label>
                  <p className="text-stone-500 small mb-3">
                    {selectedType === BookingType.SIMPLE
                      ? 'Sélectionnez exactement 1 partenaire dans la liste pour cette réservation.'
                      : 'Sélectionnez exactement 3 partenaires dans la liste pour cette réservation.'}
                  </p>
                  <MultipleInput
                    choices={memberChoices}
                    onSelected={setSelectedPartners}
                    onSearchChanges={setMemberSearch}
                    max={selectedType === BookingType.SIMPLE ? 1 : 3}
                  />
                </div>
              )}

              <div className="pt-3 border-top">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-emerald-600 bg-emerald-600 border-0 w-100 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-semibold shadow-sm transition"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Réservation en cours...
                    </>
                  ) : (
                    <>
                      <Save /> Confirmer la réservation
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
