// js/components/generalComponent.js
import { setUpGallery, renderGalleryImages } from '../_gallery.js';

export function createGeneralComponent(element, uploadedFiles) {
    console.log("Creating component for:", element.name); // Add this line for debugging
    console.log(uploadedFiles)
    const MAX_IMAGES = 4; // Assuming this is a constant

    // Check if the element is the characterGallery
    if (element.name === 'characterGallery') {
        // Create a file input specifically for characterGallery
        const fileInput = document.createElement('input');
        Object.assign(fileInput, {
            type: 'file',
            name: element.name,
            accept: 'image/*', // Accept only images
            multiple: true, // Allow multiple files
            className: 'file'
        });

        console.log(`${fileInput}`)

        // Set up the gallery with this file input
        setUpGallery(fileInput, uploadedFiles, MAX_IMAGES, renderGalleryImages);

        return fileInput;

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
