import discord
from discord.ext import commands
from discord import Embed, Interaction, app_commands
from typing import TYPE_CHECKING
import logging
import json

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


    async def find_char_data(self, interaction: Interaction, member: discord.Member | None) -> list:
        if member is None:
            member = interaction.user

        character_data = await self.queries.fetch(
            table="character_data",
            columns=["char_id", "user_id", "created_at", "servers", "status", "data"],
            where_column="user_id",
            where_value=member.id
        )

        if not character_data:
            return None

        # Process each character's data
        processed_data = [json.loads(char['data']) for char in character_data]
        return processed_data
    
    
    async def message_if_not_found(self, interaction: Interaction, member: discord.Member = None):
        message = f"Could not find characters for user {member.name}"
        await interaction.response.send_message(embed=Embed(title=message), ephemeral=True)


    async def display_character_profile(self, interaction: discord.Interaction, char_profile: dict):
        # Define a function to truncate text to a maximum length
        def truncate_text(text, max_length=1024):
            if len(text) > max_length:
                return text[:max_length - 3] + "..."
            return text

        # char_profile is already a processed dictionary and does not need json.loads
        embed = discord.Embed(
            title=f"Character Profile: {char_profile.get('characterName', 'Unknown')}",
            color=discord.Color.blue()
        )

        # Description
        description = char_profile.get('characterDescription', 'No description available.')
        embed.description = truncate_text(description)

        # Add character image
        if char_profile.get('characterImage'):
            embed.set_image(url=char_profile['characterImage'])

        # Bio section
        if char_profile.get('characterBio'):
            bio = truncate_text(char_profile['characterBio'])
            embed.add_field(name="Bio", value=bio, inline=False)

        # Likes and Dislikes
        if char_profile.get('characterLikes'):
            likes = '\n'.join(f"- {truncate_text(like)}" for like in char_profile['characterLikes'])
            embed.add_field(name="Likes", value=likes, inline=True)
        if char_profile.get('characterDislikes'):
            dislikes = '\n'.join(f"- {truncate_text(dislike)}" for dislike in char_profile['characterDislikes'])
            embed.add_field(name="Dislikes", value=dislikes, inline=True)

        # Abilities
        if char_profile.get('characterAbilities'):
            abilities = '\n'.join(f"**{truncate_text(ability['title'])}**: {truncate_text(ability['description'])}" for ability in char_profile['characterAbilities'])
            embed.add_field(name="Abilities", value=abilities, inline=False)

        # Occupation
        if char_profile.get('characterOccupation'):
            occupation = truncate_text(char_profile['characterOccupation'])
            embed.add_field(name="Occupation", value=occupation, inline=True)

        # Birthday
        if char_profile.get('characterBirthday'):
            birthday = truncate_text(char_profile['characterBirthday'])
            embed.add_field(name="Birthday", value=birthday, inline=True)

        # Pronouns
        if char_profile.get('characterPronouns'):
            pronouns = ', '.join(char_profile['characterPronouns'])
            embed.add_field(name="Pronouns", value=pronouns, inline=True)

        # Height and Weight
        if char_profile.get('characterHeight') and char_profile.get('characterWeight'):
            height = char_profile['characterHeight'].get('amount', 'Unknown')
            weight = char_profile['characterWeight'].get('amount', 'Unknown')
            height_weight = f"{height} cm / {weight} kg"
            embed.add_field(name="Height/Weight", value=truncate_text(height_weight), inline=True)

        # Additional Bio Info
        if char_profile.get('characterAgeInfo'):
            age_info = truncate_text(char_profile['characterAgeInfo'])
            embed.add_field(name="Age Info", value=age_info, inline=False)

        # Living Situation
        if char_profile.get('characterLivingSituation'):
            living_situation = truncate_text(char_profile['characterLivingSituation'])
            embed.add_field(name="Living Situation", value=living_situation, inline=False)
            
        embed.set_footer(text=f"This is not what the final product will look like! It will look much prettier, I promise! This is just to show you what the bot can do, roughly. (Expect bugs!))")

        await interaction.response.send_message(embed=embed)

        
    @app_commands.command(name="profile", description="Displays your character's mini profile")
    @app_commands.describe(member="The user to get a list of characters from")
    async def profile(self, interaction: Interaction, member: discord.Member | None = None):
        char_data = await self.find_char_data(interaction, member)
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
