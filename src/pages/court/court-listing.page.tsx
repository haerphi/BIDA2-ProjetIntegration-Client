import Header from '../../layout/header';
import { useEffect, useState } from 'react';
import { courtService } from '../../api/court.service';
import MultipleInput from '../../components/form/multiple-input';
import TablePlanning, { type PlanningCourt } from './components/table-planning';
import type { Court } from '../../interfaces/court.interface';
import type { Choice } from '../../components/form/multiple-input';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CourtListingPage() {
  const [courts, setCourts] = useState<Court[]>([]); // all the courts
  const [courtChoices, setCourtChoices] = useState<Choice[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<Choice[]>([]); // multiple select input
  const [tablPlanningCourt, setTablPlanningCourt] = useState<PlanningCourt[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

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

    const dateStr = formatDate(currentDate);

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
  }, [courts, selectedCourts, currentDate]);

  return (
    <>
      <Header pageName="Planning" icon="Calendar2Fill" />

      <div className="card bg-white rounded-3 border-stone-200 m-4 shadow-sm overflow-hidden border-0">
        <div className="bg-stone-50 p-3 border-bottom border-stone-200 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-sm btn-outline-secondary bg-white border-stone-300 hover-bg-stone-50 transition"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd'hui
            </button>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary bg-white border-stone-300 hover-bg-stone-50 transition"
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() - 1);
                  setCurrentDate(d);
                }}
              >
                &lt;
              </button>
              <button
                className="btn btn-sm btn-outline-secondary bg-white border-stone-300 hover-bg-stone-50 transition"
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() + 1);
                  setCurrentDate(d);
                }}
              >
                &gt;
              </button>
            </div>
            <span className="ms-2 text-stone-600 fw-medium small">
              {currentDate.toLocaleDateString('fr-FR', {
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

        <TablePlanning courts={tablPlanningCourt} />
      </div>
    </>
  );
}
