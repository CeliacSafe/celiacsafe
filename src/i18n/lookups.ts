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
