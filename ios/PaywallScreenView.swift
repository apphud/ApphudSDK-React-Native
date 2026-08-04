import Foundation
import ApphudSDK

/// Renders an Apphud paywall screen inside a plain `UIView`.
///
/// Hosted by `ApphudPaywallScreenView`, the Obj-C++ Fabric component view.
/// Props are applied by the host, which calls `reload()` once afterwards, so
/// setting several props at a time triggers a single fetch.
@objc(ApphudPaywallScreenContentView)
public final class ApphudPaywallScreenContentView: UIView {
  @objc public var onStartLoading: RCTBubblingEventBlock? = nil
  @objc public var onReceiveView: RCTBubblingEventBlock? = nil
  @objc public var onLoadingError: RCTBubblingEventBlock? = nil
  @objc public var onTransactionStarted: RCTBubblingEventBlock? = nil
  @objc public var onTransactionCompleted: RCTBubblingEventBlock? = nil
  @objc public var onCloseButtonTapped: RCTBubblingEventBlock? = nil

  @objc public var placementIdentifier: String? = nil

  @objc public var requestPlacementsOptions: NSDictionary? = nil

  private var currentController: ApphudPaywallScreenController? = nil {
    willSet {
      currentController?.viewWillDisappear(true)
      currentController?.view.removeFromSuperview()
      currentController?.removeFromParent()
    }

    didSet {
      guard let currentController = currentController, let newView = currentController.view else {
        return
      }


      if let parentVC = RCTPresentedViewController() {
        currentController.willMove(toParent: parentVC)
        parentVC.addChild(currentController)
        currentController.didMove(toParent: parentVC)
      }

      newView.isUserInteractionEnabled = true
      onReceiveView?([:])

      currentController.onTransactionStarted = { [weak self] result in
        self?.onTransactionStarted?(["result": result?.toMap() as Any])
      }

      currentController.onTransactionCompleted = { [weak self] result in
        self?.onTransactionCompleted?(["result": result.toMap() as Any])
      }

      currentController.onCloseButtonTapped = { [weak self] in
        self?.onCloseButtonTapped?([:])
      }

      addSubview(newView)

      newView.autoresizingMask = [.flexibleWidth, .flexibleHeight]


      return
    }
  }


  deinit {
    currentController?.willMove(toParent: nil)
    currentController?.view.removeFromSuperview()
    currentController?.removeFromParent()
  }

  @objc public func reload() {
    setupView()
  }

  private func setupView() {
    isUserInteractionEnabled = true
    guard let placementIdentifier = placementIdentifier else {
      return
    }

    self.onStartLoading?(["placementIdentifier": placementIdentifier])

    let maxAttempts = requestPlacementsOptions?["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = requestPlacementsOptions?["forceRefresh"] as? Bool ?? false

    Apphud
      .fetchPlacements(maxAttempts: maxAttempts, forceRefresh: forceRefresh) {
        [weak self, placementIdentifier] placements,
        error in
        guard let self = self,
              self.placementIdentifier == placementIdentifier else {
          return
        }

        let placement = placements.first {
          $0.identifier == placementIdentifier
        }

        guard let paywall = placement?.paywall else {
          let error = NSError(
            domain: "ApphudView",
            code: 404,
            userInfo: [NSLocalizedDescriptionKey: "Paywall not not found"])

          self.onLoadingError?([
            "error": SerializedError(from: error).toMap(),
            "placementIdentifier": placementIdentifier
          ])
          return
        }

        Apphud
          .fetchPaywallScreen(paywall) { [
            weak self,
            placementIdentifier
          ] result in
            guard let self = self, self.placementIdentifier == placementIdentifier else {
              return
            }

            switch result {
            case .success(let controller):
              self.currentController = controller
              break
            case .error(let error):

              self.onLoadingError?(
                [
                  "error": SerializedError(from: error).toMap(),
                  "placementIdentifier": placementIdentifier
                ]
              )
              break
            }
          }
      }
  }
}
