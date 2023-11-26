// js/components/nameComponent.js
export function createNameComponent(element, currentCharacterId) {
    const input = document.createElement('input');
    const submitButton = document.createElement('button');

    input.type = 'text';
    input.className = 'input-short';
    Object.assign(input, {
        name: element.name,
        placeholder: element.placeholder,
        maxLength: element.maxlength || 100, // Default to 100 if maxLength is not provided
    });

    submitButton.textContent = 'Update';
    submitButton.className = 'submit-button';

    submitButton.addEventListener('click', () => {
        const newName = input.value;
        
        // Update the name in the character list
        const characterDiv = document.querySelector(`.character-item[data-character-id="${currentCharacterId}"]`);
        if (characterDiv) {
            const nameElement = characterDiv.querySelector('h2'); // The name element in the character list
            if (nameElement) {
                nameElement.textContent = newName;
            }
        }

        // Update the 'Editing' text in the editMode
        const editGreetingElement = document.getElementById('editGreeting');
        if (editGreetingElement) {
            editGreetingElement.textContent = `Editing ${newName}`;
        }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    wrapper.appendChild(input);
    wrapper.appendChild(submitButton);

    return wrapper;
}
