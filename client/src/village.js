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
    en: ['Kali', 'temple', 'festivals'],
    bn: ['কালী', 'মন্দিরে', 'উৎসবে'],
  },

  // Hero text
  heroLine: {
    en: "A village in Purulia with Maa Kali at its heart. We pray at her carved temple, keep the night of Kali Puja, and carry her ourselves to her immersion. Eleven festivals a year bring the whole village out.",
    bn: "পুরুলিয়ার এক গ্রাম, মা কালী যার প্রাণ। তাঁর কারুকাজ করা মন্দিরে আমাদের পুজো, কালীপুজোর রাত জাগা, আর বিসর্জনে নিজেরাই কাঁধে করে তাঁকে নিয়ে যাওয়া। বছরে এগারোটা উৎসবে গোটা গ্রাম পথে নামে।",
  },

  // About the village (each item is one paragraph). Replace with Sidhagora's real history when you have it.
  story: [
    {
      en: "Sidhagora is home. It sits in Barabazar, Purulia, among open fields, quiet ponds, lanes lined with bamboo and old temples. Almost every season brings a festival.",
      bn: "সিধাগোড়া আমাদের ঘর। পুরুলিয়ার বরাবাজারে খোলা মাঠ, শান্ত পুকুর, বাঁশঝাড়ে ঘেরা গলি আর পুরোনো মন্দির নিয়ে আমাদের গ্রাম। প্রায় প্রতি ঋতুতেই কোনো না কোনো উৎসব লেগে থাকে।",
    },
    {
      en: "Our emblem, SMK, dates from 1901, and Maa Kali is at its centre. For generations the village has gathered around her: at the temple for puja, and after Kali Puja, when we carry her on our own shoulders to her immersion (bisarjan).",
      bn: "আমাদের প্রতীক এসএমকে-র শুরু ১৯০১ সালে, তার মাঝখানে মা কালী। পুরুষানুক্রমে গ্রাম তাঁকে ঘিরেই জড়ো হয়েছে: মন্দিরে পুজোয়, আর কালীপুজোর পর যখন নিজেদের কাঁধে করে তাঁকে বিসর্জনে নিয়ে যাই।",
    },
    {
      en: "Right now a new temple is going up in the village. We made this website so that everyone who calls Sidhagora home, whether they live here or far away, can see our story, our festivals and our photos.",
      bn: "এখন গ্রামে নতুন মন্দির তৈরি হচ্ছে। এই ওয়েবসাইটটা বানানো যাতে সিধাগোড়াকে যাঁরা ঘর বলেন, গ্রামে থাকুন বা দূরে, সবাই আমাদের গল্প, উৎসব আর ছবি দেখতে পান।",
    },
  ],

  // Highlighted quote in the story section
  storyQuote: {
    en: 'Wherever we are, Maa calls us home for Kali Puja.',
    bn: 'যেখানেই থাকি, কালীপুজোয় মা আমাদের ঘরে ফিরিয়ে আনেন।',
  },

  // Photos in the story collage (your own photos in client/public/gallery/)
  storyImages: {
    main: { src: '/gallery/village/procession-01.jpg', position: '50% 30%', caption: { en: 'Villagers carry Maa Kali for her immersion', bn: 'বিসর্জনে মা কালীকে কাঁধে নিয়ে চলেছেন গ্রামবাসীরা' } },
    side: { src: '/gallery/village/temple-carvings.jpg', position: '50% 40%', caption: { en: 'Maa Kali, Ganesha and Krishna on the temple wall', bn: 'মন্দিরের দেওয়ালে মা কালী, গণেশ ও কৃষ্ণ' } },
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
    { area: 'fields', img: '/gallery/village/village-pond.jpg', position: '40% 50%', Icon: Wheat, title: { en: 'Ponds & Fields', bn: 'পুকুর ও মাঠ' }, text: { en: "The ponds, the green fields and the turn of the seasons. This is what puts food on every table.", bn: "পুকুর, সবুজ মাঠ আর ঋতুর পালাবদল। প্রতিটা ঘরের ভাত এখান থেকেই আসে।" } },
    { area: 'fest', img: '/gallery/village/procession-03.jpg', position: '50% 25%', Icon: Flame, title: { en: 'Festivals', bn: 'উৎসব' }, text: { en: "The days the whole village turns out, like walking with Maa Kali to her immersion after Kali Puja.", bn: "যে দিনগুলোয় গোটা গ্রাম পথে নামে, যেমন কালীপুজোর পর মা কালীর সঙ্গে বিসর্জনে হাঁটা।" } },
    { area: 'temple', img: '/gallery/village/temple-facade.jpg', position: '50% 35%', Icon: Landmark, title: { en: 'Temple & Worship', bn: 'মন্দির ও পুজো' }, text: { en: "Our temple, with Maa Kali, Ganesha and Krishna carved on its front. This is where the village comes to pray.", bn: "আমাদের মন্দির, যার সামনে খোদাই করা মা কালী, গণেশ আর কৃষ্ণ। গ্রামের পুজো এখানেই।" } },
    { area: 'music', Icon: Drum, title: { en: 'Music & Dance', bn: 'গান ও নাচ' }, text: { en: "Harvest songs, wedding songs, drums late into the night, and dances handed down through the years.", bn: "ফসলের গান, বিয়ের গান, অনেক রাত পর্যন্ত মাদল, আর বংশ পরম্পরায় চলে আসা নাচ।" } },
    { area: 'food', Icon: Soup, title: { en: 'Food', bn: 'খাবার' }, text: { en: "Whatever our mothers cook, and the special dishes that only come out on festival days.", bn: "মায়েদের হাতের রান্না, আর যে পদগুলো শুধু বিশেষ দিনেই হয়।" } },
    { area: 'haat', Icon: ShoppingBasket, title: { en: 'Weekly Haat', bn: 'সাপ্তাহিক হাট' }, text: { en: "Market day. You go to bargain and buy sweets, meet everyone you know, and come home with all the news.", bn: "হাটবার। দরদাম, মিষ্টি কেনা, চেনা সবার সঙ্গে দেখা, আর ফেরা গ্রামের সব খবর নিয়ে।" } },
  ],

  // Festival calendar, in the order of the Bengali year (Jyaistha → Chaitra).
  // date is free text; months (1–12) mark the festival as "This season" when the current month matches.
  // tone picks the card's colours: sun | rain | serpent | moon | dawn | durga | kali | harvest | learn | kirtan.
  // img is the card photo (position = which part stays in view); without one the card shows an art panel.
  // dates: exact upcoming dates (add next year's when known); approx: true shows them as "about".
  // details: short points shown as chips on the card.
  // match finds the festival in Google's "Holidays in India" calendar, so the exact dates update every year
  // (needs GOOGLE_API_KEY in server/.env; without it, or when Google doesn't list it, date and months are used).
  festivals: [
    {
      Icon: UtensilsCrossed, tone: 'sun', months: [6], match: /jamai/i,
      date: { en: 'June (Jyaistha)', bn: 'জ্যৈষ্ঠ / জুন' }, name: { en: 'Jamai Sasthi', bn: 'জামাইষষ্ঠী' },
      dates: [['2027-06-10']],
      details: [{ en: 'Shashthi puja by mothers-in-law', bn: 'শাশুড়িদের ষষ্ঠী পুজো' }, { en: 'Gifts and new clothes', bn: 'উপহার আর নতুন জামা' }, { en: 'A feast of fish and sweets', bn: 'মাছ-মিষ্টির জমজমাট ভোজ' }],
      text: { en: "The day sons-in-law are called home. Mothers-in-law bless them, and then comes a big meal of fruit and sweets.", bn: "জামাইদের আদর করে বাড়িতে ডাকার দিন। শাশুড়িরা আশীর্বাদ করেন, তারপর ফল-মিষ্টি দিয়ে জমিয়ে খাওয়াদাওয়া।" },
    },
    {
      Icon: CloudRain, tone: 'rain', img: '/gallery/village/village-lane.jpg', position: '50% 45%', months: [6], match: /ambubachi|amabachi/i,
      date: { en: 'Late June (Ashadh)', bn: 'আষাঢ় / জুন' }, name: { en: 'Amabachi', bn: 'অম্বুবাচী' },
      dates: [['2027-06-22', '2027-06-25']], approx: true,
      details: [{ en: 'Three days of no ploughing', bn: 'তিন দিন চাষ বন্ধ' }, { en: 'Earth rests after the first rain', bn: 'প্রথম বর্ষায় ধরিত্রীর বিশ্রাম' }, { en: 'Sowing begins when it ends', bn: 'শেষে শুরু হয় বীজ বোনা' }],
      text: { en: "When the first rains come, Mother Earth is believed to rest. Nobody ploughs for these days, and the fields wait for her blessing.", bn: "বর্ষা নামলে ধরিত্রী মা বিশ্রাম নেন বলে আমাদের বিশ্বাস। এই কদিন কেউ লাঙল দেয় না, মাঠ অপেক্ষা করে মায়ের আশীর্বাদের।" },
    },
    {
      Icon: Sprout, tone: 'serpent', months: [8], match: /manasa|mansa/i,
      date: { en: 'August (Shravan)', bn: 'শ্রাবণ / আগস্ট' }, name: { en: 'Mansa Puja', bn: 'মনসা পুজো' },
      dates: [['2027-08-18']], approx: true,
      details: [{ en: 'Manasa worship at home and mandap', bn: 'ঘরে ঘরে ও মণ্ডপে মনসা পুজো' }, { en: 'Prayers for a safe monsoon', bn: 'বর্ষায় সুরক্ষার প্রার্থনা' }, { en: 'Manasa Mangal songs', bn: 'মনসামঙ্গলের গান' }],
      text: { en: "We pray to Maa Manasa, goddess of snakes, to keep every home safe through the monsoon.", bn: "সাপের দেবী মা মনসার কাছে প্রার্থনা, বর্ষায় যেন প্রতিটা ঘর নিরাপদ থাকে।" },
    },
    {
      Icon: MoonStar, tone: 'moon', months: [9], match: /jitiya|jivitputrika|jita/i,
      date: { en: 'Sept / Oct (Ashwin)', bn: 'আশ্বিন' }, name: { en: 'Jita Astami', bn: 'জিতাষ্টমী' },
      dates: [['2027-09-23']],
      details: [{ en: 'A day-long nirjala fast', bn: 'সারাদিন নির্জলা উপবাস' }, { en: 'Puja of Jimutavahana', bn: 'জীমূতবাহনের পুজো' }, { en: 'Prayers for the children', bn: 'সন্তানের মঙ্গল কামনা' }],
      text: { en: "Mothers fast all day and pray that their children live long.", bn: "সন্তানের দীর্ঘ আয়ু চেয়ে মায়েরা সারাদিন উপোস রেখে পুজো করেন।" },
    },
    {
      Icon: Sunrise, tone: 'dawn', months: [9, 10], match: /mahalaya/i,
      date: { en: 'Sept / Oct', bn: 'সেপ্টেম্বর / অক্টোবর' }, name: { en: 'Mahalaya', bn: 'মহালয়া' },
      dates: [['2027-09-29']],
      details: [{ en: 'Mahishasuramardini at 4 am', bn: 'ভোর চারটেয় মহিষাসুরমর্দিনী' }, { en: 'Tarpan for the ancestors', bn: 'পিতৃপুরুষের তর্পণ' }, { en: 'Devipaksha begins', bn: 'দেবীপক্ষের সূচনা' }],
      text: { en: "Before dawn the village wakes to the Mahishasuramardini chants. The goddess’s eyes are painted, and the wait for Durga Puja begins.", bn: "ভোর হওয়ার আগেই মহিষাসুরমর্দিনী শুনে গ্রাম জাগে। প্রতিমার চোখ আঁকা হয়, শুরু হয় দেবীপক্ষ আর পুজোর অপেক্ষা।" },
    },
    {
      Icon: Swords, tone: 'durga', months: [10], match: /durga|maha (saptami|ashtami|navami)|dussehra|vijaya ?dashami/i,
      date: { en: 'October', bn: 'আশ্বিন / অক্টোবর' }, name: { en: 'Durga Puja', bn: 'দুর্গাপুজো' },
      dates: [['2027-10-05', '2027-10-10']],
      details: [{ en: 'Shashthi to Dashami', bn: 'ষষ্ঠী থেকে দশমী' }, { en: 'Dhak, arati and pandal lights', bn: 'ঢাক, আরতি আর মণ্ডপের আলো' }, { en: 'Sindoor khela and Bijoya', bn: 'সিঁদুর খেলা ও বিজয়া' }],
      text: { en: "Puja, new clothes, everyone meeting up, and the fair.", bn: "পুজো, নতুন জামা, সবার সঙ্গে দেখা, আর মেলা।" },
    },
    {
      Icon: Flame, tone: 'kali', months: [10, 11], match: /kali puja|diwali|deepavali/i, featured: true, img: '/gallery/village/procession-04.jpg',
      date: { en: 'Oct / Nov', bn: 'কার্তিক / নভেম্বর' }, name: { en: 'Kali Puja', bn: 'কালীপুজো' },
      dates: [['2026-11-08'], ['2027-10-28']],
      details: [{ en: 'Midnight puja on Amavasya', bn: 'অমাবস্যার মধ্যরাতে পুজো' }, { en: 'Immersion (bisarjan) procession', bn: 'বিসর্জনের শোভাযাত্রা' }, { en: 'Diyas and fireworks', bn: 'প্রদীপ আর আতশবাজি' }],
      text: { en: "Maa Kali is at the centre of our emblem, and this is her night. She is worshipped through the Amavasya night, every home lights diyas, and afterwards the whole village carries her to her immersion.", bn: "আমাদের প্রতীকের মাঝখানে মা কালী, আর এই রাতটা তাঁর। অমাবস্যার রাত জুড়ে পুজো, ঘরে ঘরে প্রদীপ, আর তারপর গোটা গ্রাম মিলে কাঁধে করে তাঁকে বিসর্জনে নিয়ে যায়।" },
    },
    {
      Icon: Wheat, tone: 'harvest', months: [11, 12],
      date: { en: 'Nov / Dec (Agrahayan)', bn: 'অগ্রহায়ণ' }, name: { en: 'Pura Astami', bn: 'পুরা অষ্টমী' },
      details: [{ en: 'Village puja in Agrahayan', bn: 'অগ্রহায়ণে গ্রামের পুজো' }, { en: 'The whole village gathers', bn: 'গোটা গ্রামের মিলন' }],
      text: { en: "Our own village puja in Agrahayan, when everyone gathers in one place again.", bn: "অগ্রহায়ণে আমাদের নিজেদের গ্রামের পুজো, আবার সবাই এক জায়গায়।" },
    },
    {
      Icon: Sun, tone: 'sun', months: [1], img: '/gallery/village/village-pond.jpg', position: '50% 55%', match: /makar sankranti/i,
      date: { en: 'January (Poush)', bn: 'পৌষ / জানুয়ারি' }, name: { en: 'Makar Sankranti', bn: 'মকর সংক্রান্তি' },
      dates: [['2027-01-15']],
      details: [{ en: 'Pithe-puli from new rice', bn: 'নতুন চালের পিঠে-পুলি' }, { en: 'Holy dip at dawn', bn: 'ভোরে পুণ্যস্নান' }],
      text: { en: "We give thanks for the harvest with pithe-puli made from the new rice, and take a holy dip at dawn.", bn: "নতুন চালের পিঠে-পুলি আর ভোরের পুণ্যস্নান দিয়ে নতুন ফসলকে ধন্যবাদ জানানো।" },
    },
    {
      Icon: BookOpen, tone: 'learn', months: [1, 2], match: /vasant panchami|basant panchami|saraswati/i,
      date: { en: 'Jan / Feb (Magh)', bn: 'মাঘ / ফেব্রুয়ারি' }, name: { en: 'Saraswati Puja', bn: 'সরস্বতী পুজো' },
      dates: [['2027-02-11']],
      details: [{ en: 'Books at the goddess’s feet', bn: 'দেবীর পায়ে বই' }, { en: 'Hate khori for the little ones', bn: 'ছোটদের হাতেখড়ি' }, { en: 'Yellow clothes and khichuri bhog', bn: 'বাসন্তী সাজ ও খিচুড়ি ভোগ' }],
      text: { en: "Students put their books at the feet of Maa Saraswati, goddess of learning, and dress in spring yellow.", bn: "ছাত্রছাত্রীরা বিদ্যার দেবী মা সরস্বতীর পায়ে বই রাখে, পরে বাসন্তী রঙের জামা।" },
    },
    {
      Icon: Drum, tone: 'kirtan', months: [4],
      date: { en: '22–24 Chaitra (early April)', bn: '২২–২৪ চৈত্র' }, name: { en: 'Hori Naam', bn: 'হরিনাম' },
      dates: [['2027-04-05', '2027-04-07']], approx: true,
      details: [{ en: 'Three days of sankirtan', bn: 'তিন দিনের সংকীর্তন' }, { en: 'Khol and kartal', bn: 'খোল-করতাল' }, { en: 'Prasad for everyone', bn: 'সবার জন্য প্রসাদ' }],
      text: { en: "Three days of Harinaam sankirtan. Khol, kartal and the Lord’s name, all over the village.", bn: "তিন দিন ধরে হরিনাম সংকীর্তন। খোল-করতাল আর হরিনামে গমগম করে গোটা গ্রাম।" },
    },
  ],

  // Gallery: original photos and video of Sidhagora (files in client/public/gallery/village/).
  // cat: 'temple' | 'procession' | 'village'.  w/h: image size (keeps the layout steady while loading).
  // The first items are shown first; the rest appear with "Show all".
  gallery: [
    { src: '/gallery/village/procession-04.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Maa Kali, adorned in red flowers and gold', bn: 'লাল ফুল আর সোনালি সাজে মা কালী' } },
    { src: '/gallery/village/temple-carvings.jpg', cat: 'temple', w: 1280, h: 957, caption: { en: 'Maa Kali in the centre niche, with Ganesha and Krishna beside', bn: 'মাঝের খোপে মা কালী, পাশে গণেশ ও কৃষ্ণ' } },
    { video: '/gallery/village/kali-procession.mp4', cat: 'procession', w: 478, h: 850, caption: { en: "Video of Maa Kali’s immersion procession", bn: "মা কালীর বিসর্জনের শোভাযাত্রার ভিডিও" } },
    { src: '/gallery/village/village-pond.jpg', cat: 'village', w: 1280, h: 957, caption: { en: 'The village pond under a blue sky', bn: 'নীল আকাশের নিচে গ্রামের পুকুর' } },
    { src: '/gallery/village/procession-01.jpg', cat: 'procession', w: 867, h: 1156, caption: { en: 'Villagers carry Maa Kali on their shoulders', bn: 'কাঁধে করে মা কালীকে নিয়ে চলেছেন গ্রামবাসীরা' } },
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
