import { NavLink } from 'react-router-dom';
import CustomIcon, { type IconName } from '../../components/common/Icons/custom-icon';

interface NavItemProps {
  to?: string;
  label: string;
  icon: IconName;
  isChild?: boolean;
}

export default function NavItem({ to, label, icon, isChild = false }: NavItemProps) {
  if (!to) {
    return (
      <p className={`nav-item d-flex align-items-center mb-0 ${isChild ? 'ms-3' : ''}`}>
        <CustomIcon iconName={icon} className="me-1" />
        <span>{label}</span>
      </p>
    );
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item d-flex align-items-center ${
          isActive ? 'text-white bg-emerald-800 border-end border-4 border-emerald-400' : 'text-decoration-none'
        } ${isChild ? 'ms-3' : ''}`
      }
      style={({ isActive }) => (!isActive ? { color: '#d1fae5', transition: '0.2s' } : {})}
    >
      <CustomIcon iconName={icon} className="me-1" />
      <span>{label}</span>
    </NavLink>
  );
}
