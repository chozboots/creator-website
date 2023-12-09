// js/_toggle.js
export function addUnitToggleButtons(parentElement) {
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'unit-toggle-wrapper';

    // Metric button
    const metricButton = document.createElement('input');
    Object.assign(metricButton, {
        type: 'radio',
        id: 'metric',
        name: 'unit-toggle',
        value: 'metric',
        checked: true
    });
    const metricLabel = createLabel('Metric', 'metric');
    toggleWrapper.appendChild(metricButton);
    toggleWrapper.appendChild(metricLabel);

    // Imperial button
    const imperialButton = document.createElement('input');
    Object.assign(imperialButton, {
        type: 'radio',
        id: 'imperial',
        name: 'unit-toggle',
        value: 'imperial'
    });
    const imperialLabel = createLabel('Imperial', 'imperial');
    toggleWrapper.appendChild(imperialButton);
    toggleWrapper.appendChild(imperialLabel);

    // Event listener to update all components on unit change
    toggleWrapper.addEventListener('change', (event) => {
        const isMetric = event.target.value === 'metric';
        updateAllComponentsVisibility(isMetric);
    });

    parentElement.appendChild(toggleWrapper);
}

function createLabel(text, htmlFor) {
    const label = document.createElement('label');
    label.textContent = text;
    label.setAttribute('for', htmlFor);
    label.className = 'input-label';
    return label;
}

function updateAllComponentsVisibility(isMetric) {
    const components = document.querySelectorAll('.length-input-wrapper');
    components.forEach((component) => {
        const modeSelect = component.querySelector('.mode-select');
        const selectedMode = modeSelect.value;
        toggleInputsVisibility(component, selectedMode, isMetric);
    });
}

// js/_visibilityControl.js
export function toggleInputsVisibility(wrapper, mode, isMetric) {
    const isNumericMode = mode === 'Numeric';
    const isRangeMode = mode === 'Range';

    // Select all basic metric and imperial inputs within the wrapper
    const basicMetricInputs = wrapper.querySelectorAll('.length-input-metric:not(.range-input)');
    const basicImperialInputs = wrapper.querySelectorAll('.length-input-imperial:not(.range-input)');

    // Display basic metric or imperial inputs based on isMetric and mode
    basicMetricInputs.forEach(input => input.style.display = (isNumericMode || isRangeMode) && isMetric ? '' : 'none');
    basicImperialInputs.forEach(input => input.style.display = (isNumericMode || isRangeMode) && !isMetric ? '' : 'none');

    // For Range mode, handle additional min/max inputs
    if (isRangeMode) {
        const rangeMetricInputs = wrapper.querySelectorAll('.range-input-metric');
        const rangeImperialInputs = wrapper.querySelectorAll('.range-input-imperial');
        rangeMetricInputs.forEach(input => input.style.display = isMetric ? '' : 'none');
        rangeImperialInputs.forEach(input => input.style.display = !isMetric ? '' : 'none');
    } else {
        // Hide range inputs if not in Range mode
        const allRangeInputs = wrapper.querySelectorAll('.range-input-metric, .range-input-imperial');
        allRangeInputs.forEach(input => input.style.display = 'none');
    }

    // Hide all inputs if mode is neither Numeric nor Range
    if (!isNumericMode && !isRangeMode) {
        const allInputs = wrapper.querySelectorAll('input');
        allInputs.forEach(input => input.style.display = 'none');
    }

    // Adjust display container visibility
    const displayContainer = wrapper.querySelector('.length-display-container');
    if (displayContainer) {
        displayContainer.style.display = isNumericMode || isRangeMode ? '' : 'none';
    }
}
