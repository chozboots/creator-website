export function createTextCompnent (element) {
    const textarea = document.createElement('textarea');
    const counter = document.createElement('span');

    counter.className = 'char-counter';
    counter.textContent = `0 / ${element.maxlength}`;

    Object.assign(textarea, {
        name: element.name,
        placeholder: element.placeholder,
        rows: 10, // or any other number you deem appropriate
        cols: 50, // or any other number you deem appropriate
        maxLength: element.maxlength,
        className: 'textarea' // or any other class for styling
    });

    // Event listener for the textarea to update the counter
    textarea.addEventListener('input', () => {
        counter.textContent = `${textarea.value.length} / ${element.maxlength}`;
    });

    // Create a wrapper for the textarea and the counter
    const wrapper = document.createElement('div');
    wrapper.className = 'textarea-wrapper';
    wrapper.appendChild(textarea);
    wrapper.appendChild(counter);

    return wrapper;
}