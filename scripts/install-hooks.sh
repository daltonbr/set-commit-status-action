#!/bin/sh
# Installs git hooks from .githooks/ into .git/hooks/.
# Run once after cloning: sh scripts/install-hooks.sh
set -e
REPO_ROOT=$(git rev-parse --show-toplevel)
for hook in "$REPO_ROOT/.githooks/"*; do
    name=$(basename "$hook")
    dest="$REPO_ROOT/.git/hooks/$name"
    cp "$hook" "$dest"
    chmod +x "$dest"
    echo "installed: .git/hooks/$name"
done
echo "done."
