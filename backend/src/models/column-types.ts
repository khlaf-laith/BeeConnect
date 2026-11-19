export const longTextColumnType: 'text' | 'longtext' =
  process.env.DB_TYPE === 'sqlite' ? 'text' : 'longtext'
