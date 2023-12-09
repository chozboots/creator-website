// js/char_details.js
import { 
    fetchAndLoadElements,
    hideSubmenus, 
    submenuClick, 
    backClick, 
    characterClick,
} from './_helpers.js';

import {
    addUnitToggleButtons
} from './_toggle.js';

document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    const editMode = document.getElementById('editMode');
    const characterItems = document.querySelectorAll('.character-item');
    const submenuButtons = document.querySelectorAll('.submenu-button');
    const uploadedFiles = []; // Persistent storage for uploaded files

    // Add unit toggle buttons to the measurements container
    const measurementsContainer = document.getElementById('measurementsContainer');
    addUnitToggleButtons(measurementsContainer);

    try {
        await fetchAndLoadElements(uploadedFiles); // Ensure elements are loaded
        // Now attach click listeners that depend on these elements
        characterItems.forEach(item => {
            item.addEventListener('click', (event) => {
                characterClick(event, body, editMode, uploadedFiles);
            });
        });
    } catch (error) {
        console.error('Error loading elements:', error);
        // Handle error appropriately
    }

    submenuButtons.forEach(btn => {
        btn.addEventListener('click', (event) => submenuClick(event, uploadedFiles));
    });
    
    document.getElementById('backBtn').addEventListener('click', () => backClick(body, editMode));
    hideSubmenus();
});
