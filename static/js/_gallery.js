// js/_gallery.js
export const renderGalleryImages = (uploadedFiles) => {
    console.log(Array.isArray(uploadedFiles), uploadedFiles);
    const gallery = document.getElementById('imageGalleryContainer');
    gallery.innerHTML = '';
    uploadedFiles.forEach(file => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.classList.add('uploaded-image-preview');
        img.onload = () => URL.revokeObjectURL(img.src);
        gallery.appendChild(img);
    });
    gallery.style.display = uploadedFiles.length > 0 ? 'block' : 'none';
};

export const handleGalleryChange = (event, uploadedFiles, MAX_IMAGES, renderGalleryImages) => {
    console.log(Array.isArray(uploadedFiles), uploadedFiles);
    const getCurrentImageCount = () => uploadedFiles.length;
    uploadedFiles.splice(0, uploadedFiles.length, ...event.target.files);
    if (getCurrentImageCount() > MAX_IMAGES) {
        alert(`Maximum of ${MAX_IMAGES} images.`);
        event.target.value = "";
        uploadedFiles.length = 0;
    }
    renderGalleryImages(uploadedFiles);
};

export const setUpGallery = (input, uploadedFiles, MAX_IMAGES, renderGalleryImagesCallback) => {
    console.log(uploadedFiles)

    input.id = 'characterGallery';
    input.addEventListener('change', (event) => handleGalleryChange(event, uploadedFiles, MAX_IMAGES, renderGalleryImagesCallback));
};