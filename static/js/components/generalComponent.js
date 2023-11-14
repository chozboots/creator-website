// js/components/generalComponent.js
import { setUpGallery, renderGalleryImages } from '../_gallery.js';



export function createGeneralComponent(element, uploadedFiles) {
    console.log(uploadedFiles)
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
        // Assuming `element.options` is an array of strings like ["None", "Small", "Medium", ...]
        element.options.forEach((optionText) => {
            const optionElement = new Option(optionText, optionText);
            input.add(optionElement);
        });
    }

    if (element.name === 'characterGallery') {
        setUpGallery(input, uploadedFiles, MAX_IMAGES, renderGalleryImages);
    }

    return input;
}
