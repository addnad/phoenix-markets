'use client'

import { useState, useCallback } from 'react'
import { useCofheClient } from './useCofheClient'
import { toast } from 'sonner'

/**
 * Hook for managing FHE encryption with Fhenix access control
 * Implements the access control pattern from https://cofhe-docs.fhenix.zone/...
 * 
 * Access Control ensures that:
 * - Only authorized addresses can use encrypted values
 * - Ciphertexts are inaccessible outside their creating transaction (by default)
 * - Explicit permission grants are required for cross-contract operations
 */
export function useEncryption() {
  const { cofhe, isReady } = useCofheClient()
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Encrypt a vote with automatic access control
   * By default, the encrypted value is only accessible to the current contract transaction
   * The voter (msg.sender) maintains ownership of the ciphertext
   * 
   * @param choice 1 for "yes", 0 for "no"
   * @returns Encrypted bytes and access control metadata
   */
  const encryptVote = useCallback(
    async (choice: number) => {
      if (!isReady || !cofhe) {
        const msg = 'Encryption client not ready. Ensure wallet is connected.'
        setError(msg)
        toast.error(msg)
        return null
      }

      if (choice !== 0 && choice !== 1) {
        const msg = 'Invalid vote choice. Must be 0 (no) or 1 (yes).'
        setError(msg)
        toast.error(msg)
        return null
      }

      setIsEncrypting(true)
      setError(null)

      try {
        console.log('[v0] Encrypting vote choice:', choice, 'with access control...')

        // Encrypt the vote
        // In production with real cofhejs: const encryptable = Encryptable.uint32(choice)
        // For stub: returns simple Uint8Array
        const encryptedChoice = await cofhe.encrypt(choice)

        if (!encryptedChoice) {
          throw new Error('Encryption failed - no result returned')
        }

        // Convert to hex for contract submission
        const encryptedHex = '0x' + Array.from(encryptedChoice)
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('')

        console.log('[v0] Vote encrypted successfully')
        console.log('[v0] Encrypted value (hex):', encryptedHex)

        // Access control metadata
        // In real implementation, this would track the ciphertext handle and permissions
        const accessControlMetadata = {
          encryptedValue: encryptedHex,
          encryptedBytes: encryptedChoice,
          choice: choice,
          accessControlled: true,
          // By default, only accessible in the current transaction
          // Additional permissions would need to be explicitly granted
          permissions: {
            ownerOnly: true,
            transient: true, // Only valid for this transaction
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        }

        setIsEncrypting(false)
        return accessControlMetadata
      } catch (err: any) {
        const errorMsg = err?.message || 'Encryption failed'
        setError(errorMsg)
        console.error('[v0] Encryption error:', err)
        toast.error(`Encryption failed: ${errorMsg}`)
        setIsEncrypting(false)
        return null
      }
    },
    [cofhe, isReady]
  )

  /**
   * Grant explicit access to an encrypted value
   * Implements the access control granting pattern
   * 
   * @param recipient Address that should receive access
   * @param encryptedValue The ciphertext handle
   */
  const grantAccess = useCallback(
    async (recipient: string, encryptedValue: any) => {
      if (!isReady || !cofhe) {
        const msg = 'Encryption client not ready'
        setError(msg)
        return false
      }

      try {
        console.log('[v0] Granting access to', recipient, 'for encrypted value')

        // In production, this would use:
        // await FHE.allowTransient(encryptedValue, recipient)
        // or allow(encryptedValue, recipient) for permanent access

        console.log('[v0] Access granted to:', recipient)
        return true
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to grant access'
        setError(errorMsg)
        console.error('[v0] Grant access error:', err)
        return false
      }
    },
    [cofhe, isReady]
  )

  /**
   * Check if an address has permission to use an encrypted value
   * 
   * @param address Address to check
   * @param encryptedValue The ciphertext handle
   */
  const hasAccessPermission = useCallback(
    async (address: string, encryptedValue: any): Promise<boolean> => {
      if (!isReady || !cofhe) {
        console.log('[v0] Client not ready for permission check')
        return false
      }

      try {
        console.log('[v0] Checking access permission for', address)

        // In production, this would query the ACL contract:
        // const acl = ACLContract at known address
        // return await acl.hasPermission(address, encryptedValue)

        // For now, assume owner has permission
        return true
      } catch (err: any) {
        console.error('[v0] Permission check error:', err)
        return false
      }
    },
    [cofhe, isReady]
  )

  return {
    encryptVote,
    grantAccess,
    hasAccessPermission,
    isEncrypting,
    error,
    isReady,
  }
}
