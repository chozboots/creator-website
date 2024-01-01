import discord
from discord.ext import commands
import os
import logging
from dotenv import load_dotenv

from bot_helpers.cogloader import load_cogs

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

    async def setup_hook(self):
        """Load cogs (perhaps other things in the future)"""
        await load_cogs(self)

    async def on_ready(self):
        logger.info(f"We have logged in as {self.user}.")
        
    async def close(self):
        """Close down the bot and the database pool"""
        await super().close()

def run_bot(token: str):
    if any((not token, token is None)):
        raise ValueError("TOKEN must be set")
    bot = CharBot()
    bot.run(token)

if __name__ == "__main__":
    token = os.getenv('BOT_TOKEN')
    run_bot(token)