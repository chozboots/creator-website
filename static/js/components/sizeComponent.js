// js/components/sizeComponent.js
export function createSizeComponent(element) {
    // Create a wrapper for all length related elements
    const lengthWrapper = document.createElement('div');
    lengthWrapper.className = 'length-input-wrapper';

    const lengthDisplayContainer = document.createElement('div');
    lengthDisplayContainer.className = 'length-display-container';

    const lengthDisplaySpan = document.createElement('span');
    lengthDisplaySpan.className = 'length-display';
    lengthDisplayContainer.appendChild(lengthDisplaySpan);

    // Create the dropdown menu for selecting mode
    const modeSelect = document.createElement('select');
    modeSelect.className = 'mode-select'; // Class for styling
    ['Numeric', 'Range', 'Varies', 'None'].forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        modeSelect.appendChild(option);
    });

    // Append the dropdown to the lengthWrapper
    lengthWrapper.appendChild(modeSelect);
    lengthWrapper.appendChild(lengthDisplayContainer);

    // Function to create a label
    function createLabel(text, htmlFor) {
        const label = document.createElement('label');
        label.textContent = text;
        label.htmlFor = htmlFor;
        label.className = 'input-label'; // Add a class for potential styling
        return label;
    }

    // cmInput
    const cmInput = document.createElement('input');
    Object.assign(cmInput, {
        type: 'number',
        name: element.name + 'Cm',
        placeholder: 'Centimeters',
        className: 'length-input-cm',
        min: 0
    });
    lengthWrapper.appendChild(cmInput);

    // inchInput
    const inchInput = document.createElement('input');
    Object.assign(inchInput, {
        type: 'number',
        name: element.name + 'Inch',
        placeholder: 'Inches',
        className: 'length-input-inch',
        min: 0
    });
    lengthWrapper.appendChild(inchInput);

    const minCmInput = document.createElement('input');
    Object.assign(minCmInput, {
        type: 'number',
        name: 'min' + element.name + 'Cm',  // Changed name
        placeholder: 'Min Centimeters',     // Changed placeholder
        className: 'length-input-cm',
        min: 0
    });
    lengthWrapper.appendChild(minCmInput);

    const minInchInput = document.createElement('input');
    Object.assign(minInchInput, {
        type: 'number',
        name: 'min' + element.name + 'Inch', // Changed name
        placeholder: 'Min Inches',           // Changed placeholder
        className: 'length-input-inch',
        min: 0
    });
    lengthWrapper.appendChild(minInchInput);

    const restCmInput = document.createElement('input');
    Object.assign(restCmInput, {
        type: 'number',
        name: 'rest' + element.name + 'Cm',
        placeholder: 'Max Centimeters',
        className: 'length-input-cm',
        min: 0
    });
    lengthWrapper.appendChild(restCmInput);

    const restInchInput = document.createElement('input');
    Object.assign(restInchInput, {
        type: 'number',
        name: 'rest' + element.name + 'Inch',
        placeholder: 'Max Inches',
        className: 'length-input-inch',
        min: 0
    });
    lengthWrapper.appendChild(restInchInput);

    const logCurrentValues = () => {
        console.log('Current Values:');
        console.log('Mode:', modeSelect.value);
        console.log('Centimeters:', cmInput.value);
        console.log('Inches:', inchInput.value);
        console.log('Min Centimeters:', minCmInput.value);
        console.log('Min Inches:', minInchInput.value);
        console.log('Max Centimeters:', restCmInput.value);
        console.log('Max Inches:', restInchInput.value);
    };
    

    // Before each input, create and append a label
    const minCmInputLabel = createLabel('Min Centimeters:', 'min' + element.name + 'Cm');
    lengthWrapper.appendChild(minCmInputLabel);
    lengthWrapper.appendChild(minCmInput);

    const minInchInputLabel = createLabel('Min Inches:', 'min' + element.name + 'Inch');
    lengthWrapper.appendChild(minInchInputLabel);
    lengthWrapper.appendChild(minInchInput);

    const restCmInputLabel = createLabel('Max Centimeters:', 'rest' + element.name + 'Cm');
    lengthWrapper.appendChild(restCmInputLabel);
    lengthWrapper.appendChild(restCmInput);

    const restInchInputLabel = createLabel('Max Inches:', 'rest' + element.name + 'Inch');
    lengthWrapper.appendChild(restInchInputLabel);
    lengthWrapper.appendChild(restInchInput);

    const validateRange = () => {
        const minCm = parseFloat(minCmInput.value) || 0.0;
        const maxCm = parseFloat(restCmInput.value) || 0.0;
        const restCm = parseFloat(cmInput.value) || 0.0;
    
        // Adjust the min value if it is greater than the resting value
        if (minCm > restCm) {
            minCmInput.value = restCm;
            minInchInput.value = cmToInch(restCm).toFixed(1);
        }
    
        // Adjust the max value if it is less than the resting value
        if (maxCm < restCm) {
            restCmInput.value = restCm;
            restInchInput.value = cmToInch(restCm).toFixed(1);
        }
    };
         
    const updateLengthDisplay = () => {
        const restCm = parseFloat(cmInput.value) || 0;
        const restInches = cmToInch(restCm);
        const minCm = parseFloat(minCmInput.value) || 0;
        const minInches = cmToInch(minCm);
        const maxCm = parseFloat(restCmInput.value) || 0;
        const maxInches = cmToInch(maxCm);
    
        if (modeSelect.value === 'Numeric') {
            lengthDisplaySpan.textContent = `${restInches.toFixed(0)}" (${restCm.toFixed(0)} cm)`;
        } else if (modeSelect.value === 'Range') {
            lengthDisplaySpan.textContent = `Min: ${minInches.toFixed(0)}" (${minCm.toFixed(0)} cm) - Rest: ${restInches.toFixed(0)}" (${restCm.toFixed(0)} cm) - Max: ${maxInches.toFixed(0)}" (${maxCm.toFixed(0)} cm)`;
        }
    };    

    // Event listener for the cm input
    cmInput.addEventListener('input', () => {
        const cm = parseFloat(cmInput.value) || 0.0;
        inchInput.value = cmToInch(cm).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
        }
        updateLengthDisplay();
    });

    // Event listener for the inch input
    inchInput.addEventListener('input', () => {
        const inches = parseFloat(inchInput.value) || 0.0;
        cmInput.value = inchToCm(inches).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
        }
        updateLengthDisplay();
    });

    // Event listener for the minCm input
    minCmInput.addEventListener('input', () => {
        const minCm = parseFloat(minCmInput.value) || 0.0;
        minInchInput.value = cmToInch(minCm).toFixed(1);
        validateRange();
        updateLengthDisplay();
    });

    // Event listener for the minInch input
    minInchInput.addEventListener('input', () => {
        const minInches = parseFloat(minInchInput.value) || 0.0;
        minCmInput.value = inchToCm(minInches).toFixed(1);
        validateRange();
        updateLengthDisplay();
    });

    const toggleInputsVisibility = (mode) => {
        const isNumericMode = mode === 'Numeric';
        const isRangeMode = mode === 'Range';
    
        cmInput.style.display = isNumericMode || isRangeMode ? '' : 'none';
        inchInput.style.display = isNumericMode || isRangeMode ? '' : 'none';
    
        // Update visibility for Range mode inputs and their labels
        const rangeElements = [minCmInput, minInchInput, restCmInput, restInchInput, minCmInputLabel, minInchInputLabel, restCmInputLabel, restInchInputLabel];
        rangeElements.forEach(el => el.style.display = isRangeMode ? '' : 'none');
    
        lengthDisplayContainer.style.display = isNumericMode || isRangeMode ? '' : 'none';
    };
    
    // Event listener for the dropdown menu to change mode
    modeSelect.addEventListener('change', () => {
        const selectedMode = modeSelect.value;
        toggleInputsVisibility(selectedMode);
        updateLengthDisplay(); // Update display whenever the mode changes
    });
    
    // Initialize with the default mode
    toggleInputsVisibility(modeSelect.value);
    

    // Event listener for the dropdown menu to change mode
    modeSelect.addEventListener('change', () => {
        const selectedMode = modeSelect.value;
        toggleInputsVisibility(selectedMode);
        updateLengthDisplay(); // Update display whenever the mode changes
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
    
    const updateMinFields = () => {
        const minCm = parseFloat(minCmInput.value) || 0.0;
        minInchInput.value = cmToInch(minCm).toFixed(1);
        const minInches = parseFloat(minInchInput.value) || 0.0;
        minCmInput.value = inchToCm(minInches).toFixed(1);
    };
    
    // Event listener for the cm input
    cmInput.addEventListener('input', () => {
        const cm = parseFloat(cmInput.value);
        inchInput.value = cmToInch(cm).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
            updateMinFields();
        }
        updateLengthDisplay();
    });
    
    // Event listener for the inches input
    inchInput.addEventListener('input', () => {
        const inches = parseFloat(inchInput.value);
        cmInput.value = inchToCm(inches).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
            updateMinFields();
        }
        updateLengthDisplay();
    });
    
    // Event listener for the minCm input
    minCmInput.addEventListener('input', () => {
        const minCm = parseFloat(minCmInput.value) || 0.0;
        const maxCm = parseFloat(cmInput.value) || 0.0;
        
        if (minCm > maxCm) {
            minCmInput.value = maxCm.toFixed(1); // Set minCmInput to maxCm if it exceeds
        } else {
            minInchInput.value = cmToInch(minCm).toFixed(1); // Otherwise, update minInchInput normally
        }
        
        validateRange();
        updateLengthDisplay();
    });

    // Event listener for the minInch input
    minInchInput.addEventListener('input', () => {
        const minInches = parseFloat(minInchInput.value) || 0.0;
        const maxInches = parseFloat(inchInput.value) || 0.0;
        
        if (minInches > maxInches) {
            minInchInput.value = maxInches.toFixed(1); // Set minInchInput to maxInches if it exceeds
        } else {
            minCmInput.value = inchToCm(minInches).toFixed(1); // Otherwise, update minCmInput normally
        }
        
        validateRange();
        updateLengthDisplay();
    });

    // Add event listeners for the resting length inputs
    restCmInput.addEventListener('input', () => {
        const restCm = parseFloat(restCmInput.value) || 0.0;
        restInchInput.value = cmToInch(restCm).toFixed(1);
        validateRange();
        updateLengthDisplay();
    });

    restInchInput.addEventListener('input', () => {
        const restInches = parseFloat(restInchInput.value) || 0.0;
        restCmInput.value = inchToCm(restInches).toFixed(1);
        validateRange();
        updateLengthDisplay();
    });

    // // Initialize resting length fields with default values
    // const defaultRestCmValue = 0;
    // restCmInput.value = defaultRestCmValue;
    // const defaultRestInchesValue = cmToInch(defaultRestCmValue);
    // restInchInput.value = defaultRestInchesValue;
    
    // Create a save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-button'; // Class for styling

    // Event listener for the save button
    saveButton.addEventListener('click', logCurrentValues);

    // Append the save button to the lengthWrapper
    lengthWrapper.appendChild(saveButton);


    return lengthWrapper;
}