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
        # char_profile is already a processed dictionary and does not need json.loads
        embed = discord.Embed(
            title=f"Character Profile: {char_profile.get('characterName', 'Unknown')}",
            description=char_profile.get('characterDescription', 'No description available.'),
            color=discord.Color.blue()
        )

        # Add character image
        if char_profile.get('characterImage'):
            embed.set_image(url=char_profile['characterImage'])

        # Bio section
        if char_profile.get('characterBio'):
            embed.add_field(name="Bio", value=char_profile['characterBio'], inline=False)

        # Likes and Dislikes
        if char_profile.get('characterLikes'):
            likes = '\n'.join(f"- {like}" for like in char_profile['characterLikes'])
            embed.add_field(name="Likes", value=likes, inline=True)
        if char_profile.get('characterDislikes'):
            dislikes = '\n'.join(f"- {dislike}" for dislike in char_profile['characterDislikes'])
            embed.add_field(name="Dislikes", value=dislikes, inline=True)

        # Abilities
        if char_profile.get('characterAbilities'):
            abilities = '\n'.join(f"**{ability['title']}**: {ability['description']}" for ability in char_profile['characterAbilities'])
            embed.add_field(name="Abilities", value=abilities, inline=False)

        # Occupation
        if char_profile.get('characterOccupation'):
            embed.add_field(name="Occupation", value=char_profile['characterOccupation'], inline=True)

        # Birthday
        if char_profile.get('characterBirthday'):
            embed.add_field(name="Birthday", value=char_profile['characterBirthday'], inline=True)

        # Pronouns
        if char_profile.get('characterPronouns'):
            pronouns = ', '.join(char_profile['characterPronouns'])
            embed.add_field(name="Pronouns", value=pronouns, inline=True)

        # Height and Weight
        if char_profile.get('characterHeight') and char_profile.get('characterWeight'):
            height = char_profile['characterHeight'].get('amount', 'Unknown')
            weight = char_profile['characterWeight'].get('amount', 'Unknown')
            embed.add_field(name="Height/Weight", value=f"{height} cm / {weight} kg", inline=True)

        # Additional Bio Info
        if char_profile.get('characterAgeInfo'):
            embed.add_field(name="Age Info", value=char_profile['characterAgeInfo'], inline=False)

        # def format_alignment(alignments):
        #     return ', '.join(f"{k}: {v*100}%" for alignment in alignments for k, v in alignment.items() if v > 0)

        # # Format Sexual Alignment
        # sexual_alignment = format_alignment(char_profile.get('characterSexualAlignment', []))
        # position_alignment = format_alignment(char_profile.get('characterPositionAlignment', []))

        # alignment_text = ""
        # if sexual_alignment:
        #     alignment_text += f"Sexual: {sexual_alignment}\n"
        # if position_alignment:
        #     alignment_text += f"Position: {position_alignment}"

        # if alignment_text:
        #     embed.add_field(name="Alignments", value=alignment_text.strip(), inline=False)

        # Living Situation
        if char_profile.get('characterLivingSituation'):
            embed.add_field(name="Living Situation", value=char_profile['characterLivingSituation'], inline=False)
            
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
