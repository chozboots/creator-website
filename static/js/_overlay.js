export function showLoadingOverlay() {
    console.log('Showing loading overlay');
    document.getElementById('loadingOverlay').style.display = 'flex';
}

export function hideLoadingOverlay() {
    console.log('Hiding loading overlay');
    document.getElementById('loadingOverlay').style.display = 'none';
}

export function showSavingOverlay() {
    console.log('Showing saving overlay');
    document.getElementById('savingOverlay').style.display = 'flex';
}

export function hideSavingOverlay() {
    console.log('Hiding saving overlay');
    document.getElementById('savingOverlay').style.display = 'none';
}