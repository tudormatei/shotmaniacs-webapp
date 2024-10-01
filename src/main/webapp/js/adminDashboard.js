let allAnnouncements = [];
let allCrew = [];

document.addEventListener('DOMContentLoaded', (event) => {
    fetchAllAnnouncements();
    fetchAllCrew()
    fetchALLCrew();
});

function showPopupForm() {
    const createNewAcc = document.getElementById('create-new-account');
    createNewAcc.innerHTML = `
        <form id="create-new-account-form">
        <button  class="close-button" onclick="closeCreateNewMember()">X</button>
            <input type="file" id="image-input" name="image" accept="image/*" required>
            <img id="image-preview" src="" alt="Image Preview" />
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" placeholder="Name" required>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="John@doe.com" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" placeholder="Password" required>
            <label for="role">Role</label>
            <select id="role" name="role" required>
                <option value="admin">Admin</option>
                <option value="crewmember">Crew Member</option>
            </select>
            <label for="job">Job</label>
            <select id="job" name="job" required>
                <option value="photographer">Photographer</option>
                <option value="film">Film</option>
                <option value="marketing">Marketing</option>
                <option value="productionmanager">Production Manager</option>
                <option value="other">Other</option>
            </select>
            <div class="wrap" id = "button-container-submit-add-member">
                <button type="submit">Submit</button>
            </div>
            <div id="responseContainer"></div>
        </form>
        
    `;
    createNewAcc.style.display = "flex";

    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    imageInput.addEventListener('change', function() {
        const file = imageInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };

            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });

    document.getElementById('create-new-account-form').addEventListener('submit', registerAcc);

    window.addEventListener('click', function(event) {
        if (event.target === createNewAcc) {
            closeCreateNewMember();
        }
    });
}
function closeCreateNewMember() {
    const createNewAcc = document.getElementById('create-new-account');
    createNewAcc.style.display = "none";
    createNewAcc.innerHTML = ""; // Clear the form
}


function closeCreateNewMember() {
    const newAccPopup = document.getElementById('create-new-account');
    newAccPopup.style.display = 'none';
    newAccPopup.innerHTML = '';
}

function logOut() {
    sessionStorage.removeItem('token');
}

function registerAcc(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const responseContainer = document.getElementById('responseContainer');

    if (formData.get('job') === 'productionmanager' && formData.get('role') !== 'admin') {
        responseContainer.textContent = `Production manager cannot be assigned to not admin role`;
        responseContainer.style.color = 'red';
        return;
    }

    const fileInput = document.getElementById('image-input');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        const base64data = reader.result.split(',')[1];
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            job: formData.get('job'),
            image: base64data,
        };

        const token = sessionStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        fetch('/shotmaniacs_war/api/auth/register', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.status === "REGISTER_INVALID") {
                    responseContainer.textContent = `Account name already exists, or password does not respect the required format`;
                    responseContainer.style.color = 'red';
                } else {
                    responseContainer.textContent = `Success!`;
                    responseContainer.style.color = 'green';
                    closeCreateNewMember();
                }
            })
            .catch(error => {
                const responseContainer = document.getElementById('responseContainer');
                responseContainer.textContent = `Internal error`;
                responseContainer.style.color = 'red';
                console.error('Error:', error);
            });
    };

    reader.readAsDataURL(file);
}


document.getElementById('announcement-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const announcementData = new FormData(event.target);
    const urgency = document.getElementById('urgency').value; // Get urgency level from form

    const message = announcementData.get('message');

    const selectedCrewMembers = [];
    const crewCheckboxes = document.querySelectorAll('.crew-checkbox');
    crewCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCrewMembers.push(checkbox.value);
        }
    });

    const data = {
        announcementDate: new Date().toISOString(),
        announcementMessage: message,
        crewMembers: selectedCrewMembers,
        urgency: urgency // Assign mapped urgency value here
    };



    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    if (urgency === '2' && message.toLowerCase() === 'flappy bird') {
        showFlappyBird();
        return;
    }
    if (urgency === '2'){
        fetch('/shotmaniacs_war/api/email/sendannouncement', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    fetch('/shotmaniacs_war/api/announcement', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            document.getElementById('announcement-form').reset();
            fetchAllAnnouncements();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

function showFlappyBird() {
    const flappyBirdOverlay = document.createElement('div');
    flappyBirdOverlay.id = 'flappy-bird-overlay';
    flappyBirdOverlay.style.position = 'fixed';
    flappyBirdOverlay.style.top = '0';
    flappyBirdOverlay.style.left = '0';
    flappyBirdOverlay.style.width = '100%';
    flappyBirdOverlay.style.height = '100%';
    flappyBirdOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    flappyBirdOverlay.style.display = 'flex';
    flappyBirdOverlay.style.alignItems = 'center';
    flappyBirdOverlay.style.justifyContent = 'center';
    flappyBirdOverlay.style.zIndex = '1000';

    flappyBirdOverlay.innerHTML = `
        <iframe src="https://funhtml5games.com?embed=flappy" style="width:800px;height:520px;border:none;" frameborder="0" scrolling="no"></iframe>
        <button id="close-flappy-bird" style="position: absolute; top: 20px; right: 20px; font-size: 24px; background: transparent; border: none; color: white; cursor: pointer;">X</button>
    `;

    document.body.appendChild(flappyBirdOverlay);

    document.getElementById('close-flappy-bird').addEventListener('click', function() {
        flappyBirdOverlay.remove();
    });
}



function fetchAllAnnouncements() {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    fetch('/shotmaniacs_war/api/announcement', { headers: headers})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(announcements => {
            allAnnouncements = announcements;
            populateAnnouncements(announcements);
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
        });
}

function populateAnnouncements(announcements) {
    const announcementBox = document.querySelector('.announcement-table tbody');
    announcementBox.innerHTML = '';

    announcements.forEach((announcement, index) => {
        const announcementItem = document.createElement('tr');
        announcementItem.classList.add('announcement-item');

        const trashIcon = document.createElement('i');
        trashIcon.className = 'fa-solid fa-trash-can trash-icon';
        trashIcon.addEventListener('click', () => deleteAnnouncement(announcement));
        let announcementurgencystring = '';
        switch (announcement.urgency){
            case 0:
                announcementurgencystring = "Low";
                break;
            case 1:
                announcementurgencystring = "Medium";
                break;
            case 2:
                announcementurgencystring = "High";
                break;
            default:
                announcementurgencystring = "Error";
                break;

        }

        let announcementDate = new Date(announcement.announcementDate);

        let options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        let formattedDate = announcementDate.toLocaleDateString('en-US', options);

        announcementItem.innerHTML = `
            <td>
                <h4>${announcement.announcementName}:</h4>
                <p>${'Priority: ' + announcementurgencystring}</p>
                <p>${'Sent: ' + formattedDate}</p>
                <p>${'Message: ' + announcement.announcementMessage}</p>
            </td>
        `;
        announcementItem.appendChild(trashIcon);

        announcementBox.appendChild(announcementItem);
    });
}

function deleteAnnouncement(announcement) {
    const data = {
        announcementID: announcement.announcementID,
        announcementDate: announcement.announcementDate,
        announcementMessage: announcement.announcementMessage,
        announcementName: announcement.announcementName
    };

    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    fetch('/shotmaniacs_war/api/announcement', {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(responseData => {
            fetchAllAnnouncements();
        })
        .catch(error => {
            console.error('Error:', error);
            fetchAllAnnouncements();
        });

}

function populateCrewDropdown(crewData) {
    const crewDropdown = document.getElementById('crew-dropdown');

    // Clear the dropdown before repopulating
    crewDropdown.innerHTML = '';

    // Create search input
    const searchBox = document.createElement('input');
    searchBox.setAttribute('type', 'text');
    searchBox.setAttribute('id', 'search-box');
    searchBox.setAttribute('placeholder', 'Search...');
    crewDropdown.appendChild(searchBox);

    // Create "Everyone" option
    const everyoneLabel = document.createElement('label');
    everyoneLabel.innerHTML = `<input type="checkbox" id="everyone-checkbox" value="everyone" checked> Everyone`;
    crewDropdown.appendChild(everyoneLabel);

    // Populate crew members
    crewData.forEach(member => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" class="crew-checkbox" value="${member.memberName}"> ${member.memberName}`;
        crewDropdown.appendChild(label);
    });

    // Filter crew list based on search input
    document.getElementById('search-box').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const crewCheckboxes = crewDropdown.querySelectorAll('.crew-checkbox');

        crewCheckboxes.forEach(checkbox => {
            const memberName = checkbox.value.toLowerCase();
            const label = checkbox.parentElement;
            if (memberName.includes(searchTerm)) {
                label.style.display = 'block';
            } else {
                label.style.display = 'none';
            }
        });
    });

    // Add event listener to handle checkbox clicks
    crewDropdown.addEventListener('click', (event) => {
        if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
            const clickedValue = event.target.value;

            if (clickedValue === 'everyone') {
                // Clicked on "Everyone" deselect all other checkboxes
                const checkboxes = crewDropdown.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (checkbox !== event.target) {
                        checkbox.checked = false;
                    }
                });
            } else {
                // Clicked on a crew member deselect "Everyone"
                const everyoneCheckbox = document.getElementById('everyone-checkbox');
                everyoneCheckbox.checked = false;
            }

            // Check if no crew member is checked then check "Everyone"
            const crewCheckboxes = crewDropdown.querySelectorAll('.crew-checkbox');
            const noCrewChecked = Array.from(crewCheckboxes).every(checkbox => !checkbox.checked);
            if (noCrewChecked) {
                const everyoneCheckbox = document.getElementById('everyone-checkbox');
                everyoneCheckbox.checked = true;
            }
        }
    });

    // Check initial state if no crew member is checked check "Everyone"
    const crewCheckboxes = crewDropdown.querySelectorAll('.crew-checkbox');
    const noCrewChecked = Array.from(crewCheckboxes).every(checkbox => !checkbox.checked);
    if (noCrewChecked) {
        const everyoneCheckbox = document.getElementById('everyone-checkbox');
        everyoneCheckbox.checked = true;
    }
}

// Update the fetchAllCrew function to refresh crew members
function fetchAllCrew() {
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
            populateCrewDropdown(crew); // Update dropdown with fetched crew data
        })
        .catch(error => {
            console.error('Error fetching crew:', error);
        });
}
