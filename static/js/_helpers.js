// js/_helpers.js
import { createDateComponent } from './components/dateComponent.js';
import { createTextCompnent } from './components/textComponent.js';
import { createLengthComponent } from './components/lengthComponent.js';
import { createSizeComponent } from './components/sizeComponent.js';
import { createDynamicListComponent } from './components/dynamicListComponent.js';
import { createTitledDynamicListComponent } from './components/titledDynamicListComponent.js';
import { createGeneralComponent } from './components/generalComponent.js';

import { renderGalleryImages } from './_gallery.js';

export const createElementInput = (element, uploadedFiles) => {
    if (element.type === 'date') {
        return createDateComponent(element);

    } else if (element.type === 'textarea') {
        return createTextCompnent(element);

    } else if (element.measurement === 'length') {
        return createLengthComponent(element);

    } else if (element.measurement === 'size') {
        return createSizeComponent(element);

    } else if (element.list_type === 'dynamic_list') {
        return createDynamicListComponent(element);

    } else if (element.list_type === 'dynamic_list_with_titles') {
        return createTitledDynamicListComponent(element);

    } else {
        return createGeneralComponent(element, uploadedFiles);
    }
};

// Utility functions
export const fetchAndLoadElements = async (uploadedFiles) => {
    try {
        const response = await fetch('/dynamic_elements');
        const elements = await response.json();
        elements.forEach((element) => createAndAppendElement(element, uploadedFiles));    
    } catch (error) {
        console.error('Error fetching elements:', error);
    }
};

export const createLabel = element => {
    const label = document.createElement('label');
    label.textContent = element.placeholder;
    label.htmlFor = element.name;
    return label;
};

export const createAndAppendElement = (element, uploadedFiles) => {
    // Use element.container if it exists, otherwise fallback to 'defaultContainerId'
    const containerId = element.container || 'defaultContainerId';
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }

    const label = createLabel(element);
    const input = createElementInput(element, uploadedFiles); // Pass uploadedFiles directly
    const group = document.createElement('div');
    group.className = 'form-group';
    group.append(label, input);
    container.appendChild(group);
};

export const hideSubmenus = () => {
    console.log('Hiding submenus now'); // Check if this is being printed when expected
    document.querySelectorAll('.form-submenu').forEach(el => {
        console.log('Hiding element:', el.id); // Verify that imageGalleryContainer is being selected
        el.style.display = 'none';
    });
    // Additional logic to hide imageGalleryContainer if it's not classified as form-submenu
    const gallery = document.getElementById('imageGalleryContainer');
    if (gallery) {
        console.log('Explicitly hiding imageGalleryContainer');
        gallery.style.display = 'none';
    }
};
// js/_helpers.js
export const submenuClick = (event, uploadedFiles) => {
    console.log(uploadedFiles)

    hideSubmenus();
    // Hide submenu buttons
    document.querySelector('.submenu-buttons').style.display = 'none';
    
    const menu = event.currentTarget.dataset.menu;
    document.getElementById(`${menu}Container`).style.display = 'block';
    if (menu === 'image') renderGalleryImages(uploadedFiles); // Re-render gallery images when opening image submenu
};    

export const isAnySubmenuOpen = () => [...document.querySelectorAll('.form-submenu')].some(el => el.style.display !== 'none');

export const backClick = (body, editMode) => {
    if (isAnySubmenuOpen()) {
        hideSubmenus();
        // Show submenu buttons when going back
        document.querySelector('.submenu-buttons').style.display = 'flex';
    } else {
        body.classList.remove('edit-active');
        editMode.style.display = 'none';
    }
};

export const clearGallery = (uploadedFiles) => {
    const gallery = document.getElementById('imageGalleryContainer');
    gallery.innerHTML = ''; // Clears the gallery
    uploadedFiles.length = 0; // Clears the uploaded files reference
};

// Character selection
export const characterClick = async (event, body, editMode, uploadedFiles) => {
    console.log(event);
    console.log(uploadedFiles);

    clearGallery(uploadedFiles);
    hideSubmenus();
    const characterId = event.currentTarget.getAttribute('data-character-id');
    const characterData = await fetch(`/character_details/${characterId}`).then(res => res.json());    document.getElementById('editAvatar').src = characterData.image_url;
    document.getElementById('editGreeting').innerText = `Editing ${characterData.name}`;
    body.classList.add('edit-active');
    editMode.style.display = 'flex';
    // Clear uploaded files if any when switching characters
    uploadedFiles.length = 0;
    renderGalleryImages(uploadedFiles);
};
