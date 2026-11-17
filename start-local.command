#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  pregnancy_node="$(command -v node)"
elif [ -x /Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node ]; then
  pregnancy_node=/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node
else
  printf '%s\n' 'Bitte Node.js ab Version 22.13 installieren und den lokalen Starter erneut ausführen.' >&2
  exit 1
fi
"$pregnancy_node" --input-type=module -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22||(major===22&&minor<13)){console.error("Node.js ab Version 22.13 wird benötigt.");process.exit(1)}'
"$pregnancy_node" scripts/build.js
exec "$pregnancy_node" sync-server/local.js "$@"
