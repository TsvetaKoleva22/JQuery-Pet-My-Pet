let auth = (() => {
    function saveSession(userInfo) {
        sessionStorage.setItem('authtoken', userInfo._kmd.authtoken);
        sessionStorage.setItem('userId', userInfo._id);
        sessionStorage.setItem('username', userInfo.username);
    }

    // user/register
    function register(username, password) {
        let userData = {
            username,
            password
        };
        return requester.post('user', '', 'basic', userData);
    }

    // user/login
    function login(username, password) {
        let userData = {
            username,
            password
        };
        return requester.post('user', 'login', 'basic', userData);
    }

    // user/logout
    function logout() {
        return requester.post('user', '_logout', 'kinvey');
    }

    return {
        register,
        login,
        logout,
        saveSession,
    }
})();