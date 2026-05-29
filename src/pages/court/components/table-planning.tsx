import type { Reservation } from '../../../interfaces/court.interface';
import { useAppSelector } from '../../../store/hooks';
import ReserveButton from './reserve-button';
import dayjs, { Dayjs } from 'dayjs';
import Spinner from '../../../components/common/spinner';

export interface PlanningCourt {
  id: number;
  name: string;
  loading: boolean;
  reservations: Reservation[];
}

export type TablePlanningProps = {
  courts: PlanningCourt[];
  selectedDate: Dayjs;
};

const TIME_SLOTS = [
  { label: '08h00', hour: 8 },
  { label: '09h00', hour: 9 },
  { label: '10h00', hour: 10 },
  { label: '11h00', hour: 11 },
  { label: '12h00', hour: 12 },
  { label: '13h00', hour: 13 },
  { label: '14h00', hour: 14 },
  { label: '15h00', hour: 15 },
  { label: '16h00', hour: 16 },
  { label: '17h00', hour: 17 },
  { label: '18h00', hour: 18 },
  { label: '19h00', hour: 19 },
  { label: '20h00', hour: 20 },
  { label: '21h00', hour: 21 },
  { label: '22h00', hour: 22 },
];

const getReservationForSlot = (reservations: Reservation[] | undefined, slotHour: number) => {
  if (!reservations) return null;

  return reservations.find((res) => {
    const start = dayjs(res.date_time);
    const startHour = start.hour();
    const durationHours = Math.ceil(res.duration / 60);

    return slotHour >= startHour && slotHour < startHour + durationHours;
  });
};

export default function TablePlanning({ courts, selectedDate }: TablePlanningProps) {
  const currentUserId = useAppSelector((state) => state.auth.tokenPayload?.user_id);

  return (
    <div className="table-responsive">
      <table className="table table-bordered mb-0 text-center align-middle" style={{ fontSize: '0.875rem' }}>
        <thead className="bg-stone-50 border-stone-200 text-stone-700">
          <tr>
            <th className="py-3 bg-stone-50 border-stone-200 fw-medium" style={{ width: '100px' }}>
              Heure
            </th>
            {courts.map((court) => (
              <th key={court.id} className="py-3 bg-stone-50 border-stone-200 fw-medium">
                {court.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="border-stone-100">
          {TIME_SLOTS.map((slot) => (
            <tr key={slot.label}>
              <td className="bg-stone-50 border-stone-200 fw-medium text-stone-600 py-3">{slot.label}</td>
              {courts.map((court) => {
                if (court.loading) {
                  return (
                    <td key={court.id} className="p-1 border-stone-200" style={{ height: '72px' }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Spinner size="sm" />
                      </div>
                    </td>
                  );
                }

                const res = getReservationForSlot(court.reservations, slot.hour);
                if (res) {
                  const isMyRes = String(res.creator?.id) === String(currentUserId);
                  const isStartHour = dayjs(res.date_time).hour() === slot.hour;

                  if (isMyRes) {
                    return (
                      <td key={court.id} className="p-1 border-stone-200" style={{ height: '72px' }}>
                        <div
                          className="bg-primary text-white rounded h-100 p-2 text-start lh-sm shadow-sm"
                          style={{ fontSize: '11px' }}
                        >
                          {isStartHour ? (
                            <>
                              <strong className="d-block mb-1">Ma réservation</strong>
                              <span className="opacity-90">Par vous ({res.duration} min)</span>
                            </>
                          ) : (
                            <span className="opacity-90">Occupé (Ma rés.)</span>
                          )}
                        </div>
                      </td>
                    );
                  } else {
                    return (
                      <td key={court.id} className="p-1 border-stone-200" style={{ height: '72px' }}>
                        <div
                          className="bg-stone-100 border border-stone-200 text-stone-500 rounded h-100 p-2 text-start lh-sm"
                          style={{ fontSize: '11px' }}
                        >
                          {isStartHour ? (
                            <>
                              <strong className="d-block mb-1 text-stone-700">Réservé</strong>
                              <span className="text-stone-500">
                                {res.creator ? `${res.creator.firstname} ${res.creator.lastname}` : 'Membre'}
                              </span>
                            </>
                          ) : (
                            <span className="text-stone-400">Occupé</span>
                          )}
                        </div>
                      </td>
                    );
                  }
                }

                const today = dayjs();
                const isToday = selectedDate.isSame(today, 'day');
                const isPastHour = isToday && slot.hour < today.hour();
                const isPastDate = selectedDate.isBefore(today, 'day');

                console.log(isPastHour || isPastDate);

                console.log({
                  slotHour: slot.hour,
                  selectedHour: today.hour(),
                  selectedDate: selectedDate.toDate(),
                  courtLoading: court.loading,
                  isPastHour,
                  isPastDate,
                });

                if (isPastHour || isPastDate || court.loading) {
                  return null;
                }

                return (
                  <td key={court.id} className="p-1 border-stone-200 planning-slot" style={{ height: '72px' }}>
                    <ReserveButton courtId={court.id} selectedDate={selectedDate} hour={slot.hour} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
