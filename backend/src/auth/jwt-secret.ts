export function getJwtSecret (configuredSecret = process.env.APP_SECRET): string {
  if (
    typeof configuredSecret !== 'string' ||
    (process.env.NODE_ENV !== 'test' && Buffer.byteLength(configuredSecret, 'utf8') < 32)
  ) {
    throw new Error('APP_SECRET must be set to a random value of at least 32 bytes')
  }

  return configuredSecret
}
