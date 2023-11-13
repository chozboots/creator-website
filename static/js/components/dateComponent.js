export const createDateComponent = element => {   
    const createAgeDisplay = () => {
        const ageDisplay = document.createElement('span');
        ageDisplay.className = 'age-display'; // Class for styling
        ageDisplay.textContent = 'Age: '; // Initial text
        return ageDisplay;
    };

    const calculateAge = birthday => {
        const ageDifMs = Date.now() - new Date(birthday).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

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
}
