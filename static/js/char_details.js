document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const editMode = document.getElementById('editMode');
    const characterItems = document.querySelectorAll('.character-item');
    const submenuButtons = document.querySelectorAll('.submenu-button');
    const MAX_IMAGES = 4; // Assuming this is a constant
    const uploadedFiles = []; // Persistent storage for uploaded files

    const elementContainerMap = {
        characterType: 'profileContainer',
        characterHeight: 'profileContainer',
        characterBirthday: 'profileContainer',
        characterImage: 'imageContainer',
        characterGallery: 'imageContainer',
        characterSkills: 'skillsContainer',
        characterDetails: 'detailsContainer',
        characterBio: 'bioContainer',
    };

    // Utility functions
    const fetchAndLoadElements = async () => {
        try {
            const response = await fetch('/dynamic_elements');
            const elements = await response.json();
            elements.forEach(createAndAppendElement);
        } catch (error) {
            console.error('Error fetching elements:', error);
        }
    };

    const createAndAppendElement = element => {
        const containerId = elementContainerMap[element.name] || 'profileContainer';
        const container = document.getElementById(containerId);
        if (!container) return;

        const label = createLabel(element);
        const input = createElementInput(element);
        const group = document.createElement('div');
        group.className = 'form-group';
        group.append(label, input);
        container.appendChild(group);
    };

    const createLabel = element => {
        const label = document.createElement('label');
        label.textContent = element.placeholder;
        label.htmlFor = element.name;
        return label;
    };

const createElementInput = element => {
    // Check if we need to create a textarea for a bio
    if (element.name === 'characterBio') {
        const textarea = document.createElement('textarea');
        Object.assign(textarea, {
            name: element.name,
            placeholder: element.placeholder,
            rows: 10,  // or any other number you deem appropriate
            cols: 50,  // or any other number you deem appropriate
            className: 'bio-textarea'  // class for styling purposes
        });
        return textarea;
    } else {
        // For all other cases, continue with the original logic
        const inputType = element.type === 'dropdown' ? 'select' : 'input';
        const input = document.createElement(inputType);
        Object.assign(input, {
            name: element.name,
            placeholder: element.placeholder,
            multiple: element.multiple || false,
            accept: element.accept || null
        });

        if (element.type !== 'dropdown') input.type = element.type;
        if (element.options) element.options.forEach(option => input.add(new Option(option)));
        if (element.name === 'characterGallery') setUpGallery(input);

        return input;
    }
};

    // Gallery functions
    const setUpGallery = input => {
        input.id = 'characterGallery';
        input.addEventListener('change', handleGalleryChange);
    };

    const handleGalleryChange = event => {
        uploadedFiles.splice(0, uploadedFiles.length, ...event.target.files);
        if (getCurrentImageCount() > MAX_IMAGES) {
            alert(`Maximum of ${MAX_IMAGES} images.`);
            event.target.value = "";
            uploadedFiles.length = 0; // Reset the uploadedFiles array
        }
        renderGalleryImages();
    };

    const renderGalleryImages = () => {
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

    const getCurrentImageCount = () => uploadedFiles.length;

    const hideSubmenus = () => {
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

    const submenuClick = event => {
        hideSubmenus();
        // Hide submenu buttons
        document.querySelector('.submenu-buttons').style.display = 'none';
        
        const menu = event.currentTarget.dataset.menu;
        document.getElementById(`${menu}Container`).style.display = 'block';
        if (menu === 'image') renderGalleryImages(); // Re-render gallery images when opening image submenu
    };    

    const isAnySubmenuOpen = () => [...document.querySelectorAll('.form-submenu')].some(el => el.style.display !== 'none');

    const backClick = () => {
        if (isAnySubmenuOpen()) {
            hideSubmenus();
            // Show submenu buttons when going back
            document.querySelector('.submenu-buttons').style.display = 'flex';
        } else {
            body.classList.remove('edit-active');
            editMode.style.display = 'none';
        }
    };

    const clearGallery = () => {
        const gallery = document.getElementById('imageGalleryContainer');
        gallery.innerHTML = ''; // Clears the gallery
        uploadedFiles.length = 0; // Clears the uploaded files reference
    };

    // Character selection
    const characterClick = async event => {
        clearGallery();
        hideSubmenus();
        const characterId = event.currentTarget.getAttribute('data-character-id');
        const characterData = await fetch(`/character_details/${characterId}`).then(res => res.json());
        document.getElementById('editAvatar').src = characterData.image_url;
        document.getElementById('editGreeting').innerText = `Editing ${characterData.name}`;
        body.classList.add('edit-active');
        editMode.style.display = 'flex';
        // Clear uploaded files if any when switching characters
        uploadedFiles.length = 0;
        renderGalleryImages();
    };

    // Event listeners setup
    characterItems.forEach(item => item.addEventListener('click', characterClick));
    submenuButtons.forEach(btn => btn.addEventListener('click', submenuClick));
    document.getElementById('backBtn').addEventListener('click', backClick);

    hideSubmenus();

    // Initial calls
    fetchAndLoadElements();
});
