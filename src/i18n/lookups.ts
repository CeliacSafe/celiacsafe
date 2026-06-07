import type { VenueType } from '../types/Restaurant';

type Lang = 'es' | 'en' | 'de';

type LocalizedLabel = Record<Lang, string>;

export const VENUE_TYPE_NAMES: Record<VenueType, LocalizedLabel> = {
  restaurant: { es: 'Restaurantes', en: 'Restaurants', de: 'Restaurants' },
  cafe: { es: 'Cafes', en: 'Cafes', de: 'Cafes' },
  bakery: { es: 'Panaderias', en: 'Bakeries', de: 'Baeckereien' },
  pastry_shop: { es: 'Pastelerias', en: 'Pastry shops', de: 'Patisserien' },
  ice_cream: { es: 'Heladerias', en: 'Ice cream', de: 'Eisdielen' },
  pizzeria: { es: 'Pizzerias', en: 'Pizzerias', de: 'Pizzerien' },
  bar_tapas: { es: 'Bares y tapas', en: 'Bars and tapas', de: 'Bars und Tapas' },
  fast_food: { es: 'Comida rapida', en: 'Fast food', de: 'Fast Food' },
  hotel_restaurant: { es: 'Restaurante de hotel', en: 'Hotel restaurant', de: 'Hotelrestaurant' },
  food_truck: { es: 'Food trucks', en: 'Food trucks', de: 'Foodtrucks' },
  catering: { es: 'Catering', en: 'Catering', de: 'Catering' },
  brunch_place: { es: 'Brunch', en: 'Brunch', de: 'Brunch' },
  burger_joint: { es: 'Hamburgueserias', en: 'Burger places', de: 'Burgerlokale' },
  asian_restaurant: { es: 'Asiatico', en: 'Asian', de: 'Asiatisch' },
};

export const DELIVERY_PLATFORM_NAMES: Record<string, LocalizedLabel> = {
  glovo: { es: 'Glovo', en: 'Glovo', de: 'Glovo' },
  uber_eats: { es: 'Uber Eats', en: 'Uber Eats', de: 'Uber Eats' },
  just_eat: { es: 'Just Eat', en: 'Just Eat', de: 'Just Eat' },
  wolt: { es: 'Wolt', en: 'Wolt', de: 'Wolt' },
  deliveroo: { es: 'Deliveroo', en: 'Deliveroo', de: 'Deliveroo' },
  lieferando: { es: 'Lieferando', en: 'Lieferando', de: 'Lieferando' },
  foodora: { es: 'Foodora', en: 'Foodora', de: 'Foodora' },
  takeaway: { es: 'Takeaway', en: 'Takeaway', de: 'Takeaway' },
  bolt_food: { es: 'Bolt Food', en: 'Bolt Food', de: 'Bolt Food' },
  own_delivery: { es: 'Entrega propia', en: 'Own delivery', de: 'Eigene Lieferung' },
};

export const CUISINE_TYPE_NAMES: Record<string, LocalizedLabel> = {
  andaluza: { es: 'Andaluza', en: 'Andalusian', de: 'Andalusisch' },
  arroces: { es: 'Arroces', en: 'Rice dishes', de: 'Reisgerichte' },
  asiatica: { es: 'Asiática', en: 'Asian', de: 'Asiatisch' },
  asturiana: { es: 'Asturiana', en: 'Asturian', de: 'Asturisch' },
  brasileña: { es: 'Brasileña', en: 'Brazilian', de: 'Brasilianisch' },
  catalana: { es: 'Catalana', en: 'Catalan', de: 'Katalanisch' },
  cordobesa: { es: 'Cordobesa', en: 'Cordovan', de: 'Cordobesisch' },
  espanola: { es: 'Española', en: 'Spanish', de: 'Spanisch' },
  hamburguesas: { es: 'Hamburguesas', en: 'Burgers', de: 'Burger' },
  internacional: { es: 'Internacional', en: 'International', de: 'International' },
  italiana: { es: 'Italiana', en: 'Italian', de: 'Italienisch' },
  japonesa: { es: 'Japonesa', en: 'Japanese', de: 'Japanisch' },
  mallorquina: { es: 'Mallorquina', en: 'Majorcan', de: 'Mallorquinisch' },
  mariscos: { es: 'Mariscos', en: 'Seafood', de: 'Meeresfrüchte' },
  mediterranea: { es: 'Mediterránea', en: 'Mediterranean', de: 'Mediterran' },
  mexicana: { es: 'Mexicana', en: 'Mexican', de: 'Mexikanisch' },
  pasta: { es: 'Pasta', en: 'Pasta', de: 'Pasta' },
  pizzas: { es: 'Pizzas', en: 'Pizzas', de: 'Pizza' },
  saludable: { es: 'Saludable', en: 'Healthy', de: 'Gesund' },
  sidreria: { es: 'Sidrería', en: 'Cider house', de: 'Sidreria' },
  sushi: { es: 'Sushi', en: 'Sushi', de: 'Sushi' },
  tapas: { es: 'Tapas', en: 'Tapas', de: 'Tapas' },
  valenciana: { es: 'Valenciana', en: 'Valencian', de: 'Valencianisch' },
  vasca: { es: 'Vasca', en: 'Basque', de: 'Baskisch' },
  vegana: { es: 'Vegana', en: 'Vegan', de: 'Vegan' },
  vegetariana: { es: 'Vegetariana', en: 'Vegetarian', de: 'Vegetarisch' },
  venezolana: { es: 'Venezolana', en: 'Venezuelan', de: 'Venezolanisch' },
};

/** Fallback-Label fuer unbekannte Cuisine-Codes (z. B. wagyu-fusion -> Wagyu Fusion). */
export function formatCuisineFallback(code: string): string {
  return code
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
