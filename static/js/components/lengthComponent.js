// js/lengthComponent.js
export function createLengthComponent(element) {
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
}