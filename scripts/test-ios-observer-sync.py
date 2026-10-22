#!/usr/bin/env python3
"""Run the real Swift bridge method with controlled SDK responses on macOS.

Only the Objective-C selector annotation is removed for the standalone harness;
selector/export integration is checked by the normal iOS application build.
"""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
source = (root / 'ios/ApphudSdk.swift').read_text()
start = source.index('  @MainActor @objc(syncPurchasesInObserverMode:withRejecter:)')
end = source.index('\n  @objc(', start + 1)
method = source[start:end].replace('@objc(syncPurchasesInObserverMode:withRejecter:)', '')
harness = (root / 'tests/ios/ObserverSyncTests.swift').read_text()
assert harness.count('// METHOD_UNDER_TEST') == 1
with tempfile.TemporaryDirectory(prefix='apphud-ios-observer-sync-') as tmp:
    swift = Path(tmp) / 'ObserverSyncTests.swift'
    swift.write_text(harness.replace('// METHOD_UNDER_TEST', method))
    binary = Path(tmp) / 'observer-sync-tests'
    subprocess.run(['xcrun', 'swiftc', '-parse-as-library', str(swift), '-o', str(binary)], check=True)
    subprocess.run([str(binary)], check=True)
