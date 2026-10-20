import { NavLink } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, TargetIcon, StarIcon, SettingsIcon } from './Icons';
import './BottomNav.css';

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/explore', label: 'Explore', icon: BookOpenIcon },
  { to: '/practice', label: 'Practice', icon: TargetIcon },
  { to: '/favourites', label: 'Favourites', icon: StarIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
            }
            aria-label={item.label}
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              <IconComponent size={20} />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
