// js/_gallery.js
export const renderGalleryImages = (uploadedFiles) => {
    console.log(Array.isArray(uploadedFiles), uploadedFiles);
    const gallery = document.getElementById('imageGalleryContainer');
    gallery.innerHTML = '';

    uploadedFiles.forEach((item, index) => {
        const container = document.createElement('div');
        container.classList.add('image-container');

        const img = new Image();
        img.src = (item instanceof File) ? URL.createObjectURL(item) : item;
        img.classList.add('uploaded-image-preview');
        if (item instanceof File) {
            img.onload = () => URL.revokeObjectURL(img.src);
        }

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = () => deleteImage(index, uploadedFiles, renderGalleryImages);

        container.appendChild(img);
        container.appendChild(deleteButton);
        gallery.appendChild(container);
    });

    gallery.style.display = uploadedFiles.length > 0 ? 'block' : 'none';
};


const deleteImage = (index, uploadedFiles, renderGalleryImages) => {
    const confirmDeletion = confirm('Are you sure you want to delete this image?');
    if (confirmDeletion) {
        uploadedFiles.splice(index, 1); // Remove the image from the array
        renderGalleryImages(uploadedFiles); // Re-render the gallery
    }
};


export const handleGalleryChange = (event, uploadedFiles, MAX_IMAGES, renderGalleryImages) => {
    console.log('handleGalleryChange called');
    const newFiles = Array.from(event.target.files); // Convert FileList to Array

    // Check if adding new files would exceed the maximum limit
    if (uploadedFiles.length + newFiles.length > MAX_IMAGES) {
        alert(`You can upload a maximum of ${MAX_IMAGES} images. Please select fewer files.`);
        return; // Exit the function without changing anything
    }

    // Combine new and existing files
    const updatedFiles = [...uploadedFiles, ...newFiles].filter(item => item instanceof File || typeof item === 'string');

    // Update the array with new files and existing URLs
    uploadedFiles.splice(0, uploadedFiles.length, ...updatedFiles);
    renderGalleryImages(uploadedFiles);

    const fileInput = document.getElementById('characterGallery');
    if (fileInput) {
        fileInput.value = ''; // Clear the file input
    }
};


export const setUpGallery = (input, uploadedFiles, MAX_IMAGES, renderGalleryImagesCallback) => {
    console.log(uploadedFiles)

    input.id = 'characterGallery';
    input.addEventListener('change', (event) => handleGalleryChange(event, uploadedFiles, MAX_IMAGES, renderGalleryImagesCallback));
};


export const sendFilesToServer = async (files) => {
    const formData = new FormData();

    // Handle both File objects and string URLs
    files.forEach((file, index) => {
        if (file instanceof File) {
            formData.append(`file_${index}`, file); // Unique key for each file
        } else if (typeof file === 'string') {
            formData.append('link', file); // Append string URLs as 'link'
        }
    });
    
    console.log('Sending form data:', formData);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        // Handle a successful response from the server
        console.log('Files and links uploaded successfully');
        const responseJson = await response.json();
        const links = responseJson.links;
        console.log('Links:', links);
        if (links) {
            return links;
        }
        else {
            console.log('No links received')
            return [];
        }
      } else {
        // Handle an error response from the server
        console.error('Error uploading files and links');
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error:', error);
    }
  };
  
