/**
 * Environment Variable Configuration
 * Validates and exports type-safe environment variables
 */

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getEnvNumber(key: string, fallback?: number): number {
  const value = process.env[key]
  if (!value && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  const parsed = value ? parseInt(value, 10) : fallback!
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`)
  }
  return parsed
}

export const env = {
  database: {
    url: getEnvVar('DATABASE_URL'),
    host: getEnvVar('DATABASE_HOST'),
    port: getEnvNumber('DATABASE_PORT'),
    name: getEnvVar('DATABASE_NAME'),
    user: getEnvVar('DATABASE_USER'),
    password: getEnvVar('DATABASE_PASSWORD'),
    connectionLimit: getEnvNumber('DATABASE_CONNECTION_LIMIT', 10),
  },
} as const
