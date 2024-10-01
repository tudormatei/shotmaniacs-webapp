function showFilterInfo() {
    const filterPopup = document.getElementById('filter-info');
    filterPopup.style.display = 'block';
    filterPopup.style.top = '50%';
    filterPopup.style.left = '50%';
    filterPopup.style.transform = 'translate(-50%, -50%)';
    filterPopup.style.display = 'block';
    document.addEventListener('click', handleClickOutsideFilter, true);
}

function closeFilterInfo() {
    const filterPopup = document.getElementById('filter-info');
    filterPopup.style.display = 'none';
    document.removeEventListener('click', handleClickOutsideFilter, true);
}

function handleClickOutsideFilter(event) {
    const filterPopup = document.getElementById('filter-info');
    const filterButton = document.querySelector('.custom-button.right-side-button');
    if (!filterPopup.contains(event.target) && event.target !== filterButton) {
        closeFilterInfo();
    }
}

function applyFilter() {
    const clientFilter = document.getElementById('client-filter').value.toLowerCase();
    const dateFilter = document.getElementById('date-filter').value;
    const statusFilter = document.getElementById('status-filter').value.toLowerCase();
    const acceptFilterCheckbox = document.getElementById('accepted-filter');
    let accepted
    if(acceptFilterCheckbox == null){
        accepted = true;
    }
    else{
        accepted = document.getElementById('accepted-filter').checked;
    }

    const filteredEvents = allEvents.filter(event => {
        const clientMatches = event.name.toLowerCase().includes(clientFilter);

        const eventDate = event.date.split('T')[0];
        const dateMatches = !dateFilter || eventDate === dateFilter;

        const statusMatches = !statusFilter || event.status.toLowerCase() === statusFilter;
        const acceptedMatches = event.isaccepted === accepted;

        return clientMatches && dateMatches && statusMatches && acceptedMatches;
    });

    populateTable(filteredEvents);

    closeFilterInfo();
}

function clearFilters() {
    document.getElementById('client-filter').value = '';
    document.getElementById('date-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('accepted-filter').checked = false;

    fetchAllEvents();
}

dragElement(document.getElementById('filter-info'));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var header = elmnt.querySelector('.draggable-bar');
    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

}