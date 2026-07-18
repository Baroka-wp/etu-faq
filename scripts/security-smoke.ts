import assert from 'node:assert/strict'
import { createSessionToken, verifySessionToken } from '../src/lib/security/session'
import { protectCredential, revealCredential } from '../src/lib/security/credential'

process.env.SESSION_SECRET = 'test-session-secret-with-more-than-thirty-two-characters'
process.env.CREDENTIAL_SECRET = 'test-credential-secret-with-more-than-thirty-two-characters'

async function main() {
  const token = await createSessionToken('membre', 'member-123', 60)
  assert.equal((await verifySessionToken(token, 'membre'))?.sub, 'member-123')
  assert.equal(await verifySessionToken(token, 'admin'), null)
  assert.equal(await verifySessionToken(`${token.slice(0, -1)}x`, 'membre'), null)

  const credential = 'S3cur3-Access-Code'
  const protectedValue = await protectCredential(credential)
  assert.notEqual(protectedValue, credential)
  assert.equal(await protectCredential(credential), protectedValue)
  assert.equal(await revealCredential(protectedValue), credential)
  assert.equal(await revealCredential('legacy-code'), 'legacy-code')

  console.log('Security smoke tests: OK')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
