export function createTitledDynamicListComponent(element) {
    const listWrapperWithTitles = document.createElement('div');
    listWrapperWithTitles.className = 'dynamic-list-wrapper';

    const listWithTitles = document.createElement('ul');
    listWithTitles.className = 'dynamic-list-with-titles';

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
        const remainingItems = maxItems - listWithTitles.childElementCount;
        counter.textContent = `Items remaining: ${remainingItems}`;
        addButton.disabled = remainingItems <= 0;
    }

    function addListItem(list, itemName, defaultTitle = '', defaultDescription = '', maxlengthTitle = 255, maxlengthDesc = 1000) {
        if (list.childElementCount < maxItems) {
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

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.type = 'button';
            removeButton.className = 'remove-button';
            removeButton.onclick = () => {
                list.removeChild(listItem);
                updateCounter(); // Update counter when an item is removed
            };

            // Remove button setup
            removeButton.onclick = () => {
                list.removeChild(listItem);
                updateCounter(); // Update counter when an item is removed
            };
        
            // Update counter for the description textarea
            description.addEventListener('input', () => {
                descCounter.textContent = `${description.value.length} / ${maxlengthDesc}`;
            });
        
            // Append elements to the listItem
            listItem.appendChild(title);
            listItem.appendChild(titleCounter);
            listItem.appendChild(description);
            listItem.appendChild(descCounter);
            listItem.appendChild(removeButton);

            list.appendChild(listItem);
            updateCounter(); // Update counter when an item is added
        }
    }            
    
    addButton.onclick = () => addListItem(listWithTitles, element.item_name, '', '', 255, 1000);

    listWrapperWithTitles.appendChild(counter);
    listWrapperWithTitles.appendChild(listWithTitles);
    listWrapperWithTitles.appendChild(addButton);

    if (element.default_title || element.default_description) {
        addListItem(listWithTitles, element.item_name, element.default_title, element.default_description);
    }    

    return listWrapperWithTitles;
}