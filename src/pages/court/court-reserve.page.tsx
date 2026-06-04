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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const bookingSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  hour: z.number().min(8, "L'heure doit être entre 8 et 22").max(22, "L'heure doit être entre 8 et 22"),
  type: z.enum(BookingType, {
    error: 'Le type de réservation est requis',
  }),
  comment: z.string().optional(),
  duration: z.number().positive('La date/heure de fin doit être après la date/heure de début'),

  // ONLY FOR ADMIN BLOCKAGE
  endDate: z.string().optional(),
  endHour: z.number().optional(),
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
    formState: { errors, isValid },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
    defaultValues: {
      type: BookingType.SIMPLE,
      date: defaultDate,
      hour: defaultHour,
      duration: 1,
      endDate: defaultDate,
      endHour: defaultHour < 23 ? defaultHour + 1 : 23,
    },
  });

  const selectedType = watch('type');

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      try {
        const membersData = await memberService.getAll({
          search: memberSearch.trim() !== '' ? memberSearch : undefined,
        });
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

  const watchDate = watch('date');
  const watchHour = watch('hour');
  const watchEndDate = watch('endDate');
  const watchEndHour = watch('endHour');

  useEffect(() => {
    if (!selectedType) return;
    setSelectedPartners([]);
    if (selectedType !== BookingType.BLOCAGE_ADMIN) {
      setValue('date', defaultDate);
      setValue('hour', defaultHour);
    } else {
      // Prefill end date and hour for blocage admin if not already set
      if (!watch('endDate')) {
        setValue('endDate', defaultDate);
      }
      if (watch('endHour') === undefined) {
        setValue('endHour', defaultHour < 23 ? defaultHour + 1 : 23);
      }
    }
    if (selectedType === BookingType.SIMPLE) {
      setValue('duration', 1);
    } else if (selectedType === BookingType.DOUBLE) {
      setValue('duration', 2);
    }
  }, [selectedType, defaultDate, defaultHour, setValue]);

  useEffect(() => {
    if (selectedType === BookingType.BLOCAGE_ADMIN) {
      const computeDuration = (
        startDateStr: string | undefined,
        startHourNum: number | undefined,
        endDateStr: string | undefined,
        endHourNum: number | undefined,
      ): number => {
        if (
          !startDateStr ||
          startHourNum === undefined ||
          isNaN(startHourNum) ||
          !endDateStr ||
          endHourNum === undefined ||
          isNaN(endHourNum)
        ) {
          return 0;
        }
        const start = dayjs(startDateStr).hour(startHourNum).minute(0).second(0).millisecond(0);
        const end = dayjs(endDateStr).hour(endHourNum).minute(0).second(0).millisecond(0);
        if (!start.isValid() || !end.isValid()) {
          return 0;
        }
        const diff = end.diff(start, 'minute');
        return diff > 0 ? diff : 0;
      };

      const diff = computeDuration(watchDate, watchHour, watchEndDate, watchEndHour);
      setValue('duration', diff, { shouldValidate: true });
    }
  }, [selectedType, watchDate, watchHour, watchEndDate, watchEndHour, setValue]);

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const onSubmit = async (data: BookingFormValues) => {
    setLoading(true);
    setError(null);

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
      const date_time = dayjs(data.date)
        .set('hour', Number(data.hour))
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0);
      const duration =
        selectedType === BookingType.BLOCAGE_ADMIN ? data.duration : selectedType === BookingType.SIMPLE ? 60 : 120;

      const bookingPayload = {
        type: data.type,
        duration,
        date_time: date_time.toISOString(),
        members: data.type === BookingType.BLOCAGE_ADMIN ? [] : selectedPartners.map((p) => p.value as number),
        comment: data.type === BookingType.BLOCAGE_ADMIN ? data.comment : undefined,
      };

      await courtService.book(Number(courtId), bookingPayload);
      navigate('/courts?date=' + data.date);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const serverErrors = err.response.data;
        if (serverErrors.members) {
          setError(Array.isArray(serverErrors.members) ? serverErrors.members[0] : serverErrors.members);
        } else if (serverErrors.type) {
          setError(Array.isArray(serverErrors.type) ? serverErrors.type[0] : serverErrors.type);
        } else if (serverErrors.date_time) {
          setError(Array.isArray(serverErrors.date_time) ? serverErrors.date_time[0] : serverErrors.date_time);
        } else if (serverErrors.non_field_errors) {
          setError(Array.isArray(serverErrors.non_field_errors) ? serverErrors.non_field_errors[0] : serverErrors.non_field_errors);
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
            onClick={() => navigate('/courts?date=' + defaultDate)}
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

            <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-4">
              <div>
                <label className="form-label fw-medium text-stone-700">Type de réservation</label>
                <select
                  {...register('type')}
                  className={`form-select custom-select py-2 px-3 ${errors.type ? 'is-invalid' : ''}`}
                >
                  <option value={BookingType.SIMPLE}>Simple (1h - 1 partenaire)</option>
                  <option value={BookingType.DOUBLE} disabled={defaultHour === 22}>
                    Double (2h - 3 partenaires){defaultHour === 22 ? ' - trop tard pour un match double' : ''}
                  </option>
                  {isAdmin && <option value={BookingType.BLOCAGE_ADMIN}>Blocage Administratif</option>}
                </select>
                <div className="invalid-feedback">{errors.type?.message}</div>
              </div>

              <div className="row g-3">
                <div className={selectedType === BookingType.BLOCAGE_ADMIN ? 'col-md-6' : 'col-6'}>
                  <label className="form-label fw-medium text-stone-700">
                    {selectedType === BookingType.BLOCAGE_ADMIN ? 'Date de début' : 'Date'}
                  </label>
                  <input
                    type="date"
                    className={`form-control custom-input ${errors.date ? 'is-invalid' : ''}`}
                    {...register('date')}
                    disabled={selectedType !== BookingType.BLOCAGE_ADMIN}
                  />
                  <div className="invalid-feedback">{errors.date?.message}</div>
                </div>
                <div className={selectedType === BookingType.BLOCAGE_ADMIN ? 'col-md-6' : 'col-6'}>
                  <label className="form-label fw-medium text-stone-700">
                    {selectedType === BookingType.BLOCAGE_ADMIN ? 'Heure de début' : 'Heure'}
                  </label>
                  <input
                    type="number"
                    className={`form-control custom-input ${errors.hour ? 'is-invalid' : ''}`}
                    min={8}
                    max={22}
                    {...register('hour', { valueAsNumber: true })}
                    disabled={selectedType !== BookingType.BLOCAGE_ADMIN}
                  />
                  <div className="invalid-feedback">{errors.hour?.message}</div>
                </div>

                {selectedType === BookingType.BLOCAGE_ADMIN && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-stone-700">Date de fin</label>
                      <input
                        type="date"
                        className={`form-control custom-input ${errors.endDate ? 'is-invalid' : ''}`}
                        {...register('endDate')}
                      />
                      <div className="invalid-feedback">{errors.endDate?.message}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-stone-700">Heure de fin</label>
                      <input
                        type="number"
                        className={`form-control custom-input ${errors.endHour ? 'is-invalid' : ''}`}
                        min={8}
                        max={23}
                        {...register('endHour', { valueAsNumber: true })}
                      />
                      <div className="invalid-feedback">{errors.endHour?.message}</div>
                    </div>

                    <div className="col-12 mt-3">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-3 d-flex justify-content-between align-items-center">
                        <span className="fw-medium text-stone-700">Durée du blocage:</span>
                        <span className="badge bg-emerald-600 px-3 py-2 fs-6">
                          {watch('duration') ? `${formatDuration(watch('duration'))}` : 'Non défini'}
                        </span>
                      </div>
                      <input type="hidden" {...register('duration', { valueAsNumber: true })} />
                      {errors.duration && <div className="text-danger small mt-1">{errors.duration.message}</div>}
                    </div>
                  </>
                )}
              </div>

              {selectedType === BookingType.BLOCAGE_ADMIN && (
                <div>
                  <label className="form-label fw-medium text-stone-700">Commentaire / Motif du blocage</label>
                  <textarea
                    {...register('comment')}
                    placeholder="Ex: Travaux d'entretien, tournoi interne, court indisponible..."
                    className="form-control py-2 px-3 shadow-sm border-stone-200 focus-emerald"
                    rows={3}
                  />
                </div>
              )}

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
                  disabled={
                    loading ||
                    !isValid ||
                    (selectedType !== BookingType.BLOCAGE_ADMIN &&
                      selectedPartners.length !== (selectedType === BookingType.SIMPLE ? 1 : 3))
                  }
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
