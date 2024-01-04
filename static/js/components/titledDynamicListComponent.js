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

    function updateCounter() {
        const currentItemCount = listWithTitles.childElementCount;
        const remainingItems = maxItems - currentItemCount;
        counter.textContent = `Items remaining: ${remainingItems}`;
        addButton.disabled = remainingItems <= 0;
    }    

    function addListItem(list, itemName, defaultTitle = '', defaultDescription = '', maxlengthTitle = 100, maxlengthDesc = 300) {
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
            titleCounter.textContent = `${defaultTitle.length} / ${maxlengthTitle}`;
    
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
            descCounter.textContent = `${defaultDescription.length} / ${maxlengthDesc}`;
    
            // Update counter for the description textarea
            description.addEventListener('input', () => {
                descCounter.textContent = `${description.value.length} / ${maxlengthDesc}`;
            });
    
            // Append elements to the listItem
            listItem.appendChild(title);
            listItem.appendChild(titleCounter);
            listItem.appendChild(description);
            listItem.appendChild(descCounter);
    
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.type = 'button';
            removeButton.className = 'remove-button';
            removeButton.onclick = () => {
                list.removeChild(listItem);
                updateCounter(); // Update counter when an item is removed
            };
    
            listItem.appendChild(removeButton);
            list.appendChild(listItem);
            updateCounter(); // Update counter when an item is added
        }
    }           
    
    addButton.onclick = () => addListItem(listWithTitles, element.item_name, '', '', 100, 300);

    listWrapperWithTitles.appendChild(counter);
    listWrapperWithTitles.appendChild(listWithTitles);
    listWrapperWithTitles.appendChild(addButton);

    if (element.default_title || element.default_description) {
        addListItem(listWithTitles, element.item_name, element.default_title, element.default_description);
    }    

    listWrapperWithTitles.addListItemWithData = (title, description) => {
        addListItem(listWithTitles, element.item_name, title, description, element.maxlengthTitle, element.maxlengthDesc);
    };    

    // Expose the updateCounter method for external access
    listWrapperWithTitles.updateCounter = updateCounter;
    
    // Set a data attribute for easy identification
    listWrapperWithTitles.setAttribute('data-name', element.name);

    // Function to get list items with titles and descriptions
    listWrapperWithTitles.getListItems = () => {
        return Array.from(listWithTitles.children).map(listItem => {
            const titleInput = listItem.querySelector('.title-input');
            const descriptionTextarea = listItem.querySelector('.description-textarea');
            return {
                title: titleInput ? titleInput.value : '',
                description: descriptionTextarea ? descriptionTextarea.value : ''
            };
        });
    };

    return listWrapperWithTitles;
}