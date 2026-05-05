import CustomIcon from '../../../components/Common/Icons/custom-icon';

export default function ContributionHeader() {
  return (
    <header className="bg-white border-bottom border-stone-200 px-4 py-3 d-flex justify-content-between align-items-center">
      <h2 className="h4 mb-0 fw-semibold text-stone-800 d-flex align-items-center">
        <CustomIcon iconName="CreditCard" className="w-50 h-50 me-2 text-emerald-600" /> Cotisation
      </h2>
    </header>
  );
}
