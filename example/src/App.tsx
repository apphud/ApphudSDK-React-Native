import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ActionsScreen from './screens/ActionsScreen';
import AddAttributionScreen from './screens/AddAttributionScreen';
import ProductsScreen from './screens/ProductsScreen';
import UserPropertyScreen from './screens/UserPropertyScreen';
import PaywallScreen from './screens/PaywallScreen';
import type { ApphudPaywall } from '@apphud/react-native-apphud-sdk';
import type { StackScreenProps } from '@react-navigation/stack';

const Stack = createStackNavigator();

export interface ActionsProps {
  navigation: StackScreenProps<any>;
  updatePaywall: (newValue: ApphudPaywall) => void;
}

function App() {

  const [selectedPaywall, setSelectedPaywall] = React.useState<ApphudPaywall>();

  // Function to update the state
  function updatePaywall(newValue: ApphudPaywall) {
    setSelectedPaywall(newValue);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={HomeScreen} />
        <Stack.Screen name="Actions" component={ActionsScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="AddAttribution" component={AddAttributionScreen} />
        <Stack.Screen name="UserProperty" component={UserPropertyScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
