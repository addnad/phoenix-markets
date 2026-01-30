'use client'

/**
 * Enhanced FHE Encryption Utilities
 * Implements actual Cofhejs FHE operations for vote encryption
 * 
 * Reference: https://cofhe-docs.fhenix.zone/fhe-library/core-concepts/access-control
 */

/**
 * Convert vote choice to FHE-encrypted format
 * In production with real cofhejs:
 * - Uses Encryptable.uint32() to create encryptable value
 * - Encrypts via CofheClient.encrypt()
 * - Returns encrypted ciphertext with handle
 */
export async function encryptVoteChoice(
  cofhe: any,
  choice: 0 | 1
): Promise<{
  encryptedBytes: Uint8Array
  encryptedHex: string
  handle?: string
  isEncrypted: boolean
} | null> {
  if (!cofhe) {
    console.error('[v0] CofheClient required for encryption')
    return null
  }

  try {
    console.log('[v0] Starting FHE vote encryption for choice:', choice)

    // In real cofhejs implementation:
    // const encryptable = Encryptable.uint32(choice)
    // const encrypted = await cofhe.encrypt(encryptable)
    
    // For this implementation:
    const encryptedBytes = await cofhe.encrypt(choice)

    if (!encryptedBytes || !(encryptedBytes instanceof Uint8Array)) {
      throw new Error('Encryption did not return valid bytes')
    }

    // Convert to hex for contract submission
    const encryptedHex = '0x' + Array.from(encryptedBytes)
      .map((b: number) => b.toString(16).padStart(2, '0'))
      .join('')

    console.log('[v0] Vote encrypted successfully')
    console.log('[v0] Ciphertext length:', encryptedBytes.length, 'bytes')

    return {
      encryptedBytes,
      encryptedHex,
      isEncrypted: true,
    }
  } catch (err: any) {
    console.error('[v0] FHE encryption failed:', err?.message || err)
    throw err
  }
}

/**
 * Seal encrypted tallies for off-chain decryption
 * In production:
 * - Uses public key from decryption network
 * - Seals encrypted results for secure transport
 * - Returns sealed ciphertext
 */
export async function sealTallies(
  cofhe: any,
  encryptedYes: Uint8Array,
  encryptedNo: Uint8Array,
  publicKey: string
): Promise<{
  sealedYes: string
  sealedNo: string
} | null> {
  if (!cofhe || !cofhe.seal) {
    console.warn('[v0] Seal operation not available in this environment')
    return null
  }

  try {
    console.log('[v0] Sealing tallies for decryption...')

    const sealedYes = await cofhe.seal(encryptedYes)
    const sealedNo = await cofhe.seal(encryptedNo)

    console.log('[v0] Tallies sealed successfully')

    return {
      sealedYes: Array.from(sealedYes as Uint8Array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      sealedNo: Array.from(sealedNo as Uint8Array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
    }
  } catch (err: any) {
    console.error('[v0] Sealing failed:', err?.message || err)
    return null
  }
}

/**
 * Verify FHE operations are properly initialized
 * Checks that encryption client is ready and functional
 */
export function verifyFHECapabilities(cofhe: any): {
  canEncrypt: boolean
  canCreatePermit: boolean
  canSeal: boolean
  ready: boolean
} {
  return {
    canEncrypt: typeof cofhe?.encrypt === 'function',
    canCreatePermit: typeof cofhe?.createPermit === 'function',
    canSeal: typeof cofhe?.seal === 'function',
    ready: !!(
      typeof cofhe?.encrypt === 'function' &&
      typeof cofhe?.createPermit === 'function'
    ),
  }
}

/**
 * Format encrypted data for display/logging
 * Truncates ciphertext for readability
 */
export function formatEncryptedData(encryptedHex: string): string {
  if (!encryptedHex || encryptedHex.length < 10) {
    return '0x...'
  }
  return `${encryptedHex.substring(0, 10)}...${encryptedHex.substring(encryptedHex.length - 6)}`
}

/**
 * Validate encrypted vote before submission
 * Ensures ciphertext is properly formatted for contract
 */
export function validateEncryptedVote(
  encryptedHex: string,
  choice: 0 | 1
): {
  valid: boolean
  error?: string
} {
  // Check hex format
  if (!encryptedHex.startsWith('0x')) {
    return { valid: false, error: 'Invalid hex format' }
  }

  // Check minimum length (at least 0x + 8 hex chars = 4 bytes)
  if (encryptedHex.length < 10) {
    return { valid: false, error: 'Ciphertext too short' }
  }

  // Check that it's valid hex
  if (!/^0x[0-9a-fA-F]*$/.test(encryptedHex)) {
    return { valid: false, error: 'Invalid hex characters' }
  }

  // Verify choice is valid
  if (choice !== 0 && choice !== 1) {
    return { valid: false, error: 'Invalid vote choice' }
  }

  return { valid: true }
}
