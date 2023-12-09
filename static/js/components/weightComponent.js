// js/components/weightComponent.js
import { toggleInputsVisibility } from '../_toggle.js';

export function createWeightComponent(element, isMetric) {
    // Create a wrapper for all weight related elements
    const weightWrapper = document.createElement('div');
    weightWrapper.className = 'length-input-wrapper';
    weightWrapper.setAttribute('data-name', element.name);

    const weightDisplayContainer = document.createElement('div');
    weightDisplayContainer.className = 'length-display-container';

    const weightDisplaySpan = document.createElement('span');
    weightDisplaySpan.className = 'weight-display';
    weightDisplayContainer.appendChild(weightDisplaySpan);

    // Create the dropdown menu for selecting mode
    const modeSelect = document.createElement('select');
    modeSelect.className = 'mode-select'; // Class for styling
    modeSelect.setAttribute('data-name', element.name); // Add this line
    ['Numeric', 'Range', 'Varies', 'None'].forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        modeSelect.appendChild(option);
    });

    // Append the dropdown to the weightWrapper
    weightWrapper.appendChild(modeSelect);
    weightWrapper.appendChild(weightDisplayContainer);


    // minKgInput
    const minKgInput = document.createElement('input');
    Object.assign(minKgInput, {
        type: 'number',
        name: 'min' + element.name + 'Kg',  // Changed name
        placeholder: 'Min Kilograms',     // Changed placeholder
        className: 'range-input-metric',
        min: 0
    });
    weightWrapper.appendChild(minKgInput);

    // minLbInput
    const minLbInput = document.createElement('input');
    Object.assign(minLbInput, {
        type: 'number',
        name: 'min' + element.name + 'Lb', // Changed name
        placeholder: 'Min Pounds',           // Changed placeholder
        className: 'range-input-imperial',
        min: 0
    });
    weightWrapper.appendChild(minLbInput);



    // kgInput
    const kgInput = document.createElement('input');
    Object.assign(kgInput, {
        type: 'number',
        name: element.name + 'Kg',
        placeholder: 'Kilograms',
        className: 'length-input-metric',
        min: 0
    });
    weightWrapper.appendChild(kgInput);

    // lbInput
    const lbInput = document.createElement('input');
    Object.assign(lbInput, {
        type: 'number',
        name: element.name + 'Lb',
        placeholder: 'Pounds',
        className: 'length-input-imperial',
        min: 0
    });
    weightWrapper.appendChild(lbInput);


    // restKgInput
    const restKgInput = document.createElement('input');
    Object.assign(restKgInput, {
        type: 'number',
        name: 'rest' + element.name + 'Kg',
        placeholder: 'Max Kilograms',
        className: 'range-input-metric',
        min: 0
    });
    weightWrapper.appendChild(restKgInput);

    // restLbInput
    const restLbInput = document.createElement('input');
    Object.assign(restLbInput, {
        type: 'number',
        name: 'rest' + element.name + 'Lb',
        placeholder: 'Max Pounds',
        className: 'range-input-imperial',
        min: 0
    });
    weightWrapper.appendChild(restLbInput);



    const logCurrentValues = () => {
        console.log('Current Values:');
        console.log('Mode:', modeSelect.value);
        console.log('Kilograms:', kgInput.value);
        console.log('Pounds:', lbInput.value);
        console.log('Min Kilograms:', minKgInput.value);
        console.log('Min Pounds:', minLbInput.value);
        console.log('Max Kilograms:', restKgInput.value);
        console.log('Max Pounds:', restLbInput.value);
    };    

    const validateRange = () => {
        const minKg = parseFloat(minKgInput.value) || 0.0;
        const maxKg = parseFloat(restKgInput.value) || 0.0;
        const restKg = parseFloat(kgInput.value) || 0.0;
    
        // Adjust the min value if it is greater than the resting value
        if (minKg > restKg) {
            minKgInput.value = restKg;
            minLbInput.value = kgToLb(restKg).toFixed(1);
        }
    
        // Adjust the max value if it is less than the resting value
        if (maxKg < restKg) {
            restKgInput.value = restKg;
            restLbInput.value = kgToLb(restKg).toFixed(1);
        }
    };
         
    const updateWeightDisplay = () => {
        const restKg = parseFloat(kgInput.value) || 0;
        const restLb = kgToLb(restKg);
        const minKg = parseFloat(minKgInput.value) || 0;
        const minLb = kgToLb(minKg);
        const maxKg = parseFloat(restKgInput.value) || 0;
        const maxLb = kgToLb(maxKg);
    
        if (modeSelect.value === 'Numeric') {
            weightDisplaySpan.textContent = `${restLb.toFixed(1)} lb (${restKg.toFixed(1)} kg)`;
        } else if (modeSelect.value === 'Range') {
            weightDisplaySpan.innerHTML = `- Minimum: ${minLb.toFixed(0)} lb (${minKg.toFixed(1)} kg)<br><br>- Resting: ${restLb.toFixed(0)} lb (${restKg.toFixed(1)} kg)<br><br>- Maximum: ${maxLb.toFixed(0)} lb (${maxKg.toFixed(1)} kg)`;
        }
    };
    
    weightWrapper.updateWeightDisplay = updateWeightDisplay;

    // Event listener for the kg input
    kgInput.addEventListener('input', () => {
        const kg = parseFloat(kgInput.value) || 0.0;
        lbInput.value = kgToLb(kg).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
        }
        updateWeightDisplay();
    });

    // Event listener for the lb input
    lbInput.addEventListener('input', () => {
        const lbs = parseFloat(lbInput.value) || 0.0;
        kgInput.value = lbToKg(lbs).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
        }
        updateWeightDisplay();
    });

    // Event listener for the minKg input
    minKgInput.addEventListener('input', () => {
        const minKg = parseFloat(minKgInput.value) || 0.0;
        minLbInput.value = kgToLb(minKg).toFixed(1);
        validateRange();
        updateWeightDisplay();
    });

    // Event listener for the minLb input
    minLbInput.addEventListener('input', () => {
        const minLb = parseFloat(minLbInput.value) || 0.0;
        minKgInput.value = lbToKg(minLb).toFixed(1);
        validateRange();
        updateWeightDisplay();
    });

    // Event listener for the dropdown menu to change mode
    modeSelect.addEventListener('change', () => {
        const isMetric = document.querySelector('input[name="unit-toggle"]:checked').value === 'metric';
        toggleInputsVisibility(weightWrapper, modeSelect.value, isMetric);
        updateWeightDisplay(); // Update display whenever the mode changes
    });

    const kgToLb = (kg) => {
        const lb = kg * 2.20462;
        return lb;
    };
    
    const lbToKg = (lb) => {
        const kg = lb / 2.20462;
        return kg;
    };
    
    const updateMinFields = () => {
        const minKg = parseFloat(minKgInput.value) || 0.0;
        minLbInput.value = kgToLb(minKg).toFixed(1);
        const minLb = parseFloat(minLbInput.value) || 0.0;
        minKgInput.value = lbToKg(minLb).toFixed(1);
    };
    
    // Event listener for the kg input
    kgInput.addEventListener('input', () => {
        const kg = parseFloat(kgInput.value);
        lbInput.value = kgToLb(kg).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
            updateMinFields();
        }
        updateWeightDisplay();
    });
    
    // Event listener for the lb input
    lbInput.addEventListener('input', () => {
        const lb = parseFloat(lbInput.value);
        kgInput.value = lbToKg(lb).toFixed(1);
        if (modeSelect.value === 'Range') {
            validateRange();
            updateMinFields();
        }
        updateWeightDisplay();
    });
    
    // Event listener for the minKg input
    minKgInput.addEventListener('input', () => {
        const minKg = parseFloat(minKgInput.value) || 0.0;
        const maxKg = parseFloat(kgInput.value) || 0.0;
        
        if (minKg > maxKg) {
            minKgInput.value = maxKg.toFixed(1); // Set minKgInput to maxKg if it exceeds
        } else {
            minLbInput.value = kgToLb(minKg).toFixed(1); // Otherwise, update minLbInput normally
        }
        
        validateRange();
        updateWeightDisplay();
    });

    // Event listener for the minLb input
    minLbInput.addEventListener('input', () => {
        const minLb = parseFloat(minLbInput.value) || 0.0;
        const maxLb = parseFloat(lbInput.value) || 0.0;
        
        if (minLb > maxLb) {
            minLbInput.value = maxLb.toFixed(1); // Set minLbInput to maxLb if it exceeds
        } else {
            minKgInput.value = lbToKg(minLb).toFixed(1); // Otherwise, update minKgInput normally
        }
        
        validateRange();
        updateWeightDisplay();
    });

    // Add event listeners for the resting weight inputs
    restKgInput.addEventListener('input', () => {
        const restKg = parseFloat(restKgInput.value) || 0.0;
        restLbInput.value = kgToLb(restKg).toFixed(1);
        validateRange();
        updateWeightDisplay();
    });

    restLbInput.addEventListener('input', () => {
        const restLb = parseFloat(restLbInput.value) || 0.0;
        restKgInput.value = lbToKg(restLb).toFixed(1);
        validateRange();
        updateWeightDisplay();
    });

    // // Initialize resting weight fields with default values
    // const defaultRestKgValue = 0;
    // restKgInput.value = defaultRestKgValue;
    // const defaultRestLbValue = kgToLb(defaultRestKgValue);
    // restLbInput.value = defaultRestLbValue;
    
    // Create a save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-button'; // Class for styling

    // Event listener for the save button
    saveButton.addEventListener('click', logCurrentValues);

    // Append the save button to the weightWrapper
    weightWrapper.appendChild(saveButton);

    // Initialize with the default mode and unit state
    const isMetricInitial = document.querySelector('input[name="unit-toggle"]:checked').value === 'metric';
    toggleInputsVisibility(weightWrapper, modeSelect.value, isMetricInitial);

    return weightWrapper;
}