// ============================================================
//  SIDHAGORA — village details shown on the home page.
//  Edit this file to put in your real village information.
//  Every text has an English (en) and Bengali (bn) version.
//  Anything left as null / empty [] is simply hidden on the site.
// ============================================================

import { Wheat, Flame, Landmark, Drum, Soup, ShoppingBasket, Sun, Swords, UtensilsCrossed, CloudRain, Sprout, MoonStar, Sunrise, BookOpen } from 'lucide-react';

export const village = {
  // Short line under the name, e.g. "Village · Block · District"
  subtitle: { en: 'Barabazar · Purulia · West Bengal', bn: 'বরাবাজার · পুরুলিয়া · পশ্চিমবঙ্গ' },

  // Hero background photo (your own photo in client/public/gallery/).
  heroImage: '/gallery/hero-temple.jpg',
  heroCredit: null,

  // Words that rotate under the hero title: "A village of …"
  heroWords: {
    en: ['festivals', 'temples', 'ponds and fields', 'shared traditions', 'warm welcomes'],
    bn: ['উৎসবের', 'মন্দিরের', 'পুকুর আর মাঠের', 'ঐতিহ্যের', 'আন্তরিক আতিথ্যের'],
  },

  // Words in the hero description that glow gold (matched without punctuation).
  heroHighlights: {
    en: ['Kali', 'Harinam', 'heritage'],
    bn: ['কালীর', 'কালীপূজার', 'হরিনামের'],
  },

  // Hero text
  heroLine: {
    en: "Nestled in the heart of Purulia, our beloved village Sidhagora is rich in tradition and culture. The devotion to Maa Kali, the joy of Kali Puja, and the sacred melodies of Harinam are deeply woven into our village heritage. Our soil, ponds, fields, and the warmth of our people make Sidhagora our roots, our identity, and our pride.",
    bn: "পুরুলিয়ার মাটিতে গড়ে ওঠা আমাদের প্রিয় সিধাগোড়া। মা কালীর আরাধনা, কালীপূজার আনন্দ আর হরিনামের পবিত্র সুরে জড়িয়ে রয়েছে আমাদের গ্রামের ঐতিহ্য। গ্রামের মাটি, পুকুর, মাঠ আর মানুষের ভালোবাসায় সিধাগোড়া আমাদের শিকড়, আমাদের পরিচয়, আমাদের গর্ব।",
  },

  // About the village (each item is one paragraph). Replace with Sidhagora's real history when you have it.
  story: [
    {
      en: "Sidhagora is our beloved village, nestled in the peaceful countryside of Purulia. Surrounded by green fields, ponds, and familiar village paths, it holds countless cherished memories. The devotion to Maa Kali, the joy of Kali Puja, and the sacred melodies of Harinam continue to keep our village traditions alive.",
      bn: "সিধাগোড়া আমাদের ভালোবাসার গ্রাম। পুরুলিয়ার গ্রামবাংলার শান্ত পরিবেশ, সবুজ মাঠ, পুকুর আর চেনা পথঘাটের মাঝে গড়ে উঠেছে আমাদের জীবনের অসংখ্য স্মৃতি। মা কালীর আরাধনা, কালীপূজার আনন্দ আর হরিনামের পবিত্র সুর আমাদের গ্রামের ঐতিহ্যকে আজও প্রাণবন্ত করে রেখেছে।",
    },
    {
      en: "Our village heritage is deeply connected to the devotion to Maa Kali. During Kali Puja, the entire village comes together in celebration, joy, and unity. From the preparations to the moments of immersion, every part of the celebration reflects the love and dedication of our people.",
      bn: "আমাদের গ্রামের ঐতিহ্যের সঙ্গে জড়িয়ে রয়েছে মা কালীর প্রতি গভীর ভক্তি। কালীপূজার সময় গোটা গ্রাম আনন্দ, উৎসাহ আর একতার বন্ধনে আবদ্ধ হয়। পূজার আয়োজন থেকে বিসর্জনের মুহূর্ত—প্রতিটি পর্বে ফুটে ওঠে গ্রামের মানুষের ভালোবাসা ও আন্তরিকতা।",
    },
    {
      en: "This website is created to share Sidhagora’s heritage, culture, festivals, and stories with everyone. It helps those living away from home stay connected to their roots while introducing future generations to the history and traditions of our village.",
      bn: "এই ওয়েবসাইটটি তৈরি করা হয়েছে সিধাগোড়ার ঐতিহ্য, সংস্কৃতি, উৎসব আর মানুষের গল্প সবার কাছে পৌঁছে দেওয়ার জন্য। গ্রামের বাইরে থাকা মানুষও যেন নিজের শিকড়ের সঙ্গে যুক্ত থাকতে পারেন, আর নতুন প্রজন্ম যেন আমাদের গ্রামের ইতিহাস ও ঐতিহ্যকে জানতে পারে।",
    },
  ],

  // Highlighted quote in the story section
  storyQuote: {
    en: '“Wherever life takes us, the blessings of Maa Kali during Kali Puja bring us back to our village.”',
    bn: '“যেখানেই থাকি, কালীপূজার সময় মা কালীর আশীর্বাদে ফিরে আসি নিজের গ্রামের টানে।”',
  },

  // Photos in the story collage (your own photos in client/public/gallery/)
  storyImages: {
    main: { src: '/gallery/village/procession-01.jpg', position: '50% 30%', caption: { en: 'Maa Kali’s Immersion — A symbol of devotion, tradition, and village unity.', bn: 'মা কালীর বিসর্জন — ভক্তি, ঐতিহ্য ও গ্রামের মানুষের একতার প্রতীক।' } },
    side: { src: '/gallery/village/temple-carvings.jpg', position: '50% 40%', caption: { en: 'Maa Kali Temple — The eternal home of our devotion, faith, and heritage.', bn: 'মা কালীর মন্দির — আমাদের ভক্তি, বিশ্বাস ও ঐতিহ্যের চিরন্তন ঠিকানা।' } },
  },

  // Year shown as "Established" (from the SMK logo) and used for "years of tradition"
  established: 1901,

  // Numbers shown next to the story. Use null to hide one.
  founded: null, // year the village was founded, e.g. 1850
  families: null, // e.g. 320
  population: null, // e.g. 1500
  // "Life in the village" photo cards (numbered 01, 02 …). rea places the card in the grid;
  // img is your own photo in /gallery/ (optional: without one the card shows a designed art panel).
  life: [
    { area: 'fields', img: '/gallery/village/village-pond.jpg', position: '40% 50%', Icon: Wheat, title: { en: 'Ponds & Nature', bn: 'পুকুর ও প্রকৃতি' }, text: { en: 'Peaceful ponds, green surroundings, and the beauty of nature are an inseparable part of our village life.', bn: 'গ্রামের শান্ত পুকুর, সবুজ গাছপালা আর প্রকৃতির স্নিগ্ধতা আমাদের জীবনের এক অবিচ্ছেদ্য অংশ।' } },
    { area: 'fest', img: '/gallery/village/procession-03.jpg', position: '50% 25%', Icon: Flame, title: { en: 'Kali Puja & Immersion', bn: 'কালীপূজা ও বিসর্জন' }, text: { en: 'The joy of Kali Puja, devotion, and the emotions of immersion remain forever in the hearts of our villagers.', bn: 'কালীপূজার আনন্দ, ভক্তি আর বিসর্জনের আবেগ আমাদের গ্রামের মানুষের হৃদয়ে চিরকাল জড়িয়ে থাকে।' } },
    { area: 'temple', img: '/gallery/village/temple-facade.jpg', position: '50% 35%', Icon: Landmark, title: { en: 'Maa Kali Temple', bn: 'মা কালীর মন্দির' }, text: { en: 'With the blessings of Maa Kali, our village faith, devotion, and traditions continue across generations.', bn: 'মা কালীর আশীর্বাদে আমাদের গ্রামের বিশ্বাস, ভক্তি ও ঐতিহ্য প্রজন্ম থেকে প্রজন্মে বেঁচে রয়েছে।' } },
    { area: 'music', Icon: Drum, title: { en: 'Music & Dance', bn: 'গান ও নাচ' }, text: { en: "Harvest songs, wedding songs, drums late into the night, and dances handed down through the years.", bn: "ফসলের গান, বিয়ের গান, অনেক রাত পর্যন্ত মাদল, আর বংশ পরম্পরায় চলে আসা নাচ।" } },
    { area: 'food', Icon: Soup, title: { en: 'Food', bn: 'খাবার' }, text: { en: "Whatever our mothers cook, and the special dishes that only come out on festival days.", bn: "মায়েদের হাতের রান্না, আর যে পদগুলো শুধু বিশেষ দিনেই হয়।" } },
    { area: 'haat', Icon: ShoppingBasket, title: { en: 'Weekly Haat', bn: 'সাপ্তাহিক হাট' }, text: { en: "Market day. You go to bargain and buy sweets, meet everyone you know, and come home with all the news.", bn: "হাটবার। দরদাম, মিষ্টি কেনা, চেনা সবার সঙ্গে দেখা, আর ফেরা গ্রামের সব খবর নিয়ে।" } },
  ],

  // Festival content, in the order of the Bengali year (Jyaistha → Chaitra).
  // Verified Gregorian dates and source metadata live in festivalSchedule.js.
  // tone picks the card's colours: sun | rain | serpent | moon | dawn | durga | kali | harvest | learn | kirtan.
  // img is the card photo (position = which part stays in view); without one the card shows an art panel.
  // details: short points shown as chips on the card.
  festivals: [
    {
      Icon: UtensilsCrossed, tone: 'sun', img: '/gallery/festivals/jamai-shashti.jpg', position: '55% 52%',
      date: { en: 'Jyeshtha Shukla Shashthi', bn: 'জ্যৈষ্ঠ মাসের শুক্লা ষষ্ঠী' }, name: { en: 'Jamai Shashti', bn: 'জামাই ষষ্ঠী' },
      details: [{ en: 'Worship of Goddess Shashthi', bn: 'দেবী ষষ্ঠীর পূজা' }, { en: 'A warm welcome for the son-in-law', bn: 'জামাইকে সাদরে বরণ' }, { en: 'A family meal together', bn: 'পরিবারের সঙ্গে ভোজ' }],
      text: { en: 'On Jamai Shashti, a mother-in-law worships Goddess Shashthi and welcomes her son-in-law with affection. The family gathers over a festive meal, making the day a celebration of care and family bonds.', bn: 'জামাই ষষ্ঠীতে শাশুড়ি দেবী ষষ্ঠীর পূজা করে জামাইকে সাদরে বরণ করেন। পরিবারের সকলে মিলে উৎসবের ভোজে অংশ নেন; দিনটি স্নেহ ও পারিবারিক বন্ধনের আনন্দে ভরে ওঠে।' },
    },
    {
      Icon: CloudRain, tone: 'rain', img: '/gallery/village/village-lane.jpg', position: '50% 45%',
      date: { en: 'Assamese Ahaar · Ashadha', bn: 'অসমীয়া আহাৰ · আষাঢ়' }, name: { en: 'Ambubachi', bn: 'অম্বুবাচী' },
      details: [{ en: 'Four days of observance', bn: 'চার দিনের পালন' }, { en: 'Kamakhya Temple closes for the period', bn: 'এই সময়ে কামাখ্যা মন্দির বন্ধ থাকে' }, { en: 'Restrictions and spiritual practices', bn: 'নিয়ম-নিষেধ ও আধ্যাত্মিক সাধনা' }],
      text: { en: 'Ambubachi marks the annual menstrual period of Goddess Kamakhya and the fertility of Mother Earth. Devotees observe spiritual restrictions while Kamakhya Temple remains closed; the doors reopen after the four-day observance.', bn: 'অম্বুবাচী দেবী কামাখ্যার বার্ষিক ঋতুকাল ও ধরিত্রীমাতার উর্বরতার প্রতীক। এই সময়ে কামাখ্যা মন্দির বন্ধ থাকে এবং ভক্তরা নানা নিয়ম-নিষেধ ও আধ্যাত্মিক সাধনা পালন করেন; চার দিনের পর মন্দিরের দ্বার খোলে।' },
    },
    {
      Icon: Sprout, tone: 'serpent',
      date: { en: 'Nag Panchami & Shravan Sankranti', bn: 'নাগপঞ্চমী ও শ্রাবণ সংক্রান্তি' }, name: { en: 'Manasa Puja', bn: 'মনসা পূজা' },
      details: [{ en: 'Worship of Goddess Manasa / Bishahari', bn: 'দেবী মনসা / বিষহরীর আরাধনা' }, { en: 'Nag Panchami: Shravan Shukla Panchami', bn: 'নাগপঞ্চমী: শ্রাবণ শুক্লা পঞ্চমী' }, { en: 'Also observed at Shravan Sankranti', bn: 'শ্রাবণ সংক্রান্তিতেও পালন' }],
      text: { en: 'In Sidhagora, worship of Manasa (Bishahari), the serpent goddess, is associated with Nag Panchami and Shravan Sankranti. Devotees pray for protection and well-being during the monsoon, and Manasamangal songs are part of the wider Bengali tradition.', bn: 'সিধাগোড়ায় সাপের দেবী মনসা (বিষহরী)-র পূজা নাগপঞ্চমী ও শ্রাবণ সংক্রান্তির সঙ্গে যুক্ত। বর্ষাকালে সুরক্ষা ও মঙ্গল কামনায় ভক্তরা আরাধনা করেন; মনসামঙ্গলের গানও বাংলার এই ঐতিহ্যের অংশ।' },
    },
    {
      Icon: MoonStar, tone: 'moon',
      date: { en: 'Ashwin, Krishna Ashtami', bn: 'আশ্বিন মাসের কৃষ্ণ অষ্টমী' }, name: { en: 'Jita Ashtami', bn: 'জিতা অষ্টমী' },
      details: [{ en: 'A day-long nirjala fast', bn: 'সারাদিন নির্জলা উপবাস' }, { en: 'Puja of Jimutavahana', bn: 'জীমূতবাহনের পুজো' }, { en: 'Prayers for the children', bn: 'সন্তানের মঙ্গল কামনা' }],
      text: { en: 'Jita Ashtami is observed on Ashwin Krishna Ashtami. Mothers fast and worship Jimutavahana, praying for their children’s well-being and long life.', bn: 'আশ্বিন মাসের কৃষ্ণ অষ্টমীতে জিতা অষ্টমী পালিত হয়। সন্তানের মঙ্গল ও দীর্ঘায়ু কামনায় মায়েরা উপবাস রেখে জীমূতবাহনের পূজা করেন।' },
    },
    {
      Icon: MoonStar, tone: 'moon',
      date: { en: 'Krishna Ashtami · Kolkata Smarta observance', bn: 'কৃষ্ণ অষ্টমী · কলকাতার স্মার্ত মতে' }, name: { en: 'Janmashtami', bn: 'জন্মাষ্টমী' },
      details: [{ en: 'Worship of Lord Krishna', bn: 'ভগবান শ্রীকৃষ্ণের পূজা' }, { en: 'Devotional songs and kirtan', bn: 'ভক্তিগীতি ও কীর্তন' }, { en: 'Offerings of prasad', bn: 'প্রসাদ নিবেদন' }],
      text: { en: 'Janmashtami marks the birth of Lord Krishna. Devotees observe the occasion with worship, devotional songs, and offerings. This card uses the Kolkata Smarta date; ISKCON observances may differ in some years.', bn: 'ভগবান শ্রীকৃষ্ণের জন্মতিথি উপলক্ষে পালিত হয় জন্মাষ্টমী। পূজা, ভক্তিগীতি ও প্রসাদ নিবেদনের মাধ্যমে ভক্তরা দিনটি উদ্‌যাপন করেন। এই কার্ডে কলকাতার স্মার্ত তারিখ দেওয়া হয়; কোনো কোনো বছরে ইসকনের পালনের দিন আলাদা হতে পারে।' },
    },
    {
      Icon: Sunrise, tone: 'dawn',
      date: { en: 'Bhadra, Krishna Amavasya', bn: 'ভাদ্র মাসের কৃষ্ণ অমাবস্যা' }, name: { en: 'Mahalaya', bn: 'মহালয়া' },
      details: [{ en: 'Mahishasuramardini before dawn', bn: 'ভোরের আগে মহিষাসুরমর্দিনী পাঠ' }, { en: 'Tarpan for the ancestors', bn: 'পিতৃপুরুষের উদ্দেশে তর্পণ' }, { en: 'Beginning of Devipaksha', bn: 'দেবীপক্ষের সূচনা' }],
      text: { en: 'The Mahishasuramardini hymns before dawn and the ritual of tarpan mark Mahalaya. It also brings the beginning of Devipaksha and the anticipation of Durga Puja.', bn: 'ভোরের আগে মহিষাসুরমর্দিনীর স্তোত্রপাঠ ও পিতৃপুরুষের উদ্দেশে তর্পণের মধ্য দিয়ে মহালয়া পালিত হয়। এই দিন দেবীপক্ষের সূচনা এবং দুর্গাপুজোর প্রতীক্ষাও নিয়ে আসে।' },
    },
    {
      Icon: Swords, tone: 'durga', img: '/gallery/festivals/durga-puja.jpg', position: '48% 62%',
      date: { en: 'Ashwin, Shukla Shashthi to Dashami', bn: 'আশ্বিন মাসের শুক্লা ষষ্ঠী থেকে দশমী' }, name: { en: 'Durga Puja', bn: 'দুর্গাপূজা' },
      details: [{ en: 'Celebrations from Shashthi to Dashami', bn: 'ষষ্ঠী থেকে দশমী পর্যন্ত উদ্‌যাপন' }, { en: 'Dhak, arati, and illuminated pandals', bn: 'ঢাক, আরতি ও আলোকসজ্জিত মণ্ডপ' }, { en: 'Sindoor khela and Bijoya greetings', bn: 'সিঁদুর খেলা ও বিজয়ার শুভেচ্ছা' }],
      text: { en: 'Durga Puja brings together worship, festive gatherings, and the sounds of dhak. From the decorated pandals to the farewell on Dashami, each day carries its own joy and devotion.', bn: 'দুর্গাপুজোয় আরাধনা, উৎসবের মিলন আর ঢাকের শব্দে মুখর হয়ে ওঠে চারপাশ। সাজানো মণ্ডপ থেকে দশমীর বিদায়—প্রতিটি দিনেই থাকে আনন্দ ও ভক্তির আবহ।' },
    },
    {
      Icon: Flame, tone: 'kali', featured: true, img: '/gallery/village/procession-04.jpg',
      date: { en: 'Ashwin, Krishna Amavasya', bn: 'আশ্বিন মাসের কৃষ্ণ অমাবস্যা' }, name: { en: 'Kali Puja', bn: 'কালীপূজা' },
      details: [{ en: 'Worship on the night of Amavasya', bn: 'অমাবস্যার রাতে আরাধনা' }, { en: 'Immersion procession', bn: 'বিসর্জনের শোভাযাত্রা' }, { en: 'Diyas and festive lights', bn: 'প্রদীপ ও উৎসবের আলো' }],
      text: { en: 'Kali Puja is a night of devotion to Maa Kali. Worship continues through Amavasya, homes glow with lamps, and the village comes together for the immersion procession.', bn: 'কালীপুজো মা কালীর আরাধনার এক পবিত্র রাত। অমাবস্যাজুড়ে চলে পূজা, ঘরে ঘরে জ্বলে প্রদীপ, আর বিসর্জনের শোভাযাত্রায় একসঙ্গে অংশ নেন গ্রামের মানুষ।' },
    },
    {
      Icon: Wheat, tone: 'harvest',
      date: { en: 'Agrahayan, Krishna Ashtami', bn: 'অগ্রহায়ণ মাসের কৃষ্ণ অষ্টমী' }, name: { en: 'Pura Ashtami', bn: 'পুরা অষ্টমী' },
      details: [{ en: 'Village puja in Agrahayan', bn: 'অগ্রহায়ণে গ্রামের পুজো' }, { en: 'The whole village gathers', bn: 'গোটা গ্রামের মিলন' }],
      text: { en: 'Pura Ashtami is Sidhagora’s local village puja, observed on Agrahayan Krishna Ashtami. The date follows the Kolkata Panjika tithi and the village’s customary observance.', bn: 'পুরা অষ্টমী সিধাগোড়ার স্থানীয় গ্রামের পুজো। অগ্রহায়ণ মাসের কৃষ্ণ অষ্টমী তিথিতে কলকাতার পঞ্জিকা ও গ্রামের প্রচলিত রীতি মেনে এটি পালিত হয়।' },
    },
    {
      Icon: Sun, tone: 'sun', img: '/gallery/village/village-pond.jpg', position: '50% 55%',
      date: { en: 'Poush, Makar Sankranti', bn: 'পৌষ মাসের মকর সংক্রান্তি' }, name: { en: 'Makar Sankranti', bn: 'মকর সংক্রান্তি' },
      details: [{ en: 'Pithe-puli made with new rice', bn: 'নতুন চালের পিঠে-পুলি' }, { en: 'A holy dip at dawn', bn: 'ভোরের পুণ্যস্নান' }],
      text: { en: 'Makar Sankranti marks a seasonal transition and is associated with harvest traditions. Pithe-puli made with new rice and a holy dip at dawn are among the festival observances.', bn: 'মকর সংক্রান্তি ঋতু পরিবর্তন ও ফসলের ঐতিহ্যের সঙ্গে যুক্ত। নতুন চালের পিঠে-পুলি তৈরি এবং ভোরে পুণ্যস্নান এই উৎসবের পরিচিত রীতিগুলোর মধ্যে রয়েছে।' },
    },
    {
      Icon: BookOpen, tone: 'learn',
      date: { en: 'Magh, Shukla Panchami', bn: 'মাঘ মাসের শুক্লা পঞ্চমী' }, name: { en: 'Saraswati Puja', bn: 'সরস্বতী পূজা' },
      details: [{ en: 'Books offered to the goddess', bn: 'দেবীর পায়ে বই নিবেদন' }, { en: 'Hate khori for young children', bn: 'ছোটদের হাতেখড়ি' }, { en: 'Yellow attire and khichuri bhog', bn: 'বাসন্তী সাজ ও খিচুড়ি ভোগ' }],
      text: { en: 'Students worship Maa Saraswati, the goddess of learning, and place their books before her. The puja is also associated with hate khori for young children and the colour yellow.', bn: 'বিদ্যার দেবী মা সরস্বতীর আরাধনায় ছাত্রছাত্রীরা তাঁর পায়ে বই নিবেদন করে। ছোটদের হাতেখড়ি এবং বাসন্তী রঙের পোশাকও সরস্বতীপুজোর পরিচিত অনুষঙ্গ।' },
    },
    {
      Icon: Drum, tone: 'kirtan',
      date: { en: '22–24 Chaitra', bn: '২২–২৪ চৈত্র' }, name: { en: 'Harinam', bn: 'হরিনাম' },
      details: [{ en: 'Three days of sankirtan', bn: 'তিন দিন ধরে সংকীর্তন' }, { en: 'Khol and kartal accompaniment', bn: 'খোল-করতালের সঙ্গ' }, { en: 'Prasad shared with everyone', bn: 'সবার মধ্যে প্রসাদ বিতরণ' }],
      text: { en: 'Hari Naam brings devotees together for three days of sankirtan. The sound of khol and kartal and the singing of the divine name fill the celebration, followed by prasad shared with everyone.', bn: 'হরিনাম উপলক্ষে ভক্তরা তিন দিন ধরে সংকীর্তনে মিলিত হন। খোল-করতালের তালে হরিনাম কীর্তনে মুখর হয়ে ওঠে উৎসব, আর শেষে সবার মধ্যে প্রসাদ বিতরণ করা হয়।' },
    },
    {
      Icon: Drum, tone: 'kirtan',
      date: { en: '22–24 Chaitra · local dates', bn: '২২–২৪ চৈত্র · স্থানীয় তারিখ' }, name: { en: 'Hori', bn: 'হোরি' },
      details: [{ en: 'Three-day Sidhagora observance', bn: 'সিধাগোড়ার তিন দিনের পালন' }, { en: '22–24 Chaitra in the village calendar', bn: 'গ্রামের পঞ্জিকায় ২২–২৪ চৈত্র' }],
      text: { en: 'Hori is a separate local festival in Sidhagora, observed on 22–24 Chaitra according to the dates you provided. It is listed separately from Harinam.', bn: 'হোরি সিধাগোড়ার একটি স্বতন্ত্র স্থানীয় উৎসব, আপনার দেওয়া তারিখ অনুযায়ী ২২–২৪ চৈত্রে পালিত হয়। হরিনাম থেকে এটি আলাদা উৎসব হিসেবে দেখানো হয়েছে।' },
    },
  ],

  // Gallery: original photos and video of Sidhagora (files in client/public/gallery/village/).
  // cat: 'temple' | 'procession' | 'village'.  w/h: image size (keeps the layout steady while loading).
  // The first items are shown first; the rest appear with "Show all".
  gallery: [
    { src: '/gallery/village/procession-04.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'The Divine Glory of Maa Kali — Sidhagora comes alive with devotion, faith, and love.', bn: 'মা কালীর অপার মহিমা — ভক্তি, বিশ্বাস ও ভালোবাসায় সেজে ওঠে আমাদের সিধাগোড়া।' } },
    { src: '/gallery/village/temple-carvings.jpg', cat: 'temple', w: 1280, h: 957, caption: { en: "A Place of Faith and Devotion — Maa Kali Temple stands as a symbol of Sidhagora's faith and heritage.", bn: 'আমাদের শ্রদ্ধা ও বিশ্বাসের স্থান — মা কালীর মন্দির সিধাগোড়ার মানুষের ভক্তি ও ঐতিহ্যের প্রতীক।' } },
    { video: '/gallery/village/kali-procession.mp4', cat: 'procession', w: 478, h: 850, caption: { en: "Video of Maa Kali’s immersion procession", bn: "মা কালীর বিসর্জনের শোভাযাত্রার ভিডিও" } },
    { src: '/gallery/village/village-pond.jpg', cat: 'village', w: 1280, h: 957, caption: { en: 'Sidhagora in Nature’s Embrace — The beautiful landscapes of our beloved village, surrounded by ponds, fields, and greenery.', bn: 'প্রকৃতির কোলে আমাদের সিধাগোড়া — পুকুর, মাঠ ও সবুজে ঘেরা আমাদের প্রিয় গ্রামের অপরূপ সৌন্দর্য।' } },
    { src: '/gallery/village/procession-01.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'An Emotional Farewell — With heartfelt devotion, we bid Maa farewell and await her return next year.', bn: 'বিসর্জনের আবেগঘন মুহূর্ত — মা-কে বিদায় জানিয়ে আবার আগামী বছরের অপেক্ষায় থাকি আমরা।' } },
    { src: '/gallery/village/temple-facade.jpg', cat: 'temple', w: 768, h: 1022, caption: { en: 'The carved façade of the village temple', bn: 'গ্রামের মন্দিরের কারুকাজ করা সামনের অংশ' } },
    { src: '/gallery/village/procession-11.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Across the open field', bn: 'খোলা মাঠ পেরিয়ে' } },
    { src: '/gallery/village/village-lane.jpg', cat: 'village', w: 960, h: 1140, caption: { en: 'A quiet lane lined with bamboo', bn: 'বাঁশঝাড়ে ঘেরা নিরিবিলি গলি' } },
    { src: '/gallery/village/procession-10.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Under the hanging banyan roots', bn: 'বটের ঝুরির নিচ দিয়ে' } },
    { src: '/gallery/village/temple-front.jpg', cat: 'temple', w: 768, h: 1022, caption: { en: 'The new temple, with work still going on', bn: "নতুন মন্দির, কাজ এখনও চলছে" } },
    { src: '/gallery/village/procession-03.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Down the village road', bn: 'গ্রামের রাস্তা ধরে' } },
    { src: '/gallery/village/procession-02.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'In the soft light under the trees', bn: 'গাছের নিচে নরম আলোয়' } },
    { src: '/gallery/village/temple-street.jpg', cat: 'temple', w: 866, h: 1154, caption: { en: 'The temple beside the village street', bn: 'গ্রামের রাস্তার ধারে মন্দির' } },
    { src: '/gallery/village/procession-05.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Following Maa along the shaded path', bn: 'ছায়াঘেরা পথে মায়ের পিছু পিছু' } },
    { src: '/gallery/village/procession-06.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Through a narrow lane beside the bamboo', bn: 'বাঁশঝাড়ের পাশের সরু গলি দিয়ে' } },
    { src: '/gallery/village/procession-07.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Clouds of smoke as Maa passes', bn: 'মা যেতেই ধোঁয়ার মেঘ' } },
    { src: '/gallery/village/temple-wide.jpg', cat: 'temple', w: 1280, h: 957, caption: { en: 'A wide view of the temple and its lane', bn: 'মন্দির আর তার গলির পুরো দৃশ্য' } },
    { src: '/gallery/village/procession-08.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Shoulder to shoulder', bn: 'কাঁধে কাঁধ মিলিয়ে' } },
    { src: '/gallery/village/procession-09.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Past the old houses', bn: 'পুরোনো বাড়িগুলোর পাশ দিয়ে' } },
  ],
  // Visit section
  address: {
    en: 'Vill. Sidhagora, P.O. Bhabanipur, P.S. Barabazar, Dist. Purulia, West Bengal – 723143',
    bn: 'গ্রাম: সিধাগোড়া, পো: ভবানীপুর, থানা: বরাবাজার, জেলা: পুরুলিয়া, পশ্চিমবঙ্গ – ৭২৩১৪৩',
  },
  // Exact place name used for the Google Maps link
  mapQuery: 'Sidhagora Kali Mandir',
  // Exact map pin (latitude,longitude of Sidhagora Kali Mandir)
  coords: '23.0398938,86.2818169',
  // Google Maps page of Sidhagora Kali Mandir, opened by the "Open in Google Maps" button
  mapLink: 'https://www.google.com/maps/place/Sidhagora+kali+mandir/@23.0398938,86.2818169,18z/data=!3m1!4b1!4m6!3m5!1s0x39f675e46d0b2239:0xbf3adeaa73d7b963!8m2!3d23.0398938!4d86.2818169!16s%2Fg%2F11ptv5kfgc',
  // How to reach: distance and time are { en, bn }; by is 'bus', 'train' or 'both'.
  // query is the starting place for the Google Maps route; steps are the way, one line each,
  // with mode 'bus' | 'train' | 'toto' | 'walk' for its icon.
  routes: [
    {
      from: { en: 'Barabazar', bn: 'বরাবাজার' }, query: 'Barabazar, Purulia', distance: { en: '12 km', bn: '১২ কিমি' }, time: { en: 'about 30 min', bn: 'প্রায় ৩০ মিনিট' }, by: 'bus',
      steps: [
        { mode: 'bus', en: 'Take a bus from Barabazar to Beldi, about 30 minutes', bn: 'বরাবাজার থেকে বাসে বেলডি, প্রায় ৩০ মিনিট' },
        { mode: 'walk', en: 'From Beldi, walk or take a toto to the village', bn: 'বেলডি থেকে হেঁটে বা টোটোয় গ্রামে' },
      ],
    },
    {
      from: { en: 'Barabhum railway station', bn: 'বরাভূম রেলস্টেশন' }, query: 'Barabhum railway station', distance: { en: '12 km', bn: '১২ কিমি' }, time: { en: '27 min', bn: '২৭ মিনিট' }, by: 'bus',
      steps: [
        { mode: 'toto', en: 'From the station, take a toto to the bus stand', bn: 'স্টেশন থেকে টোটোয় বাসস্ট্যান্ড' },
        { mode: 'bus', en: 'Take a bus to Hanspur', bn: 'সেখান থেকে বাসে হাঁসপুর' },
        { mode: 'walk', en: 'From Hanspur, walk or take a toto to the village', bn: 'হাঁসপুর থেকে হেঁটে বা টোটোয় গ্রামে' },
      ],
    },
    {
      from: { en: 'Purulia town', bn: 'পুরুলিয়া শহর' }, query: 'Purulia, West Bengal', distance: { en: '41 km', bn: '৪১ কিমি' }, time: { en: '45 min', bn: '৪৫ মিনিট' }, by: 'bus',
      steps: [
        { mode: 'bus', en: 'Way 1: bus to Barabazar, then the same as from Barabazar', bn: 'পথ ১: বাসে বরাবাজার, তারপর বরাবাজার থেকে যেভাবে আসে' },
        { mode: 'bus', en: 'Way 2: bus to Balarampur, then change to a bus towards the village', bn: 'পথ ২: বাসে বলরামপুর, সেখানে বাস বদলে গ্রামের দিকে' },
      ],
    },
    {
      from: { en: 'Kolkata', bn: 'কলকাতা' }, query: 'Kolkata', distance: { en: '278 km', bn: '২৭৮ কিমি' }, time: { en: '7 hr', bn: '৭ ঘণ্টা' }, by: 'both',
      steps: [
        { mode: 'train', en: 'By train: come to Barabhum station, then the same as from Barabhum', bn: 'ট্রেনে: বরাভূম স্টেশন, তারপর বরাভূম থেকে যেভাবে আসে' },
        { mode: 'bus', en: 'By bus: come to Barabazar or Balarampur, then change to a bus towards the village', bn: 'বাসে: বরাবাজার বা বলরামপুর, সেখানে বাস বদলে গ্রামের দিকে' },
      ],
    },
  ],
};
