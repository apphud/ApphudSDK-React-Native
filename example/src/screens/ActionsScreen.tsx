import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';
import type { ApphudPaywall } from '@apphud/react-native-apphud-sdk';
import type { Props } from './LoginScreen';
import { ScrollView } from 'react-native-gesture-handler';

const boldStyles = StyleSheet.create({
  customText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  italicText: {
    fontStyle: 'italic',
  },
});

export default function ActionsScreen({ navigation }: Props) {
  React.useEffect(() => {
    ApphudSdk.userId().then((userId) => {
      navigation.setOptions({
        title: userId, // Set the new title here
      });
    });
  }, [navigation]);

  React.useEffect(() => {
    const loadPaywalls = navigation.addListener('focus', () => {
      // This function will be called when the view appears
      paywallsLoaded;
    });

    return loadPaywalls;
  }, []);

  const paywallsLoaded = ApphudSdk.paywalls().then((data) => {
    setPaywalls(data);
  });

  const [paywalls, setPaywalls] = React.useState<Array<ApphudPaywall>>();

  const callAll = () => {
    ApphudSdk.enableDebugLogs();

    // ApphudSdk.setAdvertisingIdentifier('42ed88fd-b446-4eb1-81ae-83e3025c04cf')

    // ApphudSdk.userId().then((userId) => console.log(`Apphud: userId: ${userId}`));
    ApphudSdk.hasActiveSubscription().then((active) => {
      console.log('START Has Active Subscription: = ' + active);
    });

    ApphudSdk.attributeFromWeb({
      apphud_user_id: 'aaf48728-6854-4a37-9f3b-6ab59e66b4da',
    }).then((result) => {
      console.log(
        'attribute from web result: = ' + JSON.stringify(result, null, 2)
      );
    });

    // ApphudSdk.setUserProperty({key: 'some_string_key2', value: 'some_string_valueee', setOnce: true})
    // ApphudSdk.setUserProperty({key: 'some_float_key3', value: 1.45, setOnce: true})
    // // ApphudSdk.incrementUserProperty({key: 'some2_float_ke2y', by: 2.01})
    // ApphudSdk.setUserProperty({key: ApphudUserPropertyKey.Email, value: 'user2@apphud.com', setOnce: false})
    // ApphudSdk.addAttribution({data: {network: 'Facebook2', campaign: 'Campaign', adgroup: 'AdGroup', creative: 'Creative'}, identifier: 'abc-defgee', attributionProviderId: ApphudAttributionProvider.AppsFlyer})
    // ApphudSdk.addAttribution({data: null, identifier: 'abc-xxcvcxv123345', attributionProviderId: ApphudAttributionProvider.Firebase})
    // ApphudSdk.addAttribution({data: null, identifier: 'abc22-def-token1235556', attributionProviderId: ApphudAttributionProvider.AppleSearchAds})

    // ApphudSdk.collectDeviceIdentifiers()

    // ApphudSdk.isNonRenewingPurchaseActive('com.apphud.demo.nonconsumable.premium').then(value => {
    //   console.log(`Apphud: isNonRenewingPurchaseActive: ${value}`)
    //  })

    //  ApphudSdk.nonRenewingPurchases().then(purchases => {
    //   console.log(`Apphud: nonRenewingPurchases: ${JSON.stringify(purchases)}`)
    //  })
    //  ApphudSdk.subscription().then(s => {
    //   console.log(`Apphud: subscription: ${JSON.stringify(s)}`)
    //  })
    //  ApphudSdk.subscriptions().then(ss => {
    //   console.log(`Apphud: subscriptions: ${JSON.stringify(ss)}`)
    //  })
    //  ApphudSdk.paywalls().then(paywalls => {
    //   console.log(`Apphud: paywalls: ${JSON.stringify(paywalls)}`)
    //  })
    //  ApphudSdk.products().then(products => {
    //   console.log(`Apphud: products: ${JSON.stringify(products)}`)
    //  })

    // ApphudSdk.optOutOfTracking()

    //  ApphudSdk.syncPurchasesInObserverMode().then(_ => {
    //   console.log(`sync purchases finished`)
    //  })
    //  ApphudSdk.restorePurchases().then(result => {
    //   console.log(`restore purchases finished ${JSON.stringify(result)}`)
    //  })

    // if (Platform.OS == 'ios') {
    //   ApphudSdk.submitPushNotificationsToken('cc9b1656924dfdeb2a791da1da1d2afbfde35ddc8229470b73c4cf7a6a478027')
    //   ApphudSdk.handlePushNotification({userInfo: {}, screen_id: 'd33b28ea-da91-4287-b1e8-2354bcbdc633', rule_id: '1b050976-6d76-489c-9271-af4343f5bda9'})
    // }
  };

  return (
    <ScrollView>
      <View style={{ flex: 1 }}>
        <ListItem>
          <ListItem.Title style={boldStyles.customText}>
            Paywalls ({paywalls?.length}){' '}
          </ListItem.Title>
        </ListItem>

        {paywalls?.map((paywall, index) => (
          <ListItem
            key={index}
            onPress={() => {
              navigation.navigate('Paywall', { paywallId: paywall.identifier });
            }}
          >
            <ListItem.Content>
              <ListItem.Title style={boldStyles.italicText}>
                {' '}
                {'->>>'} {paywall.identifier} ({paywall.products.length}){' '}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
        <ListItem>
          <ListItem.Title style={boldStyles.customText}>
            Other Actions{' '}
          </ListItem.Title>
        </ListItem>

        <ListItem onPress={() => navigation.navigate('Products')}>
          <ListItem.Content>
            <ListItem.Title>View All Products</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem onPress={callAll}>
          <ListItem.Content>
            <ListItem.Title>Log All Functions to Console</ListItem.Title>
          </ListItem.Content>
        </ListItem>

        <ListItem
          onPress={() => {
            ApphudSdk.logout().then(() => {
              navigation.popToTop();
            });
          }}
        >
          <ListItem.Content>
            <ListItem.Title>Log Out</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </View>
    </ScrollView>
  );
}
