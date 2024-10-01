let allCrewMembers;
let currentSelectedEvent;
let selectedCmids;
let selectedJobs;
let allEvents = []

document.addEventListener('DOMContentLoaded', (event) => {
    fetchALLCrew();
});


window.onload = function () {
    selectedCmids = []
    selectedJobs = []
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    fetch('/shotmaniacs_war/api/crewmembers', { headers: headers})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(members => {
            allCrewMembers = members;
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });

    fetchAllEvents();

    const crewSearch = document.getElementById('crewSearch');
    crewSearch.addEventListener('input', searchCrewMembers);
    crewSearch.addEventListener('click', searchCrewMembers);
};

function searchCrewMembers(event) {
    const searchQuery = event.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if(allCrewMembers) {
        const filteredCrewMembers = allCrewMembers.filter(member => member.memberName.toLowerCase().includes(searchQuery));

        filteredCrewMembers.forEach(member => {
            const listItem = document.createElement('li');
            listItem.textContent = `${member.memberName} (${member.memberRole}) (${member.memberJob})`;
            listItem.addEventListener('click', () => {
                if(currentSelectedEvent.currentmembers === currentSelectedEvent.maxmembers) {
                    showPopup("You cannot add more than " + currentSelectedEvent.maxmembers + " members", "error")
                    return;
                }

                if(member.memberJob === "productionmanager" && selectedJobs.includes(member.memberJob)){
                    showPopup("There is another production manager in this booking!", "error")
                    return;
                }

                if(selectedCmids.includes(member.memberCmid)){
                    showPopup("This member is already in the booking!", "error")
                    return;
                }

                listItem.remove();
                selectedCmids.push(member.memberCmid);
                selectedJobs.push(member.memberJob);

                currentSelectedEvent.currentmembers += 1;

                // add it to the current crewmember list
                const crewMemberList = document.getElementById('crewMemberList');
                const crewMemberListItem = document.createElement('li');
                crewMemberListItem.textContent = `${member.memberName} (${member.memberRole}) (${member.memberJob})`;
                crewMemberListItem.addEventListener('click', () => {
                    currentSelectedEvent.currentmembers -= 1;
                    crewMemberListItem.remove();

                    let indexToRemove = selectedCmids.indexOf(member.memberCmid);
                    if (indexToRemove !== -1) {
                        selectedCmids.splice(indexToRemove, 1);
                    }

                    indexToRemove = selectedJobs.indexOf(member.memberJob);
                    if (indexToRemove !== -1) {
                        selectedJobs.splice(indexToRemove, 1);
                    }
                });

                crewMemberList.appendChild(crewMemberListItem);
            });
            searchResults.appendChild(listItem);
        });
    }
}

function fetchAllEvents() {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    fetch('/shotmaniacs_war/api/event', { headers: headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            allEvents = events;
            populateTable(events);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}
function fetchALLCrew() {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    fetch('/shotmaniacs_war/api/crewmembers', { headers: headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(crew => {
            allCrew = crew;
        })
        .catch(error => {
            console.error('Error fetching crew:', error);
        });

}


function populateTable(events) {
    const tableBody = document.querySelector('.styled-table tbody');
    tableBody.innerHTML = '';

    events.forEach((event, index) => {
        const row = document.createElement('tr');
        row.classList.add('booking');
        row.onclick = () => showBookingInfo(event);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${event.name}</td>
            <td>${event.date}</td>
            <td>${event.type}</td>
            <td>${event.isaccepted}</td>
        `;

        tableBody.appendChild(row);
    });
}

function showBookingInfo(event) {
    const crewMemberList = document.getElementById('crewMemberList');

    // Clear any previous content
    crewMemberList.innerHTML = '';

    selectedCmids = []
    selectedJobs = []
    currentSelectedEvent = event;

    const currentCrewmembers = document.getElementById('currentCrewmembers');
    currentCrewmembers.textContent = "Current Crewmembers";

    // get currently existing contracts
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    fetch(`/shotmaniacs_war/api/contract/${currentSelectedEvent.eid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            return response.json();
        })
        .then(result => {
            console.log("Current event contracts: " + result)
            result.forEach(member => {
                selectedCmids.push(member.cmid);
                selectedJobs.push(member.job)

                // Create a list item for the crew member
                const crewMemberList = document.getElementById('crewMemberList');
                const crewMemberListItem = document.createElement('li');
                crewMemberListItem.textContent = `${member.name} (${member.role}) (${member.job})`;

                // Add click event listener to the list item
                crewMemberListItem.addEventListener('click', () => {
                    currentSelectedEvent.currentmembers -= 1;
                    crewMemberListItem.remove();

                    let indexToRemove = selectedCmids.indexOf(member.cmid);
                    if (indexToRemove !== -1) {
                        selectedCmids.splice(indexToRemove, 1);
                    }

                    indexToRemove = selectedJobs.indexOf(member.job);
                    if (indexToRemove !== -1) {
                        selectedJobs.splice(indexToRemove, 1);
                    }
                });

                // Append the list item to the crew member list
                crewMemberList.appendChild(crewMemberListItem);
            });

            const modal = document.getElementById('eventModal');
            const eventDetails = document.getElementById('eventDetails');

            // Clear any previous content
            eventDetails.innerHTML = '';

            // Create form elements dynamically
            const form = document.createElement('form');
            form.setAttribute('id', 'editForm');

            // what to not include
            const strings = ["clientName", "clientEmail", "cid", "currentmembers", "eid", "productionmanager"]

            const keys = Object.keys(event);
            keys.filter(key => !strings.includes(key)).forEach(key => {
                const detailRow = document.createElement('div');
                detailRow.classList.add('event-detail');

                // Create editable fields based on value type
                let inputField;
                if(key === "status"){
                    inputField = document.createElement('select');
                    inputField.setAttribute('name', key);

                    let optionOngoing = document.createElement('option');
                    optionOngoing.setAttribute('value', 'ONGOING');
                    optionOngoing.textContent = 'Ongoing';

                    let optionCompleted = document.createElement('option');
                    optionCompleted.setAttribute('value', 'COMPLETED');
                    optionCompleted.textContent = 'Completed';

                    inputField.appendChild(optionOngoing);
                    inputField.appendChild(optionCompleted);

                    if(event[key] === "ONGOING") {
                        optionOngoing.setAttribute('selected', true);
                    }
                    else{
                        optionCompleted.setAttribute('selected', true);
                    }
                } else if (key === "date") {
                    inputField = document.createElement('input');
                    inputField.setAttribute('type', 'datetime-local');
                    inputField.setAttribute('name', key);
                    inputField.setAttribute('value', event[key]);
                } else if (key === "bookingtype") {
                    inputField = document.createElement('select');
                    inputField.setAttribute('name', key);

                    let optionNotset = document.createElement('option');
                    optionNotset.setAttribute('value', 'NOTSET');
                    optionNotset.textContent = 'Not Set';

                    let optionPhotography = document.createElement('option');
                    optionPhotography.setAttribute('value', 'PHOTOGRAPHY');
                    optionPhotography.textContent = 'Photography';

                    let optionFilm = document.createElement('option');
                    optionFilm.setAttribute('value', 'FILM');
                    optionFilm.textContent = 'Film';

                    let optionMarketing = document.createElement('option');
                    optionMarketing.setAttribute('value', 'MARKETING');
                    optionMarketing.textContent = 'Marketing';

                    inputField.appendChild(optionNotset);
                    inputField.appendChild(optionPhotography);
                    inputField.appendChild(optionFilm);
                    inputField.appendChild(optionMarketing);

                    if(event[key] === "NOTSET") {
                        optionNotset.setAttribute('selected', true);
                    }
                    else if (event[key] === "PHOTOGRAPHY"){
                        optionPhotography.setAttribute('selected', true);
                    }
                    else if (event[key] === "FILM"){
                        optionFilm.setAttribute('selected', true);
                    }
                    else if (event[key] === "MARKETING"){
                        optionMarketing.setAttribute('selected', true);
                    }
                } else if (typeof event[key] === 'string' || typeof event[key] === 'number') {
                    inputField = document.createElement('input');
                    inputField.setAttribute('type', 'text');
                    inputField.setAttribute('name', key);
                    inputField.setAttribute('value', event[key]);
                } else if (typeof event[key] === 'boolean') {
                    inputField = document.createElement('input');
                    inputField.setAttribute('type', 'checkbox');
                    inputField.setAttribute('name', key);
                    inputField.checked = !!event[key];
                } else {
                    inputField = document.createElement('span');
                    inputField.textContent = event[key];
                }

                // Label for the field
                const label = document.createElement('label');
                if(key === "isaccepted"){
                    label.textContent = "Booking accepted: ";
                }
                else if(key === "maxmembers"){
                    label.textContent = "Max crew members allowed: ";
                }
                else{
                    label.textContent = `${key}: `;
                }
                label.setAttribute('for', key);

                // Append label and input/select to detailRow
                detailRow.appendChild(label);
                detailRow.appendChild(inputField);

                // Append detailRow to eventDetails
                form.appendChild(detailRow);
            });

            // Create save button
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.setAttribute('type', 'submit');
            form.appendChild(saveButton);

            const declineButton = document.createElement('button');
            declineButton.textContent = 'Delete';
            declineButton.onclick = declineBooking;
            declineButton.setAttribute('type', 'button');
            form.appendChild(declineButton);

            // Append form to eventDetails
            eventDetails.appendChild(form);

            form.addEventListener('submit', saveEvent);

            // Display the modal
            modal.style.display = 'block';

            // Close modal if the user clicks outside of it
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        })

    const saveEvent = (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);

        // Construct object from FormData
        const formDataObj = {};
        formData.forEach((value, key) => {
            // Attempt to convert values to appropriate types
            if (!isNaN(value)) { // Check if value is a number
                formDataObj[key] = parseInt(value);
            } else if (event.target.elements[key].type === 'checkbox') {
                formDataObj[key] = event.target.elements[key].checked;
            }
            else {
                formDataObj[key] = value;
            }
        });

        if(!formDataObj.isaccepted){
            formDataObj.isaccepted = false;
        }

        const eid = currentSelectedEvent.eid;
        formDataObj.currentmembers = currentSelectedEvent.currentmembers

        const token = sessionStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        fetch(`/shotmaniacs_war/api/event/${eid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObj)
        })
            .then(response => {
                if (!response.ok) {
                    showPopup("Failed to update event. Check spelling.", "error")
                }
                else{

                    // assign crew members to the event
                    const eid = currentSelectedEvent.eid;

                    // before reassigning the contract first remove the existing contracts for this eid
                    const token = sessionStorage.getItem('token');
                    const headers = {
                        'Content-Type': 'application/json'
                    };
                    if (token) {
                        headers['Authorization'] = 'Bearer ' + token;
                    }
                    fetch(`/shotmaniacs_war/api/contract/${eid}`, {
                        method: 'DELETE',
                        headers: headers
                    })
                        .then(response => {
                            selectedCmids.forEach((value, index) => {
                                const token = sessionStorage.getItem('token');
                                const headers = {
                                    'Content-Type': 'application/json'
                                };

                                if (token) {
                                    headers['Authorization'] = 'Bearer ' + token;
                                }
                                fetch('/shotmaniacs_war/api/contract', {
                                    method: 'POST',
                                    headers: headers,
                                    body: JSON.stringify({ "eid": eid, "cmid": value })
                                })
                            });

                            const modal = document.getElementById('eventModal');
                            modal.style.display = 'none';

                            fetchAllEvents();
                        });
                }
            })
            .catch(error => {
                console.error('Error updating event:', error);
                // Handle error here
            });
    }

    const declineBooking = () => {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        fetch(`/shotmaniacs_war/api/event/${currentSelectedEvent.eid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    showPopup("Failed to decline event.", "error")
                }
                else{
                    fetchAllEvents();
                    const modal = document.getElementById('eventModal');
                    modal.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error deleting the event:', error);
            });
    }};