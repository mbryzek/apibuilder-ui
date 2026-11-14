#!/bin/sh
# Installs the API Builder `api` CLI from apibuilder.org:
#
#   curl -fsSL https://apibuilder.org/install.sh | sh
#
# Every file comes from https://apibuilder.org/cli/: the version `latest` names, the binary for
# this machine, its sha256 (checked before anything is installed), and the ApiConfig.pkl every
# `.api/config.pkl` amends. The binary and its ApiConfig.pkl go into
# ~/.apibuilder/cli/<version>/ together, and `api` is linked into ~/.local/bin.
#
#   APIBUILDER_CLI_VERSION   install this version instead of the latest
#   APIBUILDER_BIN_DIR       link `api` here instead of ~/.local/bin
#   APIBUILDER_CLI_BASE      read the files from here instead of https://apibuilder.org/cli
#
# Running it again installs the latest version beside the ones already there and moves the link.
set -eu

base="${APIBUILDER_CLI_BASE:-https://apibuilder.org/cli}"
home_dir="${HOME:?HOME is not set}/.apibuilder/cli"
bin_dir="${APIBUILDER_BIN_DIR:-$HOME/.local/bin}"

fail() {
  echo "api install: $*" >&2
  exit 1
}

case "$(uname -s)/$(uname -m)" in
  Darwin/arm64) triple="darwin-arm64" ;;
  Linux/x86_64 | Linux/amd64) triple="linux-x86_64" ;;
  *) fail "no api build for $(uname -s) $(uname -m); builds exist for macOS arm64 and Linux x86_64" ;;
esac

command -v curl >/dev/null 2>&1 || fail "curl is required"

version="${APIBUILDER_CLI_VERSION:-}"
if [ -z "$version" ]; then
  version="$(curl -fsSL "$base/latest" | tr -d '[:space:]')" || fail "could not read $base/latest"
fi
[ -n "$version" ] || fail "$base/latest named no version"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

echo "==> Downloading api $version for $triple"
curl -fsSL --retry 3 -o "$tmp/api" "$base/$version/api-$triple" || fail "could not download $base/$version/api-$triple"
curl -fsSL --retry 3 -o "$tmp/api.sha256" "$base/$version/api-$triple.sha256" || fail "could not download the checksum"
curl -fsSL --retry 3 -o "$tmp/ApiConfig.pkl" "$base/$version/ApiConfig.pkl" || fail "could not download ApiConfig.pkl"

expected="$(tr -d '[:space:]' <"$tmp/api.sha256")"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp/api" | cut -d ' ' -f 1)"
else
  actual="$(shasum -a 256 "$tmp/api" | cut -d ' ' -f 1)"
fi
[ "$expected" = "$actual" ] || fail "api-$triple has sha256 $actual, but apibuilder.org published $expected; nothing was installed"

# The binary finds ApiConfig.pkl in the modulepath/ beside its own resolved path, so the two
# are installed into one directory per version.
dir="$home_dir/$version"
mkdir -p "$dir/modulepath/api" "$bin_dir"
chmod 755 "$tmp/api"
mv -f "$tmp/api" "$dir/api"
mv -f "$tmp/ApiConfig.pkl" "$dir/modulepath/api/ApiConfig.pkl"
ln -sfn "$dir/api" "$bin_dir/api"

echo "==> Installed api $version: $bin_dir/api"

case ":$PATH:" in
  *":$bin_dir:"*) ;;
  *) echo "==> Add $bin_dir to your PATH: export PATH=\"$bin_dir:\$PATH\"" ;;
esac

if ! command -v pkl >/dev/null 2>&1; then
  echo "==> api reads .api/config.pkl with pkl, which is not on your PATH."
  echo "    Install it: https://pkl-lang.org/main/current/pkl-cli/index.html#installation"
fi
