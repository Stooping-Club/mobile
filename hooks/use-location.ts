import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Berkeley, CA — default when location isn't available
const BERKELEY_DEFAULT = {
  latitude: 37.8716,
  longitude: -122.2727,
};

export interface LocationState {
  latitude: number;
  longitude: number;
  permitted: boolean;
  loading: boolean;
  error?: string;
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    ...BERKELEY_DEFAULT,
    permitted: false,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (mounted) {
            setState({ ...BERKELEY_DEFAULT, permitted: false, loading: false });
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (mounted) {
          setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            permitted: true,
            loading: false,
          });
        }
      } catch (err) {
        if (mounted) {
          setState({
            ...BERKELEY_DEFAULT,
            permitted: false,
            loading: false,
            error: 'Could not get location',
          });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
