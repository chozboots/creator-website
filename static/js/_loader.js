// js/_loader.js
import { renderGalleryImages } from './_gallery.js';
import { hideSubmenus } from './_helpers.js';

async function updateComponentsWithData(characterData, uploadedFiles) {
    console.log(characterData);
    const MAX_IMAGES = 4;
    const response = await fetch('/dynamic_elements');
    const elements = await response.json();

    elements.forEach(element => {

        if (element.name === 'characterGallery') {
            // Clear existing array and add URLs from character data
            uploadedFiles.length = 0;
            uploadedFiles.push(...characterData[element.name] || []);
            const galleryInput = document.getElementById('characterGallery');
            if (galleryInput) {
                renderGalleryImages(uploadedFiles);
            }

        } else if (element.type === 'number') {
            const measurementData = characterData[element.name];
            if (measurementData) {
                const { mode, amount, min_amount, max_amount } = measurementData;
                const unitType = element.measurement
                
                let metricStr;
                let imperialStr;
                if (unitType === 'length' || unitType === 'size') {
                    metricStr = 'Cm'
                    imperialStr = 'Inch'
                } else {
                    metricStr = 'Kg'
                    imperialStr = 'Lb'
                }

                const modeSelect = document.querySelector(`.mode-select[data-name="${element.name}"]`);
                const metricInput = document.getElementsByName(element.name + metricStr)[0];
                const imperialInput = document.getElementsByName(element.name + imperialStr)[0];
                const minMetricInput = document.getElementsByName('min' + element.name + metricStr)[0];
                const minImperialInput = document.getElementsByName('min' + element.name + imperialStr)[0];
                const maxMetricInput = document.getElementsByName('rest' + element.name + metricStr)[0];
                const maxImperialInput = document.getElementsByName('rest' + element.name + imperialStr)[0];

                // Update mode and trigger the mode change event
                if (modeSelect) {
                    modeSelect.value = mode;
                    modeSelect.dispatchEvent(new Event('change')); // Programmatically trigger the change event
                }

                // Update cm and corresponding inch values
                if (metricInput && imperialInput) {
                    metricInput.value = amount;
                    imperialInput.value = metricToImperial(amount, unitType).toFixed(1);
                    // Trigger any cm to inch conversion updates here
                }

                // Update min and max amount for 'Range' mode
                if (mode === 'Range') {
                    if (minMetricInput) {
                        minMetricInput.value = min_amount;
                        minImperialInput.value = metricToImperial(min_amount, unitType).toFixed(1);
                        // Corresponding min inch update
                    }
                    if (maxMetricInput) {
                        maxMetricInput.value = max_amount;
                        maxImperialInput.value = metricToImperial(max_amount, unitType).toFixed(1);
                        // Corresponding max inch update
                    }
                }

                if (unitType === 'length' || unitType === 'size') {
                    const lengthWrapper = document.querySelector(`.length-input-wrapper[data-name="${element.name}"]`);
                    if (lengthWrapper && lengthWrapper.updateLengthDisplay) {
                        lengthWrapper.updateLengthDisplay();
                    }
                } else {
                    const weightWrapper = document.querySelector(`.length-input-wrapper[data-name="${element.name}"]`);
                    if (weightWrapper && weightWrapper.updateWeightDisplay) {
                        weightWrapper.updateWeightDisplay();
                    }
                }
            }
        
        } else if (element.type === 'multi') {
            // Find multi-component wrapper by data-name attribute
            const multiWrapper = document.querySelector(`.multi-select-wrapper[data-name="${element.name}"]`);
            if (multiWrapper && characterData[element.name]) {
                characterData[element.name].forEach(option => {
                    multiWrapper.addTag(option);
                });
            }

        } else {
            // Handle other types of elements
            const inputElement = document.getElementsByName(element.name)[0];
            console.log(inputElement);
            if (inputElement) {
                if (element.type === 'dropdown') {
                    inputElement.value = characterData[element.name];
                }
                // Handle other types if necessary
            }
        }
    });
    hideSubmenus();
}

function metricToImperial(value, type) {
    if (type === 'length' || type == 'size') {
        return value / 2.54;
    } else if (type === 'weight') {
        return value * 2.20462;
    } else {
        return;
    }
}

export { updateComponentsWithData };
