export interface PaymentBadgeProps {
  paid: boolean;
}

export function PaymentBadge({ paid }: PaymentBadgeProps) {
  return paid ? (
    <span className="badge bg-success bg-opacity-10 text-success border border-success fw-semibold px-2 py-1 fs-6">
      Payé
    </span>
  ) : (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger fw-semibold px-2 py-1 fs-6">
      Non payé
    </span>
  );
}
