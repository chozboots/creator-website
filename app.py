import os
import logging
import json

from flask import Flask, request, redirect, url_for, render_template, jsonify
from flask_discord import DiscordOAuth2Session, requires_authorization
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import psycopg2

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")

if not os.getenv('DYNO'):   
    load_dotenv()
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "true" # !! Only in dev !!
    level = logging.DEBUG
else:
    level = logging.INFO
 
logging.basicConfig(level=level)
logger = logging.getLogger(__name__)

def get_db_connection():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    return conn

def get_characters(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT char_id, data FROM character_data WHERE user_id = %s', (user_id,))
    rows = cur.fetchall()
    conn.close()
    
    characters = {}
    for row in rows:
        char_id, data = row
        logger.debug(f'Char id: {char_id}')
        logger.debug(f'Data: {data} (type: {type(data)})')
        characters[char_id] = data  # Convert string back to dictionary
    
    return characters

def get_elements():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT elements FROM resources WHERE id = 1')  # Assuming you have one entry with id = 1
    elements_data = cur.fetchone()[0]
    conn.close()
    return elements_data  # Convert string back to dictionary (or list in this case)

app.config["DISCORD_CLIENT_ID"] = os.getenv("OAUTH2_CLIENT_ID")
app.config["DISCORD_CLIENT_SECRET"] = os.getenv("OAUTH2_CLIENT_SECRET")
app.config["DISCORD_REDIRECT_URI"] = os.getenv("OAUTH2_REDIRECT_URI")
app.config["DISCORD_BOT_TOKEN"] = os.getenv("BOT_TOKEN")

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

cloudinary.config(
    cloud_name = CLOUDINARY_CLOUD_NAME,
    api_key = CLOUDINARY_API_KEY,
    api_secret = CLOUDINARY_API_SECRET
)

discord = DiscordOAuth2Session(app)

HYPERLINK = '<a href="{}">{}</a>'


@app.route("/")
def main_menu():
    if not discord.authorized:
        return render_template("main_menu.html", authorized=False)
    
    user = discord.fetch_user()
    user_characters = get_characters(user.id)  # Fetch characters for the logged-in user
    return render_template("main_menu.html", authorized=True, user=user, characters=user_characters)


@app.route('/add_character', methods=['POST'])
def add_character():
    if not discord.authorized:
        return jsonify({'error': 'User not authenticated'}), 401

    user_id = discord.fetch_user().id
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Insert a new character with default data from the table definition
        cur.execute('INSERT INTO character_data (user_id) VALUES (%s) RETURNING char_id', (user_id,))
        char_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Character added', 'char_id': char_id}), 201
    except Exception as e:
        logger.error(f'Error adding character: {e}')
        return jsonify({'error': 'An error occurred while adding character'}), 500


@app.route('/remove_character/<int:character_id>', methods=['POST'])
def remove_character(character_id):
    if not discord.authorized:
        return jsonify({'error': 'User not authenticated'}), 401

    user_id = discord.fetch_user().id
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if the character belongs to the user
        cur.execute('SELECT user_id FROM character_data WHERE char_id = %s', (character_id,))
        row = cur.fetchone()
        if row is None or row[0] != user_id:
            return jsonify({'error': 'Character not found or not authorized to delete'}), 403

        # Delete the specified character for this user
        cur.execute('DELETE FROM character_data WHERE char_id = %s AND user_id = %s', (character_id, user_id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'message': 'Character removed'}), 200
    except Exception as e:
        logger.error(f'Error removing character: {e}')
        return jsonify({'error': 'An error occurred while removing character'}), 500


@app.route("/dynamic_elements")
def dynamic_elements():
    elements = get_elements()
    return jsonify(elements)


@app.route('/character_details/<int:character_id>', methods=['GET'])
def character_details(character_id):
    if not discord.authorized:
        return jsonify({'error': 'User not authenticated'}), 401

    user_id = discord.fetch_user().id
    characters = get_characters(user_id)

    character = characters.get(character_id)
    if character:
        return jsonify(character)
    else:
        return jsonify({'error': 'Character not found'}), 404


@app.route('/upload', methods=['POST'])
def upload_files():
    uploaded_files = request.files
    links = request.form.getlist('link')

    logger.debug(f'Uploaded files: {list(uploaded_files.keys())}')
    logger.debug(f'Links: {links}')

    max_allowed_files = 4
    amount_of_files = len(uploaded_files) + len(links)
    
    if amount_of_files > max_allowed_files:
        error_message = f'Too many files uploaded. Maximum allowed: {max_allowed_files}'
        return jsonify({'error': error_message}), 400

    uploaded_urls = []

    for file_key in uploaded_files:
        file = uploaded_files[file_key]
        logger.debug(f'Uploading file: {file.filename}')
        try:
            upload_result = cloudinary.uploader.upload(file)
            uploaded_urls.append(upload_result['url'])
        except Exception as e:
            # Cloudinary error handling
            return jsonify({'error': f'Error uploading file: {str(e)}'}), 500
    
    logger.debug(f'Uploaded urls: {uploaded_urls}')

    links += uploaded_urls
    logger.debug(f'New Links: {links}')

    # Database operations here...

    return jsonify({'links': links}), 200


@app.route('/update_character/<int:character_id>', methods=['POST'])
def update_character(character_id):
    if not discord.authorized:
        return jsonify({'error': 'User not authenticated'}), 401

    user_id = discord.fetch_user().id
    new_character_data = request.get_json()  # Using get_json() to parse JSON data

    if new_character_data is None:
        return jsonify({'error': 'Invalid data format'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Convert new character data to JSON string, if necessary
        if not isinstance(new_character_data, str):
            new_character_data_json = json.dumps(new_character_data)
        else:
            new_character_data_json = new_character_data

        # Update the character data
        cur.execute('UPDATE character_data SET data = %s WHERE char_id = %s AND user_id = %s', 
                    (new_character_data_json, character_id, user_id))
        conn.commit()

        if cur.rowcount == 0:
            # No rows were updated, indicating the character does not exist or does not belong to the user
            cur.close()
            conn.close()
            return jsonify({'error': 'Character not found or not authorized to update'}), 403

        cur.close()
        conn.close()
        return jsonify({'message': 'Character updated successfully'}), 200

    except Exception as e:
        logger.error(f'Error updating character: {e}')
        return jsonify({'error': 'An error occurred while updating character'}), 500


@app.route("/login/")
def login():
    return discord.create_session(scope=["identify"])


@app.route("/callback/")
def callback():
    data: dict = discord.callback()
    redirect_to = data.get("redirect", "/")
    return redirect(redirect_to)


@app.route("/logout/")
def logout():
    discord.revoke()
    return redirect(url_for(".main_menu"))


@app.route("/secret/")
@requires_authorization
def secret():
    return os.urandom(16)


if __name__ == "__main__":
    app.run(debug=True)
