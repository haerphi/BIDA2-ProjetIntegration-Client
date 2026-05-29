import { useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';

export interface ReserveButtonProps {
  courtId: number;
  selectedDate: Dayjs;
  hour: number;
}

export default function ReserveButton({ courtId, selectedDate, hour }: ReserveButtonProps) {
  const navigate = useNavigate();

  const handleBookingRedirect = () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    navigate(`/courts/${courtId}/reserve?date=${dateStr}&hour=${hour}`);
  };

  return (
    <div
      className="border border-2 border-emerald-400 bg-emerald-50 text-emerald-600 fw-medium rounded h-100 d-flex align-items-center justify-content-center hover-bg-emerald-50 transition planning-reserve-btn"
      style={{ cursor: 'pointer', borderStyle: 'dashed !important' }}
      onClick={handleBookingRedirect}
    >
      Réserver
    </div>
  );
}
