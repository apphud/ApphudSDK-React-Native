import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ActionsScreen from './screens/ActionsScreen';
import PurchaseScreen from './screens/PurchaseScreen';
import CheckIsNonRenewingPurchaseScreen from './screens/CheckIsNonRenewingPurchaseScreen';
import AddAttributionScreen from './screens/AddAttributionScreen';
import ProductsScreen from './screens/ProductsScreen';
import UserPropertyScreen from './screens/UserPropertyScreen';
import AddAdvertisingIdentifier from './screens/AddAdvertisingIdentifier';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={HomeScreen} />
        <Stack.Screen name="Actions" component={ActionsScreen} />
        <Stack.Screen name="Purchase" component={PurchaseScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="AddAttribution" component={AddAttributionScreen} />
        <Stack.Screen name="UserProperty" component={UserPropertyScreen} />
        <Stack.Screen
          name="AddAdvertisingIdentifier"
          component={AddAdvertisingIdentifier}
        />
        <Stack.Screen
          name="CheckIsNonRenewingPurchase"
          component={CheckIsNonRenewingPurchaseScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
