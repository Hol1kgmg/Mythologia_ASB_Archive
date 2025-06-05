import { PostgreSQLAdapter } from './PostgreSQLAdapter';
import { D1Adapter } from './D1Adapter';
export class DefaultDatabaseAdapterFactory {
    create(config) {
        switch (config.type) {
            case 'postgresql':
                if (!config.connectionString) {
                    throw new Error('Connection string required for PostgreSQL');
                }
                return new PostgreSQLAdapter(config.connectionString);
            case 'd1':
                if (!config.database) {
                    throw new Error('D1 database instance required');
                }
                return new D1Adapter(config.database);
            default:
                throw new Error(`Unsupported database type: ${config.type}`);
        }
    }
}
