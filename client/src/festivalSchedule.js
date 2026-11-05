const drikEvent = (path, year) =>
  `https://www.drikpanchang.com/${path}?geoname-id=1275004&year=${year}`;

const drikPanjikaDay = (date) =>
  `https://www.drikpanchang.com/bengali/bengali-month-panjika.html?date=${date}&geoname-id=1275004`;

const day = (start, sources, details = {}) => ({
  start,
  status: 'verified',
  sources,
  ...details,
});

const range = (start, end, sources, details = {}) => ({
  ...day(start, sources, details),
  end,
});

const userConfirmedRange = (start, end, observance) => ({
  ...range(start, end, [], { verifiedBy: 'local-user', observance }),
});

export const festivalSchedule = {
  'Jamai Shashti': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-06-20', [drikEvent('festivals/jamai-shashti/jamai-shashti-date-time.html', 2026)]),
      day('2027-06-10', [drikEvent('festivals/jamai-shashti/jamai-shashti-date-time.html', 2027)]),
      day('2028-05-29', [drikEvent('festivals/jamai-shashti/jamai-shashti-date-time.html', 2028)]),
      day('2029-06-18', [drikEvent('festivals/jamai-shashti/jamai-shashti-date-time.html', 2029)]),
      day('2030-06-07', [drikEvent('festivals/jamai-shashti/jamai-shashti-date-time.html', 2030)]),
    ],
  },
  Ambubachi: {
    verificationStatus: 'verified',
    occurrences: [
      userConfirmedRange('2026-06-22', '2026-06-25', 'Annual local schedule confirmed by the user; temple reopening June 26.'),
      userConfirmedRange('2027-06-22', '2027-06-25', 'Annual local schedule confirmed by the user; temple reopening June 26.'),
      userConfirmedRange('2028-06-22', '2028-06-25', 'Annual local schedule confirmed by the user; temple reopening June 26.'),
      userConfirmedRange('2029-06-22', '2029-06-25', 'Annual local schedule confirmed by the user; temple reopening June 26.'),
      userConfirmedRange('2030-06-22', '2030-06-25', 'Annual local schedule confirmed by the user; temple reopening June 26.'),
    ],
  },
  'Manasa Puja': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-08-17', [
        drikEvent('festivals/nag-panchami/nag-panchami-date-time.html', 2026),
        drikEvent('sankranti/simha-sankranti-date-time.html', 2026),
      ], { observance: 'Nag Panchami and Shravan Sankranti coincide.' }),
      day('2027-08-06', [drikEvent('festivals/nag-panchami/nag-panchami-date-time.html', 2027)], { observance: 'Nag Panchami.' }),
      day('2027-08-17', [drikEvent('sankranti/simha-sankranti-date-time.html', 2027)], { observance: 'Shravan Sankranti.' }),
      day('2028-07-26', [drikEvent('festivals/nag-panchami/nag-panchami-date-time.html', 2028)], { observance: 'Nag Panchami.' }),
      day('2028-08-16', [drikEvent('sankranti/simha-sankranti-date-time.html', 2028)], { observance: 'Shravan Sankranti.' }),
      day('2029-08-14', [drikEvent('festivals/nag-panchami/nag-panchami-date-time.html', 2029)], { observance: 'Nag Panchami.' }),
      day('2029-08-17', [drikEvent('sankranti/simha-sankranti-date-time.html', 2029)], { observance: 'Shravan Sankranti.' }),
      day('2030-08-04', [drikEvent('festivals/nag-panchami/nag-panchami-date-time.html', 2030)], { observance: 'Nag Panchami.' }),
      day('2030-08-17', [drikEvent('sankranti/simha-sankranti-date-time.html', 2030)], { observance: 'Shravan Sankranti.' }),
    ],
  },
  'Jita Ashtami': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-10-03', [drikEvent('vrats/jivitputrika/jivitputrika-vrat-date-time.html', 2026)], { observance: 'Kolkata Krishna Ashtami observance.' }),
      day('2027-09-23', [drikEvent('vrats/jivitputrika/jivitputrika-vrat-date-time.html', 2027)], { observance: 'Kolkata Krishna Ashtami observance.' }),
      day('2028-09-12', [drikEvent('vrats/jivitputrika/jivitputrika-vrat-date-time.html', 2028)], { observance: 'Kolkata Krishna Ashtami observance.' }),
      day('2029-10-01', [drikEvent('vrats/jivitputrika/jivitputrika-vrat-date-time.html', 2029)], { observance: 'Kolkata Krishna Ashtami observance.' }),
      day('2030-09-20', [drikEvent('vrats/jivitputrika/jivitputrika-vrat-date-time.html', 2030)], { observance: 'Kolkata Krishna Ashtami observance.' }),
    ],
  },
  Janmashtami: {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-09-04', [drikEvent('dashavatara/lord-krishna/krishna-janmashtami-date-time.html', 2026)], { observance: 'Kolkata Smarta observance.' }),
      day('2027-08-25', [drikEvent('dashavatara/lord-krishna/krishna-janmashtami-date-time.html', 2027)], { observance: 'Kolkata Smarta observance.' }),
      day('2028-08-13', [drikEvent('dashavatara/lord-krishna/krishna-janmashtami-date-time.html', 2028)], { observance: 'Kolkata Smarta observance; ISKCON observance is August 14.' }),
      day('2029-09-01', [drikEvent('dashavatara/lord-krishna/krishna-janmashtami-date-time.html', 2029)], { observance: 'Kolkata Smarta observance.' }),
      day('2030-08-21', [drikEvent('dashavatara/lord-krishna/krishna-janmashtami-date-time.html', 2030)], { observance: 'Kolkata Smarta observance.' }),
    ],
  },
  Mahalaya: {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-10-10', [drikEvent('shraddha/tithi/amavasya-shraddha-date-time.html', 2026)], { observance: 'Kolkata Amavasya Shraddha / Mahalaya date.' }),
      day('2027-09-29', [drikEvent('shraddha/tithi/amavasya-shraddha-date-time.html', 2027)], { observance: 'Kolkata Amavasya Shraddha / Mahalaya date.' }),
      day('2028-09-18', [drikEvent('shraddha/tithi/amavasya-shraddha-date-time.html', 2028)], { observance: 'Kolkata Amavasya Shraddha / Mahalaya date.' }),
      day('2029-10-07', [drikEvent('shraddha/tithi/amavasya-shraddha-date-time.html', 2029)], { observance: 'Kolkata Amavasya Shraddha / Mahalaya date.' }),
      day('2030-09-27', [drikEvent('shraddha/tithi/amavasya-shraddha-date-time.html', 2030)], { observance: 'Kolkata Amavasya Shraddha / Mahalaya date.' }),
    ],
  },
  'Durga Puja': {
    verificationStatus: 'verified',
    occurrences: [
      range('2026-10-17', '2026-10-20', [
        drikEvent('navratri/durga-puja/bengal/kalparambha-date-time.html', 2026),
        drikEvent('navratri/durga-puja/durga-visarjan-date-time.html', 2026),
      ], { observance: 'Bengal Kalparambha through Durga Visarjan.' }),
      range('2027-10-05', '2027-10-10', [
        drikEvent('navratri/durga-puja/bengal/kalparambha-date-time.html', 2027),
        drikEvent('navratri/durga-puja/durga-visarjan-date-time.html', 2027),
      ], { observance: 'Bengal Kalparambha through Durga Visarjan.' }),
      range('2028-09-24', '2028-09-28', [
        drikEvent('navratri/durga-puja/bengal/kalparambha-date-time.html', 2028),
        drikEvent('navratri/durga-puja/durga-visarjan-date-time.html', 2028),
      ], { observance: 'Bengal Kalparambha through Durga Visarjan.' }),
      range('2029-10-12', '2029-10-16', [
        drikEvent('navratri/durga-puja/bengal/kalparambha-date-time.html', 2029),
        drikEvent('navratri/durga-puja/durga-visarjan-date-time.html', 2029),
      ], { observance: 'Bengal Kalparambha through Durga Visarjan.' }),
      range('2030-10-02', '2030-10-06', [
        drikEvent('navratri/durga-puja/bengal/kalparambha-date-time.html', 2030),
        drikEvent('navratri/durga-puja/durga-visarjan-date-time.html', 2030),
      ], { observance: 'Bengal Kalparambha through Durga Visarjan.' }),
    ],
  },
  'Kali Puja': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-11-08', [drikEvent('diwali/kali-puja/bengal-kalipuja-date-time.html', 2026)], { observance: 'Bengal Amavasya Nishita observance.' }),
      day('2027-10-28', [drikEvent('diwali/kali-puja/bengal-kalipuja-date-time.html', 2027)], { observance: 'Bengal Amavasya Nishita observance.' }),
      day('2028-10-17', [drikEvent('diwali/kali-puja/bengal-kalipuja-date-time.html', 2028)], { observance: 'Bengal Amavasya Nishita observance.' }),
      day('2029-11-05', [drikEvent('diwali/kali-puja/bengal-kalipuja-date-time.html', 2029)], { observance: 'Bengal Amavasya Nishita observance.' }),
      day('2030-10-26', [drikEvent('diwali/kali-puja/bengal-kalipuja-date-time.html', 2030)], { observance: 'Bengal Amavasya Nishita observance.' }),
    ],
  },
  'Pura Ashtami': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-12-01', [drikPanjikaDay('01/12/2026')], { observance: 'User-confirmed local Agrahayan Krishna Ashtami; Kolkata Panjika confirms the tithi.' }),
      day('2027-11-21', [drikPanjikaDay('21/11/2027')], { observance: 'Agrahayan Krishna Ashtami.' }),
      day('2028-12-09', [drikPanjikaDay('09/12/2028')], { observance: 'Agrahayan Krishna Ashtami.' }),
      day('2029-11-29', [drikPanjikaDay('29/11/2029')], { observance: 'Agrahayan Krishna Ashtami.' }),
      day('2030-11-18', [drikPanjikaDay('18/11/2030')], { observance: 'Agrahayan Krishna Ashtami.' }),
    ],
  },
  'Makar Sankranti': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-01-14', [drikEvent('sankranti/makar-sankranti-date-time.html', 2026)]),
      day('2027-01-15', [drikEvent('sankranti/makar-sankranti-date-time.html', 2027)]),
      day('2028-01-15', [drikEvent('sankranti/makar-sankranti-date-time.html', 2028)]),
      day('2029-01-14', [drikEvent('sankranti/makar-sankranti-date-time.html', 2029)]),
      day('2030-01-14', [drikEvent('sankranti/makar-sankranti-date-time.html', 2030)]),
    ],
  },
  'Saraswati Puja': {
    verificationStatus: 'verified',
    occurrences: [
      day('2026-01-23', [drikEvent('festivals/vasant-panchami/vasant-panchami-puja-date-time.html', 2026)]),
      day('2027-02-11', [drikEvent('festivals/vasant-panchami/vasant-panchami-puja-date-time.html', 2027)]),
      day('2028-01-31', [drikEvent('festivals/vasant-panchami/vasant-panchami-puja-date-time.html', 2028)]),
      day('2029-01-19', [drikEvent('festivals/vasant-panchami/vasant-panchami-puja-date-time.html', 2029)]),
      day('2030-02-07', [drikEvent('festivals/vasant-panchami/vasant-panchami-puja-date-time.html', 2030)]),
    ],
  },
  Harinam: {
    verificationStatus: 'verified',
    occurrences: [
      range('2026-04-06', '2026-04-08', [drikPanjikaDay('06/04/2026'), drikPanjikaDay('08/04/2026')], { observance: 'Village dates: 22–24 Chaitra 1432.' }),
      range('2027-04-06', '2027-04-08', [drikPanjikaDay('06/04/2027'), drikPanjikaDay('08/04/2027')], { observance: 'Village dates: 22–24 Chaitra 1433.' }),
      range('2028-04-05', '2028-04-07', [drikPanjikaDay('05/04/2028'), drikPanjikaDay('07/04/2028')], { observance: 'Village dates: 22–24 Chaitra 1434.' }),
      range('2029-04-05', '2029-04-07', [drikPanjikaDay('05/04/2029'), drikPanjikaDay('07/04/2029')], { observance: 'Village dates: 22–24 Chaitra 1435.' }),
      range('2030-04-06', '2030-04-08', [drikPanjikaDay('06/04/2030'), drikPanjikaDay('08/04/2030')], { observance: 'Village dates: 22–24 Chaitra 1436.' }),
    ],
  },
};
