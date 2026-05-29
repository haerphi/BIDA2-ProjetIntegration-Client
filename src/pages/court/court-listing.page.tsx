import Header from '../../layout/header';
import { useEffect, useState } from 'react';
import { courtService } from '../../api/court.service';
import MultipleInput from '../../components/form/multiple-input';
import TablePlanning, { type PlanningCourt } from './components/table-planning';
import type { Court } from '../../interfaces/court.interface';
import type { Choice } from '../../components/form/multiple-input';
import dayjs, { Dayjs } from 'dayjs';

const formatDate = (date: Dayjs) => {
  return date.format('YYYY-MM-DD');
};

export default function CourtListingPage() {
  const [courts, setCourts] = useState<Court[]>([]); // all the courts
  const [courtChoices, setCourtChoices] = useState<Choice[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<Choice[]>([]); // multiple select input
  const [tablPlanningCourt, setTablPlanningCourt] = useState<PlanningCourt[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const fetchCourts = async () => {
      const courtsData = await courtService.getAll();
      setCourts(courtsData);
      setCourtChoices(
        courtsData
          .filter((_, index) => index < 4)
          .map((court) => ({
            value: court.id,
            label: court.name,
          })),
      );
    };
    fetchCourts();
  }, []);

  useEffect(() => {
    const filtered = courts.filter((court) => {
      if (selectedCourts.length === 0) return true;
      return selectedCourts.some((sc) => sc.value === court.id);
    });

    const dateStr = formatDate(selectedDate);

    // Set initial loading states
    const initialPlanning: PlanningCourt[] = filtered.map((court) => ({
      id: court.id,
      name: court.name,
      loading: true,
      reservations: [],
    }));
    setTablPlanningCourt(initialPlanning);

    // Fetch reservations for each court
    filtered.forEach((court) => {
      courtService
        .getReservationForCourt(court.id, dateStr)
        .then((reservations) => {
          setTablPlanningCourt((prev) =>
            prev.map((item) => (item.id === court.id ? { ...item, loading: false, reservations } : item)),
          );
        })
        .catch((err) => {
          console.error(`Failed to fetch reservations for court ${court.id}:`, err);
          setTablPlanningCourt((prev) =>
            prev.map((item) => (item.id === court.id ? { ...item, loading: false } : item)),
          );
        });
    });
  }, [courts, selectedCourts, selectedDate]);

  return (
    <>
      <Header pageName="Planning" icon="Calendar2Fill" />

      <div className="card bg-white rounded-3 border-stone-200 m-4 shadow-sm overflow-hidden border-0">
        <div className="bg-stone-50 p-3 border-bottom border-stone-200 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-sm btn-outline-secondary bg-white border-stone-300 hover-bg-stone-50 transition"
              onClick={() => setSelectedDate(dayjs())}
            >
              Aujourd'hui
            </button>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary bg-white border-stone-300 hover-bg-stone-50 transition"
                onClick={() => {
                  setSelectedDate(selectedDate.subtract(1, 'day'));
                }}
              >
                &lt;
              </button>
              <button
                className="btn btn-sm btn-outline-secondary bg-white border-stone-300 hover-bg-stone-50 transition"
                onClick={() => {
                  setSelectedDate(selectedDate.add(1, 'day'));
                }}
              >
                &gt;
              </button>
            </div>
            <span className="ms-2 text-stone-600 fw-medium small">
              {selectedDate.toDate().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="d-flex gap-3 small text-stone-700">
            <span className="d-flex align-items-center gap-1">
              <i className="text-emerald-500" style={{ fontStyle: 'normal' }}>
                ●
              </i>{' '}
              Libre
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="text-primary" style={{ fontStyle: 'normal' }}>
                ●
              </i>{' '}
              Ma réservation
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="text-stone-500" style={{ fontStyle: 'normal' }}>
                ●
              </i>{' '}
              Réservé
            </span>
          </div>
        </div>

        <div className="p-3 bg-stone-50 border-bottom border-stone-200">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label small fw-semibold text-stone-700 mb-2">Filtrer par terrain</label>
              <MultipleInput choices={courtChoices} onSelected={setSelectedCourts} />
            </div>
          </div>
        </div>

        {courts.length === 0 && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <span className="text-stone-600 small">Aucun terrain disponible</span>
          </div>
        )}

        {courts.length > 0 && <TablePlanning courts={tablPlanningCourt} selectedDate={selectedDate} />}
      </div>
    </>
  );
}
