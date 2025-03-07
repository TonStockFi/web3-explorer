# Web3 Explorer

Web3 Explorer is a platform for web3 blockchain browser

## Building locally

```sh
# Install `Node.js` version v20.7.0
nvm use

# Install `Yarn` version 4.0.2
corepack enable
```

### Build desktop script

```sh
# Install dependencies
yarn

# Build desktop for current OS
cp apps/desktop/.env.example apps/desktop/.env
yarn build:pkg
cd apps/desktop
yarn make:mac
```

Application for your platform could be found in `/apps/desktop/out` once they're built.

#### Mac Environment variables:

You can generate an App Store Connect API key to authenticate `notarytool` by going to the
[App Store Connect](https://appstoreconnect.apple.com/access/api) access page and using the "Keys"
tab. This API key will look something like `AuthKey_ABCD123456.p8` and can only be downloaded once.

| Env variable       | Description                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `APPLE_API_KEY`    | Filesystem path string to your API key file.                                                                       |
| `APPLE_API_KEY_ID` | 10-character alphanumeric ID string. In the previous `AuthKey_ABCD123456.p8` example, this would be `ABCD123456`.  |
| `APPLE_API_ISSUER` | UUID that identifies the API key issuer. You will find this ID in the "Keys" tab where you generated your API key. |

Keychain - Certificate Type - `Developer ID Application`

## License

(c) Copyright 2024 Web3 Explorer Limited Released under the
[Apache License, Version 2.0](LICENSE.txt).

