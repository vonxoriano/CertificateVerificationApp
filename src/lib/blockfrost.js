import { APP_METADATA_LABEL } from './chain'

/**
 * Direct REST API call to Blockfrost (No SDK package needed)
 */
export async function fetchTxMetadata(txHash) {
  const projectId = process.env.REACT_APP_BLOCKFROST_PROJECT_ID;

  if (!projectId) {
    throw new Error('Blockfrost Project ID is missing from .env file.');
  }

  // Cardano Preprod network endpoint
  const url = `https://cardano-preprod.blockfrost.io/api/v0/txs/${txHash}/metadata`;

  const response = await fetch(url, {
    headers: {
      project_id: projectId,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Transaction not found on Cardano network.');
    }
    throw new Error(`Blockfrost API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Reads this app's metadata entry off a Cardano transaction and checks
 * whether the hash recorded on-chain matches the freshly computed one.
 *
 * @param {string} txHash
 * @param {string} expectedHash
 * @returns {Promise<{ found: boolean, matches: boolean, metadata: object|null, raw: any }>}
 */
export async function verifyCertificateOnChain(txHash, expectedHash) {
  const raw = await fetchTxMetadata(txHash);
  const entry = Array.isArray(raw)
    ? raw.find((m) => m.label === String(APP_METADATA_LABEL))
    : null;

  if (!entry || typeof entry.json_metadata !== 'object' || entry.json_metadata === null) {
    return { found: false, matches: false, metadata: null, raw };
  }

  return {
    found: true,
    matches: entry.json_metadata.hash === expectedHash,
    metadata: entry.json_metadata,
    raw,
  };
}
