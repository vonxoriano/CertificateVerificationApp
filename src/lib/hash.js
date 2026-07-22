/**
 * Computes the SHA-256 hash of a File object entirely in the browser.
 * The file's bytes never leave the client just to be hashed —
 * only the resulting hash gets sent anywhere.
 *
 * @param {File} file
 * @returns {Promise<string>} hex-encoded hash, e.g. "a3f8b9c2..."
 */
export async function hashFile(file) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return bufferToHex(digest)
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}