// js/components/multiComponent.js
export function createMultiComponent(element) {
    const wrapper = document.createElement('div');
    wrapper.className = 'multi-select-wrapper';
    wrapper.setAttribute('data-name', element.name); 

    // Character limit
    const charLimit = 25;
    const entryLimit = element.max || 10
    
    // Create a container for the tags
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tags-container';
    wrapper.appendChild(tagsContainer);

    // Create a dropdown menu for predefined options
    const dropdown = document.createElement('select');
    dropdown.className = 'option-dropdown';
    const placeholderOption = document.createElement('option');
    placeholderOption.text = 'Select an option';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    dropdown.appendChild(placeholderOption);

    element.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.text = option;
        dropdown.appendChild(optionElement);
    });
    wrapper.appendChild(dropdown);

    // Create an input field for adding custom options
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Or type an option';
    inputField.className = 'option-input';
    inputField.maxLength = charLimit; // Set the maximum length
    wrapper.appendChild(inputField);

    // Create a character counter
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter-tag';
    charCounter.textContent = `0/${charLimit}`;
    wrapper.appendChild(charCounter);

    // Function to update the character counter
    function updateCharCounter() {
        const currentLength = inputField.value.length;
        charCounter.textContent = `${currentLength}/${charLimit}`;
    }

    // Function to update remaining entries counter
    function updateRemainingEntriesCounter() {
        const remaining = entryLimit - selectedOptions.length;
        remainingEntriesCounter.textContent = `${remaining} remaining`;
    }

    // Remaining entries counter
    const remainingEntriesCounter = document.createElement('div');
    remainingEntriesCounter.className = 'remaining-entries-counter';
    remainingEntriesCounter.textContent = `${entryLimit} remaining`;
    wrapper.appendChild(remainingEntriesCounter);

    const selectedOptions = []; // Array to store selected options

    // Update the character counter when typing
    inputField.addEventListener('input', updateCharCounter);

    // Function to add a tag
    function addTag(option) {
        if (selectedOptions.includes(option) || selectedOptions.length >= entryLimit) return;

        selectedOptions.push(option);
        const tag = document.createElement('span');
        tag.className = 'option-tag';
        const tagText = document.createElement('span');
        tagText.className = 'option-tag-text';
        tagText.textContent = option;
        tag.appendChild(tagText);

        // Add a remove button to each tag
        const removeBtn = document.createElement('span');
        removeBtn.innerHTML = '&times;';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => removeTag(option, tag);

        tag.appendChild(removeBtn);
        tagsContainer.appendChild(tag);
        updateRemainingEntriesCounter(); // Update the counter after adding a tag
    }

    wrapper.addTag = addTag; // Add the addTag function to the wrapper

    // Function to remove a tag
    function removeTag(option, tagElement) {
        selectedOptions.splice(selectedOptions.indexOf(option), 1);
        tagsContainer.removeChild(tagElement);
        updateRemainingEntriesCounter(); // Update the counter after adding a tag
    }

    // Handle dropdown selection
    dropdown.addEventListener('change', () => {
        const selectedOption = dropdown.value;
        if (selectedOption && selectedOption !== 'Select an option') {
            addTag(selectedOption);
            dropdown.selectedIndex = 0; // Reset dropdown after selection
        }
    });

    // Handle input for custom options
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const customOption = inputField.value.trim();
            if (customOption) {
                addTag(customOption);
                inputField.value = '';
            }
        }
    });

    return wrapper;
}
