# bot_helpers/database.py: instantiate a Database object and use it to create a connection pool
import os
import logging
import asyncpg

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.database_url = os.environ.get('DATABASE_URL')
        self.pool = None

    async def create_pool(self, min_size=10, max_size=100):
        """Create a database connection pool."""
        try:
            self.pool = await asyncpg.create_pool(self.database_url, min_size=min_size, max_size=max_size)
            logger.info('Database connection pool created')
        except Exception as e:
            logger.error(f"Database connection pool creation failed: {e}")
            raise

    async def close_pool(self):
        """Close the database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info('Database connection pool closed')

    async def fetch(self, query, *params) -> list:
        """Execute a query and return results."""
        if not self.pool:
            raise Exception("Connection pool not initialized. Call create_pool() first.")
        
        try:
            async with self.pool.acquire() as connection:
                connection: asyncpg.connection.Connection
                return await connection.fetch(query, *params)
        except Exception as e:
            logger.error(f"An error occurred when trying to execute query: {e}")
            raise

# Usage example:
# db = Database()
# await db.create_pool()
# results = await db.fetch("SELECT * FROM my_table WHERE id = $1", some_id)
