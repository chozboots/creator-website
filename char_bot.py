# char_bot.py: main file for the bot
import discord
from discord.ext import commands
import os
import logging
from dotenv import load_dotenv

from bot_helpers import load_cogs, Database, Queries

if not os.getenv('DYNO'):
    load_dotenv()

if not os.getenv('DYNO'):   
    load_dotenv()
    level = logging.DEBUG
    logging.basicConfig(level=level)

logger = logging.getLogger(__name__)


class CharBot(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix="!",
            intents=discord.Intents.all()
        )
        
        self.database = Database()
        self.queries = Queries(self.database)

    async def setup_hook(self):
        """Open database pool & load cogs"""
        try:
            await self.database.create_pool()
            logger.info("Database connection pool created")
        except Exception as e:
            logger.error(f"Database connection pool creation failed: {e}")
            raise
        
        await load_cogs(self)

    async def on_ready(self):
        logger.info(f"We have logged in as {self.user}.")
        
    async def close(self):
        """Close down the bot and the database pool"""
        await self.database.close_pool()
        await super().close()

def run_bot(token: str):
    if any((not token, token is None)):
        raise ValueError("TOKEN must be set")
    bot = CharBot()
    logger.debug("Running...")
    bot.run(token)

if __name__ == "__main__":
    token = os.getenv('BOT_TOKEN')
    run_bot(token)