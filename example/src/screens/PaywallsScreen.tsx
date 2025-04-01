import * as React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { ApphudPaywall } from '@apphud/react-native-apphud-sdk';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import { common } from './styles';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const styles = StyleSheet.create({
  root: {
    padding: 8,
  },
});

export default function PaywallsScreen() {
  const [paywalls, setPaywalls] = React.useState<ApphudPaywall[]>([]);

  const navigation = useNavigation<NavigationProp<Record<string, any>>>();

  React.useEffect(() => {
    ApphudSdk.paywalls().then(setPaywalls);
  }, []);

  return (
    <ScrollView>
      <View style={styles.root}>
        <View style={common.table}>
          <View style={common.row}>
            <View style={common.col}>
              <Text style={common.th}>ID</Text>
            </View>
            <View style={common.col}>
              <Text style={common.th}>Products Length</Text>
            </View>
            <View style={common.col}>
              <Text style={common.th}>Exp name</Text>
            </View>
            <View style={common.col}>
              <Text style={common.th}>Variation name</Text>
            </View>
          </View>
          {paywalls.map((paywall) => (
            <View style={common.row} key={paywall.identifier}>
              <View style={common.col}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Paywall', {
                      paywallId: paywall.identifier,
                    });
                  }}
                >
                  <Text>{paywall.identifier}</Text>
                </TouchableOpacity>
              </View>
              <View style={common.col}>
                <Text>{paywall.products.length}</Text>
              </View>
              <View style={common.col}>
                <Text>{paywall.experimentName}</Text>
              </View>
              <View style={common.col}>
                <Text>{paywall.variationName}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
