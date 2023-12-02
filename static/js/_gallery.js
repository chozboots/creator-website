// js/_gallery.js
export const renderGalleryImages = (uploadedFiles) => {
    console.log(Array.isArray(uploadedFiles), uploadedFiles);
    const gallery = document.getElementById('imageGalleryContainer');
    gallery.innerHTML = '';
    uploadedFiles.forEach(item => {
        const img = new Image();
        // Determine if item is a File object or a URL string
        img.src = (item instanceof File) ? URL.createObjectURL(item) : item;
        img.classList.add('uploaded-image-preview');
        if (item instanceof File) {
            img.onload = () => URL.revokeObjectURL(img.src); // Release object URL for File objects
        }
        gallery.appendChild(img);
    });
    gallery.style.display = uploadedFiles.length > 0 ? 'block' : 'none';
};


export const handleGalleryChange = (event, uploadedFiles, MAX_IMAGES, renderGalleryImages) => {
    // Filter out URLs, keep only File objects
    const existingFiles = uploadedFiles.filter(item => item instanceof File);

    // Add new files to the array
    existingFiles.push(...Array.from(event.target.files));

    // Check for maximum images
    if (existingFiles.length > MAX_IMAGES) {
        alert(`Maximum of ${MAX_IMAGES} images.`);
        event.target.value = "";
        return;
    }

    // Update the array with new files
    uploadedFiles.splice(0, uploadedFiles.length, ...existingFiles);
    renderGalleryImages(uploadedFiles);
};

export const setUpGallery = (input, uploadedFiles, MAX_IMAGES, renderGalleryImagesCallback) => {
    console.log(uploadedFiles)

    input.id = 'characterGallery';
    input.addEventListener('change', (event) => handleGalleryChange(event, uploadedFiles, MAX_IMAGES, renderGalleryImagesCallback));
};
