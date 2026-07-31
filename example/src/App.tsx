import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  ApphudSdk,
  ApphudSdkEventEmitter,
} from '@apphud/react-native-apphud-sdk';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import ActionsScreen from './screens/ActionsScreen';
import ProductsScreen from './screens/ProductsScreen';
import PaywallScreen from './screens/PaywallScreen';
import PlacementsScreen from './screens/PlacementsScreen';
import SetAttributionScreen from './screens/SetAttributionScreen';
import PaywallNativeScreen from './screens/PaywallNativeScreen';
import UpdateUserIDScreen from './screens/UpdateUserIDScreen';
import { getStoredApiKey, startApphudSession } from './session';

type RootStackParamList = {
  Login: undefined;
  Actions: undefined;
  Products: undefined;
  Paywall: { placementId: string };
  Placements: undefined;
  SetAttribution: undefined;
  PaywallNativeScreen: undefined;
  UpdateUserID: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

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

ApphudSdkEventEmitter.onApphudRuleScreenDidAppear((arg) => {
  console.log('Received event ApphudRuleScreenDidAppear:', arg);
});

ApphudSdkEventEmitter.onApphudRuleWillPurchase((arg) => {
  console.log('Received event ApphudRuleWillPurchase:', arg);
});

ApphudSdkEventEmitter.onApphudRulePurchaseCompleted((arg) => {
  console.log('Received event ApphudRulePurchaseCompleted:', arg);
});

ApphudSdkEventEmitter.onApphudRuleScreenWillDismiss((arg) => {
  console.log('Received event ApphudRuleScreenWillDismiss:', arg);
});

ApphudSdkEventEmitter.onApphudRuleScreenDidDismiss((arg) => {
  console.log('Received event ApphudRuleScreenDidDismiss:', arg);
});

ApphudSdkEventEmitter.onApphudRuleDidSelectSurveyAnswer((arg) => {
  console.log('Received event ApphudRuleDidSelectSurveyAnswer:', arg);
});

ApphudSdkEventEmitter.onApphudRulePaywallWithoutScreen((arg) => {
  console.log('Received event ApphudRulePaywallWithoutScreen:', arg);
});

ApphudSdkEventEmitter.onPlacementsDidFullyLoad((arg) => {
  console.log('Received event PlacementsDidFullyLoad:', arg);
});

ApphudSdkEventEmitter.onUserDidLoad((arg) => {
  console.log('Received event UserDidLoad:', arg);
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

/**
 * Digs the `raw` match object out of the attribution payload. The platforms hand
 * over different slices of the API envelope: Android unwraps to `data.results`,
 * while iOS forwards the whole response body.
 */
function resolveRawMatch(
  attribution: Record<string, unknown>
): Record<string, unknown> | null {
  const data = asRecord(attribution.data);
  const results = asRecord(data?.results ?? attribution.results);
  const raw = asRecord(results?.raw ?? attribution.raw);

  return raw ?? ('match_score' in attribution ? attribution : null);
}

const matchScoreOf = (raw: Record<string, unknown> | null): number | null => {
  const score = raw?.match_score;
  if (typeof score === 'number') {
    return score;
  }
  if (typeof score === 'string' && score.trim() !== '') {
    const parsed = Number(score);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

ApphudSdkEventEmitter.onApphudDeeplinkAttribution((arg) => {
  console.log(
    `Received event ApphudDeeplinkAttribution: kind=${arg.kind}, url=${
      arg.url ?? 'null'
    },`,
    `attribution=${JSON.stringify(arg.attribution)}`
  );

  const raw = resolveRawMatch(arg.attribution);
  const matchScore = matchScoreOf(raw);

  // Only surface an actual match; organic opens come back with a null or zero score.
  if (matchScore !== null && matchScore > 0) {
    Alert.alert('Deeplink Match found', JSON.stringify(raw, null, 2));
  }
});

function App() {
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Restore a previous demo session: if an api key is stored, start Apphud and
  // skip the Login screen on the next launch.
  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const storedApiKey = await getStoredApiKey();
        if (storedApiKey) {
          await startApphudSession({ apiKey: storedApiKey, persist: false });
          if (!cancelled) {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.warn('Failed to restore Apphud session', error);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Android forwards links natively in MainActivity via Apphud.handleIntent.
  // iOS forwards React Native Linking URLs to Apphud here.
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      return;
    }

    void Linking.getInitialURL().then((url) => {
      if (url) {
        ApphudSdk.handleDeeplinkUrl(url);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      ApphudSdk.handleDeeplinkUrl(url);
    });

    return () => subscription.remove();
  }, []);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Actions' : 'Login'}>
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
