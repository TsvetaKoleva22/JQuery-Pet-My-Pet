function startApp() {
    showView('basic');
    attachAllEvents();

    function showView(viewName) {
        $('#container section').hide();// Hide all views
        $('.' + viewName).show(); // Show the selected view only
        $('#site-footer').show();
        if(sessionStorage.getItem('authtoken') === null){
            $('.navbar-anonymous').show();
        } else{
            $('.navbar-dashboard').show();
            $('#welcomeLi').text(`Welcome, ${sessionStorage.getItem('username')}!`);
        }
    }
    
    function attachAllEvents() {
        // Bind the navigation menu links
        $('#registerLink').on('click', function () {
            showView('register');
        });
        $('#loginLink').on('click', function () {
            showView('login');
        });
        $('#logoutLink').on('click', logoutUser);
        $('#dashboardLink').on('click', showAllListings);

        $('#addPetLink').on('click', function () {
            showView('create');
        });
        $('#myPetsLink').on('click', showMyListings);


        //CATEGORIES dashboard links:
        $('#dashAll').on('click', showAllListings);
        $('#dashCats').on('click', function () {
            showCategory('Cat');
        });
        $('#dashDogs').on('click', function () {
            showCategory('Dog');
        });
        $('#dashParrots').on('click', function () {
            showCategory('Parrot');
        });
        $('#dashReptiles').on('click', function () {
            showCategory('Reptile');
        });
        $('#dashOther').on('click', function () {
            showCategory('Other');
        });

        // Bind the form submit buttons
        $("#loginForm").on('submit', loginUser);
        $("#registerForm").on('submit', registerUser);
        $("#createForm").on('submit', createListing);
        $("form").on('submit', function(event) { event.preventDefault() })
    }

    function registerUser() {
        let username = $('#registerForm input[name="username"]').val();
        let password = $('#registerForm input[name="password"]').val();

        if(username.length >= 3 && password.length >= 6){
            auth.register(username, password)
                .then(function (response) {
                    $('#registerForm').trigger('reset');
                    auth.saveSession(response);
                    showView('basic');
                    notify.showInfo('User registration successful.')
                }).catch(function (err) {
                notify.handleError(err)
            });
        } else{
            if(username.length < 3){
                notify.showError('Username must be at least 3 symbols');
            }
            if(password.length < 6){
                notify.showError('Password must be at least 6 symbols');
            }
        }
    }

    function loginUser() {
        let username = $('#loginForm input[name="username"]').val();
        let password = $('#loginForm input[name="password"]').val();

        if(username.length >= 3 && password.length >= 6){
            auth.login(username, password)
                .then(function (response) {
                    $('#loginForm').trigger('reset');
                    auth.saveSession(response);
                    showView('basic');
                    notify.showInfo('Login successful.');
                }).catch(function (err) {
                notify.handleError(err)
            });
        } else{
            if(username.length < 3){
                notify.showError('Username must be at least 3 symbols');
            }
            if(password.length < 6){
                notify.showError('Password must be at least 6 symbols');
            }
        }
    }
    function logoutUser() {
        auth.logout()
            .then(function () {
                sessionStorage.clear();
                showView('basic');
                notify.showInfo('Logout successful.');
            }).catch(function (err) {
            notify.handleError(err)
        });
    }

    function showAllListings() {
        $.ajax({
            method: 'GET',
            url: 'https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets?query={}&sort={"likes": -1}',
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')}
        }).then(function (arr) {
            arr = arr.sort((a,b) => Number(b.likes) - Number(a.likes));
            $('#dashContainer').empty();
            for(let i = 0; i< arr.length; i++){
                let currPet = arr[i];
                if(currPet._acl.creator !== sessionStorage.getItem('userId')){
                    let mainLi = $('<li class="otherPet"></li>');
                    let hName = $(`<h3>Name: ${currPet.name}</h3>`);
                    mainLi.append(hName);
                    let pCategory = $(`<p>Category: ${currPet.category}</p>`);
                    mainLi.append(pCategory);
                    let pImage = $(` <p class="img"><img src="${currPet.imageURL}"></p>`);
                    mainLi.append(pImage);
                    let pDescr = $(`<p class="description">${currPet.description}</p>`);
                    mainLi.append(pDescr);
                    let divInfo = $('<div class="pet-info"></div>');
                    let likeLinkDashboard = $('<a href="#"><button class="button"><i class="fas fa-heart"></i> Pet</button></a>')
                    likeLinkDashboard.on('click', function () {
                        likePet(currPet);
                    });
                    divInfo.append(likeLinkDashboard);
                    let detailsLinkDashboard = $('<a href="#"><button class="button">Details</button></a>')
                    detailsLinkDashboard.on('click', function () {
                        showDetails(currPet);
                    });
                    divInfo.append(detailsLinkDashboard);
                    divInfo.append($(`<i class="fas fa-heart"></i> <span> ${currPet.likes}</span>`));

                    mainLi.append(divInfo);
                    $('#dashContainer').append(mainLi);
                }
            }
            showView('dashboard');
        }).catch(function (err) {
            notify.handleError(err)
        })
    }


    function showCategory(category) {
        $.ajax({
            method: 'GET',
            url: ' https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets?query={}&sort={"likes": -1}',
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')}
        }).then(function (arr) {
            arr = arr.sort((a,b) => Number(b.likes) - Number(a.likes));
            $('#dashContainer').empty();
            for(let i = 0; i< arr.length; i++){
                let currPet = arr[i];
                if(currPet._acl.creator !== sessionStorage.getItem('userId') &&
                currPet.category === category){
                    let mainLi = $('<li class="otherPet"></li>');
                    let hName = $(`<h3>Name: ${currPet.name}</h3>`);
                    mainLi.append(hName);
                    let pCategory = $(`<p>Category: ${currPet.category}</p>`);
                    mainLi.append(pCategory);
                    let pImage = $(` <p class="img"><img src="${currPet.imageURL}"></p>`);
                    mainLi.append(pImage);
                    let pDescr = $(`<p class="description">${currPet.description}</p>`);
                    mainLi.append(pDescr);
                    let divInfo = $('<div class="pet-info"></div>');
                    let likeLinkDashboard = $('<a href="#"><button class="button"><i class="fas fa-heart"></i> Pet</button></a>')
                    likeLinkDashboard.on('click', function () {
                        likePetInCategory(currPet);
                    });
                    divInfo.append(likeLinkDashboard);
                    let detailsLinkDashboard = $('<a href="#"><button class="button">Details</button></a>')
                    detailsLinkDashboard.on('click', function () {
                        showDetails(currPet);
                    });
                    divInfo.append(detailsLinkDashboard);
                    divInfo.append($(`<i class="fas fa-heart"></i> <span> ${currPet.likes}</span>`));

                    mainLi.append(divInfo);
                    $('#dashContainer').append(mainLi);
                }
            }
            showView('dashboard');
        }).catch(function (err) {
            notify.handleError(err)
        })
    }

    function createListing() {
        let name = $('#createForm input[name="name"]').val();
        let description = $('#createForm textarea[name="description"]').val();
        let imageURL = $('#createForm input[name="imageURL"]').val();
        let likes = 0;
        let category = $('#category option:selected').val();

        let dataPet = {name, description, imageURL, likes, category};

        $.ajax({
            method: 'POST',
            url: 'https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets',
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')},
            data: dataPet
        }).then(function () {
            $('#createForm').trigger('reset');
            showView('basic');
            notify.showInfo('Pet created.');
        }).catch(notify.handleError);
    }


    function showMyListings() {
        let userId = sessionStorage.getItem('userId');
        $.ajax({
            method: 'GET',
            url: `https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets?query={"_acl.creator":"${userId}"}`,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')}
        }).then(function (arr) {
            console.log(arr);
            $('#myPetsContainer').empty();
            for(let i = 0; i< arr.length; i++){
                let currPet = arr[i];
                let mainSec = $('<section class="myPet"></section>');
                let hName = $(`<h3>Name: ${currPet.name}</h3>`);
                mainSec.append(hName);
                let pCategory = $(`<p>Category: ${currPet.category}</p>`);
                mainSec.append(pCategory);
                let pImage = $(` <p class="img"><img src="${currPet.imageURL}"></p>`);
                mainSec.append(pImage);
                let pDescr = $(`<p class="description">${currPet.description}</p>`);
                mainSec.append(pDescr);
                let divInfo = $('<div class="pet-info"></div>');
                let editLink = $('<a href="#"><button class="button">Edit</button></a>');
                editLink.on('click', function () {
                    loadPetForEdit(currPet);
                });
                divInfo.append(editLink);
                let delLink = $('<a href="#"><button class="button">Delete</button></a>')
                delLink.on('click', function () {
                    showPetForDelete(currPet);
                });
                divInfo.append(delLink);
                divInfo.append($(`<i class="fas fa-heart"></i> <span> ${currPet.likes}</span>`));
                mainSec.append(divInfo);
                $('#myPetsContainer').append(mainSec);

            }
            showView('my-pets');
            $('#myPetsContainer .myPet').show();
        }).catch(function (err) {
            notify.handleError(err)
        });
    }

    function showPetForDelete(currPet) {
        let id = currPet._id;
        let container = $('.deletePet');
        $(container).empty();
        let hName = $(`<h3>${currPet.name}</h3>`);
        $(container).append(hName);
        let pCounter = $(`<p>Pet counter: <i class="fas fa-heart"></i> ${currPet.likes}</p>`);
        $(container).append(pCounter);
        let pImage = $(`<p class="img"><img src="${currPet.imageURL}"></p>`);
        $(container).append(pImage);

        let form = $(`<form action="#" method="POST" id="deleteForm"></form>`);
        $(form).append($(`<p class="description">${currPet.description}</p>`));
        let butt = $('<button class="button">Delete</button>');
        butt.on('click', function () {
            realDelFunc(id)
        });
        $(form).append(butt);
        $(container).append(form);
        $("#deleteForm").on('submit', function(event) { event.preventDefault() })
        showView('deletePet');
    }
    function realDelFunc(petId) {
        $.ajax({
            method: 'DELETE',
            url: `https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets/${petId}`,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')}
        }).then(function () {
            showAllListings();
            notify.showInfo('Pet removed successfully!');
        }).catch(notify.handleError);
    }


    function loadPetForEdit(currPet) {
        let id = currPet._id;
        let container = $('.detailsMyPet');
        $(container).empty();

        let hName = $(`<h3>${currPet.name}</h3>`);
        $(container).append(hName);
        let pCounter = $(`<p>Pet counter: <i class="fas fa-heart"></i> ${currPet.likes}</p>`);
        $(container).append(pCounter);
        let pImage = $(`<p class="img"><img src="${currPet.imageURL}"></p>`);
        $(container).append(pImage);

        let form = $(`<form action="#" method="POST" id="editForm"></form>`);
        $(form).append($(`<textarea type="text" name="description">${currPet.description}</textarea>`));
        let butt = $('<button class="button"> Save</button>');
        butt.on('click', function () {
            realEditFunc(currPet)
        });
        $(form).append(butt);
        $(container).append(form);
        $("#editForm").on('submit', function(event) { event.preventDefault() });

        showView('detailsMyPet');
    }
    function realEditFunc(currPet) {
        let petId = currPet._id;
        let name = currPet.name;
        let imageURL = currPet.imageURL;
        let description = $('#editForm textarea[name="description"]').val();
        let category = currPet.category;
        let likes = currPet.likes;

        let dataEdit = {name, description, imageURL, category, likes};

        $.ajax({
            method: 'PUT',
            url: `https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets/${petId}`,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')},
            data: dataEdit
        }).then(function () {
            showAllListings();
            notify.showInfo(`Updated successfully!`);
        }).catch(notify.handleError);
    }
    

    function showDetails(currPet){
        let container = $('.detailsOtherPet');
        $(container).empty();

        let hName = $(`<h3>${currPet.name}</h3>`);
        $(container).append(hName);

        let pCounter = $(`<p>Pet counter: ${currPet.likes}</p>`);
        let aEl = $('<a href="#"></a>');

        let butt = $('<button class="button"><i class="fas fa-heart"></i> Pet</button>');
        butt.on('click', function () {
            likePetInDetails(currPet);
        });

        aEl.append(butt);
        $(pCounter).append(aEl);
        $(container).append(pCounter);

        let pImage = $(`<p class="img"><img src="${currPet.imageURL}"></p>`);
        $(container).append(pImage);
        let pDesc = $(`<p class="description">${currPet.description}</p>`);
        $(container).append(pDesc);

        showView('detailsOtherPet');
    }

    function likePet(currPet) {
        let petId = currPet._id;
        let name = currPet.name;
        let description = currPet.description;
        let imageURL = currPet.imageURL;
        let category = currPet.category;
        let likes = Number(currPet.likes) + 1;

        let dataEdit = {name, description, imageURL, category, likes};

        $.ajax({
            method: 'PUT',
            url: `https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets/${petId}`,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')},
            data: dataEdit
        }).then(function () {
            showAllListings();
        }).catch(notify.handleError);
    }

    function likePetInDetails(currPet) {
        let petId = currPet._id;
        let name = currPet.name;
        let description = currPet.description;
        let imageURL = currPet.imageURL;
        let category = currPet.category;
        let likes = Number(currPet.likes) + 1;

        let dataEdit = {name, description, imageURL, category, likes};

        $.ajax({
            method: 'PUT',
            url: `https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets/${petId}`,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')},
            data: dataEdit
        }).then(function (response) {
            showDetails(response);
        }).catch(notify.handleError);
    }

    function likePetInCategory(currPet) {
        let petId = currPet._id;
        let name = currPet.name;
        let description = currPet.description;
        let imageURL = currPet.imageURL;
        let category = currPet.category;
        let likes = Number(currPet.likes) + 1;

        let dataEdit = {name, description, imageURL, category, likes};

        $.ajax({
            method: 'PUT',
            url: `https://baas.kinvey.com/appdata/kid_SkyD6RmxV/pets/${petId}`,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authtoken')},
            data: dataEdit
        }).then(function (response) {
            let category = response.category;
            showCategory(category);
        }).catch(notify.handleError);
    }
}
