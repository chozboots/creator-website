// js/components/generalComponent.js
import { setUpGallery, renderGalleryImages } from '../_gallery.js';

export function createGeneralComponent(element, uploadedFiles, currentCharacterId, currentCharacterClone) {
    console.log(uploadedFiles);
    const MAX_IMAGES = 4; // Assuming this is a constant
    const inputType = element.type === 'dropdown' ? 'select' : 'input';
    const input = document.createElement(inputType);

    Object.assign(input, {
        name: element.name,
        placeholder: element.placeholder,
        multiple: element.multiple || false,
        accept: element.accept || null,
        className: element.type
    });

    if (element.type !== 'dropdown') {
        input.type = element.type;
    } else {
        element.options.forEach((optionText) => {
            const optionElement = new Option(optionText, optionText);
            input.add(optionElement);
        });
    }

    if (element.name === 'characterGallery') {
        setUpGallery(input, uploadedFiles, MAX_IMAGES, renderGalleryImages);
        currentCharacterClone[element.name] = uploadedFiles;
    }

    if (element.name === 'characterName') {
        input.type = 'text';
        input.addEventListener('input', function(event) {
            const newName = event.target.value;
            currentCharacterClone[element.name] = newName; // Update the cloned character    
            
            // Update the name in the character list
            const characterDiv = document.querySelector(`.character-item[data-character-id="${currentCharacterId}"]`);
            if (characterDiv) {
                const nameElement = characterDiv.querySelector('.character-name');
                if (nameElement) {
                    nameElement.textContent = newName;
                }
            }

            // Update the name in the editing menu, if applicable
            const editNameElement = document.getElementById('editCharacterName'); // Adjust ID as needed
            if (editNameElement) {
                editNameElement.textContent = newName;
            }
        });
    }

    if (element.name === 'characterImage') {
        input.type = 'file'; // Ensure it's a file input
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    currentCharacterClone[element.name] = imageUrl; 
    
                    // Update the image in the character list
                    const characterDiv = document.querySelector(`.character-item[data-character-id="${currentCharacterId}"]`);
                    if (characterDiv) {
                        const imageElement = characterDiv.querySelector('.character-image-container img');
                        if (imageElement) {
                            imageElement.src = imageUrl;
                        }
                    }
    
                    // Update the image in the editing menu
                    const editAvatar = document.getElementById('editAvatar');
                    if (editAvatar) {
                        editAvatar.src = imageUrl;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    
    } else {
        // Generic handling for all other inputs
        input.addEventListener(element.type === 'file' ? 'change' : 'input', function(event) {
            if (element.type === 'file' && element.name !== 'characterImage') { // Exclude 'characterImage'
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        currentCharacterClone[element.name] = e.target.result;
                        // Additional file-specific UI update logic here
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                // For text, dropdown, and other input types
                currentCharacterClone[element.name] = event.target.value;
            }
        });
    }

    return input;
}
