# Certificate Verification App

A document registry built on Cardano. You upload a file once to fingerprint
and register it on-chain, and later anyone can upload the same file (or a
suspect copy) to check whether it still matches. The document itself is
never stored or uploaded anywhere — only its hash.

## How it works

Register:
1. The file is hashed in the browser with SHA-256. It never leaves the client.
2. You connect a CIP-30 wallet (Eternl, Nami, Lace, etc. via [Mesh SDK](https://meshjs.dev/)) and sign a transaction that writes the hash into that transaction's metadata on Cardano preprod.
3. The hash, label, and resulting tx id get saved to Supabase so it can be looked up later.

Verify:
1. The uploaded file is hashed the same way and looked up in Supabase by hash.
2. If there's a match with a tx id attached, the app pulls that transaction's metadata straight from Blockfrost and checks it against the freshly computed hash — so verification isn't just trusting the database, it's trusting the chain.

## Architecture

- **Frontend** — React (Create React App + CRACO)
- **Wallet / on-chain writes** — `@meshsdk/core`, builds/signs/submits the Cardano tx via whatever CIP-30 wallet is connected ([`src/lib/chain.js`](src/lib/chain.js))
- **On-chain reads** — Blockfrost REST API, used to read metadata back off a tx hash ([`src/lib/blockfrost.js`](src/lib/blockfrost.js))
- **Off-chain lookup** — Supabase, stores hash/label/tx id for fast lookup ([`src/lib/supabaseClient.js`](src/lib/supabaseClient.js))

## Setup

```
npm install
```

Set your Blockfrost **Preprod** project id in `.env` (free at [blockfrost.io](https://blockfrost.io/)):

```
REACT_APP_BLOCKFROST_PROJECT_ID=your_preprod_project_id
```

You'll also need Supabase project values — see `.env.example`.

```
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Cardano setup

Registering a document submits a real tx on Cardano preprod, signed by your own wallet — the app itself never touches your keys.

1. Install a CIP-30 wallet: [Eternl](https://eternl.io/), [Nami](https://namiwallet.io/), or [Lace](https://www.lace.io/).
2. Switch that wallet to the **Preprod** network.
3. Grab test ADA from the [official faucet](https://docs.cardano.org/cardano-testnets/tools/faucet).
4. Double check `REACT_APP_BLOCKFROST_PROJECT_ID` is a **Preprod** project id — mixing networks (e.g. a mainnet or preview id) makes verification fail silently even though registration went through, since the wallet and Blockfrost would be looking at different networks.
5. Connect the wallet in the app header, register a document, then verify it — it should read the tx back and confirm the hash matches.

## Scripts

- `npm start` — dev server at localhost:3000
- `npm test` — test suite, watch mode
- `npm run build` — production build to `build/`

Bootstrapped with Create React App.
