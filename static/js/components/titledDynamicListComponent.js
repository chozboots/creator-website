export function createTitledDynamicListComponent(element) {
    const listWrapperWithTitles = document.createElement('div');
    listWrapperWithTitles.className = 'dynamic-list-wrapper';

    const listWithTitles = document.createElement('ul'); // Changed variable name here
    listWithTitles.className = 'dynamic-list-with-titles'; // Assign the class to the list

    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.type = 'button';
    addButton.className = 'add-button';
    addButton.onclick = () => addListItem(listWithTitles, element.item_name, element.default_title, element.default_description);

    function addListItem(list, itemName, defaultTitle = '', defaultDescription = '', maxlengthTitle = 255, maxlengthDesc = 1000) {
        const listItem = document.createElement('li');
        listItem.className = 'dynamic-list-with-titles-item';
    
        // Title input
        const title = document.createElement('input');
        const titleCounter = document.createElement('span');
        title.type = 'text';
        title.value = defaultTitle;
        title.name = `${itemName}-title`;
        title.className = 'title-input';
        title.maxLength = maxlengthTitle;
        titleCounter.className = 'char-counter';
        titleCounter.textContent = `0 / ${maxlengthTitle}`;
    
        // Update counter for the title input
        title.addEventListener('input', () => {
            titleCounter.textContent = `${title.value.length} / ${maxlengthTitle}`;
        });
    
        // Description textarea
        const description = document.createElement('textarea');
        const descCounter = document.createElement('span');
        description.value = defaultDescription;
        description.name = `${itemName}-description`;
        description.className = 'description-textarea';
        description.rows = 4;
        description.maxLength = maxlengthDesc;
        descCounter.className = 'char-counter';
        descCounter.textContent = `0 / ${maxlengthDesc}`;
    
        // Update counter for the description textarea
        description.addEventListener('input', () => {
            descCounter.textContent = `${description.value.length} / ${maxlengthDesc}`;
        });
    
        // Remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.type = 'button';
        removeButton.className = 'remove-button';
        removeButton.onclick = () => list.removeChild(listItem);
    
        // Append elements to the listItem
        listItem.appendChild(title);
        listItem.appendChild(titleCounter);
        listItem.appendChild(description);
        listItem.appendChild(descCounter);
        listItem.appendChild(removeButton);
    
        list.appendChild(listItem);
    }            
    
    if (element.default_title || element.default_description) {
        addListItem(listWithTitles, element.item_name, element.default_title, element.default_description);
    }

    listWrapperWithTitles.appendChild(listWithTitles);
    listWrapperWithTitles.appendChild(addButton);

    return listWrapperWithTitles;
}