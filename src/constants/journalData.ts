import { ImageSourcePropType } from 'react-native';

export type Mood = {
  id: string;
  label: string;
  icon: string;
};

export const MOODS: Mood[] = [
  { id: 'happy', label: 'Happy', icon: 'happy-outline' },
  { id: 'playful', label: 'Playful', icon: 'sparkles-outline' },
  { id: 'calm', label: 'Calm', icon: 'leaf-outline' },
  { id: 'loved', label: 'Loved', icon: 'heart-outline' },
  { id: 'sad', label: 'Sad', icon: 'water-outline' },
];

export type BackgroundItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  category: string;
};

export const BACKGROUND_CATEGORIES = [
  {
    id: 'blue',
    label: 'Blue',
    items: [
      { id: 'b_1', name: 'Blue Check', image: require('../app/jpics/blue/1.png'), category: 'blue' },
      { id: 'b_2', name: 'Blue Stars', image: require('../app/jpics/blue/2.png'), category: 'blue' },
      { id: 'b_3', name: 'Yellow & Blue Swirl', image: require('../app/jpics/blue/3.jpg'), category: 'blue' },
      { id: 'b_4', name: 'Blue Wavy Check', image: require('../app/jpics/blue/4.jpg'), category: 'blue' },
      { id: 'b_5', name: 'Navy Check', image: require('../app/jpics/blue/5.jpg'), category: 'blue' },
      { id: 'b_6', name: 'Orange & Blue Waves', image: require('../app/jpics/blue/6.jpg'), category: 'blue' },
      { id: 'b_7', name: 'Orange & Blue Waves', image: require('../app/jpics/blue/7.jpg'), category: 'blue' },
      { id: 'b_8', name: 'Orange & Blue Waves', image: require('../app/jpics/blue/8.jpg'), category: 'blue' },
    ],
  },
  {
    id: 'green',
    label: 'Green',
    items: [
      { id: 'g_1', name: 'Green Swirls', image: require('../app/jpics/green/1.jpg'), category: 'green' },
      { id: 'g_2', name: 'Green Check', image: require('../app/jpics/green/2.jpg'), category: 'green' },
      { id: 'g_3', name: 'Froggies', image: require('../app/jpics/green/3.jpg'), category: 'green' },
      { id: 'g_4', name: 'Limes', image: require('../app/jpics/green/4.jpg'), category: 'green' },
      { id: 'g_5', name: 'Lime Waves', image: require('../app/jpics/green/5.jpg'), category: 'green' }, 
      { id: 'g_6', name: 'Lime Waves', image: require('../app/jpics/green/6.jpg'), category: 'green' },
      { id: 'g_7', name: 'Lime Waves', image: require('../app/jpics/green/7.jpg'), category: 'green' },
      { id: 'g_8', name: 'Lime Waves', image: require('../app/jpics/green/8.jpg'), category: 'green' },
    
    ],
  },
  {
    id: 'pink',
    label: 'Pink',
    items: [
      { id: 'p_1', name: 'Pink Stars', image: require('../app/jpics/pink/1.png'), category: 'pink' },
      { id: 'p_2', name: 'Bows', image: require('../app/jpics/pink/2.png'), category: 'pink' },
      { id: 'p_3', name: 'Pink Check', image: require('../app/jpics/pink/3.png'), category: 'pink' },
      { id: 'p_4', name: 'Dark Pink Stars', image: require('../app/jpics/pink/4.png'), category: 'pink' },
      { id: 'p_5', name: 'Pink Waves', image: require('../app/jpics/pink/5.png'), category: 'pink' },
      { id: 'p_6', name: 'Light Pink Check', image: require('../app/jpics/pink/6.png'), category: 'pink' },
      { id: 'p_7', name: 'Red Abstract', image: require('../app/jpics/pink/7.png'), category: 'pink' }, 
      { id: 'p_8', name: 'Red Abstract', image: require('../app/jpics/pink/7.png'), category: 'pink' },

    ],
  },
  {
    id: 'purple',
    label: 'Purple',
    items: [
      { id: 'pur_1', name: 'Purple Stars', image: require('../app/jpics/purple/1.jpg'), category: 'purple' },
      { id: 'pur_2', name: 'Lavender Stars', image: require('../app/jpics/purple/2.jpg'), category: 'purple' },
      { id: 'pur_3', name: 'Purple Wavy Check', image: require('../app/jpics/purple/3.jpg'), category: 'purple' },
      { id: 'pur_4', name: 'Purple Bows', image: require('../app/jpics/purple/4.jpg'), category: 'purple' },
      { id: 'pur_5', name: 'Purple Flowers', image: require('../app/jpics/purple/5.jpg'), category: 'purple' },
      { id: 'pur_6', name: 'Soft Purple Waves', image: require('../app/jpics/purple/6.jpg'), category: 'purple' },
      { id: 'pur_7', name: 'Soft Purple Waves', image: require('../app/jpics/purple/7.jpg'), category: 'purple' },
      { id: 'pur_8', name: 'Soft Purple Waves', image: require('../app/jpics/purple/8.jpg'), category: 'purple' },
    ],
  },
  {
    id: 'red',
    label: 'Red',
    items: [
      { id: 'r_1', name: 'Red & Pink Waves', image: require('../app/jpics/red/1.jpg'), category: 'red' },
      { id: 'r_2', name: 'Brown & Cream Check', image: require('../app/jpics/red/2.jpg'), category: 'red' },
      { id: 'r_3', name: 'Red Bows', image: require('../app/jpics/red/3.jpg'), category: 'red' },
      { id: 'r_4', name: 'Lips', image: require('../app/jpics/red/4.jpg'), category: 'red' },
      { id: 'r_5', name: 'Hearts', image: require('../app/jpics/red/5.jpg'), category: 'red' },
      { id: 'r_6', name: 'Red Stars', image: require('../app/jpics/red/6.jpg'), category: 'red' },
      { id: 'r_7', name: 'Red Swirls', image: require('../app/jpics/red/7.jpg'), category: 'red' },
      { id: 'r_8', name: 'Red Check', image: require('../app/jpics/red/8.jpg'), category: 'red' },
    ],
  },
  {
    id: 'yellow',
    label: 'Yellow',
    items: [
      { id: 'y_1', name: 'Yellow Waves', image: require('../app/jpics/yellow/1.jpg'), category: 'yellow' },
      { id: 'y_2', name: 'Yellow Check', image: require('../app/jpics/yellow/2.jpg'), category: 'yellow' },
      { id: 'y_3', name: 'Yellow Sparkles', image: require('../app/jpics/yellow/3.jpg'), category: 'yellow' },
      { id: 'y_4', name: 'Soft Yellow', image: require('../app/jpics/yellow/4.jpg'), category: 'yellow' },
      { id: 'y_5', name: 'Cream Waves', image: require('../app/jpics/yellow/5.jpg'), category: 'yellow' },
      { id: 'y_6', name: 'Lemons', image: require('../app/jpics/yellow/6.jpg'), category: 'yellow' },
      { id: 'y_7', name: 'Yellow Gingham', image: require('../app/jpics/yellow/7.jpg'), category: 'yellow' },
      { id: 'y_8', name: 'Yellow Blob', image: require('../app/jpics/yellow/8.jpg'), category: 'yellow' },
    ],
  },
] as const;

export const FALLBACK_BACKGROUND_LIST = ['b_2', 'p_3', 'y_2', 'g_3', 'pur_1'];

export function findImageSource(backgroundId?: string | null) {
  for (const category of BACKGROUND_CATEGORIES) {
    const found = category.items.find((item) => item.id === backgroundId);
    if (found) return found.image;
  }
  return BACKGROUND_CATEGORIES[0].items[1].image;
}

export function findBackground(backgroundId?: string | null) {
  for (const category of BACKGROUND_CATEGORIES) {
    const found = category.items.find((item) => item.id === backgroundId);
    if (found) return found;
  }
  return BACKGROUND_CATEGORIES[0].items[1];
}
