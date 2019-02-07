function autocomplete(address, latInput, lngInput) {
    //if there is no address yet, dont do anything.
    if (!address) return;

    const dropdown = new google.maps.places.Autocomplete(address);
    dropdown.addEventListener('place_changed', () => {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });

    address.on('keydown', (e) => {
        if (e.keyCode == 13) e.preventDefault();
    });
}

export default autocomplete;