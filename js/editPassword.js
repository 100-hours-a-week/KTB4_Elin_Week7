document.addEventListener("DOMContentLoaded", function () {
    const userId = getLoginUserId();
    const profileButton = document.querySelector("#profileButton");
    const profileDropdown = document.querySelector("#profileDropdown");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    const editPasswordForm = document.querySelector("#editPasswordForm");

    const passwordInput = document.querySelector("#password");
    const passwordCheckInput = document.querySelector("#passwordCheck");

    const passwordHelper = document.querySelector("#passwordHelper");
    const passwordCheckHelper = document.querySelector("#passwordCheckHelper");

    const editPasswordButton = document.querySelector("#editPasswordButton");
    const editPasswordToast = document.querySelector("#editPasswordToast");

    function isValidPassword(password) {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,20}$/;

        return passwordRegex.test(password);
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
                    "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            }
            return false;
        }

        passwordHelper.textContent = "";
        return true;
    }

    function validatePasswordCheck(showMessage) {
        const password = passwordInput.value.trim();
        const passwordCheck = passwordCheckInput.value.trim();

        if (passwordCheck.length === 0) {
            if (showMessage) {
                passwordCheckHelper.textContent = "* 비밀번호를 한번 더 입력해주세요.";
            }
            return false;
        }

        if (password !== passwordCheck) {
            if (showMessage) {
                passwordCheckHelper.textContent = "* 비밀번호와 다릅니다.";
            }
            return false;
        }

        passwordCheckHelper.textContent = "";
        return true;
    }

    async function requestUpdatePassword() {
        if (!userId) {
            alert("로그인이 필요합니다.");
            location.href = "./login.html";
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER-ID": userId
                },
                body: JSON.stringify({
                    password: passwordInput.value.trim()
                })
            });

            const result = await response.json();

            console.log("비밀번호 수정 status:", response.status);
            console.log("비밀번호 수정 응답:", result);

            if (!response.ok) {
                passwordHelper.textContent = "* 비밀번호 수정에 실패했습니다.";
                return false;
            }

            return true;
        } catch (error) {
            console.error(error);
            passwordHelper.textContent = "* 서버와 연결할 수 없습니다.";
            return false;
        }
    }

    function updateEditPasswordButtonState() {
        const password = passwordInput.value.trim();
        const passwordCheck = passwordCheckInput.value.trim();

        const isPasswordValid = isValidPassword(password);
        const isPasswordCheckValid =
            passwordCheck.length > 0 && password === passwordCheck;

        if (isPasswordValid && isPasswordCheckValid) {
            editPasswordButton.classList.remove("btn-inactive");
            editPasswordButton.classList.add("active");
        } else {
            editPasswordButton.classList.add("btn-inactive");
            editPasswordButton.classList.remove("active");
        }
    }

    profileButton.addEventListener("click", function (event) {
        event.stopPropagation();
        profileDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function () {
        profileDropdown.classList.remove("show");
    });

    dropdownLinks.forEach(function (button) {
        button.addEventListener("click", function () {
            const link = button.dataset.link;
            location.href = link;
        });
    });

    passwordInput.addEventListener("input", function () {
        validatePassword(false);
        validatePasswordCheck(false);
        updateEditPasswordButtonState();
    });

    passwordCheckInput.addEventListener("input", function () {
        validatePasswordCheck(false);
        updateEditPasswordButtonState();
    });

    editPasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const isPasswordValid = validatePassword(true);
        const isPasswordCheckValid = validatePasswordCheck(true);

        updateEditPasswordButtonState();

        const success = await requestUpdatePassword();

        if (!success) {
            return;
        }

        editPasswordToast.classList.add("show");

        setTimeout(function () {
            editPasswordToast.classList.remove("show");
        }, 3000);
    });

    updateEditPasswordButtonState();
});