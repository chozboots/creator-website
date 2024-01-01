import logging
import os
from typing import TYPE_CHECKING, List
from discord.ext.commands import ExtensionFailed

if TYPE_CHECKING:
    from char_bot import CharBot
    
logger = logging.getLogger(__name__)
    
def _get_cogs_helper(folder: str, cogs: List[str] = None) -> List[str]:
    """Helper function to get all cogs in a specific folder."""
    if cogs is None:
        cogs = []
    elif not isinstance(cogs, list):
        raise TypeError('Cogs argument must be vacant or of type list.')
    for filename in os.listdir(os.path.join('cogs', folder)):
        if filename.endswith('py'):
            cogs.append(f'bot_cogs.{folder}.{filename[:-3]}')
    return cogs

def get_cogs() -> List[str]:
    """Get all cogs from folders within the 'cogs' parent folder."""
    cogs = []
    # Put all folders here (e.g. ['admin', 'general'])
    folders = ['character']
    for folder in folders:
        cogs = _get_cogs_helper(folder, cogs)
    return cogs

async def load_cogs(bot: 'CharBot'):
    """Load all cogs."""
    cogs = get_cogs()
    failures = 0
    for count, cog in enumerate(cogs, start=1):
        logger.info(f'Loading cog {count}/{len(cogs)}: {cog}')
        try:
            await bot.load_extension(cog)
            logger.info(f"Cog {cog} loaded successfully.")
        except ExtensionFailed as e:
            logger.error(f"Failed to load cog {cog}: {e}")
            failures += 1
            logger.info("Failed to load cog {cog}. Continuing...")
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            failures += 1
            logger.info("Failed to load cog {cog}. Continuing...")
    logger.info(f"Cog loading complete. {len(cogs) - failures}/{len(cogs)} cogs loaded successfully.")