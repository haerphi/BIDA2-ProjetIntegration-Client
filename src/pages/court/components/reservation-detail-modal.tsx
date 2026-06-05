import { useState } from 'react';
import { XLg, CalendarCheck, ClockHistory, People, ChatLeft, ExclamationTriangle } from 'react-bootstrap-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { Reservation } from '../../../interfaces/court.interface';
import { courtService } from '../../../api/court.service';
import { BookingType } from '../../../enums/booking-type.enum';

dayjs.extend(utc);

interface ReservationDetailModalProps {
  reservation: Reservation;
  courtName: string;
  currentUserId: string | undefined;
  isAdmin: boolean;
  onClose: () => void;
  onCancelled: (reservationId: number) => void;
}

function canCancel(reservation: Reservation): boolean {
  const start = dayjs.utc(reservation.date_time);
  const now = dayjs.utc();

  return start.diff(now, 'hour', true) >= 24;
}

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple (1h)',
  double: 'Double (2h)',
  blocage_admin: 'Blocage administratif',
};

export default function ReservationDetailModal({
  reservation,
  courtName,
  currentUserId,
  isAdmin,
  onClose,
  onCancelled,
}: ReservationDetailModalProps) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isMyReservation = currentUserId !== undefined && String(reservation.creator?.id) === String(currentUserId);
  const showCancelButton = (isMyReservation && canCancel(reservation)) || isAdmin;

  const isBlocage = reservation.type === BookingType.BLOCAGE_ADMIN;

  const startTime = dayjs.utc(reservation.date_time);
  const endTime = startTime.add(reservation.duration, 'minute');

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await courtService.cancelReservation(reservation.court, reservation.id);
      onCancelled(reservation.id);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.response?.data?.detail || "Une erreur est survenue lors de l'annulation.";
      setError(msg);
      setCancelling(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded-3 shadow-lg overflow-hidden"
        style={{ zIndex: 1051, width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 d-flex justify-content-between align-items-center ${
            isBlocage ? 'bg-rose-600' : isMyReservation ? 'bg-primary' : 'bg-stone-700'
          } text-white`}
        >
          <div className="d-flex align-items-center gap-2 fw-semibold">
            <CalendarCheck />
            <span>
              {isBlocage ? 'Blocage Administratif' : isMyReservation ? 'Ma réservation' : 'Réservation'} — {courtName}
            </span>
          </div>
          <button className="btn btn-sm" onClick={onClose} aria-label="Fermer">
            <XLg size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 d-flex flex-column gap-3">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0">
              <ExclamationTriangle />
              {error}
            </div>
          )}

          {/* Date & Heure */}
          <div className="d-flex align-items-start gap-3">
            <ClockHistory className="text-stone-500 mt-1 flex-shrink-0" size={18} />
            <div>
              <div className="fw-semibold text-stone-800">{startTime.format('dddd D MMMM YYYY')}</div>
              <div className="text-stone-600 small">
                {startTime.format('HH:mm')} → {endTime.format('HH:mm')}
                <span className="ms-2 text-stone-400">({reservation.duration} min)</span>
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="d-flex align-items-center gap-3">
            <CalendarCheck className="text-stone-500 flex-shrink-0" size={18} />
            <span className="text-stone-700">
              Type : <span className="fw-semibold">{TYPE_LABELS[reservation.type] ?? reservation.type}</span>
            </span>
          </div>

          {/* Créateur */}
          {reservation.creator && (
            <div className="d-flex align-items-start gap-3">
              <People className="text-stone-500 mt-1 flex-shrink-0" size={18} />
              <div>
                <div className="text-stone-700 fw-semibold mb-1">Créé par</div>
                <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-pill px-2 py-1 small">
                  {reservation.creator.firstname} {reservation.creator.lastname}
                </span>
              </div>
            </div>
          )}

          {/* Joueurs */}
          {!isBlocage && reservation.players && reservation.players.length > 0 && (
            <div className="d-flex align-items-start gap-3">
              <People className="text-stone-500 mt-1 flex-shrink-0" size={18} />
              <div>
                <div className="text-stone-700 fw-semibold mb-1">Joueurs</div>
                <div className="d-flex flex-wrap gap-1">
                  {reservation.players.map((p) => (
                    <span
                      key={p.id}
                      className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-pill px-2 py-1 small"
                    >
                      {p.firstname} {p.lastname}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Commentaire (blocage admin) */}
          {isBlocage && reservation.comment && (
            <div className="d-flex align-items-start gap-3">
              <ChatLeft className="text-stone-500 mt-1 flex-shrink-0" size={18} />
              <div>
                <div className="text-stone-700 fw-semibold mb-1">Motif</div>
                <p className="text-stone-600 small mb-0 bg-rose-50 border border-rose-200 rounded p-2">
                  {reservation.comment}
                </p>
              </div>
            </div>
          )}

          {/* Message si annulation impossible (ne pas afficher si on est admin) */}
          {!showCancelButton && (
            <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-0 small">
              <ExclamationTriangle />
              L'annulation n'est plus possible (moins de 24h avant le début).
            </div>
          )}
        </div>

        {/* Footer */}
        {showCancelButton && (
          <div className="px-4 pb-4">
            {!confirmCancel ? (
              <button
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                onClick={() => setConfirmCancel(true)}
              >
                <XLg /> Annuler cette réservation
              </button>
            ) : (
              <div className="d-flex flex-column gap-2">
                <p className="text-danger small text-center mb-1 fw-semibold">
                  Confirmer l'annulation de cette réservation ?
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary flex-fill"
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelling}
                  >
                    Retour
                  </button>
                  <button
                    className="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? <span className="spinner-border spinner-border-sm" role="status" /> : <XLg />}
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
