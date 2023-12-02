// js/_info.js
export function showInfo(infoHtml) {
    // Create the modal container
    const modal = document.createElement('div');
    modal.className = 'info-modal';

    // Create the content area of the modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = infoHtml; // Set HTML content
    modal.appendChild(modalContent);

    // Create a close button for the modal
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Close';
    closeButton.onclick = () => modal.style.display = 'none';
    modalContent.appendChild(closeButton);

    // Append the modal to the body (or another suitable container)
    document.body.appendChild(modal);

    // Display the modal using flexbox
    modal.style.display = 'flex';
}

