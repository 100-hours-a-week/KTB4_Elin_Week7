document.addEventListener("DOMContentLoaded", function () {
    const userId = getLoginUserId();
    const emailText = document.querySelector("#emailText");
    const profileImage = document.querySelector("#profileImage");
    let currentProfileImage = null;

    const profileButton = document.querySelector("#profileButton");
    const profileDropdown = document.querySelector("#profileDropdown");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    const editProfileForm = document.querySelector("#editProfileForm");
    const nicknameInput = document.querySelector("#nickname");
    const nicknameHelper = document.querySelector("#nicknameHelper");
    const editProfileButton = document.querySelector("#editProfileButton");
    const editProfileToast = document.querySelector("#editProfileToast");

    const withdrawButton = document.querySelector("#withdrawButton");
    const withdrawModal = document.querySelector("#withdrawModal");
    const withdrawCancelButton = document.querySelector("#withdrawCancelButton");
    const withdrawConfirmButton = document.querySelector("#withdrawConfirmButton");

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

        nicknameHelper.textContent = "";
        return true;
    }

    async function requestProfile() {
        if (!userId) {
            alert("로그인이 필요합니다.");
            location.href = "./login.html";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    "X-USER-ID": userId
                }
            });

            const result = await response.json();

            if (!response.ok) {
                alert("회원정보를 불러오지 못했습니다.");
                return;
            }

            const profile = result.data;

            emailText.textContent = profile.email;
            nicknameInput.value = profile.nickname;
            currentProfileImage = profile.profileImage;

            if (currentProfileImage) {
                profileImage.src = currentProfileImage;
            }

            updateEditButtonState();
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
        }
    }

    async function requestUpdateProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER-ID": userId
                },
                body: JSON.stringify({
                    nickname: nicknameInput.value.trim(),
                    profileImage: currentProfileImage
                })
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.message === "duplicated_nickname") {
                    nicknameHelper.textContent = "* 중복된 닉네임입니다.";
                    return false;
                }

                nicknameHelper.textContent = "* 회원정보 수정에 실패했습니다.";
                return false;
            }

            return true;
        } catch (error) {
            console.error(error);
            nicknameHelper.textContent = "* 서버와 연결할 수 없습니다.";
            return false;
        }
    }

    async function requestDeleteUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: "DELETE",
                headers: {
                    "X-USER-ID": userId
                }
            });

            console.log("회원 탈퇴 status:", response.status);

            if (response.status !== 204) {
                alert("회원 탈퇴에 실패했습니다.");
                return;
            }

            removeLoginUserId();
            alert("회원 탈퇴가 완료되었습니다.");
            location.href = "./login.html";
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
        }
    }

    function updateEditButtonState() {
        const nickname = nicknameInput.value.trim();

        if (isValidNickname(nickname)) {
            editProfileButton.classList.remove("btn-inactive");
            editProfileButton.classList.add("active");
        } else {
            editProfileButton.classList.add("btn-inactive");
            editProfileButton.classList.remove("active");
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

    nicknameInput.addEventListener("input", function () {
        validateNickname(false);
        updateEditButtonState();
    });

    editProfileForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const isNicknameValid = validateNickname(true);

        updateEditButtonState();

        if (!isNicknameValid) {
            return;
        }
        const success = await requestUpdateProfile();

        if (!success) {
            return;
        }
        editProfileToast.classList.add("show");

        setTimeout(function () {
            editProfileToast.classList.remove("show");
        }, 3000);
    });

    withdrawButton.addEventListener("click", function () {
        withdrawModal.classList.add("show");
    });

    withdrawCancelButton.addEventListener("click", function () {
        withdrawModal.classList.remove("show");
    });

    withdrawConfirmButton.addEventListener("click", async function () {
        await requestDeleteUser();
    });

    requestProfile();
    updateEditButtonState();

});