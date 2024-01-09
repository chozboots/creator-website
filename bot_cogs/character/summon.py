import discord
from discord.ext import commands
from discord import Embed, Interaction, app_commands
from typing import TYPE_CHECKING, List, Dict, Tuple
import logging
import json

from bot_helpers import process_elements
from bot_helpers.fetcher import get_char_data, get_elements_settings

if TYPE_CHECKING:
    from char_bot import CharBot


logger = logging.getLogger(__name__)


class CharacterDropdown(discord.ui.Select):
    def __init__(self, characters, char_manager: 'CharacterManager'):
        options = [
            discord.SelectOption(label=char['characterName'], value=str(i))
            for i, char in enumerate(characters)
        ]
        super().__init__(placeholder='Choose a character...', min_values=1, max_values=1, options=options)
        self.characters = characters
        self.char_manager = char_manager


    async def callback(self, interaction: discord.Interaction):
        selected_index = int(self.values[0])
        selected_char = self.characters[selected_index]
        await self.char_manager.display_character_profile(interaction, selected_char) 


class CharacterManager(commands.Cog, group_name="char"):
    def __init__(self, bot: 'CharBot') -> None:
        self.bot = bot
        self.queries = bot.queries

    async def message_if_not_found(self, interaction: Interaction, member: discord.Member = None):
        message = f"Could not find characters for user {member.name}"
        await interaction.response.send_message(embed=Embed(title=message), ephemeral=True)


    async def display_character_profile(self, interaction: discord.Interaction, char_profile: dict):
        try:
            elements_settings, desired_fields = await get_elements_settings(self.queries)
            elements_settings: dict
            desired_fields: List[dict]
            if not elements_settings:
                raise Exception("Could not get elements settings!")
            if not desired_fields:
                raise Exception("Could not get card list!")
        except Exception as e:
            logger.error(e)
            interaction.response.send_message("Server error. Please try again later.", ephemeral=True)
        
        for field in desired_fields:
            field: dict
            name: str = field["name"]
            logger.debug("Field: %s", field)
            if name in char_profile:
                field["data"] = char_profile[name]
            elif name == "break":
                continue
            else:
                desired_fields.remove(field)
                
        logger.debug("Char fields: %s", desired_fields)
            
        embed = process_elements(desired_fields, elements_settings)
        
        await interaction.response.send_message(embed=embed)

        
    @app_commands.command(name="profile", description="Displays your character's profile")
    @app_commands.describe(member="The user to get a list of characters from")
    async def profile(self, interaction: Interaction, member: discord.Member | None = None):
        char_data = await get_char_data(self.queries, interaction, member)
        if not char_data:
            await self.message_if_not_found(interaction, member)
            return

        if len(char_data) > 1:
            # Create and send a dropdown menu
            dropdown = CharacterDropdown(char_data, self)
            view = discord.ui.View()
            view.add_item(dropdown)
            await interaction.response.send_message("Select a character:", view=view, ephemeral=True)
        else:
            # Display the profile of the single character
            await self.display_character_profile(interaction, char_data[0])


async def setup(bot: 'CharBot'):
    await bot.add_cog(CharacterManager(bot))
