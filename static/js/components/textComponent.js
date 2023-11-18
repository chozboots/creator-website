// js/components/textComponent.js
export function createTextComponent (element) {
    const textarea = document.createElement('textarea');
    const counter = document.createElement('span');

    counter.className = 'char-counter';
    counter.textContent = `0 / ${element.maxlength}`;

    // Determine the size and style based on element.mode
    let rows, cols, className;
    if (element.mode === 'long') {
        rows = 10; // or any other number for long mode
        cols = 50; // or any other number for long mode
        className = 'textarea-long'; // specific class for long mode
    } else if (element.mode === 'short') {
        rows = 1; // fewer rows for short mode
        cols = 20; // fewer columns for short mode
        className = 'textarea-short'; // specific class for short mode
    }

    Object.assign(textarea, {
        name: element.name,
        placeholder: element.placeholder,
        rows: rows,
        cols: cols,
        maxLength: element.maxlength,
        className: className // applying the class based on mode
    });

    textarea.addEventListener('input', () => {
        counter.textContent = `${textarea.value.length} / ${element.maxlength}`;
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'textarea-wrapper';
    wrapper.appendChild(textarea);
    wrapper.appendChild(counter);

    return wrapper;
}