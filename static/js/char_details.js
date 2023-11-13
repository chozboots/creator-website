// js/char_details.js
import { 
    fetchAndLoadElements,
    hideSubmenus, 
    submenuClick, 
    backClick, 
    characterClick,
} from './_helpers.js';

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const editMode = document.getElementById('editMode');
    const characterItems = document.querySelectorAll('.character-item');
    const submenuButtons = document.querySelectorAll('.submenu-button');
    const uploadedFiles = []; // Persistent storage for uploaded files

    // Assuming characterClick is supposed to be called with the 'item' as 'element'
    characterItems.forEach(item => {
        item.addEventListener('click', (event) => {
            characterClick(event, body, editMode, uploadedFiles);
        });
    });
    
    submenuButtons.forEach(btn => {
        btn.addEventListener('click', (event) => submenuClick(event, uploadedFiles));
    });
    document.getElementById('backBtn').addEventListener('click', () => backClick(body, editMode));

    hideSubmenus();

    // Initial calls
    fetchAndLoadElements(uploadedFiles);
});
