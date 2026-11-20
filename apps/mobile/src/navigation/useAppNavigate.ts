import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { useNavigationLayout } from '@erui/core';

/**
 * Navigates to a shared route id regardless of the active layout:
 * tab/drawer destinations live in "main", overflow destinations are pushed on the root stack.
 */
export function useAppNavigate() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width } = useWindowDimensions();
  const { layout, tabs } = useNavigationLayout({ platform: 'native', viewportWidth: width, maxTabs: 4 });
  return useCallback(
    (routeId: string) => {
      const inMain = layout === 'hamburger' || tabs.some((t) => t.id === routeId);
      if (inMain) navigation.navigate('main', { screen: routeId });
      else navigation.navigate(`screen.${routeId}`);
    },
    [navigation, layout, tabs],
  );
}
