import Foundation
import ApphudSDK

class PaywallScreenView : UIView {
  @objc var onStartLoading: RCTBubblingEventBlock? = nil
  @objc var onReceiveView: RCTBubblingEventBlock? = nil
  @objc var onLoadingError: RCTBubblingEventBlock? = nil
  @objc var onTransactionStarted: RCTBubblingEventBlock? = nil
  @objc var onFinished: RCTBubblingEventBlock? = nil


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
      
      
      if let parentVC = findParentViewController() {
        currentController.willMove(toParent: parentVC)
        parentVC.addChild(currentController)
        currentController.didMove(toParent: parentVC)
      }
      
      newView.isUserInteractionEnabled = true
      onReceiveView?([:])
      
      currentController.onFinished = { [weak self] result in
        self?.onFinished?(["result": result.toMap()])
        return .allow
      }
      
      currentController.onTransactionStarted = { [weak self] result in
        self?.onTransactionStarted?(["result": result?.toMap() as Any])
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

  @objc var placementIdentifier: String? = nil {
    didSet {
      setupView()
    }
  }
  
    
  private func setupView() {
    isUserInteractionEnabled = true
    guard let placementIdentifier = placementIdentifier else {
      return
    }
    
    self.onStartLoading?(["placementIdentifier": placementIdentifier])

    Apphud
      .fetchPlacements {
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
          self.onLoadingError?([
            "error":
              NSError(
                domain: "ApphudView",
                code: 404,
                userInfo: [NSLocalizedDescriptionKey: "Paywall not not found"]),
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
              self.onLoadingError?([
                "error": error,
                "placementIdentifier": placementIdentifier
              ])
              break
            }
          }
      }
  }
  
  private func findParentViewController() -> UIViewController? {
    var responder: UIResponder? = self
    while let nextResponder = responder?.next {
      if let viewController = nextResponder as? UIViewController {
        return viewController
      }
      responder = nextResponder
    }
    return nil
  }
}
