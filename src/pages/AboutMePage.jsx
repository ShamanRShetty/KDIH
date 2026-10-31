import { useState, useEffect } from 'react';
import {
  NEWCOMER_STATEMENT,
  SPEAK_SLOWLY_STATEMENT,
  LANGUAGE_OPTIONS,
  ALLERGIES_LIST,
  BLOOD_GROUPS,
  getBloodGroupStatement,
  getNameStatement,
  getEmergencyContactStatement,
} from '../data/aboutMeOptions';
import AboutMeModal from '../components/AboutMeModal';
import { EyeIcon, LockIcon } from '../components/Icons';
import './AboutMePage.css';

const STORAGE_KEY = 'nammasahaaya_aboutme';

const DEFAULT_STATE = {
  isNewcomer: true,
  speakSlowly: true,
  preferredLanguage: 'en', // 'en' | 'hi' | 'ta' | 'te' | null
  allergies: [], // array of allergy ids
  bloodGroup: '', // e.g. 'O+'
  firstName: '',
  emergencyName: '',
  emergencyPhone: '',
};

function loadStoredAboutMe() {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_STATE;
}

export default function AboutMePage() {
  const [formData, setFormData] = useState(loadStoredAboutMe);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Synchronize state strictly to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  const handleToggleAllergy = (allergyId) => {
    setFormData((prev) => {
      const current = prev.allergies || [];
      const updated = current.includes(allergyId)
        ? current.filter((id) => id !== allergyId)
        : [...current, allergyId];
      return { ...prev, allergies: updated };
    });
  };

  const handlePhoneChange = (e) => {
    // Digits only
    const digits = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, emergencyPhone: digits }));
  };

  const handleDeleteData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setFormData(DEFAULT_STATE);
    setShowDeleteConfirm(false);
  };

  // Compile display lines based only on filled/selected fields
  const getCompiledLines = () => {
    const lines = [];

    // 1. Name (if provided)
    if (formData.firstName && formData.firstName.trim()) {
      const nameStmt = getNameStatement(formData.firstName);
      if (nameStmt) lines.push({ id: 'name', ...nameStmt });
    }

    // 2. Newcomer statement
    if (formData.isNewcomer) {
      lines.push({ id: 'newcomer', ...NEWCOMER_STATEMENT });
    }

    // 3. Speak slowly statement
    if (formData.speakSlowly) {
      lines.push({ id: 'slow', ...SPEAK_SLOWLY_STATEMENT });
    }

    // 4. Preferred language
    if (formData.preferredLanguage) {
      const langMatch = LANGUAGE_OPTIONS.find((l) => l.id === formData.preferredLanguage);
      if (langMatch) {
        lines.push({
          id: `lang-${langMatch.id}`,
          kannada: langMatch.kannada,
          transliteration: langMatch.transliteration,
          english: langMatch.english,
        });
      }
    }

    // 5. Blood group
    if (formData.bloodGroup) {
      const bgStmt = getBloodGroupStatement(formData.bloodGroup);
      if (bgStmt) lines.push({ id: 'blood-group', ...bgStmt });
    }

    // 6. Allergies
    if (formData.allergies && formData.allergies.length > 0) {
      formData.allergies.forEach((allergyId) => {
        const item = ALLERGIES_LIST.find((a) => a.id === allergyId);
        if (item) {
          lines.push({
            id: `allergy-${item.id}`,
            kannada: item.kannada,
            transliteration: item.transliteration,
            english: item.english,
          });
        }
      });
    }

    // 7. Emergency Contact
    if (formData.emergencyPhone && formData.emergencyPhone.trim()) {
      const emStmt = getEmergencyContactStatement(formData.emergencyName, formData.emergencyPhone);
      if (emStmt) lines.push({ id: 'emergency-contact', ...emStmt });
    }

    return lines;
  };

  const compiledLines = getCompiledLines();

  return (
    <main className="page aboutme-page">
      <div className="container">
        <header className="aboutme-header">
          <h1 className="aboutme-title">Personal "About Me" Card</h1>
          <p className="aboutme-description">
            Show your vital details, communication preferences, and allergies in large Kannada
            to clinic staff, shopkeepers, or transport conductors when you cannot speak the language.
          </p>
          <div className="aboutme-privacy-badge">
            <LockIcon size={14} />
            <span>Saved only on this phone. Never uploaded or shared.</span>
          </div>
        </header>

        {/* 1. Identity & Name */}
        <section className="aboutme-form-section" aria-labelledby="section-name">
          <h2 id="section-name" className="aboutme-section-title">Your Details</h2>
          <p className="aboutme-section-desc">Shown as a simple greeting statement.</p>

          <div className="aboutme-input-group">
            <label htmlFor="first-name-input" className="aboutme-input-label">
              First Name (Optional)
            </label>
            <input
              id="first-name-input"
              type="text"
              className="aboutme-input"
              placeholder="e.g. Rahul, Priya, Alex"
              value={formData.firstName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              maxLength={40}
            />
          </div>
        </section>

        {/* 2. Communication Needs */}
        <section className="aboutme-form-section" aria-labelledby="section-comm">
          <h2 id="section-comm" className="aboutme-section-title">Communication Preferences</h2>
          <p className="aboutme-section-desc">Polite requests to help others understand your situation.</p>

          <div className="aboutme-checkbox-group">
            <label className="aboutme-check-item">
              <input
                type="checkbox"
                className="aboutme-check-input"
                checked={formData.isNewcomer}
                onChange={(e) => setFormData((prev) => ({ ...prev, isNewcomer: e.target.checked }))}
              />
              <span className="aboutme-check-label">
                I am new here and do not speak Kannada well (ನಾನು ಇಲ್ಲಿಗೆ ಹೊಸಬರು...)
              </span>
            </label>

            <label className="aboutme-check-item">
              <input
                type="checkbox"
                className="aboutme-check-input"
                checked={formData.speakSlowly}
                onChange={(e) => setFormData((prev) => ({ ...prev, speakSlowly: e.target.checked }))}
              />
              <span className="aboutme-check-label">
                Please speak slowly (ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ)
              </span>
            </label>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <span className="aboutme-input-label">Ask to speak in (Pick one or none):</span>
            <div className="aboutme-chips-grid" role="radiogroup" aria-label="Preferred spoken language">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = formData.preferredLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    className={`aboutme-chip-btn ${isSelected ? 'aboutme-chip-btn--active' : ''}`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredLanguage: isSelected ? null : lang.id,
                      }))
                    }
                    role="radio"
                    aria-checked={isSelected}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Blood Group */}
        <section className="aboutme-form-section" aria-labelledby="section-blood">
          <h2 id="section-blood" className="aboutme-section-title">Blood Group</h2>
          <p className="aboutme-section-desc">Shown as a plain factual statement for medical emergencies.</p>

          <div className="aboutme-chips-grid" role="radiogroup" aria-label="Select Blood Group">
            {BLOOD_GROUPS.map((bg) => {
              const isSelected = formData.bloodGroup === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  className={`aboutme-chip-btn ${isSelected ? 'aboutme-chip-btn--active' : ''}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      bloodGroup: isSelected ? '' : bg.id,
                    }))
                  }
                  role="radio"
                  aria-checked={isSelected}
                >
                  {bg.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Allergies */}
        <section className="aboutme-form-section" aria-labelledby="section-allergies">
          <h2 id="section-allergies" className="aboutme-section-title">Allergies</h2>
          <p className="aboutme-section-desc">
            Multi-select common food and medical allergies. Statements contain no medical advice.
          </p>

          <div className="aboutme-allergies-grid" role="group" aria-label="Select allergies">
            {ALLERGIES_LIST.map((item) => {
              const isSelected = (formData.allergies || []).includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`aboutme-allergy-chip ${isSelected ? 'aboutme-allergy-chip--active' : ''}`}
                  onClick={() => handleToggleAllergy(item.id)}
                  aria-pressed={isSelected}
                >
                  <span aria-hidden="true">{isSelected ? '✓ ' : '+ '}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Emergency Contact */}
        <section className="aboutme-form-section" aria-labelledby="section-contact">
          <h2 id="section-contact" className="aboutme-section-title">Emergency Contact</h2>
          <p className="aboutme-section-desc">Phone number will be shown as-is with a direct call option.</p>

          <div className="aboutme-input-group">
            <label htmlFor="emergency-name-input" className="aboutme-input-label">
              Contact Person Name (Optional)
            </label>
            <input
              id="emergency-name-input"
              type="text"
              className="aboutme-input"
              placeholder="e.g. Spouse, Friend, Parent"
              value={formData.emergencyName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, emergencyName: e.target.value }))}
              maxLength={40}
            />
          </div>

          <div className="aboutme-input-group">
            <label htmlFor="emergency-phone-input" className="aboutme-input-label">
              Phone Number (Digits only)
            </label>
            <input
              id="emergency-phone-input"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className="aboutme-input"
              placeholder="e.g. 9876543210"
              value={formData.emergencyPhone || ''}
              onChange={handlePhoneChange}
              maxLength={15}
            />
          </div>
        </section>

        {/* Action Bar */}
        <div className="aboutme-action-bar">
          <button
            type="button"
            className="btn btn-primary aboutme-show-btn"
            onClick={() => setShowModal(true)}
            disabled={compiledLines.length === 0}
            aria-label="Show personal card full-screen"
          >
            <EyeIcon size={20} />
            <span>Show Card ({compiledLines.length} lines)</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              className="aboutme-delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete my card data
            </button>
          ) : (
            <div className="aboutme-confirm-box" role="alert">
              <span className="aboutme-confirm-text">Clear all saved card data?</span>
              <button
                type="button"
                className="aboutme-confirm-yes"
                onClick={handleDeleteData}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="aboutme-confirm-no"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen View Modal */}
      {showModal && (
        <AboutMeModal
          lines={compiledLines}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
