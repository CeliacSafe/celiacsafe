import type { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';

import type { BuscarStackParamList } from './BuscarStack';
import type { ComunidadStackParamList } from './ComunidadStack';
import type { FavoritosStackParamList } from './FavoritosStack';
import type { MapaStackParamList } from './MapaStack';
import type { PerfilStackParamList } from './PerfilStack';

/**
 * Deep-Linking-Konfiguration für native (Schema celiacsafe://) und Web.
 *
 * Beispiele:
 *   celiacsafe://restaurant/es_md_001
 *   https://celiacsafe.vercel.app/restaurant/es_md_001
 *   https://celiacsafe.vercel.app/map
 */
type RootTabParamList = {
  Buscar: NavigatorScreenParams<BuscarStackParamList>;
  Comunidad: NavigatorScreenParams<ComunidadStackParamList>;
  Mapa: NavigatorScreenParams<MapaStackParamList>;
  Favoritos: NavigatorScreenParams<FavoritosStackParamList>;
  Perfil: NavigatorScreenParams<PerfilStackParamList>;
};

export const WEB_URL = 'https://celiacsafe.vercel.app';

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['celiacsafe://', `${WEB_URL}/`, 'https://celiacsafe.app/'],
  config: {
    screens: {
      Buscar: {
        screens: {
          BuscarList: 'search',
          RestaurantDetail: 'restaurant/:restaurantId',
        },
      },
      Comunidad: {
        screens: {
          ComunidadMain: 'community',
          RestaurantDetail: 'community/restaurant/:restaurantId',
          SubmitRestaurant: 'community/submit',
        },
      },
      Mapa: {
        screens: {
          MapaMain: 'map',
          RestaurantDetail: 'map/restaurant/:restaurantId',
        },
      },
      Favoritos: {
        screens: {
          FavoritosList: 'favorites',
          RestaurantDetail: 'favorites/restaurant/:restaurantId',
        },
      },
      Perfil: {
        screens: {
          PerfilMain: 'profile',
          About: 'about',
          Privacy: 'privacy',
          Impressum: 'impressum',
          SubmitRestaurant: 'submit',
        },
      },
    },
  },
};
