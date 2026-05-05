import { UserGroup, type UserGroupEnum } from '../../enums/user-groupe.enum';
import { useAppSelector } from '../../store/hooks';
import { selectGroups, selectIsAdmin } from '../../store/slices/auth.slice';
import { type IconName } from '../../components/Common/Icons/custom-icon';
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
    { path: '/courts', label: 'Réservations', icon: 'Calendar2Fill', roles: [UserGroup.MEMBER] },
    {
      label: 'Administration',
      icon: 'ShieldLockFill',
      roles: [UserGroup.ADMIN],
      children: [
        { path: '/members', label: 'Membres', icon: 'PersonFill' },
        { path: '/contributions', label: 'Contributions', icon: 'CurrencyDollar' },
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
          <>
            <NavItem to={item.path} label={item.label} icon={item.icon} />
            {item.children?.filter(canShowItem).map((child) => (
              <NavItem to={child.path} label={child.label} icon={child.icon} isChild={true} />
            ))}
          </>
        );
      })}
    </nav>
  );
}
