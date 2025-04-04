import appConfig from './app/app.config'
import authConfig from './auth/auth.config'
import databaseConfig from './database/database.config'
import ossConfig from './oss/oss.config'

export default {
  database: databaseConfig,
  auth: authConfig,
  app: appConfig,
  oss: ossConfig,
}
