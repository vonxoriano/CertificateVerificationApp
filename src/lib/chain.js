/**
 * ------------------------------------------------------------------
 * BLOCKCHAIN INTEGRATION POINT
 * ------------------------------------------------------------------
 * Right now the app's source of truth is Supabase alone. Once the
 * smart contract (DocumentRegistry.sol) is deployed, replace the
 * bodies of these two functions with real on-chain calls
 * (e.g. via ethers.js/wagmi), and everything in IssuePage.jsx /
 * VerifyPage.jsx that calls them will keep working unchanged.
 *
 * Target shape once wired up:
 *   registerOnChain(hash, label) -> calls contract.registerDocument()
 *   verifyOnChain(hash)          -> calls contract.verifyDocument()
 * ------------------------------------------------------------------
 */

export async function registerOnChain(hash, label) {
  // TODO: replace with contract.registerDocument(hash, label)
  return {
    onChain: false,
    txHash: null,
    note: 'Blockchain not yet connected — record saved to Supabase only.',
  }
}

export async function verifyOnChain(hash) {
  // TODO: replace with contract.verifyDocument(hash)
  return {
    onChain: false,
    found: null, // null = "unknown, chain not connected" (different from false = "not found")
  }
}
