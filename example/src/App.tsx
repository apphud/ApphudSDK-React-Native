import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import ActionsScreen from './screens/ActionsScreen';
import ProductsScreen from './screens/ProductsScreen';
import PaywallScreen from './screens/PaywallScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Actions" component={ActionsScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
