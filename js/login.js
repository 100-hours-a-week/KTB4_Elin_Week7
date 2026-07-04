document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("#loginForm");

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    const emailHelper = document.querySelector("#emailHelper");
    const passwordHelper = document.querySelector("#passwordHelper");

    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");


    function validateEmail(showMessage) {
        const email = emailInput.value.trim();

        if (email.length === 0) {
            if (showMessage) {
                emailHelper.textContent = "* 이메일을 입력해주세요.";
            }
            return false;
        }

        if (!isValidEmail(email)) {
            if (showMessage) {
                emailHelper.textContent =
                    "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
            }
            return false;
        }

        emailHelper.textContent = "";
        return true;
    }

    function validatePassword(showMessage) {
        const password = passwordInput.value.trim();

        if (password.length === 0) {
            if (showMessage) {
                passwordHelper.textContent = "* 비밀번호를 입력해주세요.";
            }
            return false;
        }

        if (!isValidPassword(password)) {
            if (showMessage) {
                passwordHelper.textContent =
                    "* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            }
            return false;
        }

        passwordHelper.textContent = "";
        return true;
    }

    function updateLoginButtonState() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const isEmailValid = isValidEmail(email);
        const isPasswordValid = isValidPassword(password);

        if (isEmailValid && isPasswordValid) {
            loginButton.classList.remove("btn-inactive");
            loginButton.classList.add("active");
        } else {
            loginButton.classList.add("btn-inactive");
            loginButton.classList.remove("active");
        }
    }

    async function requestLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch(`${API_BASE_URL}/users/sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            console.log("로그인 status:", response.status);
            console.log("로그인 응답:", result);
            
            if (!response.ok) {
                passwordHelper.textContent = "* 이메일 또는 비밀번호가 올바르지 않습니다.";
                return;
            }

            const userId = result.data.userId;

            saveLoginUserId(userId);

            console.log("저장된 userId:", getLoginUserId());

            location.href = "./posts.html";
        } catch (error) {
            console.error(error);
            passwordHelper.textContent = "* 서버와 연결할 수 없습니다.";
        }
    }

    emailInput.addEventListener("input", function () {
        validateEmail(false);
        updateLoginButtonState();
    });

    passwordInput.addEventListener("input", function () {
        validatePassword(false);
        updateLoginButtonState();
    });

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const isEmailValid = validateEmail(true);
        const isPasswordValid = validatePassword(true);

        updateLoginButtonState();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        await requestLogin();
    });

    signupButton.addEventListener("click", function () {
        location.href = "./signup.html";
    });

    updateLoginButtonState();
});