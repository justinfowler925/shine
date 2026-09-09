#!/bin/sh
# One generator owns canonical guidance, the Cowork tree, and both public downloads.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build-distribution.py
mkdir -p cowork/dist
cp site/shine.plugin cowork/dist/shine.plugin
