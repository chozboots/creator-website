// js/_report.js
import { sendFilesToServer } from './_gallery.js';


export async function createJsonReport(uploadedFiles) {
    console.log("Creating JSON report...");
    const report = {};
    try {
        const response = await fetch('/dynamic_elements');
        const elements = await response.json();
        if (elements) {
            // Create an array of promises
            const promises = elements.map(element => processFields(element, uploadedFiles, report));
            // Wait for all promises to resolve
            await Promise.all(promises);
        }
        console.log(`Completed report: ${JSON.stringify(report)}`);
    } catch (error) {
        console.error('Error fetching elements:', error);
    }

    return report;
}

async function processFields(element, uploadedFiles, report) {
    console.log('Processing element:', element)

    if (!element.name || !element.type) {
        console.error('Invalid element:', element);
        return Promise.resolve(); // Resolve immediately for invalid elements
    }

    if (element.type === 'dropdown' || element.type === 'textarea') {
        const inputElement = document.getElementsByName(element.name)[0];
        if (inputElement) {
            report[element.name] = inputElement.value;
        }
    } else if (element.type === 'file') {
        // Handle file inputs
        return processImageField(element, uploadedFiles, report); // Return the promise
    }
    else if (element.type === 'number') {
        // Handle number fields with different units
        return processNumberField(element, report);
    }
    else if (element.type === 'multi') {
        // Handle multi-select elements
        return processMultiField(element, report);
    }
    else if (element.type === 'dynamicList') {
        // Handle dynamic lists
        if (element.list_type === 'dynamic_list') {
            return processDynamicListField(element, report);
        } else if (element.list_type === 'dynamic_list_with_titles') {
            return processTitledDynamicListField(element, report);
        } else {
            console.error('Invalid list type:', element);
        }
    } else if (element.type === 'date') {
        // Handle date inputs
        return processDateField(element, report);
    }

    else if (element.type === 'slider') {
        // Handle slider elements
        return processSliderField(element, report);
    }

    return Promise.resolve();
}

async function processImageField(element, uploadedFiles, report) {
    let files = [];

    if (element.name === 'characterImage') {
        // Assuming 'characterImage' is the ID of the file input corresponding to the avatar
        const fileInput = document.getElementById('characterImage');
        if (fileInput && fileInput.files.length > 0) {
            files.push(fileInput.files[0]); // Get the first file
            if (files.length > 0) {
                const linksArray = await sendFilesToServer(files);
                console.log('Links array:', linksArray);
                report[element.name] = linksArray[0];
            }
            return;
        } else {
            const avatarLink = document.getElementById('editAvatar').src
            console.log('Avatar link:', avatarLink);
            report[element.name] = avatarLink;
            return;
        }
    } else if (element.name === 'characterGallery') {
        // Assuming 'uploadedFiles' contains the files for the gallery
        files.push(...uploadedFiles); // Add all files from the gallery
    }

    if (files.length > 0) {
        const linksArray = await sendFilesToServer(files);
        console.log('Links array:', linksArray);
        report[element.name] = linksArray;
    }
    else {
        report[element.name] = [];
    }
}

function processNumberField(element, report) {
    const unitType = element.measurement;
                
    let metricStr;
    let imperialStr;
    if (unitType === 'length' || unitType === 'size') {
        metricStr = 'Cm';
        imperialStr = 'Inch';
    } else {
        metricStr = 'Kg';
        imperialStr = 'Lb';
    }

    const modeSelect = document.querySelector(`.mode-select[data-name="${element.name}"]`);
    const metricInput = document.getElementsByName(element.name + metricStr)[0];
    const minMetricInput = document.getElementsByName('min' + element.name + metricStr)[0];
    const maxMetricInput = document.getElementsByName('rest' + element.name + metricStr)[0];

    report[element.name] = {
        mode: modeSelect ? modeSelect.value : 'Numeric',
        amount: null,
        min_amount: null,
        max_amount: null
    };

    if (report[element.name].mode === 'Numeric') {
        report[element.name].amount = metricInput ? metricInput.value : null;
    } else if (report[element.name].mode === 'Range') {
        report[element.name].amount = metricInput ? metricInput.value : null;
        report[element.name].min_amount = minMetricInput ? minMetricInput.value : null;
        report[element.name].max_amount = maxMetricInput ? maxMetricInput.value : null;
    }

    console.log(`Field report for ${element.name}:`, report[element.name]);
}

function processMultiField(element, report) {
    // Find the multi-component wrapper by data-name attribute
    const multiWrapper = document.querySelector(`.multi-select-wrapper[data-name="${element.name}"]`);
    
    if (multiWrapper && multiWrapper.getSelectedOptions) {
        report[element.name] = multiWrapper.getSelectedOptions();
    } else {
        report[element.name] = []; // Default to an empty array if not found
    }

    console.log(`Field report for ${element.name}:`, report[element.name]);
}

function processDynamicListField(element, report) {
    console.log('Processing dynamic list field:', element)
    const listWrapper = document.querySelector(`.dynamic-list-wrapper[data-name="${element.name}"]`);
    if (listWrapper && listWrapper.getListItems) {
        report[element.name] = listWrapper.getListItems();
    } else {
        report[element.name] = []; // Default to an empty array if not found
    }
    
    console.log(`Field report for ${element.name}:`, report[element.name]);
}

function processTitledDynamicListField(element, report) {
    console.log('Processing titled dynamic list field:', element)
    const listWrapperWithTitles = document.querySelector(`.dynamic-list-wrapper[data-name="${element.name}"]`);
    if (listWrapperWithTitles && listWrapperWithTitles.getListItems) {
        report[element.name] = listWrapperWithTitles.getListItems();
    } else {
        report[element.name] = []; // Default to an empty array if not found
    }

    console.log(`Field report for ${element.name}:`, report[element.name]);
}

function processDateField(element, report) {
    const dateInput = document.getElementsByName(element.name)[0];
    if (dateInput) {
        report[element.name] = dateInput.value || '';
    } else {
        report[element.name] = ''; // Default to null if date input not found
    }
}

function processSliderField(element, report) {
    const sliderValues = [];

    element.options.forEach((option, index) => {
        const slider = document.getElementById(`slider-${index}`);
        const key = option.label || `Option${index}`;  // Using label as key, or a default key
        let valueObj = {};
        valueObj[key] = slider ? parseFloat(slider.value) : null;
        sliderValues.push(valueObj);
    });

    report[element.name] = sliderValues;

    console.log(`Field report for ${element.name}:`, JSON.stringify(report[element.name]));
}
