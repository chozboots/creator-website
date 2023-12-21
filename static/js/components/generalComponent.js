// js/components/generalComponent.js
import { setUpGallery, renderGalleryImages, sendFilesToServer } from '../_gallery.js';

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
        uploadButton.textContent = 'Upload'; // Customize this text
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
            fileNameDisplay.id = 'fileNameDisplay';
            fileInput.addEventListener('change', () => {
                fileNameDisplay.textContent = fileInput.files.length > 0 ?
                    Array.from(fileInput.files).map(file => file.name).join(', ') : '';
                if (document.getElementById('editAvatar') !== null) {
                    document.getElementById('editAvatar').src = URL.createObjectURL(fileInput.files[0]);
                }
            });
    
            fileInputContainer.appendChild(fileNameDisplay);
        }
    
        // Test submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Image';
        submitButton.className = 'custom-file-submit';

        // Submit button logic
        submitButton.addEventListener('click', () => {
            // For the gallery, send all uploadedFiles
            if (element.name === 'characterGallery') {
                sendFilesToServer(uploadedFiles);
            } else {
                // For other file inputs, send only selected files
                const selectedFiles = Array.from(fileInput.files);
                sendFilesToServer(selectedFiles);
            }
        });

        fileInputContainer.appendChild(submitButton);
        
        if (element.name === 'characterGallery') {
            // Create Drag & Drop Overlay
            const dragDropOverlay = document.createElement('div');
            dragDropOverlay.classList.add('drag-drop-overlay', 'hidden');
            dragDropOverlay.textContent = 'Drop files here or click window to return.';
            dragDropOverlay.addEventListener('dragover', (e) => {
                e.preventDefault();
                dragDropOverlay.classList.add('drag-over');
            });
            dragDropOverlay.addEventListener('dragleave', () => {
                dragDropOverlay.classList.remove('drag-over');
            });
            dragDropOverlay.addEventListener('drop', (e) => {
                e.preventDefault();
                dragDropOverlay.classList.remove('drag-over');
                const newFiles = Array.from(e.dataTransfer.files); // Convert FileList to Array
                // Assuming you have access to uploadedFiles and MAX_IMAGES here
                if (uploadedFiles.length + newFiles.length > MAX_IMAGES) {
                    alert(`You can upload a maximum of ${MAX_IMAGES} images. Please select fewer files.`);
                    return; // Exit the function without changing anything
                }
                const updatedFiles = [...uploadedFiles, ...newFiles].filter(item => item instanceof File || typeof item === 'string');
                // Update the array with new files and existing URLs
                uploadedFiles.splice(0, uploadedFiles.length, ...updatedFiles);
                renderGalleryImages(uploadedFiles);
                dragDropOverlay.classList.add('hidden');
            });
        
            // Function to show the drag & drop overlay
            const showDragDropOverlay = () => {
                dragDropOverlay.classList.remove('hidden');
            };
        
            // Function to hide the drag & drop overlay
            const hideDragDropOverlay = () => {
                dragDropOverlay.classList.add('hidden');
            };
        
            // Add click event to hide overlay when clicked outside the drop area
            dragDropOverlay.addEventListener('click', (e) => {
                if (e.target === dragDropOverlay) {
                    hideDragDropOverlay();
                }
            });
        
            // Create a button to trigger the drag & drop overlay
            const dragDropButton = document.createElement('button');
            dragDropButton.textContent = 'Drag & Drop Files';
            dragDropButton.className = 'custom-drag-drop';
            dragDropButton.addEventListener('click', showDragDropOverlay);
        
            fileInputContainer.appendChild(dragDropButton);
            fileInputContainer.appendChild(dragDropOverlay);
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
