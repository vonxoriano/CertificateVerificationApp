import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

// Initialize Blockfrost instance
export const blockfrost = new BlockFrostAPI({
  projectId: process.env.REACT_APP_BLOCKFROST_PROJECT_ID,
});

/**
 * Fetch transaction details to verify a certificate hash recorded on-chain
 * @param {string} txHash - Transaction ID on Cardano
 */
export async function verifyCertificateOnChain(txHash) {
  try {
    // Retrieve transaction metadata or details
    const metadata = await blockfrost.txsMetadata(txHash);
    return metadata;
  } catch (error) {
    console.error('Error querying Blockfrost:', error);
    throw error;
  }
}