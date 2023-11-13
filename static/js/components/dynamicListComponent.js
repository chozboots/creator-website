export function createDynamicListComponent(element) {   
    const listWrapper = document.createElement('div');
    listWrapper.className = 'dynamic-list-wrapper';

    const list = document.createElement('ul');
    list.className = 'dynamic-list';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.type = 'button';
    addButton.className = 'add-button';
    addButton.onclick = () => addListItem(list, element.item_name);

    // Function to add list item
    function addListItem(list, itemName) {
        const listItem = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'text';
        input.name = itemName;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.type = 'button';
        removeButton.className = 'remove-button';
        removeButton.onclick = () => list.removeChild(listItem);

        listItem.appendChild(input);
        listItem.appendChild(removeButton);
        list.appendChild(listItem);
    }

    // Initial item
    addListItem(list, element.item_name);

    listWrapper.appendChild(list);
    listWrapper.appendChild(addButton);

    return listWrapper;
}