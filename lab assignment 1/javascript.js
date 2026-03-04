const nameInput = document.querySelector('#name-input');
const displayName = document.querySelector('#display-name');

// Using the 'input' event to update the greeting live as they type!
nameInput.addEventListener('input', () => {
    // We access what they typed using the .value property of the input
    const theirName = nameInput.value;

    // If they delete everything, default back to 'Guest'
    if (theirName === "") {
        displayName.textContent = "Guest";
    } else {
        displayName.textContent = theirName;
    }
});