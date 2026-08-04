import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import type {
  ApphudPaywall,
  ApphudProduct,
  ApphudPurchaseProps,
  ApphudPurchasePromoProps,
  SKProductDiscount,
} from '@apphud/react-native-apphud-sdk';
import {
  ApphudSdk,
  PaywallScreenPresenter,
} from '@apphud/react-native-apphud-sdk';

const MODAL_SCROLL_MAX_HEIGHT = Dimensions.get('window').height * 0.52;
const PROMO_DEBUG_PRODUCT_ID = 'com.apphud.monthly_promo';
const PROMO_DEBUG_TAG = `[Apphud Promo Debug] ${PROMO_DEBUG_PRODUCT_ID}`;

function logMonthlyPromoDebug(event: string, payload: Record<string, unknown>) {
  console.log(PROMO_DEBUG_TAG, event, JSON.stringify(payload, null, 2));
}

const colors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  primary: '#007AFF',
  primaryMuted: '#E8F2FF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

interface ProductProps {
  productId: string;
  price: number;
  formattedPrice: string;
  basePlanId?: string;
  offerToken?: string;
  offerId?: string;
  standardPriceLabel?: string;
  offerPeriodLabel?: string;
  properties?: Record<string, unknown>;
  discounts?: SKProductDiscount[];
}

function buildPurchaseOptions(
  product: ProductProps,
  paywall?: ApphudPaywall
): ApphudPurchaseProps & { forceRefresh: boolean; preferredTimeout: number } {
  const options: ApphudPurchaseProps & {
    forceRefresh: boolean;
    preferredTimeout: number;
  } = {
    productId: product.productId,
    paywallIdentifier: paywall?.identifier,
    placementIdentifier: paywall?.placementIdentifier,
    offerToken: product.offerToken,
    forceRefresh: true,
    preferredTimeout: 21,
  };

  if (Platform.OS === 'android') {
    options.isConsumable =
      !product.basePlanId &&
      product.productId !== 'com.apphud.demo.nonconsumable.premium';
  }

  return options;
}

function promoOfferLabel(
  discount: SKProductDiscount,
  currencyCode: string
): string {
  const priceLabel =
    discount.price === 0
      ? 'Free'
      : formatCurrency(discount.price, currencyCode);
  const modeLabel =
    discount.paymentMode === 2
      ? 'free trial'
      : discount.paymentMode === 1
        ? 'up front'
        : 'pay as you go';

  return `${discount.identifier} — ${priceLabel} (${modeLabel})`;
}

function formatCurrency(amount: number, currencyCode: string): string {
  const code = currencyCode?.trim() || 'USD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

function inferPeriodLabel(basePlanId?: string, offerId?: string): string {
  const source = `${basePlanId ?? ''} ${offerId ?? ''}`.toLowerCase();
  if (source.includes('year') || source.includes('annual')) {
    return 'Yearly';
  }
  if (source.includes('month') || source.includes('monthly')) {
    return 'Monthly';
  }
  if (source.includes('week') || source.includes('weekly')) {
    return 'Weekly';
  }
  if (source.includes('day') || source.includes('daily')) {
    return 'Daily';
  }
  return 'Not specified';
}

function inferStandardPriceLabel(
  formattedPrice: string,
  pricingPhases?: Array<{ formattedPrice?: string }>
): string {
  const lastPhasePrice =
    pricingPhases?.[pricingPhases.length - 1]?.formattedPrice;
  return lastPhasePrice?.trim() || formattedPrice;
}

function prepareProducts(products: ApphudProduct[]): ProductProps[] {
  if (Platform.OS === 'ios') {
    return products.map((product) => {
      const price = product.skProduct?.price ?? 0;
      const currencyCode = product.skProduct?.priceLocale.currencyCode ?? 'USD';

      return {
        productId: product.productId,
        price,
        formattedPrice: formatCurrency(price, currencyCode),
        basePlanId: product.basePlanId,
        properties: product.properties,
        discounts: product.skProduct?.discounts,
      };
    });
  }

  return products.flatMap((product) => {
    const shared = {
      properties: product.properties,
    };

    if (product.productDetails?.oneTimePurchaseOffer) {
      const offer = product.productDetails.oneTimePurchaseOffer;
      const price = offer.price ?? 0;

      return {
        productId: product.productId,
        price,
        formattedPrice:
          offer.formattedPrice?.trim() || formatCurrency(price, 'USD'),
        basePlanId: product.basePlanId,
        ...shared,
      };
    }

    if (product.productDetails?.subscriptionOffers) {
      return product.productDetails.subscriptionOffers.map((offer) => {
        const price = offer.pricingPhases?.[0]?.price ?? 0;
        const formatted =
          offer.pricingPhases?.[0]?.formattedPrice?.trim() ||
          formatCurrency(price, 'USD');

        return {
          productId: product.productId,
          price,
          formattedPrice: formatted,
          basePlanId: offer.basePlanId ?? product.basePlanId,
          offerToken: offer.offerToken,
          offerId: offer.offerId,
          standardPriceLabel: inferStandardPriceLabel(
            formatted,
            offer.pricingPhases
          ),
          offerPeriodLabel: inferPeriodLabel(
            offer.basePlanId ?? product.basePlanId,
            offer.offerId
          ),
          ...shared,
        };
      });
    }

    return [];
  });
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function ProductCard({
  product,
  onPurchase,
  onViewProperties,
}: {
  product: ProductProps;
  onPurchase: () => void;
  onViewProperties: () => void;
}) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productLabel}>Product ID</Text>
          <Text style={styles.productValue}>{product.productId}</Text>
          <Text style={[styles.productLabel, styles.productLabelSpaced]}>
            Base plan ID
          </Text>
          <Text style={styles.productValue}>{product.basePlanId || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          style={styles.propertiesButton}
          onPress={onViewProperties}
          activeOpacity={0.7}
        >
          <Text style={styles.propertiesButtonText}>Properties</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={onPurchase}
        activeOpacity={0.85}
      >
        <Text style={styles.buyButtonText}>See options</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PaywallScreen({
  route,
  navigation,
}: {
  route: { params: { placementId: string } };
  navigation: any;
}) {
  const paywallShownTrackedRef = React.useRef(false);
  const [currentPaywall, setCurrentPaywall] = React.useState<ApphudPaywall>();
  const [productsProps, setProductsProps] = React.useState<ProductProps[]>([]);
  const [apphudProductsById, setApphudProductsById] = React.useState<
    Record<string, ApphudProduct>
  >({});
  const [paywallScreenPresenter, setPaywallScreenPresenter] =
    React.useState<PaywallScreenPresenter | null>(null);
  const [propertiesModal, setPropertiesModal] = React.useState<{
    productId: string;
    properties: Record<string, unknown>;
  } | null>(null);
  const [androidOffersModal, setAndroidOffersModal] = React.useState<{
    productId: string;
    options: ProductProps[];
  } | null>(null);
  const displayProducts = React.useMemo(() => {
    if (Platform.OS !== 'android') {
      return productsProps;
    }

    const uniqueByProductId = new Map<string, ProductProps>();
    productsProps.forEach((product) => {
      if (!uniqueByProductId.has(product.productId)) {
        uniqueByProductId.set(product.productId, product);
      }
    });

    return Array.from(uniqueByProductId.values());
  }, [productsProps]);

  React.useEffect(() => {
    paywallScreenPresenter?.addEventListener('closeButtonTapped', () =>
      console.log('close button tapped')
    );
    paywallScreenPresenter?.addEventListener('error', (error) =>
      console.log('error', error)
    );
    paywallScreenPresenter?.addEventListener('screenShown', () => {
      console.log('screenShown');
    });
    paywallScreenPresenter?.addEventListener(
      'transactionStarted',
      (product) => {
        console.log('transactionStarted', product);
      }
    );
    paywallScreenPresenter?.addEventListener(
      'transactionCompleted',
      (product) => {
        console.log('transactionCompleted', product);
      }
    );

    return () => {
      paywallScreenPresenter?.dispose();
    };
  }, [paywallScreenPresenter]);

  React.useEffect(() => {
    paywallShownTrackedRef.current = false;
  }, [route.params.placementId]);

  React.useEffect(() => {
    if (!currentPaywall || paywallShownTrackedRef.current) {
      return;
    }

    paywallShownTrackedRef.current = true;
    console.log('[PaywallScreen] paywall shown', {
      paywallIdentifier: currentPaywall.identifier,
      placementIdentifier: currentPaywall.placementIdentifier,
      experiment: currentPaywall.experimentName,
      variation: currentPaywall.variationName,
    });
    ApphudSdk.paywallShown({
      paywallIdentifier: currentPaywall.identifier,
      placementIdentifier: currentPaywall.placementIdentifier,
      forceRefresh: true,
      preferredTimeout: 21,
    });
  }, [currentPaywall]);

  React.useEffect(() => {
    const findPaywall = async () => {
      const placements = await ApphudSdk.placements({
        forceRefresh: false,
        preferredTimeout: 21,
      });
      const placement = placements.find(
        (item) => item.identifier === route.params.placementId
      );

      if (!placement) {
        throw new Error(`Placement "${route.params.placementId}" not found`);
      }

      if (!placement.paywall) {
        throw new Error(
          `Placement "${route.params.placementId}" has no paywall`
        );
      }

      const paywall = placement.paywall;
      setCurrentPaywall(paywall);
      setPaywallScreenPresenter(
        new PaywallScreenPresenter({
          placementIdentifier: paywall.placementIdentifier,
          forceRefresh: true,
          preferredTimeout: 21,
          maxAttempts: 4,
        })
      );

      setProductsProps(prepareProducts(paywall.products));
      const productsById = Object.fromEntries(
        paywall.products.map((item) => [item.productId, item])
      );
      setApphudProductsById(productsById);

      const monthlyPromo = productsById[PROMO_DEBUG_PRODUCT_ID];
      if (monthlyPromo) {
        logMonthlyPromoDebug('paywall_loaded', {
          paywallId: paywall.identifier,
          placementId: paywall.placementIdentifier,
          skProductPrice: monthlyPromo.skProduct?.price,
          discounts: monthlyPromo.skProduct?.discounts ?? [],
          discountsCount: monthlyPromo.skProduct?.discounts?.length ?? 0,
        });
      } else {
        logMonthlyPromoDebug('paywall_loaded', {
          paywallId: paywall.identifier,
          message: 'product not found on paywall',
          productIds: paywall.products.map((p) => p.productId),
        });
      }

      return paywall;
    };

    findPaywall()
      .then((paywall) => {
        navigation.setOptions({
          title: paywall.identifier ?? 'Paywall',
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, [navigation, route.params.placementId]);

  const showPurchaseResult = (result: unknown) => {
    Alert.alert('Purchase Result', JSON.stringify(result, null, 2));
  };

  const runPurchase = (
    options: ApphudPurchaseProps & {
      forceRefresh: boolean;
      preferredTimeout: number;
    }
  ) => {
    ApphudSdk.purchase(options)
      .then(showPurchaseResult)
      .catch((error) => {
        Alert.alert('Purchase failed', String(error));
      });
  };

  const runPurchasePromo = (
    options: ApphudPurchasePromoProps & {
      forceRefresh: boolean;
      preferredTimeout: number;
    }
  ) => {
    ApphudSdk.purchasePromo(options)
      .then(showPurchaseResult)
      .catch((error) => {
        Alert.alert('Promo purchase failed', String(error));
      });
  };

  const showPricingOptionsAlert = async (
    product: ProductProps,
    options: ApphudPurchaseProps & {
      forceRefresh: boolean;
      preferredTimeout: number;
    },
    isPromoDebugProduct: boolean
  ) => {
    const discounts =
      product.discounts ??
      apphudProductsById[product.productId]?.skProduct?.discounts ??
      [];

    if (discounts.length === 0) {
      if (isPromoDebugProduct) {
        logMonthlyPromoDebug('promo_skipped', {
          reason: 'no discounts on SKProduct',
        });
      }
      runPurchase(options);
      return;
    }

    const currencyCode =
      apphudProductsById[product.productId]?.skProduct?.priceLocale
        .currencyCode ?? 'USD';

    let eligible = false;
    try {
      eligible = await ApphudSdk.checkEligibilityForPromotionalOffer(options);

      if (isPromoDebugProduct) {
        logMonthlyPromoDebug('eligibility_checked', {
          eligible,
          discounts,
          discountsCount: discounts.length,
        });
      }
    } catch (error) {
      if (isPromoDebugProduct) {
        logMonthlyPromoDebug('eligibility_error', {
          error: String(error),
          discounts,
        });
      }
      console.error(error);
    }

    const pickerMessage = eligible
      ? 'Select standard pricing or a promotional offer.'
      : 'Apphud reports you are not eligible for promotional offers on this device. Standard pricing is recommended; promo options may fail at checkout.';

    Alert.alert(
      'Choose pricing',
      pickerMessage,
      [
        {
          text: `Standard — ${product.formattedPrice}`,
          onPress: () => {
            if (isPromoDebugProduct) {
              logMonthlyPromoDebug('purchase_started', { type: 'standard' });
            }
            runPurchase(options);
          },
        },
        ...discounts.map((discount) => ({
          text: promoOfferLabel(discount, currencyCode),
          onPress: () => {
            if (isPromoDebugProduct) {
              logMonthlyPromoDebug('purchase_started', {
                type: 'promo',
                discountID: discount.identifier,
                eligible,
              });
            }
            runPurchasePromo({
              ...options,
              discountID: discount.identifier,
            });
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );

    if (isPromoDebugProduct) {
      logMonthlyPromoDebug('promo_picker_shown', {
        eligible,
        discounts,
        optionCount: discounts.length + 1,
      });
    }
  };

  const onPurchase = async (product: ProductProps) => {
    const options = buildPurchaseOptions(product, currentPaywall);
    const isPromoDebugProduct = product.productId === PROMO_DEBUG_PRODUCT_ID;

    if (isPromoDebugProduct) {
      logMonthlyPromoDebug('see_options_pressed', {
        formattedPrice: product.formattedPrice,
        purchaseOptions: options,
      });
    }

    if (Platform.OS === 'android') {
      const androidOptions = productsProps.filter(
        (item) => item.productId === product.productId
      );

      if (androidOptions.length <= 1) {
        runPurchase(options);
        return;
      }

      setAndroidOffersModal({
        productId: product.productId,
        options: androidOptions,
      });
      return;
    }

    let commitmentSupported = false;
    try {
      commitmentSupported = await ApphudSdk.isCommitmentPlanSupported(options);
      if (isPromoDebugProduct) {
        logMonthlyPromoDebug('commitment_checked', { commitmentSupported });
      }
    } catch (error) {
      console.error(error);
    }

    if (commitmentSupported) {
      Alert.alert(
        'Commitment plan',
        'Apphud will purchase using the commitment plan automatically when you continue.',
        [
          {
            text: 'Purchase with commitment',
            onPress: () => {
              if (isPromoDebugProduct) {
                logMonthlyPromoDebug('purchase_started', {
                  type: 'commitment',
                  note: 'uses ApphudSdk.purchase(); native SDK applies commitment plan',
                });
              }
              runPurchase(options);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return;
    }

    await showPricingOptionsAlert(product, options, isPromoDebugProduct);
  };

  const placementId =
    currentPaywall?.placementIdentifier ?? route.params.placementId ?? 'N/A';
  const hasVisualPaywall = Boolean(currentPaywall?.hasVisualPaywall);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.headerCard}>
        <Text style={styles.sectionTitle}>Paywall</Text>
        <MetaRow label="Paywall ID" value={currentPaywall?.identifier ?? '…'} />
        <MetaRow label="Placement ID" value={placementId} />
        <MetaRow
          label="Visual screen"
          value={hasVisualPaywall ? 'has screen' : 'no screen'}
        />
        <MetaRow
          label="Experiment"
          value={currentPaywall?.experimentName ?? 'N/A'}
        />

        {paywallScreenPresenter && currentPaywall ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                !hasVisualPaywall && styles.actionButtonDisabled,
              ]}
              onPress={() => paywallScreenPresenter.displayPaywallScreen()}
              activeOpacity={0.85}
              disabled={!hasVisualPaywall}
            >
              <Text style={styles.actionButtonText}>Modal style</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonSecondary,
                !hasVisualPaywall && styles.actionButtonDisabled,
              ]}
              onPress={() => {
                navigation.navigate('PaywallNativeScreen', {
                  placementIdentifier: currentPaywall.placementIdentifier,
                });
              }}
              activeOpacity={0.85}
              disabled={!hasVisualPaywall}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  styles.actionButtonTextSecondary,
                ]}
              >
                Navigation style
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <Text style={styles.productsSectionTitle}>
        Products ({displayProducts.length})
      </Text>

      {displayProducts.map((product, index) => (
        <ProductCard
          key={`${product.productId}-${product.basePlanId ?? ''}-${
            product.offerId ?? index
          }`}
          product={product}
          onPurchase={() => onPurchase(product)}
          onViewProperties={() => {
            if (
              !product.properties ||
              Object.keys(product.properties).length === 0
            ) {
              Alert.alert(
                'Properties',
                'No properties configured for this product.'
              );
              return;
            }
            setPropertiesModal({
              productId: product.productId,
              properties: product.properties,
            });
          }}
        />
      ))}

      <Modal
        visible={propertiesModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPropertiesModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPropertiesModal(null)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Product properties</Text>
            <Text style={styles.modalSubtitle}>
              {propertiesModal?.productId}
            </Text>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              bounces
            >
              <Text style={styles.modalJson} selectable>
                {JSON.stringify(propertiesModal?.properties, null, 2)}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPropertiesModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={androidOffersModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAndroidOffersModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAndroidOffersModal(null)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose offer</Text>
            <Text style={styles.modalSubtitle}>
              {androidOffersModal?.productId}
            </Text>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.offerListContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              bounces
            >
              {androidOffersModal?.options.map((item, index) => (
                <TouchableOpacity
                  key={`${item.productId}-${
                    item.offerToken ?? item.offerId ?? index
                  }`}
                  style={styles.offerOptionButton}
                  onPress={() => {
                    setAndroidOffersModal(null);
                    runPurchase(buildPurchaseOptions(item, currentPaywall));
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.offerOptionTitle}>
                    {item.formattedPrice}
                  </Text>
                  <Text style={styles.offerOptionSubtitle}>
                    {`Standard: ${
                      item.standardPriceLabel ?? item.formattedPrice
                    }`}
                  </Text>
                  <Text style={styles.offerOptionSubtitle}>
                    {`Offer period: ${
                      item.offerPeriodLabel ?? 'Not specified'
                    }`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAndroidOffersModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: colors.primaryMuted,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    color: colors.primary,
  },
  productsSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  productInfo: {
    flex: 1,
  },
  productLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  productLabelSpaced: {
    marginTop: 10,
  },
  productValue: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  propertiesButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  propertiesButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: MODAL_SCROLL_MAX_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  modalScrollContent: {
    padding: 12,
  },
  offerListContent: {
    padding: 12,
    gap: 10,
  },
  offerOptionButton: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  offerOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  offerOptionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalJson: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
