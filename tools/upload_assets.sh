#!/bin/bash

GITHUB_TOKEN="$1"
RELEASE_ID="$2"
GITHUB_REPOSITORY="$3"
ASSET_PATH="$4"
ASSET_NAME="$5"

echo $GITHUB_TOKEN

echo $RELEASE_ID
echo $ASSET_PATH
echo $ASSET_NAME


UPLOAD_URL="https://uploads.github.com/repos/$GITHUB_REPOSITORY/releases/$RELEASE_ID/assets?name=$ASSET_NAME"
# Use curl to upload the asset and check if it was successful
response=$(curl -L -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@$ASSET_PATH" \
  "$UPLOAD_URL" || echo "error")

if [[ "$response" == "error" ]]; then
  echo "Failed to upload asset"
  exit 1
else
  echo "Asset uploaded successfully"
fi
