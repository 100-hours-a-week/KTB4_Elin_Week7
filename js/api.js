window.API_BASE_URL = "http://localhost:8080";

window.saveLoginUserId = function (userId) {
    localStorage.setItem("userId", userId);
};

window.getLoginUserId = function () {
    return localStorage.getItem("userId");
};

window.removeLoginUserId = function () {
    localStorage.removeItem("userId");
};

window.isLoggedIn = function () {
    return getLoginUserId() !== null;
};
