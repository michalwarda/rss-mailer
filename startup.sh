#! /bin/bash
echo $GOOGLE_APPLICATION_CREDENTIALS_BASE64 | base64 -d > credentials.json
bun run start


