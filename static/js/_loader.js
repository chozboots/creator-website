// js/_loader.js
function updateComponentsWithData(characterData) {
    // Find the multi-component wrapper
    const multiComponentWrapper = document.querySelector('.multi-select-wrapper');
    if (multiComponentWrapper) {
        const options = characterData['characterGenders'];
        options.forEach(option => {
            multiComponentWrapper.addTag(option);
        });
    }
}

export { updateComponentsWithData };
