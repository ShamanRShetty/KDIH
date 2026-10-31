/**
 * Quick Packs for NammaSahaaya.
 * Each pack is a curated step-through of existing phrase IDs for a specific real-life moment.
 * All phraseIds MUST exist in src/data/phrases.json.
 */

const packs = [
  {
    id: 'auto-ride',
    title: 'Auto Ride',
    icon: '🛺',
    whenToUse: 'Before you step into an auto-rickshaw to settle the destination and fare.',
    phraseIds: [
      'trans-010', // Is the auto available?
      'trans-012', // How much will it be to Indiranagar?
      'trans-011', // Will you come by meter?
      'trans-007', // Do you have change here?
      'shop-008',  // Do you accept UPI or Google Pay?
      'dir-011',   // I know only a little Kannada.
    ],
    tips: [
      'Confirm meter or fixed fare before boarding — refusing to negotiate is normal and not rude.',
      'Keep small change (₹10–₹50) handy; many drivers cannot break ₹500 notes.',
    ],
  },
  {
    id: 'bus',
    title: 'Bus',
    icon: '🚌',
    whenToUse: 'Board the right BMTC bus, pay your fare, and get off at the correct stop.',
    phraseIds: [
      'trans-001', // Does this bus go to Majestic?
      'trans-002', // Where should I board the Majestic bus?
      'trans-006', // How much is the ticket?
      'trans-003', // Which is the next stop?
      'trans-004', // Please let me know when Silk Board arrives.
      'trans-005', // Please drop me at the next stop.
      'trans-007', // Do you have change?
    ],
    tips: [
      'Say your destination clearly when boarding; conductors will issue the correct ticket.',
      'Ring the buzzer or tap the window early — buses do not always stop at every stand.',
    ],
  },
  {
    id: 'vegetable-market',
    title: 'Vegetable Market',
    icon: '🥦',
    whenToUse: 'Navigate a Bangalore sabzi market: check prices, buy the right quantity, and pay.',
    phraseIds: [
      'shop-001', // How much does this cost?
      'shop-002', // How much per kilogram?
      'shop-011', // Can you reduce the price a little?
      'shop-004', // Half a kilogram is enough.
      'shop-003', // Please give a smaller quantity.
      'shop-008', // Do you accept UPI or Google Pay?
      'shop-012', // Could you give a bag?
    ],
    tips: [
      'Prices at open markets are often negotiable — a polite smile goes a long way.',
      'Bring a reusable bag; plastic bags may be unavailable or charged extra.',
    ],
  },
  {
    id: 'clinic-visit',
    title: 'Clinic Visit',
    icon: '🏥',
    whenToUse: 'Register at a government or private clinic and navigate the waiting process.',
    phraseIds: [
      'health-001', // Where should I do new registration?
      'health-002', // How much is the registration fee?
      'health-004', // Can I get a doctor's appointment today?
      'health-005', // Where is the reception counter?
      'health-007', // Where should I wait?
      'health-008', // When will my token number be called?
      'health-011', // I need help filling this form.
    ],
    tips: [
      'Carry an Aadhaar card and any previous prescription — most clinics require photo ID.',
      'Government hospitals use token queues; ask the counter staff before sitting anywhere.',
    ],
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    icon: '🍛',
    whenToUse: 'Order food, state your preferences, and pay the bill at a Darshini or restaurant.',
    phraseIds: [
      'food-001', // Please give the menu card.
      'food-002', // Is pure vegetarian food available?
      'food-003', // One plate masala dosa, please.
      'food-004', // Please make it less spicy.
      'food-010', // Where is the hand wash area?
      'food-008', // Please give the bill.
      'shop-008', // Do you accept UPI or Google Pay?
    ],
    tips: [
      'At Darshinis (standing restaurants) you pay first at the counter, then collect your food.',
      'Say "parcel" to get food packed for takeaway instead of dine-in.',
    ],
  },
  {
    id: 'lost-or-help',
    title: 'Lost or Need Help',
    icon: '🆘',
    whenToUse: 'When you are lost, need urgent assistance, or have lost something valuable.',
    phraseIds: [
      'emer-005', // I have lost my way.
      'dir-001',  // Where is this place? (show map/address)
      'emer-001', // Please help me!
      'emer-006', // My wallet/purse is lost.
      'emer-007', // My mobile phone is lost.
      'emer-003', // Where is the police station?
      'dir-002',  // Where is an ATM nearby?
    ],
    tips: [
      'Show your phone map or a written address — locals respond better to visual cues than spoken place names.',
      'Dial 100 for police or 108 for ambulance; both work from any network in Karnataka.',
    ],
  },
];

export default packs;

