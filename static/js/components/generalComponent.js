// js/components/generalComponent.js
import { setUpGallery, renderGalleryImages } from '../_gallery.js';

export function createGeneralComponent(element, uploadedFiles) {
    console.log("Creating component for:", element.name);
    const MAX_IMAGES = 4; // Assuming this is a constant

    
    if (element.type === 'file') {
        const fileInputContainer = document.createElement('div');
        fileInputContainer.classList.add('file-input-container');

        const fileInput = document.createElement('input');
        Object.assign(fileInput, {
            type: 'file',
            name: element.name,
            accept: 'image/*',
            multiple: element.multiple || false,
            id: element.name,
            className: 'hidden-file-input' // Hide the default input for all file inputs
        });

        // Create a custom button for uploading files
        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Upload Image'; // Customize this text
        uploadButton.className = 'custom-file-upload';
        uploadButton.addEventListener('click', () => fileInput.click());

        fileInputContainer.appendChild(fileInput);
        fileInputContainer.appendChild(uploadButton);

        if (element.name === 'characterGallery') {
            setUpGallery(fileInput, uploadedFiles, MAX_IMAGES, renderGalleryImages);
        } else {
            // Setup for other file inputs
            const fileNameDisplay = document.createElement('span');
            fileNameDisplay.className = 'file-name-display';
            fileInput.addEventListener('change', () => {
                fileNameDisplay.textContent = fileInput.files.length > 0 ?
                    Array.from(fileInput.files).map(file => file.name).join(', ') : '';
            });

            fileInputContainer.appendChild(fileNameDisplay);
        }

        return fileInputContainer;


    } else {
        // Handle other general components
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

        return input;
    }
}
