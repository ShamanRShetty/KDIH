import AudioButton from './AudioButton';
import './NumbersReference.css';

const NUMBERS_DATA = [
  { val: '1', kannada: 'ಒಂದು', translit: 'Ondu', digits: '೧' },
  { val: '2', kannada: 'ಎರಡು', translit: 'Eradu', digits: '೨' },
  { val: '3', kannada: 'ಮೂರು', translit: 'Mooru', digits: '೩' },
  { val: '4', kannada: 'ನಾಲ್ಕು', translit: 'Naalku', digits: '೪' },
  { val: '5', kannada: 'ಐದು', translit: 'Aidu', digits: '೫' },
  { val: '6', kannada: 'ಆರು', translit: 'Aaru', digits: '೬' },
  { val: '7', kannada: 'ಏಳು', translit: 'Eylu', digits: '೭' },
  { val: '8', kannada: 'ಎಂಟು', translit: 'Entu', digits: '೮' },
  { val: '9', kannada: 'ಒಂಬತ್ತು', translit: 'Ombattu', digits: '೯' },
  { val: '10', kannada: 'ಹತ್ತು', translit: 'Hattu', digits: '೧೦' },
  { val: '20', kannada: 'ಇಪ್ಪತ್ತು', translit: 'Ippattu', digits: '೨೦' },
  { val: '50', kannada: 'ಐವತ್ತು', translit: 'Aivattu', digits: '೫೦' },
  { val: '100', kannada: 'ನೂರು', translit: 'Nooru', digits: '೧೦೦' },
  { val: '500', kannada: 'ಐನೂರು', translit: 'Ainooru', digits: '೫೦೦' },
  { val: '1000', kannada: 'ಒಂದು ಸಾವಿರ', translit: 'Ondu Saavira', digits: '೧೦೦೦' },
];

export default function NumbersReference() {
  return (
    <section className="numbers-reference" aria-labelledby="numbers-reference-title">
      <div className="numbers-header">
        <h2 id="numbers-reference-title" className="numbers-title">
          Numbers & Currency Reference
        </h2>
        <p className="numbers-subtitle">
          Essential numbers for prices, quantities, and cash handling in Kannada.
        </p>
      </div>

      <div className="numbers-grid">
        {NUMBERS_DATA.map((item) => (
          <div key={item.val} className="number-card">
            <span className="number-value">₹ {item.val} ({item.digits})</span>
            <span className="number-script" lang="kn">{item.kannada}</span>
            <span className="number-translit">{item.translit}</span>
            <AudioButton
              kannadaText={item.kannada}
              label={`Number ${item.val}`}
              size="sm"
              showSlow={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
