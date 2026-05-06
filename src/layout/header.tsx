import CustomIcon, { type IconName } from '../components/Common/Icons/custom-icon';

export default function Header({ pageName, icon }: { pageName: string; icon: IconName }) {
  return (
    <header className="bg-white border-bottom border-stone-200 p-4 d-flex justify-content-between align-items-center">
      <h2 className="h4 mb-0 fw-semibold text-stone-800 d-flex align-items-center">
        <CustomIcon iconName={icon} className="w-50 h-50 me-2 text-emerald-600" /> {pageName}
      </h2>
    </header>
  );
}
