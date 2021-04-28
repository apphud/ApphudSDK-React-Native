import * as React from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import ApphudSdk from '@apphud/react-native-apphud-sdk';
import type { Props } from './HomeScreen';

export default function ActionsScreen({ navigation }: Props) {
  const errorHandler = (err: Error) => Alert.alert('error', err.message);
  React.useEffect(() => {
    navigation.addListener('beforeRemove', () => {
      ApphudSdk.logout();
    });
  }, [navigation]);
  return (
    <ScrollView>
      <View style={{ flex: 1 }}>
        <ListItem
          onPress={() =>
            ApphudSdk.hasActiveSubscription()
              .then((bool) =>
                Alert.alert('hasActiveSubscription', bool ? 'Yes' : 'No')
              )
              .catch(errorHandler)
          }
        >
          <ListItem.Content>
            <ListItem.Title>Check Active Subscriptions</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem onPress={() => navigation.navigate('Products')}>
          <ListItem.Content>
            <ListItem.Title>Products</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          onPress={() => {
            ApphudSdk.subscription()
              .then((subscription) => {
                Alert.alert('subscription', JSON.stringify(subscription));
              })
              .catch(errorHandler);
          }}
        >
          <ListItem.Content>
            <ListItem.Title>Get Subscription</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          onPress={() => {
            ApphudSdk.nonRenewingPurchases()
              .then((purchases) => {
                Alert.alert('purchases', JSON.stringify(purchases));
              })
              .catch(errorHandler);
          }}
        >
          <ListItem.Content>
            <ListItem.Title>Get Non-renewing Purchases</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Platform.OS === 'ios' && (
          <>
            <ListItem
              onPress={() => {
                ApphudSdk.restorePurchases()
                  .then((purchases) => {
                    Alert.alert('purchases', JSON.stringify(purchases));
                  })
                  .catch(errorHandler);
              }}
            >
              <ListItem.Content>
                <ListItem.Title>Restore Purchases</ListItem.Title>
              </ListItem.Content>
            </ListItem>
            <ListItem
              onPress={() => navigation.navigate('AddAdvertisingIdentifier')}
            >
              <ListItem.Content>
                <ListItem.Title>Set advertising ID</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </>
        )}
        <ListItem
          onPress={() => navigation.navigate('CheckIsNonRenewingPurchase')}
        >
          <ListItem.Content>
            <ListItem.Title>Сheck is Non-renewing Purchase</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {Platform.OS === 'android' && (
          <>
            <ListItem onPress={() => navigation.navigate('Purchase')}>
              <ListItem.Content>
                <ListItem.Title>Purchase by id</ListItem.Title>
              </ListItem.Content>
            </ListItem>
            <ListItem
              onPress={() => {
                ApphudSdk.subscriptions()
                  .then((subscriptions) => {
                    Alert.alert('subscriptions', JSON.stringify(subscriptions));
                  })
                  .catch(errorHandler);
              }}
            >
              <ListItem.Content>
                <ListItem.Title>Get subscriptions</ListItem.Title>
              </ListItem.Content>
            </ListItem>
            <ListItem
              onPress={() => {
                ApphudSdk.syncPurchases()
                  .then(() => {
                    Alert.alert('syncPurchases', 'success');
                  })
                  .catch(errorHandler);
              }}
            >
              <ListItem.Content>
                <ListItem.Title>Sync Purchases</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </>
        )}
        <ListItem onPress={() => navigation.navigate('UserProperty')}>
          <ListItem.Content>
            <ListItem.Title>User property</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem onPress={() => navigation.navigate('AddAttribution')}>
          <ListItem.Content>
            <ListItem.Title>Add attribution</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          onPress={() => {
            ApphudSdk.userId()
              .then((userId) => {
                Alert.alert('userID', userId);
              })
              .catch(errorHandler);
          }}
        >
          <ListItem.Content>
            <ListItem.Title>Get User ID</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </View>
    </ScrollView>
  );
}
