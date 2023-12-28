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
            const measurementData = characterData[element.name] || {"mode": "Numeric", "amount": "0", "max_amount": null, "min_amount": null};
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
            const multiItems = characterData[element.name] || [];
            if (multiWrapper) {
                multiWrapper.clearTags();
                multiItems.forEach(option => {
                    multiWrapper.addTag(option);
                });
            }
        
        } else if (element.type === 'dynamicList') {
            if (element.list_type === 'dynamic_list') {
                const listData = characterData[element.name] || [];
                console.log(listData);
        
                const listWrapper = document.querySelector(`.dynamic-list-wrapper[data-name="${element.name}"]`);
                const list = listWrapper.querySelector('.dynamic-list'); // Access the list from the listWrapper
        
                // Clear existing list items
                while (list.firstChild) {
                    list.removeChild(list.firstChild);
                }
        
                // Add items from characterData
                listData.forEach(itemData => {
                    listWrapper.addListItem(list, element.item_name, itemData);
                });
                listWrapper.updateCounter();
            } else if (element.list_type === 'dynamic_list_with_titles') {
                const listData = characterData[element.name] || [];
                const listWrapperWithTitles = document.querySelector(`.dynamic-list-wrapper[data-name="${element.name}"]`);
                const listWithTitles = listWrapperWithTitles.querySelector('.dynamic-list-with-titles'); // Access the list from the listWrapper
        
                // Clear existing list items
                while (listWithTitles.firstChild) {
                    listWithTitles.removeChild(listWithTitles.firstChild);
                }
        
                listData.forEach(itemData => {
                    if (listWrapperWithTitles.addListItemWithData) {
                        listWrapperWithTitles.addListItemWithData(itemData.title, itemData.description);
                    }
                });
                listWrapperWithTitles.updateCounter();
            }

        } else if (element.type === 'date') {
            const dateInput = document.getElementsByName(element.name)[0];
            if (dateInput) {
                dateInput.value = characterData[element.name] || "2000-01-01";
                dateInput.updateAgeDisplay();
            }
    
        } else {
            // Handle other types of elements
            const inputElement = document.getElementsByName(element.name)[0];
            console.log(inputElement);
            if (inputElement) {
                if (element.type === 'dropdown') {
                    inputElement.value = characterData[element.name] || null;
                }
                else if (element.type === 'textarea') {
                    let savedText = characterData[element.name] || '';
                    if (savedText.length > element.maxlength) {
                        savedText = savedText.slice(0, element.maxlength);
                    }
                    if (inputElement.updateTextareaAndCounter) {
                        inputElement.updateTextareaAndCounter(savedText);
                    }
                    inputElement.value = savedText;
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
