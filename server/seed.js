// Sample entries so the site isn't empty on first run.
// Replace these with real words from the Sidhagora village language (or add them from the "Contribute" page).
export const seedWords = [
  { word: 'Namaskar', pronunciation: 'nuh-mus-kaar', meaning: 'Hello / Respectful greeting', meaningBn: 'নমস্কার / প্রণাম', category: 'greeting', example: 'Namaskar, kemiti achha?', exampleMeaning: 'Hello, how are you? (নমস্কার, কেমন আছেন?)' },
  { word: 'Maa', pronunciation: 'maa', meaning: 'Mother', meaningBn: 'মা', category: 'family' },
  { word: 'Bapa', pronunciation: 'baa-paa', meaning: 'Father', meaningBn: 'বাবা', category: 'family' },
  { word: 'Bhai', pronunciation: 'bhaa-ee', meaning: 'Brother', meaningBn: 'ভাই', category: 'family' },
  { word: 'Bhata', pronunciation: 'bhaa-taa', meaning: 'Cooked rice', meaningBn: 'ভাত', category: 'food' },
  { word: 'Pani', pronunciation: 'paa-nee', meaning: 'Water', meaningBn: 'জল', category: 'food' },
  { word: 'Gachha', pronunciation: 'gaa-chhaa', meaning: 'Tree', meaningBn: 'গাছ', category: 'nature' },
  { word: 'Nadi', pronunciation: 'nuh-dee', meaning: 'River', meaningBn: 'নদী', category: 'nature' },
  { word: 'Ghara', pronunciation: 'ghuh-raa', meaning: 'House / Home', meaningBn: 'ঘর / বাড়ি', category: 'daily' },
  { word: 'Eka', pronunciation: 'eh-kaa', meaning: 'One', meaningBn: 'এক', category: 'number' },
  { word: 'Dui', pronunciation: 'doo-ee', meaning: 'Two', meaningBn: 'দুই', category: 'number' },
  { word: 'Kemiti achha?', pronunciation: 'keh-mi-ti aa-chhaa', meaning: 'How are you?', meaningBn: 'কেমন আছেন?', category: 'phrase' },
].map((w) => ({ contributor: 'Sidhagora team', likes: 0, example: '', exampleMeaning: '', ...w }));
