import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/explore', label: 'Explore', icon: '📖' },
  { to: '/practice', label: 'Practice', icon: '🎯' },
  { to: '/favourites', label: 'Favourites', icon: '⭐' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
          }
          aria-label={item.label}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
