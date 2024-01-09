from typing import List, Dict, Any, Union, Literal
from discord import Embed
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# utilities
def _listify(field_list: List[str]) -> str:
    if len(field_list) == 1:
        return field_list[0]
    item_list = []
    for item in field_list:
        item_list.append(f"- {item}")
    return "\n".join(item_list)

# core functions
def process_elements(character_fields: List[dict], elements_settings: dict) -> Embed:
    embed = Embed()
    for field in character_fields:
        field_name: str = field.get('name')
        
        if field_name == "break":
            embed.add_field(name="\u200b", value="\u200b", inline=False)
            continue
        
        field_inline: bool = field.get('inline')
        field_data: dict = field.get('data')
        
        if not any((field_name, field_inline, field_data)):
            logger.error("Invalid field: %s", field)
            continue
        
        logger.debug("Field name: %s | Field data: %s", field_name, field_data)
        
        e_config: dict = elements_settings[field_name]
        e_config_type: str = e_config.get('type')
        
        if e_config_type == "textarea":
            embed = process_textarea(embed, field_data, e_config, field_inline)
            
        elif e_config_type == "multi":
            embed = process_multi(embed, field_data, e_config, field_inline)
            
        elif e_config_type == "slider":
            embed = process_slider(embed, field_data, e_config, field_inline)
            
        elif e_config_type == "file":
            embed = process_file(embed, field_data, e_config, field_inline)
            
        elif e_config_type == "number":
            embed = process_number(embed, field_data, e_config, field_inline)
            
        elif e_config_type == "dynamicList":
            embed = process_dynamic_list(embed, field_data, e_config, field_inline)
            
        elif e_config_type == "date":
            embed = process_date(embed, field_data, e_config, field_inline)
            
    return embed

# textarea
def process_textarea(embed: Embed, field_value: Union[str, None], e_config: dict, field_inline=True):
    if field_value:
        if e_config.get('is_header'):
            embed.title = f"{field_value} (Profile)"
        else:
            embed.add_field(name=e_config.get('placeholder'), value=field_value, inline=field_inline)
    return embed


# multi
def process_multi(embed: Embed, field_value: Union[List[Any], None], e_config: dict, field_inline=True):
    if field_value and isinstance(field_value, list):
        item_list = _listify(field_value)
        embed.add_field(name=e_config.get('placeholder'), value=item_list, inline=field_inline)
    return embed


# slider
def _make_percentage(value: float) -> str:
    return f"{value * 100}%"

def _slider_embed_text(name: str, value: float):
    return f"**{name}**: {_make_percentage(value)}"

def process_slider(embed: Embed, field_value: Union[List[dict], None], e_config: dict, field_inline=True):
    if isinstance(field_value, list):
        item_list = []
        total = 0
        for category in field_value:
            for cat_name, cat_value in category.items():
                # Validate that cat_name and cat_value
                cat_name = str(cat_name)
                try:
                    cat_value = float(cat_value)
                except ValueError:
                    logger.error("Invalid value for slider category '%s': %s", cat_name, cat_value)
                    continue
                
                if cat_value > 0:
                    total += cat_value
                    item_list.append(_slider_embed_text(cat_name, cat_value))
        
        if item_list and total == 1:
            embed.add_field(name=e_config.get('placeholder'), value=_listify(item_list), inline=field_inline)
            
    return embed


# file
def process_file(embed: Embed, field_value: Union[str, None], e_config: dict, field_inline=True):
    profile: bool = e_config.get('profile')
    
    if profile and field_value:
        link = field_value if isinstance(field_value, str) else field_value[0]
        try:
            embed.set_image(url=link)
            # embed.set_thumbnail(url=link)
        except Exception as e:
            logger.error('Could not set thumbnail for %s: %s', link, e)
            
    elif not profile and field_value:
        logger.debug("Field value: %s", field_value)
        link = field_value if isinstance(field_value, str) else field_value[0]
        logger.debug("Link: %s", link)
        try:
            embed.set_image(url=link)
        except Exception as e:
            logger.error('Could not set image for %s: %s', link, e)
            
    return embed
              

# number
def _check_float(value: Any) -> float:
    try: 
        return float(value)
    except ValueError as e:
        logger.error("Could not convert '%s' (type: %s) to float: %s", value, type(value).__name__, e)
        return 0.0

def _length_display(value: Any) -> str:
    # Assuming value is in centimeters, converting to feet and inches
    if not isinstance(value, float):
        value = _check_float(value)
    
    total_inches = value / 2.54  # 1 cm = 0.393701 inches
    feet = int(total_inches // 12)
    inches = round(total_inches % 12)

    return f"{feet}\'{inches}\" ({round(value)} cm)"

def _size_display(value: Any) -> str:
    # Assuming value is in centimeters, converting to inches
    if not isinstance(value, float):
        value = _check_float(value)

    inches = value / 2.54  # 1 cm = 0.393701 inches

    return f"{round(inches)}\" ({round(value)} cm)"

def _weight_display(value: Any) -> str:
    # Assuming value is in kilograms, converting to pounds
    if not isinstance(value, float):
        value = _check_float(value)

    pounds = value * 2.20462  # 1 kg = 2.20462 lbs

    return f"{round(pounds)} lbs ({round(value)} kg)"

def _create_display(mode: Literal["length", "size", "weight"], value: Any) -> str | None:
    if mode == "length":
        return _length_display(value)
    elif mode == "size":
        return _size_display(value)
    elif mode == "weight":
        return _weight_display(value)
    else:
        return None
    
    
def process_number(embed: Embed, field_value: Union[Dict[str, Union[str, None]], None], e_config: dict, field_inline=True):
    mode: Literal["Numeric", "Range", "Varies", "None"] = field_value.get('mode')
    measurement: Literal["length", "size", "weight"] = e_config.get('measurement')
    
    if mode == "Numeric":
        text = _create_display(measurement, field_value.get('amount'))
        embed.add_field(name=e_config.get('placeholder'), value=text, inline=field_inline) 
         
    elif mode == "Range":
        amount, min_amount, max_amount = (
            field_value.get('amount'), 
            field_value.get('min_amount'), 
            field_value.get('max_amount')
        )
        amount_display, min_display, max_display = (
            f"**Normal:** {_create_display(measurement, amount)}",
            f"**Min:** {_create_display(measurement, min_amount)}",
            f"**Max:** {_create_display(measurement, max_amount)}"
        )
        text = _listify([amount_display, min_display, max_display])
        embed.add_field(name=e_config.get('placeholder'), value=text, inline=field_inline)
        
    elif mode == "Varies":
        text = mode
        embed.add_field(name=e_config.get('placeholder'), value=text, inline=field_inline)

    return embed

        
# dynamicList
def process_dynamic_list(embed: Embed, field_value: Union[List[Dict[str, str]], None], e_config: dict, field_inline=True):
    if field_value:
        item_list = []
        for item in field_value:
            title = item["title"]
            if title:
                item_list.append(title)
        embed.add_field(name=e_config.get('placeholder'), value=_listify(item_list), inline=field_inline)
    return embed

def process_date(embed: Embed, field_value: Union[str, None], e_config: dict, field_inline=True):
    # Ensure that field_value matches the "YYYY-MM-DD" format using runtime validation
    if field_value:
        try:
            # Parse the date
            birth_date = datetime.strptime(field_value, "%Y-%m-%d")
            current_date = datetime.now()

            # Convert to "Month DD, YYYY" format
            formatted_date = birth_date.strftime("%B %d, %Y")

            # Calculate age
            age = current_date.year - birth_date.year - ((current_date.month, current_date.day) < (birth_date.month, birth_date.day))
            
            # Prepare the final display string
            # display_string = f"{formatted_date} ({age} years old)"
            display_string = f"{formatted_date}"

            
            embed.add_field(name=e_config.get('placeholder'), value=display_string, inline=field_inline)
            embed.add_field(name="Age", value=f"{age}", inline=field_inline)

        except ValueError:
            logger.error("Invalid date format for '%s'. Expected format: YYYY-MM-DD", field_value)
    else:
        pass

    return embed
