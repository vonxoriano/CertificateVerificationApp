# Certificate Verification App

This is a small app for registering a document's "fingerprint" on the Cardano
blockchain so that anyone can later check whether a file has been tampered
with. The idea came from a pretty common problem: how do you prove a
certificate, diploma, or contract hasn't been altered after the fact, without
having to hand over a copy of the actual document to some central authority
you have to trust?

The answer here is to never touch the document itself. Instead, the app
hashes it (SHA-256, done entirely in the browser) and writes that hash onto
the Cardano chain. Since a hash changes completely if even a single
character in the file changes, comparing hashes later is enough to prove
whether something matches, without needing the file to check it.

## How it actually works

**Registering a document**

1. You drop a file in and it gets hashed client-side. The file never leaves
   your browser, only the hash does.
2. You connect a Cardano wallet (anything CIP-30 compatible — I used Eternl
   while testing) through Mesh SDK, and sign a transaction. That transaction
   carries the hash in its metadata, submitted to Cardano's preprod testnet.
3. The hash, an optional label, and the resulting transaction id get saved
   in Supabase, mostly so verification later doesn't have to scan the whole
   chain looking for it.

**Verifying a document**

1. Whatever file you upload gets hashed the same way, then looked up in
   Supabase.
2. If a match turns up and it has a transaction id attached, the app doesn't
   just trust that database row — it goes and asks Blockfrost what's
   actually stored in that transaction's metadata on-chain, and compares
   that against the hash you just computed. That's the part that actually
   makes this trustworthy: the database is just a shortcut for finding the
   transaction, the chain is where the real proof lives.

## What's under the hood

- **Frontend**: React, set up with Create React App + CRACO (needed CRACO
  mainly to get some node polyfills working for the wallet libraries)
- **Wallet / writing to chain**: `@meshsdk/core` — handles building, signing,
  and submitting the transaction through whatever wallet extension is
  connected. See [`src/lib/chain.js`](src/lib/chain.js).
- **Reading from chain**: Blockfrost's REST API, called directly with fetch
  rather than pulling in their whole SDK. See
  [`src/lib/blockfrost.js`](src/lib/blockfrost.js).
- **Lookup table**: Supabase holds hash / label / transaction id so
  verification has something fast to search. See
  [`src/lib/supabaseClient.js`](src/lib/supabaseClient.js).

## Running it locally

Install everything first:

```
npm install
```

You'll need two things before it'll actually work — a Blockfrost project id
and a Supabase project. For Blockfrost, sign up free at
[blockfrost.io](https://blockfrost.io/) and create a **Preprod** project
(not mainnet, that matters later). Then in `.env`:

```
REACT_APP_BLOCKFROST_PROJECT_ID=your_preprod_project_id
```

Supabase values go in `.env` too — check `.env.example` for the exact names.

Then just:

```
npm start
```

and it'll be up at [http://localhost:3000](http://localhost:3000).

## Getting a wallet set up for testing

Registering a document is a real transaction, just on Cardano's test
network instead of mainnet, so it doesn't cost real money, but it still
needs an actual wallet to sign it.

1. Install a CIP-30 wallet extension — [Eternl](https://eternl.io/),
   [Nami](https://namiwallet.io/), or [Lace](https://www.lace.io/) all work.
2. In the wallet settings, switch the network to **Preprod**.
3. Get some free test ADA from the
   [official faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)
   — you need a little bit to pay transaction fees.
4. Make sure the Blockfrost project id in `.env` is also a **Preprod** one.
   I tripped over this myself early on — if the wallet is on Preprod but the
   Blockfrost id is for mainnet or preview, registering will still succeed
   (the wallet doesn't care), but verifying afterward will fail because
   Blockfrost is looking at the wrong network entirely.
5. Click "Connect wallet" up top, register something, then try verifying it.
   If it comes back confirmed, the whole loop worked.

## Scripts

- `npm start` — dev server
- `npm test` — runs tests in watch mode
- `npm run build` — production build, outputs to `build/`

Started from Create React App.
