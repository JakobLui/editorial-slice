import { DefaultNamingStrategy } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils.js'

/**
 * Names tables and columns in snake_case: `createdAt` becomes `created_at`,
 * the `createdBy` relation becomes `created_by_id`. Explicit names in the
 * entity decorators still win.
 */
export class SnakeNamingStrategy extends DefaultNamingStrategy {
  override tableName(targetName: string, userSpecifiedName?: string) {
    return userSpecifiedName ?? snakeCase(targetName)
  }

  override columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ) {
    return snakeCase(
      [...embeddedPrefixes, customName ?? propertyName].join('_'),
    )
  }

  override relationName(propertyName: string) {
    return snakeCase(propertyName)
  }

  override joinColumnName(relationName: string, referencedColumnName: string) {
    return snakeCase(`${relationName}_${referencedColumnName}`)
  }

  override joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ) {
    return snakeCase(`${tableName}_${columnName ?? propertyName}`)
  }
}
