/**
 * scripts/fix-virtualview.js
 *
 * Patches two React Native 0.79 files that crash Metro's Codegen with:
 * "Unable to determine event arguments for onModeChange"
 *
 * Runs automatically after every `npm install` via the postinstall hook.
 */

const fs   = require('fs');
const path = require('path');

const BROKEN = [
  'node_modules/react-native/src/private/components/virtualview/VirtualViewNativeComponent.js',
  'node_modules/react-native/src/private/components/virtualview/VirtualViewExperimentalNativeComponent.js',
];

const EMPTY_MODULE = '// patched by scripts/fix-virtualview.js\nmodule.exports = {};\n';

BROKEN.forEach((rel) => {
  const full = path.join(__dirname, '..', rel);
  if (fs.existsSync(full)) {
    fs.writeFileSync(full, EMPTY_MODULE, 'utf8');
    console.log('[fix-virtualview] Patched:', rel);
  } else {
    console.log('[fix-virtualview] Not found (skipping):', rel);
  }
});
