export class D1Adapter {
    database;
    constructor(database) {
        this.database = database;
    }
    async query(sql, params = []) {
        try {
            const stmt = this.database.prepare(sql);
            const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
            const result = await boundStmt.all();
            return {
                rows: result.results,
                rowCount: result.results.length
            };
        }
        catch (error) {
            console.error('D1 Query Error:', error);
            throw error;
        }
    }
    async transaction(callback) {
        // D1 doesn't support traditional transactions
        // For now, we'll just execute the callback
        return callback(this);
    }
    async close() {
        // D1 connections are managed automatically
        // No explicit close needed
    }
}
