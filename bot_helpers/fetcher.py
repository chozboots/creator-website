from discord import Interaction, Member
import json
import logging
from typing import TYPE_CHECKING, List, Literal, Tuple

if TYPE_CHECKING:
    from queries import Queries
    
logger = logging.getLogger(__name__)


async def get_char_data(queries: 'Queries', interaction: Interaction, member: Member | None) -> list:
    if member is None:
        member = interaction.user

    character_data = await queries.fetch(
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

async def get_elements_settings(queries: 'Queries', card_type: Literal["profile"]="profile") -> Tuple[dict, List[dict]]:
    card_table_name = f"{card_type}_values"
    try:  
        # there should only be one row in this table
        # the primary key is currently set to a Discord guild_id for future scalability
        remote_data = await queries.fetch(
            table="resources",
            columns=["form_elements", card_table_name]
        )
        
        if remote_data:
            # lambda here later?
            elements_list: List[dict]  = remote_data[0]['form_elements']
            elements_list: dict = json.loads(elements_list) if isinstance(elements_list, str) else elements_list
            card_list: List[dict] = remote_data[0][card_table_name]
            card_list: dict = json.loads(card_list) if isinstance(card_list, str) else card_list
            if not elements_list[0] or not card_list[0]:
                raise Exception("One or more database lists are empty!")
        else:
            raise Exception("Could not find data in the database!")
    except Exception as e:
        logger.error(e)
        return None
    
    logger.debug("Elements list: %s", elements_list)
    
    elements_settings = {}
    for element in elements_list:
        logger.debug("Element: %s | Type: %s", element, type(element))
        # element: dict = json.loads(element) if isinstance(element, str) else element
        element_name: str = element.get('name')
        elements_settings[element_name] = element
        
    logger.debug("Elements settings: %s", elements_settings)
    
    return elements_settings, card_list