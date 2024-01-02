import discord
from discord.ext import commands
from discord import Embed, Interaction, app_commands
from typing import TYPE_CHECKING
import logging

if TYPE_CHECKING:
    from char_bot import CharBot

from ui import char_cards

logger = logging.getLogger(__name__)

class CharacterManager(commands.Cog, group_name="char"):
    def __init__(self, bot: 'CharBot') -> None:
        self.bot = bot
        self.queries = bot.queries

    async def find_char_data(self, interaction: Interaction, name: str, member: discord.Member | None) -> dict | None:
        member_id = member.id if member else interaction.user.id
        char_profiles_entry = await self.bot.queries.select_double_condition(
            "char_profiles",
            ["char_id"],
            "member_id", member_id,
            "char_name", name
        )

        if not char_profiles_entry:
            return None

        char_id = char_profiles_entry[0].get("char_id")
        return await self.bot.queries.select(
            "char_data",
            [
                "char_name", "weapons", "abilities", "ref_img", "prof_img",
                "identity", "num_meas", "cat_meas", "details", "bio", "dob"
            ],
            "char_id", char_id
        )

    async def message_if_not_found(self, interaction: Interaction, name: str, member: discord.Member = None):
        message = f"Could not find character named {name} for user {member.name}" if member else f"Could not find character named {name}"
        await interaction.response.send_message(embed=Embed(title=message), ephemeral=True)

    @app_commands.command(name="mini", description="Displays your character's mini profile")
    @app_commands.describe(name="The character's name", member="The user who owns the character (optional)")
    async def mini(self, interaction: Interaction, name: str, member: discord.Member | None = None):
        char_data = await self.find_char_data(interaction, name, member)
        if not char_data:
            return await self.message_if_not_found(interaction, name, member)

        embed = await char_cards.mini_profile(self.bot.queries, char_data, interaction)
        await interaction.response.send_message(embed=embed)

    # ... other commands like skills, details, bio, all ...

async def setup(bot: 'MyBot'):
    await bot.add_cog(CharacterManager(bot))
