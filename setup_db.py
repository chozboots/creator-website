import psycopg2
import json
import os
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Database connection parameters
DATABASE_URL = os.getenv('DATABASE_URL')

# Function to create tables
def create_tables(conn):
    CREATE_TABLES_SQL = """
    CREATE TABLE IF NOT EXISTS character_data
    (
        char_id serial PRIMARY KEY,
        user_id bigint NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        servers integer[] DEFAULT '{}'::integer[],
        status text DEFAULT 'in-progress',
        data jsonb DEFAULT '{"characterName": "New Character", "characterImage": "https://res.cloudinary.com/hzgpk6xkf/image/upload/v1703113863/coimdqozf3kwhc933pf0.jpg"}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS resources
    (
        guild_id bigint NOT NULL,
        form_elements jsonb DEFAULT '[]'::jsonb,
        profile_values jsonb DEFAULT '[]'::jsonb,
        submenu_buttons jsonb DEFAULT '[]'::jsonb,
        CONSTRAINT resources_pkey PRIMARY KEY (guild_id)
    );
    """

    cur = conn.cursor()
    cur.execute(CREATE_TABLES_SQL)
    conn.commit()
    cur.close()

# Function to insert values into resources
def insert_into_resources(conn, guild_id, form_elements, profile_values, submenu_buttons):
    try:
        cur = conn.cursor()
        insert_sql = """
        INSERT INTO resources (guild_id, form_elements, profile_values, submenu_buttons)
        VALUES (%s, %s, %s, %s);
        """
        # Convert dictionaries to JSON strings
        form_elements_json = json.dumps(form_elements)
        profile_values_json = json.dumps(profile_values)
        submenu_buttons_json = json.dumps(submenu_buttons)

        cur.execute(insert_sql, (guild_id, form_elements_json, profile_values_json, submenu_buttons_json))
        conn.commit()
        cur.close()
        logger.info("Data inserted successfully into resources")
    except (Exception, psycopg2.DatabaseError) as error:
        logger.error(f"Error: {error}")
        conn.rollback()
        cur.close()

# Main execution
if __name__ == "__main__":
    if DATABASE_URL is None:
        logger.error('Please set a DATABASE_URL environment variable')
        exit(1)

    try:
        conn = psycopg2.connect(DATABASE_URL)
    except Exception as e:
        logger.error(f'Error: {e}')
        exit(1)

    create_tables(conn)

    guild_id = 123456789  # Example guild_id
    with open('db_settings/form_elements.json', 'r') as file:
        form_elements = json.load(file)
    with open('db_settings/profile_values.json', 'r') as file:
        profile_values = json.load(file)
    with open('db_settings/submenu_buttons.json', 'r') as file:
        submenu_buttons = json.load(file)

    insert_into_resources(conn, guild_id, form_elements, profile_values, submenu_buttons)
    conn.close()
