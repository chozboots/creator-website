# bot_helpers/queries.py: a class that contains methods for building and executing queries
import logging
from typing import List, Union, Optional, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from database import Database

logger = logging.getLogger(__name__)

class QueryBuilder:
    def __init__(self):
        self.query = ""
        self.values = []

    def select(self, table: str, columns: List[str]) -> 'QueryBuilder':
        self.query = f"SELECT {', '.join(columns)} FROM {table}"
        return self

    def where(self, column: str, value: Union[int, str]) -> 'QueryBuilder':
        self.query += f" WHERE {column} = ${len(self.values) + 1}"
        self.values.append(value)
        return self

    def build(self) -> Tuple[str, List[Union[int, str]]]:
        return self.query, self.values

class Queries:
    def __init__(self, database: 'Database'):
        self.database = database

    async def fetch(self, table: str, columns: List[str], where_column: Optional[str] = None, where_value: Optional[Union[int, str]] = None) -> Optional[List[dict]]:
        qb = QueryBuilder().select(table, columns)
        if where_column and where_value:
            qb.where(where_column, where_value)
        query, values = qb.build()
        result = await self.database.fetch(query, *values)
        return [dict(row) for row in result] if result else None

    async def insert(self, table: str, columns: List[str], values: List[Union[int, str]]) -> Optional[dict]:
        placeholders = ', '.join([f'${i+1}' for i in range(len(values))])
        query = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders}) RETURNING *"
        result = await self.database.fetch(query, *values)
        return dict(result[0]) if result else None

    async def update(self, table: str, set_columns: List[str], set_values: List[Union[int, str]], where_column: Optional[str], where_value: Optional[Union[int, str]]) -> Optional[dict]:
        set_clause = ', '.join([f"{col} = ${i+1}" for i, col in enumerate(set_columns)])
        where_clause = f"{where_column} = ${len(set_values) + 1}"
        query = f"UPDATE {table} SET {set_clause} WHERE {where_clause} RETURNING *"
        all_values = set_values + [where_value]
        result = await self.database.fetch(query, *all_values)
        return dict(result[0]) if result else None

# Usage Example:
# db = Database()
# queries = Queries(db)
# await db.create_pool()
# fetch_result = await queries.fetch('my_table', ['column1', 'column2'], 'id', 1)
# insert_result = await queries.insert('my_table', ['column1', 'column2'], [value1, value2])
# update_result = await queries.update('my_table', ['column1'], ['new_value'], 'id', 1)
