// js/char_details.js
import { 
    fetchAndLoadElements,
    hideSubmenus, 
    submenuClick, 
    backClick, 
    characterClick,
} from './_helpers.js';

import { addUnitToggleButtons } from './_toggle.js';
import { createJsonReport } from './_report.js';

import { showLoadingOverlay, hideLoadingOverlay, showSavingOverlay, hideSavingOverlay } from './_overlay.js';

// Global variable for current character ID
let currentCharacterId = null;

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
        characterItems.forEach(item => {
            item.addEventListener('click', (event) => {
                currentCharacterId = event.currentTarget.getAttribute('data-character-id');
                characterClick(event, body, editMode, uploadedFiles);
            });
        });
    } catch (error) {
        console.error('Error loading elements:', error);
    }

    submenuButtons.forEach(btn => {
        btn.addEventListener('click', (event) => submenuClick(event, uploadedFiles));
    });

    document.getElementById('backBtn').addEventListener('click', () => backClick(body, editMode));
    hideSubmenus();

    document.getElementById('saveBtn').addEventListener('click', async () => {
        if (currentCharacterId && confirm('Are you sure you want to save these changes?')) {
            console.log('Saving changes...');
            showSavingOverlay();
            try {
                const report = await createJsonReport(uploadedFiles);
                await fetch(`/update_character/${currentCharacterId}`, {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(report)
                });
                // Handle response from the server
            } catch (error) {
                console.error('Error saving character:', error);
            }
            setTimeout(hideSavingOverlay, 1500); // Hide loading overlay
        }
    });
    
    document.getElementById('addCharacterBtn').addEventListener('click', async () => {
        showLoadingOverlay(); // Show loading overlay
        try {
            const response = await fetch('/add_character', { method: 'POST' });
            window.location.reload(); // Reload the page
        } catch (error) {
            console.error('Error adding character:', error);
            hideLoadingOverlay(); // Hide loading overlay in case of error
        }
    });
    
    document.querySelectorAll('.removeCharacterBtn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation(); // Prevent event from bubbling up
            if (confirm('Are you sure you want to remove this character?')) {
                showLoadingOverlay(); // Show loading overlay
                try {
                    const characterId = event.target.getAttribute('data-character-id');
                    await fetch(`/remove_character/${characterId}`, { method: 'POST' });
                    window.location.reload(); // Reload the page
                } catch (error) {
                    console.error('Error removing character:', error);
                    hideLoadingOverlay(); // Hide loading overlay in case of error
                }
            }
        });
    });

    hideLoadingOverlay();

    // Flag to track if changes were made
    let unsavedChanges = false;

    // Function to mark changes as unsaved
    function markChangesAsUnsaved() {
        unsavedChanges = true;
    }

    // Add this function call to events where changes are made by the user

    // beforeunload event listener
    window.addEventListener('beforeunload', (event) => {
        if (unsavedChanges) {
            // Set the confirmation message
            const confirmationMessage = 'Any unsaved changes will be discarded. Is that alright?';
            event.returnValue = confirmationMessage; // Standard for most browsers
            return confirmationMessage; // For some older browsers
        }
    });
    
});
