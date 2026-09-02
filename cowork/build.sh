#!/bin/sh
# Package the Cowork plugin: cowork/plugin/ -> cowork/dist/shine.plugin
# A .plugin file is a zip of the plugin directory with .claude-plugin/plugin.json at root.
set -e
cd "$(dirname "$0")/plugin"
mkdir -p ../dist
rm -f ../dist/shine.plugin
zip -rq ../dist/shine.plugin . -x "*.DS_Store"
echo "built $(cd ../dist && pwd)/shine.plugin ($(du -h ../dist/shine.plugin | cut -f1 | tr -d ' '))"
