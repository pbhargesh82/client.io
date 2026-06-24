#!/usr/bin/env bash
set -euo pipefail

# npm ci in workspaces skips platform-specific optional deps when the lockfile
# was generated on another OS (npm/cli#4828). Use npm install, then ensure
# Linux bindings required by Tailwind v4 are present on Netlify builders.
npm install

if [[ "$(uname -s)" == "Linux" ]]; then
  npm install \
    @tailwindcss/oxide-linux-x64-gnu@4.3.1 \
    lightningcss-linux-x64-gnu@1.32.0 \
    -w client
fi

npm run build -w client
