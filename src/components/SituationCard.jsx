import { useNavigate } from 'react-router-dom';
import { SituationIcon, ArrowRightIcon } from './Icons';
import './SituationCard.css';

/**
 * A clickable card representing a real-life situation category.
 *
 * @param {object} props
 * @param {object} props.situation - Situation data object
 * @param {string} props.situation.id
 * @param {string} props.situation.title
 * @param {string} props.situation.titleKannada
 * @param {string} props.situation.description
 * @param {string} props.situation.color
 */
export default function SituationCard({ situation }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/situation/${situation.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="situation-card card card-interactive"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${situation.title} — ${situation.description}`}
      style={{ '--card-accent': situation.color }}
    >
      <div className="situation-card-icon" aria-hidden="true">
        <SituationIcon situationId={situation.id} size={22} />
      </div>
      <div className="situation-card-content">
        <div className="situation-card-header-row">
          <h3 className="situation-card-title">{situation.title}</h3>
          <span className="situation-card-kannada kannada-text">
            {situation.titleKannada}
          </span>
        </div>
        <p className="situation-card-description">{situation.description}</p>
      </div>
      <div className="situation-card-arrow" aria-hidden="true">
        <ArrowRightIcon size={18} />
      </div>
    </div>
  );
}
