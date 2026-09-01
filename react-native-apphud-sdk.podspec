require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-apphud-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/apphud/ApphudSDK-React-Native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # The generated `react_native_apphud_sdk-Swift.h` imports
  # `<react_native_apphud_sdk/react_native_apphud_sdk.h>`. Headers are private
  # by default and would otherwise be exposed under the pod name, which uses
  # dashes, so both settings are needed to match the module name.
  s.public_header_files = "ios/**/*.h"
  s.header_dir = "react_native_apphud_sdk"

  # Requires CocoaPods trunk spec for ApphudSDK 4.4.9+. Run: pod install --repo-update
  s.dependency "ApphudSDK", "4.4.9"

  # Links React Native, and wires up the Codegen-generated TurboModule and
  # Fabric interfaces declared in `codegenConfig` (package.json).
  install_modules_dependencies(s)
end
