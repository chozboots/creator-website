# bot_cogs/setup/setup.py: a cog that contains a command to sync commands between guilds (integral to the setup process)
from discord.ext import commands
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from char_bot import CharBot

class Setup(commands.Cog):
    def __init__(self, bot: 'CharBot'):
        self.bot = bot
        
    @commands.command()
    @commands.guild_only()
    @commands.is_owner()
    async def setup(self, ctx:commands.Context, mode:str) -> None:
        ctx.bot: commands.Bot = ctx.bot
        try:
            if mode == "local":
                guild = ctx.guild
                ctx.bot.tree.copy_global_to(guild=guild)
                synced = await ctx.bot.tree.sync(guild=guild)
                await ctx.send("Bringing global commands to current guild...")
                await ctx.send(f'Synced {len(synced)} commands.')
                
            elif mode == "global":
                guild = None
                synced = await ctx.bot.tree.sync(guild=guild)
                await ctx.send("Syncing commands globally...")
                await ctx.send(f'Synced {len(synced)} commands.')
                
            elif mode == "clear":
                await ctx.send("Clearing commands from current guild...")
                guild = ctx.guild
                ctx.bot.tree.clear_commands(guild=guild)
                synced = await ctx.bot.tree.sync(guild=guild)
                await ctx.send("Commands have been cleared.")
            else:
                await ctx.send('Command not recognized.')
                return
        except commands.errors.NotOwner as e:
            await ctx.send("You do not have permission to use this command.")
            raise e
        except Exception as e:
            await ctx.send('An error occurred.')
            raise e

async def setup(bot: commands.Bot):
    await bot.add_cog(Setup(bot))
