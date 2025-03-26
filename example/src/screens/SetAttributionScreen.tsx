import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import {
  ApphudSdk,
  ApphudAttributionProvider,
  type AttributionProperties,
} from '@apphud/react-native-apphud-sdk';

const DEFAULT_RAW_DATA = {
  rawDict_field_0: 'SomeCustomValue_1',
  rawDict_field_1: 'SomeCustomValue_2',
};

export default function SetAttributionScreen() {
  const [adNetwork, setAdNetwork] = useState('');
  const [channel, setChannel] = useState('');
  const [campaign, setCampaign] = useState('');
  const [adSet, setAdSet] = useState('');
  const [creative, setCreative] = useState('');
  const [keyword, setKeyword] = useState('');
  const [custom1, setCustom1] = useState('');
  const [custom2, setCustom2] = useState('');
  const [identifier, setIdentifier] = useState('');

  const [currentProviderId, setCurrentProviderId] = useState(
    ApphudAttributionProvider.custom
  );

  const [rawData, setRawData] = useState(() =>
    JSON.stringify(DEFAULT_RAW_DATA)
  );

  const setAttribution = () => {
    try {
      const props: AttributionProperties = {
        identifier: identifier || undefined,
        attributionProviderId: currentProviderId,
        data: {
          rawData: JSON.parse(rawData),
          adNetwork: adNetwork || undefined,
          channel: channel || undefined,
          campaign: campaign || undefined,
          adSet: adSet || undefined,
          creative: creative || undefined,
          keyword: keyword || undefined,
          custom1: custom1 || undefined,
          custom2: custom2 || undefined,
        },
      };

      ApphudSdk.setAttribution(props).then((result) =>
        Alert.alert(`Result: ${result}`)
      );
    } catch (ex: unknown) {
      Alert.alert(`error`, `${ex}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContainer}
    >
      <TextInput
        style={styles.rawInput}
        placeholder="Ad Network"
        onChangeText={setAdNetwork}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Channel"
        onChangeText={setChannel}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Campaign"
        onChangeText={setCampaign}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Ad Set"
        onChangeText={setAdSet}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Creative"
        onChangeText={setCreative}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Keyword"
        onChangeText={setKeyword}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Custom 1"
        onChangeText={setCustom1}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Custom 2"
        onChangeText={setCustom2}
      />
      <TextInput
        style={styles.rawInput}
        placeholder="Identifier"
        onChangeText={setIdentifier}
      />

      <TextInput
        style={styles.textarea}
        multiline
        placeholder="Raw data"
        value={rawData}
        onChangeText={setRawData}
      />
      <Button
        title="Default raw data"
        onPress={() => setRawData(JSON.stringify(DEFAULT_RAW_DATA))}
      />

      {Object.values(ApphudAttributionProvider).map((providerId) => (
        <TouchableOpacity
          key={providerId}
          onPress={() => setCurrentProviderId(providerId)}
        >
          <Text
            style={
              providerId === currentProviderId
                ? styles.selectedProviderStyle
                : styles.providerStyle
            }
          >
            {providerId}
          </Text>
        </TouchableOpacity>
      ))}

      <Button title="Set attribution" onPress={setAttribution} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerContainer: {
    padding: 16,
    gap: 16,
  },
  rawInput: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  textarea: {
    height: 120,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 16,
  },

  providerStyle: {},
  selectedProviderStyle: {
    color: 'blue',
  },
});
