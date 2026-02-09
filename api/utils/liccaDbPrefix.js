export const LICCA_DB_PREFIX = (() => {
  // When set, queries can target legacy/LICCA tables in that schema on the same MySQL server.
  // Example: RM360_LICCA=regain_memory => `regain_memory`.table
  const schema = process.env.RM360_LICCA
  if (!schema) return ''

  // Prevent SQL injection via schema name (identifiers can't be parameterized).
  if (!/^[A-Za-z0-9_]+$/.test(schema)) {
    throw new Error('INVALID_RM360_LICCA')
  }

  return `\`${schema}\`.`
})()
