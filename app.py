import os
import json
import logging

from flask import Flask, request, redirect, url_for, render_template, jsonify
from flask_discord import DiscordOAuth2Session, requires_authorization
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
# import psycopg2

from defaults import CHARACTERS, ELEMENTS

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

# def get_db_connection():
#     conn = psycopg2.connect(os.getenv('DATABASE_URL'))
#     return conn

# def get_characters():
#     conn = psycopg2.connect(os.getenv('DATABASE_URL'))
#     cur = conn.cursor()
#     cur.execute('SELECT character_data FROM characters_table')  # Example query
#     character_data = cur.fetchone()[0]
#     conn.close()
#     return json.loads(character_data)  # Convert string back to dictionary

# def get_elements():
#     conn = psycopg2.connect(os.getenv('DATABASE_URL'))
#     cur = conn.cursor()
#     cur.execute('SELECT elements_data FROM elements_table')  # Example query
#     elements_data = cur.fetchone()[0]
#     conn.close()
#     return json.loads(elements_data)  # Convert string back to dictionary

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
    return render_template("main_menu.html", authorized=True, user=user, characters=CHARACTERS)


@app.route("/dynamic_elements")
def dynamic_elements():
    return jsonify(ELEMENTS)


@app.route('/character_details/<int:character_id>', methods=['GET'])
def character_details(character_id):
    character = CHARACTERS.get(character_id)
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
