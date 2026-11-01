import { Sparkles, HandHeart, Users, UtensilsCrossed, Trees, House, MessageCircle, Hash, Pin } from 'lucide-react';

// Change these to your village and language name.
export const site = {
  name: 'Sidhagora',
  nameBn: 'সিধাগোড়া',
  // Credit line at the bottom of the footer. url: your portfolio (the name becomes a link when set).
  designer: { name: 'Giriraj Mahanty', url: 'https://girirajmahanty.vercel.app/' },
};

export const categories = [
  { id: 'all', Icon: Sparkles },
  { id: 'greeting', Icon: HandHeart },
  { id: 'family', Icon: Users },
  { id: 'food', Icon: UtensilsCrossed },
  { id: 'nature', Icon: Trees },
  { id: 'daily', Icon: House },
  { id: 'phrase', Icon: MessageCircle },
  { id: 'number', Icon: Hash },
  { id: 'other', Icon: Pin },
];

export const categoryIcon = (id) => categories.find((c) => c.id === id)?.Icon || Pin;
