import os

from flask import Flask, redirect, url_for, render_template, jsonify, request
from flask_discord import DiscordOAuth2Session, requires_authorization
from dotenv import load_dotenv

from defaults import CHARACTERS, ELEMENTS


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")

if not os.getenv('DYNO'):   
    load_dotenv()
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "true"    # !! Only in development environment.

app.config["DISCORD_CLIENT_ID"] = os.getenv("OAUTH2_CLIENT_ID")
app.config["DISCORD_CLIENT_SECRET"] = os.getenv("OAUTH2_CLIENT_SECRET")
app.config["DISCORD_REDIRECT_URI"] = os.getenv("OAUTH2_REDIRECT_URI")
app.config["DISCORD_BOT_TOKEN"] = os.getenv("BOT_TOKEN")

discord = DiscordOAuth2Session(app)

HYPERLINK = '<a href="{}">{}</a>'

@app.route("/")
def main_menu():
    if not discord.authorized:
        return render_template("main_menu.html", authorized=False)
    user = discord.fetch_user()
    return render_template("main_menu.html", authorized=True, user=user, characters=CHARACTERS)

@app.route("/dynamic_characters", methods=['GET'])
def dynamic_characters():
    return jsonify(CHARACTERS)

@app.route("/dynamic_elements", methods=['GET'])
def dynamic_elements():
    return jsonify(ELEMENTS)

@app.route('/character_details/<character_id>', methods=['GET'])
def character_details(character_id):
    print("Requested character ID:", character_id)
    try:
        character_id = int(character_id)
    except ValueError:
        print("Invalid character ID")
        return jsonify({'error': 'Invalid character ID'}), 400

    character = next((char for char in CHARACTERS if char['id'] == character_id), None)
    if character:
        print("Character found:", character)
        return jsonify(character)
    else:
        print("Character not found")
        return jsonify({'error': 'Character not found'}), 404
    
@app.route('/update_character/<int:character_id>', methods=['PUT'])
def update_character(character_id):
    updated_character = request.json
    for char in CHARACTERS:
        if char['id'] == character_id:
            char.update(updated_character)
            return jsonify(char), 200
    return jsonify({'error': 'Character not found'}), 404

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
