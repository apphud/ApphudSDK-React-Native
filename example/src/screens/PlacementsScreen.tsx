import * as React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { ApphudPlacement } from '@apphud/react-native-apphud-sdk';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import { common } from './styles';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const styles = StyleSheet.create({
  root: {
    padding: 8,
  },
});

export default function PlacementsScreen() {
  const [placements, setPlacements] = React.useState<ApphudPlacement[]>([]);

  const navigation = useNavigation<NavigationProp<Record<string, any>>>();

  React.useEffect(() => {
    ApphudSdk.placements().then(setPlacements);
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
              <Text style={common.th}>Paywall</Text>
            </View>
            <View style={common.col}>
              <Text style={common.th}>ExpName</Text>
            </View>
          </View>
          {placements.map((placement) => (
            <View style={common.row} key={placement.identifier}>
              <View style={common.col}>
                <Text>{placement.identifier}</Text>
              </View>
              <View style={common.col}>
                <TouchableOpacity
                  disabled={!placement.paywall?.identifier}
                  onPress={() => {
                    navigation.navigate('Paywall', {
                      paywallId: placement.paywall?.identifier,
                    });
                  }}
                >
                  <Text>{placement.paywall?.identifier}</Text>
                </TouchableOpacity>
              </View>
              <View style={common.col}>
                <Text>{placement.experimentName}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
