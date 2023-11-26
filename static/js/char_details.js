// js/char_details.js
import { 
    fetchAndLoadElements,
    hideSubmenus, 
    submenuClick, 
    backClick, 
    characterClick,
} from './_helpers.js';

import { loadCharacters } from './characterManager.js'; // Add this import

document.addEventListener('DOMContentLoaded', async () => {
    let currentCharacterId = null;
    let currentCharacterClone = null;
    const body = document.body;
    const editMode = document.getElementById('editMode');
    
    const submenuButtons = document.querySelectorAll('.submenu-button');
    const uploadedFiles = []; // Persistent storage for uploaded files

    await loadCharacters();
    const characterList = document.getElementById('characterList'); // Get the character list container
    console.log(`characterList type: ${typeof characterList}`); // Verify that characterList is not null

    // Inside the DOMContentLoaded event listener
    characterList.addEventListener('click', (event) => {
        const characterItem = event.target.closest('.character-item');
        if (characterItem) {
            const characterId = characterItem.getAttribute('data-character-id');
            console.log('Fetching character details for ID:', characterId);
            characterClick(event, body, editMode, uploadedFiles, characterId, currentCharacterClone);
        }
    });

    submenuButtons.forEach(btn => {
        btn.addEventListener('click', (event) => submenuClick(event, uploadedFiles));
    });
    document.getElementById('backBtn').addEventListener('click', () => backClick(body, editMode));

    hideSubmenus();

    // Initial calls
    fetchAndLoadElements(uploadedFiles, currentCharacterId, currentCharacterClone);
});
