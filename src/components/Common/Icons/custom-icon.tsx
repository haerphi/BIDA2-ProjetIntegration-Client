import * as icons from 'react-bootstrap-icons';

const localIcons = ['tennis-ball', 'court'] as const;

export type IconName = keyof typeof icons | (typeof localIcons)[number];

interface IconProps extends icons.IconProps {
  iconName: IconName;
}

export default function CustomIcon({ iconName, ...props }: IconProps) {
  if (localIcons.includes(iconName as (typeof localIcons)[number])) {
    return <img src={`/icons/${iconName}.svg`} alt={iconName} className={props.className} />;
  }
  const BootstrapIcon = icons[iconName as keyof typeof icons];
  return <BootstrapIcon {...props} />;
}
