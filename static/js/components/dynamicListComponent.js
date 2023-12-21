export function createDynamicListComponent(element) {   
    const listWrapper = document.createElement('div');
    listWrapper.className = 'dynamic-list-wrapper';

    const list = document.createElement('ul');
    list.className = 'dynamic-list';

    const maxItems = element.max_items || 10; // Default to 10 if not specified

    // Counter element to show remaining items
    const counter = document.createElement('span');
    counter.className = 'item-counter';
    counter.textContent = `Items remaining: ${maxItems}`;

    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.type = 'button';
    addButton.className = 'add-button';

    // Function to update the item counter
    function updateCounter() {
        const remainingItems = maxItems - list.childElementCount;
        counter.textContent = `Items remaining: ${remainingItems}`;
        addButton.disabled = remainingItems <= 0;
    }

    listWrapper.updateCounter = updateCounter; // Attach the function to the listWrapper for external access

    // Function to add list item
    function addListItem(list, itemName, preFilledData = '') {
        if (list.childElementCount < maxItems) {
            const listItem = document.createElement('li');
            const input = document.createElement('input');
            input.type = 'text';
            input.name = itemName;
            input.maxLength = element.maxlength || 255; // Set the maxlength attribute

            // Create a wrapper for input and character counter
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'input-wrapper';

            // Create and configure the character counter
            const charCounter = document.createElement('span');
            charCounter.className = 'char-counter';
            charCounter.textContent = `0 / ${input.maxLength}`; // Use input.maxLength

            input.value = preFilledData;
            charCounter.textContent = `${preFilledData.length} / ${input.maxLength}`;

            // Update the character counter when input changes
            input.addEventListener('input', () => {
                charCounter.textContent = `${input.value.length} / ${input.maxLength}`;
            });

            // Append input and charCounter to the wrapper
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(charCounter);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.type = 'button';
            removeButton.className = 'remove-button';
            removeButton.onclick = () => {
                list.removeChild(listItem);
                updateCounter(); // Update counter when an item is removed
            };

            listItem.appendChild(inputWrapper);
            listItem.appendChild(removeButton);
            list.appendChild(listItem);
            updateCounter(); // Update counter when an item is added
        }
    }

    addButton.onclick = () => addListItem(list, element.item_name);

    listWrapper.appendChild(counter);
    listWrapper.appendChild(list);
    listWrapper.appendChild(addButton);

    // Attach the function to the listWrapper for external access
    listWrapper.addListItem = addListItem;

    // Add a data attribute for identification
    listWrapper.setAttribute('data-name', element.name);

    // Function to get list items
    listWrapper.getListItems = () => {
        return Array.from(list.children).map(listItem => {
            const input = listItem.querySelector('input');
            return input ? input.value : '';
        });
    };

    return listWrapper;
}
