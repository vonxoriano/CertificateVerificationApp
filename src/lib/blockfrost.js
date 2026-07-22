/**
 * Direct REST API call to Blockfrost (No SDK package needed)
 */
export async function verifyCertificateOnChain(txHash) {
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

  const data = await response.json();
  return data;
}