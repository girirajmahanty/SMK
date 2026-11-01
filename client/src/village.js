// ============================================================
//  SIDHAGORA — village details shown on the home page.
//  Edit this file to put in your real village information.
//  Every text has an English (en) and Bengali (bn) version.
//  Anything left as null / empty [] is simply hidden on the site.
// ============================================================

import { Wheat, Flame, Landmark, Drum, Soup, ShoppingBasket, Sun, Swords, UtensilsCrossed, CloudRain, Sprout, MoonStar, Sunrise, BookOpen } from 'lucide-react';

// High-quality Unsplash image URL, resized by Unsplash's image server.
const unsplash = (id, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const village = {
  // Short line under the name, e.g. "Village · Block · District"
  subtitle: { en: 'Our village · Our language · Our home', bn: 'আমাদের গ্রাম · আমাদের ভাষা · আমাদের ঘর' },

  // Hero background photo (sample from Unsplash — replace with a photo of Sidhagora,
  // e.g. '/gallery/hero.jpg'; set heroCredit to null for your own photo).
  heroImage: '/gallery/hero-temple.jpg',
  heroCredit: null,

  // Words that rotate under the hero title: "A village of …"
  heroWords: {
    en: ['golden fields', 'festivals', 'families', 'stories', 'our language'],
    bn: ['সোনালি মাঠের', 'উৎসবের', 'পরিবারের', 'গল্পের', 'আমাদের ভাষার'],
  },

  // Words in the hero description that glow gold (matched without punctuation).
  heroHighlights: {
    en: ['fields', 'festivals', 'families', 'language'],
    bn: ['মাঠ', 'উৎসব', 'পরিবারের', 'ভাষা'],
  },

  // Hero text
  heroLine: {
    en: 'A village of fields, festivals and families — and a language our grandparents gave us. This website keeps it all in one place.',
    bn: 'মাঠ, উৎসব আর পরিবারের গ্রাম — আর সেই ভাষা যা আমাদের ঠাকুমা-দাদুরা দিয়ে গেছেন। এই ওয়েবসাইট সবকিছু এক জায়গায় ধরে রাখে।',
  },

  // About the village (each item is one paragraph). Replace with Sidhagora's real history when you have it.
  story: [
    {
      en: 'Sidhagora is our home — a village of open fields, quiet ponds and old temples, where every lane has a story and every season brings a festival.',
      bn: 'সিধাগোড়া আমাদের ঘর — খোলা মাঠ, শান্ত পুকুর আর পুরোনো মন্দিরের গ্রাম, যেখানে প্রতিটি গলির একটি গল্প আছে আর প্রতিটি ঋতু নিয়ে আসে একটি উৎসব।',
    },
    {
      en: 'Our emblem, SMK, established in 1901, carries Maa Kali at its heart. Generation after generation, the village has gathered around its traditions — in worship, in celebration and in the language we speak at home.',
      bn: 'আমাদের প্রতীক এসএমকে, প্রতিষ্ঠিত ১৯০১ সালে, যার কেন্দ্রে মা কালী। প্রজন্মের পর প্রজন্ম ধরে গ্রাম তার ঐতিহ্যকে ঘিরে একত্রিত হয়েছে — পূজায়, উৎসবে আর ঘরের ভাষায়।',
    },
    {
      en: 'This website keeps those words and memories safe, so our children can hear them, learn them and pass them on.',
      bn: 'এই ওয়েবসাইট সেই শব্দ আর স্মৃতিগুলো সযত্নে রাখে, যাতে আমাদের সন্তানরা সেগুলো শুনতে, শিখতে আর পরের প্রজন্মকে দিয়ে যেতে পারে।',
    },
  ],

  // Highlighted quote in the story section
  storyQuote: {
    en: 'A language lives for as long as someone still speaks it.',
    bn: 'যতদিন কেউ কথা বলে, ততদিন ভাষা বেঁচে থাকে।',
  },

  // Photos in the story collage (your own photos in client/public/gallery/)
  storyImages: {
    main: { src: '/gallery/village/procession-01.jpg', position: '50% 30%', caption: { en: 'Kali Puja procession', bn: 'কালীপুজোর শোভাযাত্রা' } },
    side: { src: '/gallery/village/temple-carvings.jpg', position: '50% 40%', caption: { en: 'The village temple', bn: 'গ্রামের মন্দির' } },
  },

  // Year shown as "Established" (from the SMK logo) and used for "years of tradition"
  established: 1901,

  // Numbers shown next to the story. Use null to hide one.
  founded: null, // year the village was founded, e.g. 1850
  families: null, // e.g. 320
  population: null, // e.g. 1500
  // "Life in the village" photo cards (numbered 01, 02 …). rea places the card in the grid;
  // img is a photo (your own in /gallery/, or a sample from Unsplash with credit).
  life: [
    { area: 'fields', img: '/gallery/village/village-pond.jpg', position: '40% 50%', Icon: Wheat, title: { en: 'Ponds & Fields', bn: 'পুকুর ও মাঠ' }, text: { en: 'Wide ponds, green meadows and the rhythm of the seasons that feeds every home.', bn: 'বিশাল পুকুর, সবুজ মাঠ আর ঋতুর ছন্দ, যা প্রতিটি ঘরের মুখে অন্ন তুলে দেয়।' } },
    { area: 'fest', img: '/gallery/village/procession-03.jpg', position: '50% 25%', Icon: Flame, title: { en: 'Festivals', bn: 'উৎসব' }, text: { en: 'The days when the whole village comes together — like carrying Maa Kali through every lane at Kali Puja.', bn: 'যে দিনগুলোতে গোটা গ্রাম একসাথে হয় — যেমন কালীপুজোয় মা কালীকে কাঁধে নিয়ে প্রতিটি গলি ঘোরা।' } },
    { area: 'temple', img: '/gallery/village/temple-facade.jpg', position: '50% 35%', Icon: Landmark, title: { en: 'Temple & Worship', bn: 'মন্দির ও পুজো' }, text: { en: 'Our temple, its façade carved with Maa Kali, Ganesha and Krishna — the heart of village worship.', bn: 'আমাদের মন্দির, যার সামনে খোদাই করা মা কালী, গণেশ ও কৃষ্ণ — গ্রামের পূজার প্রাণকেন্দ্র।' } },
    { area: 'music', img: unsplash('photo-1742632987158-23d3ecc9c73c', 900), position: '50% 30%', credit: { name: 'Ratul Pal', url: 'https://unsplash.com/photos/an-elderly-musician-sits-with-his-instruments-zNE_NOGieDQ' }, Icon: Drum, title: { en: 'Music & Dance', bn: 'গান ও নাচ' }, text: { en: 'Songs of harvest and wedding, drums at night, dances passed down the years.', bn: 'ফসল আর বিয়ের গান, রাতের মাদল, বংশ পরম্পরায় চলে আসা নাচ।' } },
    { area: 'food', img: unsplash('photo-1589778655375-3e622a9fc91c', 1100), credit: { name: 'Barun Ghosh', url: 'https://unsplash.com/photos/assorted-foods-on-stainless-steel-tray-wClFKcjhNcI' }, Icon: Soup, title: { en: 'Food', bn: 'খাবার' }, text: { en: 'The dishes our mothers make — and the ones cooked only on special days.', bn: 'মায়েদের হাতের রান্না — আর যা শুধু বিশেষ দিনেই হয়।' } },
    { area: 'haat', img: unsplash('photo-1742632986715-8795748fb43c', 1100), position: '50% 35%', credit: { name: 'Ratul Pal', url: 'https://unsplash.com/photos/woman-selling-goods-at-an-outdoor-market-XIhQnoa6Pw4' }, Icon: ShoppingBasket, title: { en: 'Weekly Haat', bn: 'সাপ্তাহিক হাট' }, text: { en: 'Market day: news, bargains, sweets and meeting everyone you know.', bn: 'হাটের দিন: খবর, দরদাম, মিষ্টি আর চেনা সবার সাথে দেখা।' } },
  ],

  // Festival calendar, in the order of the Bengali year (Jyaistha → Chaitra).
  // date is free text; months (1–12) mark the festival as "This season" when the current month matches.
  // tone picks the card's colours: sun | rain | serpent | moon | dawn | durga | kali | harvest | learn | kirtan.
  // img is the card photo (position = which part stays in view), credit names the Unsplash photographer.
  // dates: exact upcoming dates (add next year's when known); approx: true shows them as "about".
  // details: short points shown as chips on the card.
  // match finds the festival in Google's "Holidays in India" calendar, so the exact dates update every year
  // (needs GOOGLE_API_KEY in server/.env; without it, or when Google doesn't list it, date and months are used).
  festivals: [
    {
      Icon: UtensilsCrossed, tone: 'sun', img: unsplash('photo-1681840329074-2b5020f39d05', 900), position: '50% 50%', credit: { name: 'Ira Ispita Roy', url: 'https://unsplash.com/photos/a-plate-of-food-with-rice-meat-and-vegetables-fJozv1wkqs0' }, months: [6], match: /jamai/i,
      date: { en: 'June (Jyaistha)', bn: 'জ্যৈষ্ঠ / জুন' }, name: { en: 'Jamai Sasthi', bn: 'জামাইষষ্ঠী' },
      dates: [['2027-06-10']],
      details: [{ en: 'Shashthi puja by mothers-in-law', bn: 'শাশুড়িদের ষষ্ঠী পুজো' }, { en: 'Gifts and new clothes', bn: 'উপহার আর নতুন জামা' }, { en: 'A feast of fish and sweets', bn: 'মাছ-মিষ্টির জমজমাট ভোজ' }],
      text: { en: 'Sons-in-law are welcomed home: mothers-in-law bless them, and the day ends in a feast of fruit and sweets.', bn: 'জামাইদের বাড়িতে আদর করে ডাকা হয় — শাশুড়িরা আশীর্বাদ করেন, আর হয় ফল-মিষ্টি আর ভোজের আয়োজন।' },
    },
    {
      Icon: CloudRain, tone: 'rain', img: unsplash('photo-1593779509800-5c927227db13', 900), position: '50% 40%', credit: { name: 'Sreehari Devadas', url: 'https://unsplash.com/photos/green-grass-field-under-cloudy-sky-during-daytime-5CKqByQqu-w' }, months: [6], match: /ambubachi|amabachi/i,
      date: { en: 'Late June (Ashadh)', bn: 'আষাঢ় / জুন' }, name: { en: 'Amabachi', bn: 'অম্বুবাচী' },
      dates: [['2027-06-22', '2027-06-25']], approx: true,
      details: [{ en: 'Three days of no ploughing', bn: 'তিন দিন চাষ বন্ধ' }, { en: 'Earth rests after the first rain', bn: 'প্রথম বর্ষায় ধরিত্রীর বিশ্রাম' }, { en: 'Sowing begins when it ends', bn: 'শেষে শুরু হয় বীজ বোনা' }],
      text: { en: 'With the first rains Mother Earth is said to rest — no ploughing, and the fields wait for her blessing.', bn: 'বর্ষার শুরুতে ধরিত্রী মা বিশ্রাম নেন বলে বিশ্বাস — এই কদিন চাষ বন্ধ, মাঠ অপেক্ষা করে মায়ের আশীর্বাদের।' },
    },
    {
      Icon: Sprout, tone: 'serpent', img: unsplash('photo-1782812245910-eb81e9741291', 900), position: '50% 35%', credit: { name: 'Tahamie Farooqui', url: 'https://unsplash.com/photos/a-dark-cobra-raises-its-head-with-a-flared-hood-fKmadDvPIfE' }, months: [8], match: /manasa|mansa/i,
      date: { en: 'August (Shravan)', bn: 'শ্রাবণ / আগস্ট' }, name: { en: 'Mansa Puja', bn: 'মনসা পুজো' },
      dates: [['2027-08-18']], approx: true,
      details: [{ en: 'Manasa worship at home and mandap', bn: 'ঘরে ঘরে ও মণ্ডপে মনসা পুজো' }, { en: 'Prayers for a safe monsoon', bn: 'বর্ষায় সুরক্ষার প্রার্থনা' }, { en: 'Manasa Mangal songs', bn: 'মনসামঙ্গলের গান' }],
      text: { en: 'Worship of Maa Manasa, goddess of snakes, praying for every home to stay safe through the monsoon.', bn: 'সাপের দেবী মা মনসার পুজো — বর্ষায় প্রতিটি ঘরের সুরক্ষার প্রার্থনা।' },
    },
    {
      Icon: MoonStar, tone: 'moon', img: unsplash('photo-1729107861458-559daeaf2133', 900), position: '50% 30%', credit: { name: 'manish_ jadhav_photography05', url: 'https://unsplash.com/photos/a-woman-holding-a-baby-in-her-arms-Y1oUmzAQaUQ' }, months: [9], match: /jitiya|jivitputrika|jita/i,
      date: { en: 'Sept / Oct (Ashwin)', bn: 'আশ্বিন' }, name: { en: 'Jita Astami', bn: 'জিতাষ্টমী' },
      dates: [['2027-09-23']],
      details: [{ en: 'A day-long nirjala fast', bn: 'সারাদিন নির্জলা উপবাস' }, { en: 'Puja of Jimutavahana', bn: 'জীমূতবাহনের পুজো' }, { en: 'Prayers for the children', bn: 'সন্তানের মঙ্গল কামনা' }],
      text: { en: 'Mothers keep a day-long fast and pray for the long life of their children.', bn: 'সন্তানের দীর্ঘ আয়ুর জন্য মায়েরা সারাদিন উপবাস রেখে পুজো করেন।' },
    },
    {
      Icon: Sunrise, tone: 'dawn', img: unsplash('photo-1568742635798-fd2aa80a493a', 900), position: '40% 35%', credit: { name: 'Boudhayan Bardhan', url: 'https://unsplash.com/photos/woman-painting-statue-n2TpnZ9K28E' }, months: [9, 10], match: /mahalaya/i,
      date: { en: 'Sept / Oct', bn: 'সেপ্টেম্বর / অক্টোবর' }, name: { en: 'Mahalaya', bn: 'মহালয়া' },
      dates: [['2027-09-29']],
      details: [{ en: 'Mahishasuramardini at 4 am', bn: 'ভোর চারটেয় মহিষাসুরমর্দিনী' }, { en: 'Tarpan for the ancestors', bn: 'পিতৃপুরুষের তর্পণ' }, { en: 'Devipaksha begins', bn: 'দেবীপক্ষের সূচনা' }],
      text: { en: 'Before dawn the village wakes to the Mahishasuramardini chants, the artisans paint the goddess’s eyes, and the countdown to Durga Puja begins.', bn: 'ভোরের আগে মহিষাসুরমর্দিনীর সুরে গ্রাম জেগে ওঠে, প্রতিমার চোখ আঁকা হয় — শুরু হয় দেবীপক্ষ, পুজোর অপেক্ষা।' },
    },
    {
      Icon: Swords, tone: 'durga', img: unsplash('photo-1599106242946-fd550dac004c', 900), position: '50% 25%', credit: { name: 'Sonika Agarwal', url: 'https://unsplash.com/photos/durga-devi-statue-in-mumbai-P_G5rrqogok' }, months: [10], match: /durga|maha (saptami|ashtami|navami)|dussehra|vijaya ?dashami/i,
      date: { en: 'October', bn: 'আশ্বিন / অক্টোবর' }, name: { en: 'Durga Puja', bn: 'দুর্গাপুজো' },
      dates: [['2027-10-05', '2027-10-10']],
      details: [{ en: 'Shashthi to Dashami', bn: 'ষষ্ঠী থেকে দশমী' }, { en: 'Dhak, arati and pandal lights', bn: 'ঢাক, আরতি আর মণ্ডপের আলো' }, { en: 'Sindoor khela and Bijoya', bn: 'সিঁদুর খেলা ও বিজয়া' }],
      text: { en: 'Days of worship, new clothes, gatherings and fairs.', bn: 'পুজো, নতুন জামা, মিলন আর মেলার দিন।' },
    },
    {
      Icon: Flame, tone: 'kali', months: [10, 11], match: /kali puja|diwali|deepavali/i, featured: true, img: '/gallery/village/procession-04.jpg',
      date: { en: 'Oct / Nov', bn: 'কার্তিক / নভেম্বর' }, name: { en: 'Kali Puja', bn: 'কালীপুজো' },
      dates: [['2026-11-08'], ['2027-10-28']],
      details: [{ en: 'Midnight puja on Amavasya', bn: 'অমাবস্যার মধ্যরাতে পুজো' }, { en: 'Procession through every lane', bn: 'প্রতিটি গলিতে শোভাযাত্রা' }, { en: 'Diyas and fireworks', bn: 'প্রদীপ আর আতশবাজি' }],
      text: { en: 'The festival of Maa Kali, who is at the heart of our emblem. Villagers carry her through every lane, and homes glow with diyas.', bn: 'মা কালীর উৎসব, যিনি আমাদের প্রতীকের কেন্দ্রে। গ্রামবাসীরা মাকে কাঁধে নিয়ে প্রতিটি গলি ঘোরেন, আর ঘরে ঘরে জ্বলে প্রদীপ।' },
    },
    {
      Icon: Wheat, tone: 'harvest', img: unsplash('photo-1530507629858-e4977d30e9e0', 900), position: '50% 40%', credit: { name: 'Nandhu Kumar', url: 'https://unsplash.com/photos/woman-harvesting-rice-5NGTf4oD8RA' }, months: [11, 12],
      date: { en: 'Nov / Dec (Agrahayan)', bn: 'অগ্রহায়ণ' }, name: { en: 'Pura Astami', bn: 'পুরা অষ্টমী' },
      details: [{ en: 'Village puja in Agrahayan', bn: 'অগ্রহায়ণে গ্রামের পুজো' }, { en: 'The whole village gathers', bn: 'গোটা গ্রামের মিলন' }],
      text: { en: 'Our village puja in the month of Agrahayan, when the whole village gathers once more.', bn: 'অগ্রহায়ণ মাসে আমাদের গ্রামের পুজো — আবার একসাথে মেলে গোটা গ্রাম।' },
    },
    {
      Icon: Sun, tone: 'sun', months: [1], img: unsplash('photo-1677047759978-8782844a3d3a', 900), position: '50% 55%', credit: { name: 'ARTO SURAJ', url: 'https://unsplash.com/photos/two-people-in-a-small-boat-on-the-water-at-sunset-y4oZkoD6RYY' }, match: /makar sankranti/i,
      date: { en: 'January (Poush)', bn: 'পৌষ / জানুয়ারি' }, name: { en: 'Makar Sankranti', bn: 'মকর সংক্রান্তি' },
      dates: [['2027-01-15']],
      details: [{ en: 'Pithe-puli from new rice', bn: 'নতুন চালের পিঠে-পুলি' }, { en: 'Holy dip at dawn', bn: 'ভোরে পুণ্যস্নান' }, { en: 'Tusu songs and fair', bn: 'টুসু গান ও মেলা' }],
      text: { en: 'Harvest thanks with pithe-puli — sweets made from new rice — and a holy dip at dawn.', bn: 'নতুন চালের পিঠে-পুলি আর ভোরের পুণ্যস্নানে নতুন ফসলের উৎসব।' },
    },
    {
      Icon: BookOpen, tone: 'learn', img: unsplash('photo-1741273574071-04ecb1a973bb', 900), position: '50% 30%', credit: { name: 'Anik Deb Nath', url: 'https://unsplash.com/photos/a-statue-of-the-hindu-goddess-saraswati-srELgHLQ0Tg' }, months: [1, 2], match: /vasant panchami|basant panchami|saraswati/i,
      date: { en: 'Jan / Feb (Magh)', bn: 'মাঘ / ফেব্রুয়ারি' }, name: { en: 'Saraswati Puja', bn: 'সরস্বতী পুজো' },
      dates: [['2027-02-11']],
      details: [{ en: 'Books at the goddess’s feet', bn: 'দেবীর পায়ে বই' }, { en: 'Hate khori for the little ones', bn: 'ছোটদের হাতেখড়ি' }, { en: 'Yellow clothes and khichuri bhog', bn: 'বাসন্তী সাজ ও খিচুড়ি ভোগ' }],
      text: { en: 'Students place their books before Maa Saraswati, goddess of learning, and dress in spring yellow.', bn: 'বিদ্যার দেবী মা সরস্বতীর পায়ে বই রেখে ছাত্রছাত্রীদের পুজো, বাসন্তী রঙের সাজে।' },
    },
    {
      Icon: Drum, tone: 'kirtan', img: unsplash('photo-1783124759939-66f9889d4c59', 900), position: '50% 50%', credit: { name: 'Thilina Alagiyawanna', url: 'https://unsplash.com/photos/hands-beat-traditional-drums-during-a-performance-Y4d-2HF4GZE' }, months: [4],
      date: { en: '22–24 Chaitra (early April)', bn: '২২–২৪ চৈত্র' }, name: { en: 'Hori Naam', bn: 'হরিনাম' },
      dates: [['2027-04-05', '2027-04-07']], approx: true,
      details: [{ en: 'Three days of sankirtan', bn: 'তিন দিনের সংকীর্তন' }, { en: 'Khol and kartal', bn: 'খোল-করতাল' }, { en: 'Prasad for everyone', bn: 'সবার জন্য প্রসাদ' }],
      text: { en: 'Three days of Harinaam sankirtan — khol, kartal and the Lord’s name fill the whole village.', bn: 'তিন দিন ধরে হরিনাম সংকীর্তন — খোল-করতালের সুরে মুখর গোটা গ্রাম।' },
    },
  ],

  // Gallery: original photos and video of Sidhagora (files in client/public/gallery/village/).
  // cat: 'temple' | 'procession' | 'village'.  w/h: image size (keeps the layout steady while loading).
  // The first items are shown first; the rest appear with "Show all".
  gallery: [
    { src: '/gallery/village/procession-04.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Maa Kali, adorned in red flowers and gold', bn: 'লাল ফুল আর সোনালি সাজে মা কালী' } },
    { src: '/gallery/village/temple-carvings.jpg', cat: 'temple', w: 1280, h: 957, caption: { en: 'Maa Kali in the centre niche, with Ganesha and Krishna beside', bn: 'মাঝের খোপে মা কালী, পাশে গণেশ ও কৃষ্ণ' } },
    { video: '/gallery/village/kali-procession.mp4', cat: 'procession', w: 478, h: 850, caption: { en: 'The Kali Puja procession — video', bn: 'কালীপুজোর শোভাযাত্রা — ভিডিও' } },
    { src: '/gallery/village/village-pond.jpg', cat: 'village', w: 1280, h: 957, caption: { en: 'The village pond under a blue sky', bn: 'নীল আকাশের নিচে গ্রামের পুকুর' } },
    { src: '/gallery/village/procession-01.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Villagers carry Maa Kali on their shoulders', bn: 'কাঁধে করে মা কালীকে নিয়ে চলেছেন গ্রামবাসীরা' } },
    { src: '/gallery/village/temple-facade.jpg', cat: 'temple', w: 768, h: 1022, caption: { en: 'The carved façade of the village temple', bn: 'গ্রামের মন্দিরের কারুকাজ করা সামনের অংশ' } },
    { src: '/gallery/village/procession-11.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Across the open field', bn: 'খোলা মাঠ পেরিয়ে' } },
    { src: '/gallery/village/village-lane.jpg', cat: 'village', w: 960, h: 1140, caption: { en: 'A quiet lane lined with bamboo', bn: 'বাঁশঝাড়ে ঘেরা নিরিবিলি গলি' } },
    { src: '/gallery/village/procession-10.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Under the hanging banyan roots', bn: 'বটের ঝুরির নিচ দিয়ে' } },
    { src: '/gallery/village/temple-front.jpg', cat: 'temple', w: 768, h: 1022, caption: { en: 'The new temple, with work still going on', bn: 'নতুন মন্দির — কাজ এখনও চলছে' } },
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
  // How to reach: distance and time are { en, bn }; by is 'bus' or 'train'
  routes: [
    { from: { en: 'Barabazar', bn: 'বরাবাজার' }, distance: { en: '12 km', bn: '১২ কিমি' }, time: { en: '25 min', bn: '২৫ মিনিট' }, by: 'bus' },
    { from: { en: 'Barabhum railway station', bn: 'বরাভূম রেলস্টেশন' }, distance: { en: '12 km', bn: '১২ কিমি' }, time: { en: '27 min', bn: '২৭ মিনিট' }, by: 'bus' },
    { from: { en: 'Purulia town', bn: 'পুরুলিয়া শহর' }, distance: { en: '41 km', bn: '৪১ কিমি' }, time: { en: '45 min', bn: '৪৫ মিনিট' }, by: 'bus' },
    { from: { en: 'Kolkata', bn: 'কলকাতা' }, distance: { en: '278 km', bn: '২৭৮ কিমি' }, time: { en: '7 hr', bn: '৭ ঘণ্টা' }, by: 'train' },
  ],
};
