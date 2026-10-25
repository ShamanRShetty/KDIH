/**
 * Fixed lists and pre-written Kannada, transliteration, and English strings
 * for the personal "About Me" offline card.
 *
 * All medical items are strictly worded as plain direct statements
 * without offering medical advice.
 */

export const NEWCOMER_STATEMENT = {
  kannada: 'ನಾನು ಇಲ್ಲಿಗೆ ಹೊಸಬರು, ನನಗೆ ಕನ್ನಡ ಸರಿಯಾಗಿ ಬರುವುದಿಲ್ಲ.',
  transliteration: 'Naanu illige hosabaru, nanage Kannada sariyagi baruvudilla.',
  english: 'I am new here and do not speak Kannada well.',
};

export const SPEAK_SLOWLY_STATEMENT = {
  kannada: 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.',
  transliteration: 'Dayavittu nidhanavagi maathanadi.',
  english: 'Please speak slowly.',
};

export const LANGUAGE_OPTIONS = [
  {
    id: 'en',
    label: 'English',
    kannada: 'ದಯವಿಟ್ಟು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ.',
    transliteration: 'Dayavittu English-nalli maathanadi.',
    english: 'Please speak in English.',
  },
  {
    id: 'hi',
    label: 'Hindi',
    kannada: 'ದಯವಿಟ್ಟು ಹಿಂದಿಯಲ್ಲಿ ಮಾತನಾಡಿ.',
    transliteration: 'Dayavittu Hindi-yalli maathanadi.',
    english: 'Please speak in Hindi.',
  },
  {
    id: 'ta',
    label: 'Tamil',
    kannada: 'ದಯವಿಟ್ಟು ತಮಿಳಿನಲ್ಲಿ ಮಾತನಾಡಿ.',
    transliteration: 'Dayavittu Tamil-nalli maathanadi.',
    english: 'Please speak in Tamil.',
  },
  {
    id: 'te',
    label: 'Telugu',
    kannada: 'ದಯವಿಟ್ಟು ತೆಲುಗಿನಲ್ಲಿ ಮಾತನಾಡಿ.',
    transliteration: 'Dayavittu Telugu-nalli maathanadi.',
    english: 'Please speak in Telugu.',
  },
];

export const ALLERGIES_LIST = [
  {
    id: 'penicillin',
    label: 'Penicillin',
    kannada: 'ನನಗೆ ಪೆನ್ಸಿಲಿನ್ ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage penicillin allergy ide.',
    english: 'I have a penicillin allergy.',
  },
  {
    id: 'peanuts',
    label: 'Peanuts',
    kannada: 'ನನಗೆ ಕಡಲೆಕಾಯಿ ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage kadalekaayi allergy ide.',
    english: 'I have a peanut allergy.',
  },
  {
    id: 'eggs',
    label: 'Eggs',
    kannada: 'ನನಗೆ ಮೊಟ್ಟೆ ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage motte allergy ide.',
    english: 'I have an egg allergy.',
  },
  {
    id: 'milk',
    label: 'Cow milk / Dairy',
    kannada: 'ನನಗೆ ಹಾಲಿನ ಉತ್ಪನ್ನಗಳು ಅಲರ್ಜಿ ಇವೆ.',
    transliteration: 'Nanage haalina utpannagalu allergy ive.',
    english: 'I have a dairy / milk allergy.',
  },
  {
    id: 'seafood',
    label: 'Seafood / Shellfish',
    kannada: 'ನನಗೆ ಸಮುದ್ರಾಹಾರ ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage samudraahaara allergy ide.',
    english: 'I have a seafood allergy.',
  },
  {
    id: 'soy',
    label: 'Soy',
    kannada: 'ನನಗೆ ಸೋಯಾ ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage soya allergy ide.',
    english: 'I have a soy allergy.',
  },
  {
    id: 'wheat',
    label: 'Wheat / Gluten',
    kannada: 'ನನಗೆ ಗೋಧಿ ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage godhi allergy ide.',
    english: 'I have a wheat / gluten allergy.',
  },
  {
    id: 'dust',
    label: 'Dust / Pollen',
    kannada: 'ನನಗೆ ಧೂಳು ಅಲರ್ಜಿ ಇದೆ.',
    transliteration: 'Nanage dhoolu allergy ide.',
    english: 'I have a dust allergy.',
  },
];

export const BLOOD_GROUPS = [
  { id: 'A+', label: 'A+' },
  { id: 'A-', label: 'A-' },
  { id: 'B+', label: 'B+' },
  { id: 'B-', label: 'B-' },
  { id: 'AB+', label: 'AB+' },
  { id: 'AB-', label: 'AB-' },
  { id: 'O+', label: 'O+' },
  { id: 'O-', label: 'O-' },
];

export function getBloodGroupStatement(bloodGroup) {
  if (!bloodGroup) return null;
  return {
    kannada: `ನನ್ನ ರಕ್ತದ ಗುಂಪು ${bloodGroup}.`,
    transliteration: `Nanna raktada gumpu ${bloodGroup}.`,
    english: `My blood group is ${bloodGroup}.`,
  };
}

export function getNameStatement(name) {
  if (!name || !name.trim()) return null;
  const clean = name.trim();
  return {
    kannada: `ನನ್ನ ಹೆಸರು ${clean}.`,
    transliteration: `Nanna hesaru ${clean}.`,
    english: `My name is ${clean}.`,
  };
}

export function getEmergencyContactStatement(name, phone) {
  if (!phone || !phone.trim()) return null;
  const cleanPhone = phone.trim();
  const cleanName = name ? name.trim() : '';

  if (cleanName) {
    return {
      kannada: `ತುರ್ತು ಸಂಪರ್ಕ: ${cleanName} (${cleanPhone}).`,
      transliteration: `Thurtu samparka: ${cleanName} (${cleanPhone}).`,
      english: `Emergency contact: ${cleanName} (${cleanPhone}).`,
      phone: cleanPhone,
      name: cleanName,
    };
  }

  return {
    kannada: `ತುರ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆ: ${cleanPhone}.`,
    transliteration: `Thurtu samparka sankhye: ${cleanPhone}.`,
    english: `Emergency contact phone: ${cleanPhone}.`,
    phone: cleanPhone,
    name: '',
  };
}
