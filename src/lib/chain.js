import { Transaction } from '@meshsdk/core'

/**
 * ------------------------------------------------------------------
 * BLOCKCHAIN INTEGRATION POINT (Cardano)
 * ------------------------------------------------------------------
 * Registration works by attaching the document hash as transaction
 * metadata on a Cardano preprod transaction, signed and submitted by
 * the user's own connected CIP-30 wallet (via Mesh SDK). Verification
 * reads that metadata back via Blockfrost (see lib/blockfrost.js).
 *
 * APP_METADATA_LABEL is this app's own namespace within Cardano tx
 * metadata (CIP-10 registry) — chosen to avoid the reserved 0-15 and
 * 65536-131071 ranges and well-known labels (674, 721, 61284/61285).
 * It isn't formally registered anywhere; that's fine for an app-
 * specific convention, but keep it consistent since it's how
 * verification finds the right piece of metadata on a transaction.
 * ------------------------------------------------------------------
 */
export const APP_METADATA_LABEL = 8434

export async function registerOnChain(wallet, hash, label) {
  if (!wallet) {
    throw new Error('Connect a Cardano wallet before registering.')
  }

  const tx = new Transaction({ initiator: wallet })
  tx.setMetadata(APP_METADATA_LABEL, { v: 1, hash, label: label || null })

  const unsignedTx = await tx.build()
  const signedTx = await wallet.signTx(unsignedTx)
  const txHash = await wallet.submitTx(signedTx)

  return {
    onChain: true,
    txHash,
    note: 'Registered on Cardano (preprod) — the fingerprint is now in that transaction\'s metadata.',
  }
}
