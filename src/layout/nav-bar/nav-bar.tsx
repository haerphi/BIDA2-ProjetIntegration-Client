import { UserGroup, type UserGroupEnum } from '../../enums/user-groupe.enum';
import { useAppSelector } from '../../store/hooks';
import { selectGroups, selectIsAdmin } from '../../store/slices/auth.slice';
import { type IconName } from '../../components/common/Icons/custom-icon';
import NavItem from './nav-item';

interface NavItem {
  path?: string;
  label: string;
  icon: IconName;
  roles?: UserGroupEnum[];
  children?: NavItem[];
}

export default function NavBar({ className }: { className?: string }) {
  const groups = useAppSelector(selectGroups);
  const isAdmin = useAppSelector(selectIsAdmin);

  const navItems: NavItem[] = [
    { path: '/courts', label: 'Réservations', icon: 'Calendar2Fill', roles: [UserGroup.PAID_MEMBER] },
    {
      label: 'Administration',
      icon: 'ShieldLockFill',
      roles: [UserGroup.ADMIN],
      children: [
        { path: '/courts/create', label: 'Ajouter un terrain', icon: 'PlusCircle' },
        { path: '/members', label: 'Membres', icon: 'PersonFill' },
        { path: '/contributions', label: 'Cotisations', icon: 'CurrencyDollar' },
      ],
    },
  ];

  const canShowItem = (navItem: NavItem) => {
    return isAdmin || !navItem.roles || !navItem.roles.length || navItem.roles.some((role) => groups.includes(role));
  };

  return (
    <nav className={className}>
      {navItems.filter(canShowItem).map((item) => {
        return (
          <div key={item.label}>
            <NavItem to={item.path} label={item.label} icon={item.icon} />
            {item.children?.filter(canShowItem).map((child) => (
              <NavItem
                key={`${item.label}-${child.label}`}
                to={child.path}
                label={child.label}
                icon={child.icon}
                isChild={true}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
