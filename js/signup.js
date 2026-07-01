document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector("#signupForm");

    const backButton = document.querySelector("#backButton");
    const loginMoveButton = document.querySelector("#loginMoveButton");

    const profileImageInput = document.querySelector("#profileImageInput");
    const profileImageButton = document.querySelector("#profileImageButton");

    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const passwordCheckInput = document.querySelector("#passwordCheck");
    const nicknameInput = document.querySelector("#nickname");

    const profileHelper = document.querySelector("#profileHelper");
    const emailHelper = document.querySelector("#emailHelper");
    const passwordHelper = document.querySelector("#passwordHelper");
    const passwordCheckHelper = document.querySelector("#passwordCheckHelper");
    const nicknameHelper = document.querySelector("#nicknameHelper");

    const signupButton = document.querySelector("#signupButton");

    let selectedProfileImage = null;

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPassword(password) {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,20}$/;

        return passwordRegex.test(password);
    }

    function isValidNickname(nickname) {
        const nicknameRegex = /^[^\s]{1,10}$/;
        return nicknameRegex.test(nickname);
    }

    function validateProfile(showMessage) {
        if (!selectedProfileImage) {
            if (showMessage) {
                profileHelper.textContent = "* 프로필 사진을 추가해주세요.";
            }
            return false;
        }

        profileHelper.textContent = "";
        return true;
    }

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
                    "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
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
                passwordCheckHelper.textContent = "* 비밀번호가 다릅니다.";
            }
            return false;
        }

        passwordCheckHelper.textContent = "";
        return true;
    }

    function validateNickname(showMessage) {
        const nickname = nicknameInput.value.trim();

        if (nickname.length === 0) {
            if (showMessage) {
                nicknameHelper.textContent = "* 닉네임을 입력해주세요.";
            }
            return false;
        }

        if (nickname.includes(" ")) {
            if (showMessage) {
                nicknameHelper.textContent = "* 띄어쓰기를 없애주세요.";
            }
            return false;
        }

        if (nickname.length > 10) {
            if (showMessage) {
                nicknameHelper.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
            }
            return false;
        }

        if (!isValidNickname(nickname)) {
            if (showMessage) {
                nicknameHelper.textContent = "* 닉네임 형식이 올바르지 않습니다.";
            }
            return false;
        }

        nicknameHelper.textContent = "";
        return true;
    }

    function updateSignupButtonState() {
        const isProfileValid = selectedProfileImage !== null;
        const isEmailValidValue = isValidEmail(emailInput.value.trim());
        const isPasswordValidValue = isValidPassword(passwordInput.value.trim());
        const isPasswordCheckValidValue =
            passwordInput.value.trim() === passwordCheckInput.value.trim()
            && passwordCheckInput.value.trim().length > 0;
        const isNicknameValidValue = isValidNickname(nicknameInput.value.trim());

        if (
            isProfileValid &&
            isEmailValidValue &&
            isPasswordValidValue &&
            isPasswordCheckValidValue &&
            isNicknameValidValue
        ) {
            signupButton.classList.remove("btn-inactive");
            signupButton.classList.add("active");
        } else {
            signupButton.classList.add("btn-inactive");
            signupButton.classList.remove("active");
        }
    }

    async function requestSignup() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const nickname = nicknameInput.value.trim();

        const profileImageName = selectedProfileImage.name;

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    nickname: nickname,
                    profileImage: profileImageName
                })
            });

            const result = await response.json();

            console.log("회원가입 status:", response.status);
            console.log("회원가입 응답:", result);

            if (!response.ok) {
                if (result.message === "duplicated_email") {
                    emailHelper.textContent = "* 중복된 이메일입니다.";
                    return;
                }

                if (result.message === "duplicated_nickname") {
                    nicknameHelper.textContent = "* 중복된 닉네임입니다.";
                    return;
                }

                profileHelper.textContent = "* 회원가입에 실패했습니다.";
                return;
            }

            location.href = "./login.html";
        } catch (error) {
            console.error(error);
            profileHelper.textContent = "* 서버와 연결할 수 없습니다.";
        }
    }

    profileImageButton.addEventListener("click", function () {
        profileImageInput.click();
    });

    profileImageInput.addEventListener("change", function () {
        const file = profileImageInput.files[0];

        if (!file) {
            selectedProfileImage = null;
            profileImageButton.innerHTML = "+";
            updateSignupButtonState();
            return;
        }

        selectedProfileImage = file;

        const imageUrl = URL.createObjectURL(file);

        profileImageButton.innerHTML = `
            <img src="${imageUrl}" alt="프로필 이미지" class="profile-preview">
        `;

        profileHelper.textContent = "";
        updateSignupButtonState();
    });

    emailInput.addEventListener("input", function () {
        validateEmail(false);
        updateSignupButtonState();
    });

    passwordInput.addEventListener("input", function () {
        validatePassword(false);
        validatePasswordCheck(false);
        updateSignupButtonState();
    });

    passwordCheckInput.addEventListener("input", function () {
        validatePasswordCheck(false);
        updateSignupButtonState();
    });

    nicknameInput.addEventListener("input", function () {
        validateNickname(false);
        updateSignupButtonState();
    });

    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const isProfileValid = validateProfile(true);
        const isEmailValidValue = validateEmail(true);
        const isPasswordValidValue = validatePassword(true);
        const isPasswordCheckValidValue = validatePasswordCheck(true);
        const isNicknameValidValue = validateNickname(true);

        updateSignupButtonState();

        if (
            !isProfileValid ||
            !isEmailValidValue ||
            !isPasswordValidValue ||
            !isPasswordCheckValidValue ||
            !isNicknameValidValue
        ) {
            return;
        }

        await requestSignup();
    });

    backButton.addEventListener("click", function () {
        location.href = "./login.html";
    });

    loginMoveButton.addEventListener("click", function () {
        location.href = "./login.html";
    });

    updateSignupButtonState();
});