// js/_helpers.js
import { createDateComponent } from './components/dateComponent.js';
import { createTextComponent } from './components/textComponent.js';
import { createMultiComponent } from './components/multiComponent.js';
import { createLengthComponent } from './components/lengthComponent.js';
import { createSizeComponent } from './components/sizeComponent.js';
import { createWeightComponent } from './components/weightComponent.js';
import { createDynamicListComponent } from './components/dynamicListComponent.js';
import { createTitledDynamicListComponent } from './components/titledDynamicListComponent.js';
import { createGeneralComponent } from './components/generalComponent.js';
import { createSliderComponent } from './components/sliderComponent.js';

import { renderGalleryImages } from './_gallery.js';
import { showInfo } from './_info.js';
import { updateComponentsWithData } from './_loader.js';
import { showLoadingOverlay, hideLoadingOverlay } from './_overlay.js';

export const createElementInput = (element, uploadedFiles, isMetric) => {
    if (element.type === 'date') {
        return createDateComponent(element);

    } else if (element.type === 'textarea') {
        return createTextComponent(element);

    } else if (element.type === 'multi') {
        return createMultiComponent(element);
        
    } else if (element.measurement === 'length') {
        return createLengthComponent(element, isMetric);

    } else if (element.measurement === 'size') {
        return createSizeComponent(element);

    } else if (element.measurement === 'weight') {
        return createWeightComponent(element, isMetric);

    } else if (element.list_type === 'dynamic_list') {
        return createDynamicListComponent(element);

    } else if (element.list_type === 'dynamic_list_with_titles') {
        return createTitledDynamicListComponent(element);

    } else if (element.type === 'slider') {
        return createSliderComponent(element);

    } else {
        return createGeneralComponent(element, uploadedFiles);
    }
};

// Utility functions
export const fetchAndLoadElements = async (uploadedFiles) => {
    const isMetric = document.querySelector('input[name="unit-toggle"]:checked')?.value === 'metric';
    try {
        const response = await fetch('/dynamic_elements');
        const elements = await response.json();
        elements.forEach((element) => createAndAppendElement(element, uploadedFiles, isMetric));    
    } catch (error) {
        console.error('Error fetching elements:', error);
    }
};

export const createLabel = element => {
    const label = document.createElement('label');
    label.textContent = element.placeholder;
    if (!element.optional) {
        label.textContent += " *"; // Add an asterisk if the element is not optional
    }
    label.htmlFor = element.name;

    // Check if element has info and create an info button
    if (element.info) {
        const infoButton = document.createElement('button');
        infoButton.className = 'info-button';
        infoButton.textContent = 'i'; // Or use an icon
        infoButton.onclick = () => showInfo(element.info);
        label.appendChild(infoButton); // Append the button next to the label
    }

    return label;
};

export const createAndAppendElement = (element, uploadedFiles, isMetric) => {
    // Check if the 'characterList' element exists on the page
    const characterList = document.getElementById('characterList');
    if (!characterList) {
        return; // Do nothing if the element doesn't exist
    }

    const containerId = element.container || 'defaultContainerId';

    console.log(`Creating element for container: ${containerId}`); // Debugging line
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }

    console.log(`Appending to container: ${containerId}`); // Debugging line
    
    const label = createLabel(element);
    const input = createElementInput(element, uploadedFiles, isMetric);
    console.log("Created input element:", input); // Inspect the created input

    const group = document.createElement('div');
    group.className = 'form-group';
    group.append(label, input);

    console.log("Appending group to container:", group); // Debugging line
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

export const backClick = () => { 
    if (isAnySubmenuOpen()) {
        hideSubmenus();
        // Show submenu buttons when going back
        document.querySelector('.submenu-buttons').style.display = 'flex';
    } else {
        window.location.reload(); // Reload the page
    }
};

export const clearGallery = (uploadedFiles) => {
    const gallery = document.getElementById('imageGalleryContainer');
    gallery.innerHTML = ''; // Clears the gallery
    uploadedFiles.length = 0; // Clears the uploaded files reference

    if (document.getElementById('characterImage') !== null) {
        document.getElementById('characterImage').value = '';
    }
    if (document.getElementById('fileNameDisplay') !== null) {
        document.getElementById('fileNameDisplay').textContent = '';
    }
};

let currentCharacterId = null;

// Character selection
export const characterClick = async (event, body, editMode, uploadedFiles) => {
    console.log(event);
    console.log(uploadedFiles);
    clearGallery(uploadedFiles);
    hideSubmenus();

    // Set the currentCharacterId when a character is clicked
    currentCharacterId = event.currentTarget.getAttribute('data-character-id');

    showLoadingOverlay(); // Show loading overlay
    const characterData = await fetch(`/character_details/${currentCharacterId}`).then(res => res.json());
    setTimeout(hideLoadingOverlay, 500); // Hide loading overlay after fetching data
    // Update components with the fetched data
    updateComponentsWithData(characterData, uploadedFiles);

    document.getElementById('editAvatar').src = characterData['characterImage'];
    document.getElementById('editGreeting').innerText = `Editing ${characterData['characterName']}`;

    body.classList.add('edit-active');
    editMode.style.display = 'flex';
    
    // Clear uploaded files if any when switching characters
    if (document.getElementsByName('characterGallery').length > 0) {
        document.getElementsByName('characterGallery')[0].value = '';
    }
    
    uploadedFiles.length = 0;
    renderGalleryImages(uploadedFiles);
};
