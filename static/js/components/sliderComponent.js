export function createSliderComponent(element) {
    const options = element.options || [];
    const container = document.createElement('div');
    container.className = 'slider-container';

    options.forEach((option, index) => {
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'slider-wrapper';
    
        const sliderDisplayContainer = document.createElement('div'); // New container for slider and value display
        sliderDisplayContainer.className = 'slider-display-container';
    
        const slider = document.createElement('input');
        const valueDisplay = document.createElement('span'); // Display for showing value
        Object.assign(slider, {
            type: 'range',
            min: 0,
            max: 1,
            step: 0.01,
            value: option.initialValue || 0,
            className: 'option-slider',
            id: `slider-${index}`
        });

        // Display initial value as percentage
        valueDisplay.textContent = `${(slider.value * 100).toFixed(0)}%`;        valueDisplay.className = 'slider-value-display';

        sliderDisplayContainer.appendChild(slider);
        sliderDisplayContainer.appendChild(valueDisplay);

        const label = document.createElement('label');
        label.textContent = option.label || `Option ${index + 1}: `;
        label.appendChild(sliderDisplayContainer);

        sliderWrapper.appendChild(label);
        container.appendChild(sliderWrapper);
    });

    // Function to calculate the maximum value a slider can have
    function calculateMaxValue(excludedIndex) {
        const sliders = Array.from(container.querySelectorAll('.option-slider'));
        let totalOtherValues = 0;

        sliders.forEach((slider, index) => {
            if (index !== excludedIndex) {
                totalOtherValues += parseFloat(slider.value);
            }
        });

        return Math.min(1 - totalOtherValues, 1);
    }

    // Event listener for when a slider is moved
    container.addEventListener('input', (event) => {
        if (event.target.className === 'option-slider') {
            const sliderIndex = options.findIndex(opt => `slider-${opt.index}` === event.target.id);
            const maxValue = calculateMaxValue(sliderIndex);
            let newValue = parseFloat(event.target.value);

            if (newValue > maxValue) {
                event.target.value = maxValue.toFixed(2); // Restrict to max value
                newValue = maxValue;
            }

            // Update display to show percentage
            const percentage = (event.target.value * 100).toFixed(0);
            container.querySelectorAll('.slider-value-display')[sliderIndex].textContent = `${percentage}%`;
        }
    });

    return container;
}
