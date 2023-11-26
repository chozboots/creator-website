// js/characterManager.js
import { characterClick } from './_helpers.js';

export async function loadCharacters(currentCharacterClone) {
    try {
        const response = await fetch('/dynamic_characters');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const characters = await response.json();
        console.log('Characters:', characters);

        const characterList = document.getElementById('characterList');
        if (!characterList) {
            console.error('characterList element not found');
            return;
        }
        
        console.log(`characterList: ${characterList}`)
        characterList.innerHTML = ''; // Clear existing characters
        console.log(`characterList - after clear: ${characterList}`) 
        if (characters.length === 0) {
            handleNoCharacters();
        } else {
            characters.forEach(character => {
                const characterElement = createCharacterElement(character, currentCharacterClone);
                characterList.appendChild(characterElement);
            });
        }
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

function createCharacterElement(character, currentCharacterClone) {
    const characterDiv = document.createElement('div');
    characterDiv.className = 'character-item';
    console.log(`characterId: ${character.id}`)
    characterDiv.setAttribute('data-character-id', character.id);
    console.log('characterAttribute: ', characterDiv.getAttribute('data-character-id'));
    characterDiv.addEventListener('click', (event) => {
        event.stopPropagation();  // Prevent the event from bubbling up
        characterClick(event, document.body, document.getElementById('editMode'), [], character.id, currentCharacterClone);
    });

    // Construct the inner HTML for the character element
    characterDiv.innerHTML = `
        <div class="character-image-container">
            <img src="${character.characterImage}" alt="${character.characterName}">
        </div>
        <div class="character-info">
            <h2>${character.characterName}</h2>
            <span class="character-species">Species: ${character.characterSpecies}</span>
        </div>
    `;

    return characterDiv;
}

function handleNoCharacters() {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '<p>No characters found. Create a new one!</p>'; // Adjust the message as needed
}
