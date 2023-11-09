document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const editMode = document.getElementById('editMode');
    const characterItems = document.querySelectorAll('.character-item');
    const submenuButtons = document.querySelectorAll('.submenu-button');
    const MAX_IMAGES = 4; // Assuming this is a constant
    const uploadedFiles = []; // Persistent storage for uploaded files

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

    const createLabel = element => {
        const label = document.createElement('label');
        label.textContent = element.placeholder;
        label.htmlFor = element.name;
        return label;
    };

    const calculateAge = birthday => {
        const ageDifMs = Date.now() - new Date(birthday).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const createAgeDisplay = () => {
        const ageDisplay = document.createElement('span');
        ageDisplay.className = 'age-display'; // Class for styling
        ageDisplay.textContent = 'Age: '; // Initial text
        return ageDisplay;
    };

    const createElementInput = (element, containerId) => {
        if (element.type === 'date') {
            const dateInput = document.createElement('input');
            const ageDisplay = createAgeDisplay();

            Object.assign(dateInput, {
                type: 'date',
                name: element.name,
                placeholder: element.placeholder,
                className: 'date-input' // Class for styling
            });

            // Add event listener for date input to update the age display
            dateInput.addEventListener('change', () => {
                const age = calculateAge(dateInput.value);
                ageDisplay.textContent = `Age: ${age} years`;
            });

            const wrapper = document.createElement('div');
            wrapper.className = 'date-input-wrapper';
            wrapper.appendChild(dateInput);
            wrapper.appendChild(ageDisplay);

            return wrapper;
            
        // Check if the element is a textarea based on element.name or any other appropriate property
        } else if (element.type === 'textarea') {
            const textarea = document.createElement('textarea');
            const counter = document.createElement('span');

            counter.className = 'char-counter';
            counter.textContent = `0 / ${element.maxlength}`;

            Object.assign(textarea, {
                name: element.name,
                placeholder: element.placeholder,
                rows: 10, // or any other number you deem appropriate
                cols: 50, // or any other number you deem appropriate
                maxLength: element.maxlength,
                className: 'textarea' // or any other class for styling
            });

            // Event listener for the textarea to update the counter
            textarea.addEventListener('input', () => {
                counter.textContent = `${textarea.value.length} / ${element.maxlength}`;
            });

            // Create a wrapper for the textarea and the counter
            const wrapper = document.createElement('div');
            wrapper.className = 'textarea-wrapper';
            wrapper.appendChild(textarea);
            wrapper.appendChild(counter);

            return wrapper;

        // Special handling for character height with measurement type 'length'
        } else if (element.measurement === 'length') {
            // Create a wrapper for all height related elements
            const heightWrapper = document.createElement('div');
            heightWrapper.className = 'height-input-wrapper';

            const heightDisplayContainer = document.createElement('div');
            heightDisplayContainer.className = 'height-display-container';

            const feetInchesContainer = document.createElement('div');
            feetInchesContainer.className = 'feet-inches-input-container';

            const heightDisplaySpan = document.createElement('span');
            heightDisplaySpan.className = 'height-display'
            heightDisplayContainer.appendChild(heightDisplaySpan);
            heightWrapper.appendChild(heightDisplayContainer);

            // Create the number input for cm
            const numberInput = document.createElement('input');
            Object.assign(numberInput, {
                type: 'number',
                name: element.name,
                placeholder: element.placeholder,
                className: 'height-input', // Class for styling
                min: 0
            });

            heightWrapper.appendChild(numberInput);

            const unitSelectorContainer = document.createElement('div');
            unitSelectorContainer.className = 'height-unit-selector';

            // Create radio buttons for unit selection
            const cmRadio = document.createElement('input');
            Object.assign(cmRadio, { type: 'radio', name: 'heightUnit', value: 'cm', checked: true });
            const ftInRadio = document.createElement('input');
            Object.assign(ftInRadio, { type: 'radio', name: 'heightUnit', value: 'ftIn' });

            // Create labels for the radio buttons
            const cmLabel = document.createElement('label');
            cmLabel.textContent = 'cm';
            const ftInLabel = document.createElement('label');
            ftInLabel.textContent = 'ft/in';

            // Append radio buttons and labels to the unit selector container
            unitSelectorContainer.appendChild(cmRadio);
            unitSelectorContainer.appendChild(cmLabel);
            unitSelectorContainer.appendChild(ftInRadio);
            unitSelectorContainer.appendChild(ftInLabel);

            // Create feet and inches input fields and add them to feetInchesContainer
            const feetInput = document.createElement('input');
            Object.assign(feetInput, {
                type: 'number',
                name: 'feet',
                placeholder: 'Feet',
                style: 'display: none;', // Initially hidden
                className: 'height-input-feet',
                min: 0
            });

            const inchesInput = document.createElement('input');
            Object.assign(inchesInput, {
                type: 'number',
                name: 'inches',
                placeholder: 'Inches',
                style: 'display: none;', // Initially hidden
                className: 'height-input-inches',
                min: 0
            });

            // Append feet and inches inputs to the feetInchesContainer
            feetInchesContainer.appendChild(feetInput);
            feetInchesContainer.appendChild(inchesInput);

            // Append feetInchesContainer to the wrapper
            heightWrapper.appendChild(feetInchesContainer);
            
            // Now, append the unitSelectorContainer
            heightWrapper.appendChild(unitSelectorContainer);

            const cmToFeet = (cm) => {
                const totalInches = cm / 2.54;
                let feet = Math.floor(totalInches / 12);
                let inches = Math.round(totalInches % 12);
            
                // If rounding gives us 12 inches, we should add to feet and set inches to 0
                if (inches === 12) {
                    feet += 1;
                    inches = 0;
                }
            
                return { feet, inches };
            };
        
            const feetToCm = (feet, inches) => {
                return Math.round((feet * 12 + inches) * 2.54);
            };

            const updateHeightDisplay = (cm) => {
                const { feet, inches } = cmToFeet(cm);
                heightDisplaySpan.textContent = `${feet}'${inches}" (${Math.round(cm)} cm)`;
            };

            const adjustFeetAndInches = () => {
                let feet = parseInt(feetInput.value, 10) || 0;
                let inches = parseInt(inchesInput.value, 10) || 0;
            
                if (inches >= 12) {
                    feet += Math.floor(inches / 12);
                    inches %= 12;
                }
            
                feetInput.value = feet;
                inchesInput.value = inches;
            
                return { feet, inches };
            };

            heightWrapper.addEventListener('change', (event) => {
                if (event.target.name === 'heightUnit') {
                    if (event.target.value === 'cm') {
                        // Hide feet and inches input
                        feetInput.style.display = 'none';
                        inchesInput.style.display = 'none';
                        // Show cm input
                        numberInput.style.display = 'block';
                        // Update the display to cm
                        updateHeightDisplay(parseFloat(numberInput.value));
                    } else {
                        // Show feet and inches input
                        feetInput.style.display = 'block';
                        inchesInput.style.display = 'block';
                        // Hide cm input
                        numberInput.style.display = 'none';
                        // Calculate feet and inches from cm and update their values
                        const { feet, inches } = cmToFeet(parseFloat(numberInput.value));
                        feetInput.value = feet;
                        inchesInput.value = inches;
                        // Update the display to feet and inches
                        updateHeightDisplay(parseFloat(numberInput.value));
                    }
                }
            });

            // Event listener for the number input to handle the height value in cm
            numberInput.addEventListener('input', () => {
                if (cmRadio.checked) {
                    // Update display when cm value changes
                    updateHeightDisplay(parseFloat(numberInput.value)); 
                } else {
                    // Convert the ft/in to cm and update the number input
                    const cm = feetToCm(parseInt(feetInput.value, 10) || 0, parseInt(inchesInput.value, 10) || 0);
                    numberInput.value = cm;
                    updateHeightDisplay(cm); 
                }
            });

            // Event listener for inches input
            inchesInput.addEventListener('input', () => {
                const { feet, inches } = adjustFeetAndInches();

                // Update cm and display
                const cm = feetToCm(feet, inches);
                numberInput.value = cm;
                updateHeightDisplay(cm);
            });

            // Event listener for feet input
            feetInput.addEventListener('input', () => {
                const { feet, inches } = adjustFeetAndInches();

                // Update cm and display
                const cm = feetToCm(feet, inches);
                numberInput.value = cm;
                updateHeightDisplay(cm);
            });

            // Add max attribute for the inches input for HTML5 validation as an extra layer of enforcement
            inchesInput.setAttribute('max', '11');
            inchesInput.setAttribute('min', '0');

            // Set the default value for the number input and update the display
            const defaultCmValue = 0;
            numberInput.value = defaultCmValue;
            updateHeightDisplay(defaultCmValue);

            return heightWrapper;

        } else if (element.measurement === 'size') {
            // Create a wrapper for all length related elements
            const lengthWrapper = document.createElement('div');
            lengthWrapper.className = 'length-input-wrapper';
        
            const lengthDisplayContainer = document.createElement('div');
            lengthDisplayContainer.className = 'length-display-container';
        
            const lengthDisplaySpan = document.createElement('span');
            lengthDisplaySpan.className = 'length-display';
            lengthDisplayContainer.appendChild(lengthDisplaySpan);
            lengthWrapper.appendChild(lengthDisplayContainer);
        
            // Create the dropdown menu for selecting mode
            const modeSelect = document.createElement('select');
            modeSelect.className = 'mode-select'; // Class for styling
            ['Numeric', 'Varies', 'None'].forEach(mode => {
                const option = document.createElement('option');
                option.value = mode;
                option.textContent = mode;
                modeSelect.appendChild(option);
            });
        
            // Append the dropdown to the lengthWrapper
            lengthWrapper.appendChild(modeSelect);
        
            // Create the number input for cm
            const cmInput = document.createElement('input');
            Object.assign(cmInput, {
                type: 'number',
                name: element.name + 'Cm',
                placeholder: 'Centimeters',
                className: 'length-input-cm', // Class for styling
                min: 0
            });
            lengthWrapper.appendChild(cmInput);
        
            // Create the number input for inches
            const inchInput = document.createElement('input');
            Object.assign(inchInput, {
                type: 'number',
                name: element.name + 'Inch',
                placeholder: 'Inches',
                className: 'length-input-inch', // Class for styling
                min: 0
            });
            lengthWrapper.appendChild(inchInput);
        
            // Function to toggle visibility of inputs and display based on mode
            const toggleInputsVisibility = (mode) => {
                const isNumericMode = mode === 'Numeric';
                // Show inputs only in Numeric mode
                cmInput.style.display = isNumericMode ? '' : 'none';
                inchInput.style.display = isNumericMode ? '' : 'none';
                // Hide display for Varies and None mode
                lengthDisplayContainer.style.display = isNumericMode ? '' : 'none';
            };
        
            // Event listener for the dropdown menu to change mode
            modeSelect.addEventListener('change', () => {
                const selectedMode = modeSelect.value;
                toggleInputsVisibility(selectedMode);
            });
        
            // Initialize with the default mode
            toggleInputsVisibility(modeSelect.value);
        
            const cmToInch = (cm) => {
                const inches = cm / 2.54;
                return inches;
            };
        
            const inchToCm = (inches) => {
                const cm = inches * 2.54;
                return cm;
            };
        
            const updateLengthDisplay = (cm, inches) => {
                // Only update the display in Numeric mode
                if (modeSelect.value === 'Numeric') {
                    lengthDisplaySpan.textContent = `${inches.toFixed(1)}" (${cm.toFixed(1)} cm)`;
                }
            };
        
            // Event listener for the cm input
            cmInput.addEventListener('input', () => {
                const cm = parseFloat(cmInput.value);
                const inches = cmToInch(cm);
                inchInput.value = inches.toFixed(1);
                updateLengthDisplay(cm, inches);
            });
        
            // Event listener for the inches input
            inchInput.addEventListener('input', () => {
                const inches = parseFloat(inchInput.value);
                const cm = inchToCm(inches);
                cmInput.value = cm.toFixed(1);
                updateLengthDisplay(cm, inches);
            });
        
            // Set the default value for cm and inches input and update the display
            const defaultCmValue = 0;
            cmInput.value = defaultCmValue;
            const defaultInchesValue = cmToInch(defaultCmValue);
            inchInput.value = defaultInchesValue.toFixed(1);
            updateLengthDisplay(defaultCmValue, defaultInchesValue);
        
            // Return the lengthWrapper containing all elements
            return lengthWrapper;
        
        } else if (element.list_type === 'dynamic_list') {
            const listWrapper = document.createElement('div');
            listWrapper.className = 'dynamic-list-wrapper';
    
            const list = document.createElement('ul');
            list.className = 'dynamic-list';
    
            const addButton = document.createElement('button');
            addButton.textContent = 'Add';
            addButton.type = 'button';
            addButton.className = 'add-button';
            addButton.onclick = () => addListItem(list, element.item_name);
    
            // Function to add list item
            function addListItem(list, itemName) {
                const listItem = document.createElement('li');
                const input = document.createElement('input');
                input.type = 'text';
                input.name = itemName;
    
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.type = 'button';
                removeButton.className = 'remove-button';
                removeButton.onclick = () => list.removeChild(listItem);
    
                listItem.appendChild(input);
                listItem.appendChild(removeButton);
                list.appendChild(listItem);
            }
    
            // Initial item
            addListItem(list, element.item_name);
    
            listWrapper.appendChild(list);
            listWrapper.appendChild(addButton);
    
            return listWrapper;
        } else if (element.list_type === 'dynamic_list_with_titles') {
            const listWrapperWithTitles = document.createElement('div');
            listWrapperWithTitles.className = 'dynamic-list-wrapper';
        
            const listWithTitles = document.createElement('ul'); // Changed variable name here
            listWithTitles.className = 'dynamic-list-with-titles'; // Assign the class to the list
        
            const addButton = document.createElement('button');
            addButton.textContent = 'Add';
            addButton.type = 'button';
            addButton.className = 'add-button';
            addButton.onclick = () => addListItem(listWithTitles, element.item_name, element.default_title, element.default_description);
        
            function addListItem(list, itemName, defaultTitle = '', defaultDescription = '', maxlengthTitle = 255, maxlengthDesc = 1000) {
                const listItem = document.createElement('li');
                listItem.className = 'dynamic-list-with-titles-item';
            
                // Title input
                const title = document.createElement('input');
                const titleCounter = document.createElement('span');
                title.type = 'text';
                title.value = defaultTitle;
                title.name = `${itemName}-title`;
                title.className = 'title-input';
                title.maxLength = maxlengthTitle;
                titleCounter.className = 'char-counter';
                titleCounter.textContent = `0 / ${maxlengthTitle}`;
            
                // Update counter for the title input
                title.addEventListener('input', () => {
                    titleCounter.textContent = `${title.value.length} / ${maxlengthTitle}`;
                });
            
                // Description textarea
                const description = document.createElement('textarea');
                const descCounter = document.createElement('span');
                description.value = defaultDescription;
                description.name = `${itemName}-description`;
                description.className = 'description-textarea';
                description.rows = 4;
                description.maxLength = maxlengthDesc;
                descCounter.className = 'char-counter';
                descCounter.textContent = `0 / ${maxlengthDesc}`;
            
                // Update counter for the description textarea
                description.addEventListener('input', () => {
                    descCounter.textContent = `${description.value.length} / ${maxlengthDesc}`;
                });
            
                // Remove button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.type = 'button';
                removeButton.className = 'remove-button';
                removeButton.onclick = () => list.removeChild(listItem);
            
                // Append elements to the listItem
                listItem.appendChild(title);
                listItem.appendChild(titleCounter);
                listItem.appendChild(description);
                listItem.appendChild(descCounter);
                listItem.appendChild(removeButton);
            
                list.appendChild(listItem);
            }            
            
            if (element.default_title || element.default_description) {
                addListItem(listWithTitles, element.item_name, element.default_title, element.default_description);
            }
        
            listWrapperWithTitles.appendChild(listWithTitles);
            listWrapperWithTitles.appendChild(addButton);
        
            return listWrapperWithTitles;
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

    const createAndAppendElement = element => {
        const containerId = element.container || 'defaultContainerId'; // Fallback to a default container if none is specified
        const container = document.getElementById(containerId);
        if (!container) return;
    
        const label = createLabel(element);
        const input = createElementInput(element, containerId); // Pass containerId as an argument
        const group = document.createElement('div');
        group.className = 'form-group';
        group.append(label, input);
        container.appendChild(group);
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
