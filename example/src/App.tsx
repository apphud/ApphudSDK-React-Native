import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ApphudSdkEventEmitter } from '@apphud/react-native-apphud-sdk';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import ActionsScreen from './screens/ActionsScreen';
import ProductsScreen from './screens/ProductsScreen';
import PaywallScreen from './screens/PaywallScreen';
import PlacementsScreen from './screens/PlacementsScreen';
import SetAttributionScreen from './screens/SetAttributionScreen';
import PaywallNativeScreen from './screens/PaywallNativeScreen';
import UpdateUserIDScreen from './screens/UpdateUserIDScreen';

const Stack = createStackNavigator();

ApphudSdkEventEmitter.onApphudDidChangeUserID((newUserId) =>
  console.log('Received event ApphudDidChangeUserID:', newUserId)
);

ApphudSdkEventEmitter.onApphudDidFailPurchase((arg) => {
  console.log('Received event apphudDidFailPurchase:', arg);
});

ApphudSdkEventEmitter.onApphudDidLoadStoreProducts((arg) => {
  console.log('Received event ApphudDidLoadStoreProducts:', arg);
});

ApphudSdkEventEmitter.onApphudDidPurchase((arg) => {
  console.log('Received event ApphudDidPurchase:', arg);
});

ApphudSdkEventEmitter.onApphudDidSelectSurveyAnswer((arg) => {
  console.log('Received event ApphudDidSelectSurveyAnswer:', arg);
});

ApphudSdkEventEmitter.onApphudNonRenewingPurchasesUpdated((arg) => {
  console.log('Received event ApphudNonRenewingPurchasesUpdated:', arg);
});

ApphudSdkEventEmitter.onApphudScreenDidAppear((arg) => {
  console.log('Received event ApphudScreenDidAppear:', arg);
});

ApphudSdkEventEmitter.onApphudSubscriptionsUpdated((arg) => {
  console.log('Received event ApphudSubscriptionsUpdated:', arg);
});

ApphudSdkEventEmitter.onApphudWillPurchase((arg) => {
  console.log('Received event ApphudWillPurchase:', arg);
});

ApphudSdkEventEmitter.onPlacementsDidFullyLoad((arg) => {
  console.log('Received event PlacementsDidFullyLoad:', arg);
});

ApphudSdkEventEmitter.onUserDidLoad((arg) => {
  console.log('Received event UserDidLoad:', arg);
});

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Actions" component={ActionsScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="Placements" component={PlacementsScreen} />
        <Stack.Screen name="SetAttribution" component={SetAttributionScreen} />
        <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
          <Stack.Screen
            name="PaywallNativeScreen"
            component={PaywallNativeScreen}
            options={{ header: () => null }}
          />
        </Stack.Group>
        <Stack.Screen name="UpdateUserID" component={UpdateUserIDScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
