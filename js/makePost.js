document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.querySelector("#backButton");

    const profileButton = document.querySelector("#profileButton");
    const profileDropdown = document.querySelector("#profileDropdown");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    const makePostForm = document.querySelector("#makePostForm");

    const titleInput = document.querySelector("#title");
    const contentInput = document.querySelector("#content");
    const imageInput = document.querySelector("#image");

    const postHelper = document.querySelector("#postHelper");
    const fileName = document.querySelector("#fileName");

    const makePostSubmitButton = document.querySelector("#makePostSubmitButton");

    function isValidPost() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        return title.length > 0 && title.length <= 26 && content.length > 0;
    }

    function validatePost(showMessage) {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title.length === 0 || content.length === 0) {
            if (showMessage) {
                postHelper.textContent = "* 제목, 내용을 모두 작성해주세요.";
            }

            return false;
        }

        if (title.length > 26) {
            if (showMessage) {
                postHelper.textContent = "* 제목은 최대 26자까지 작성 가능합니다.";
            }

            return false;
        }

        postHelper.textContent = "";
        return true;
    }

    function updateSubmitButtonState() {
        if (isValidPost()) {
            makePostSubmitButton.classList.add("active");
            makePostSubmitButton.classList.remove("btn-inactive");
        } else {
            makePostSubmitButton.classList.remove("active");
            makePostSubmitButton.classList.add("btn-inactive");
        }
    }

    async function requestCreatePost() {
        const userId = getLoginUserId();

        if (!userId || userId === "undefined") {
            alert("로그인이 필요합니다.");
            location.href = "./login.html";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER-ID": userId
                },
                body: JSON.stringify({
                    title: titleInput.value.trim(),
                    content: contentInput.value.trim(),
                    contentImage: null
                })
            });

            const result = await response.json();

            console.log("게시글 작성 status:", response.status);
            console.log("게시글 작성 응답:", result);

            if (!response.ok) {
                postHelper.textContent = "* 게시글 작성에 실패했습니다.";
                return;
            }

            const postId = result.data.postId;
            location.href = `./post.html?postId=${postId}`;
        } catch (error) {
            console.error(error);
            postHelper.textContent = "* 서버와 연결할 수 없습니다.";
        }
    }
    backButton.addEventListener("click", function () {
        location.href = "posts.html";
    });

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

    titleInput.addEventListener("input", function () {
        validatePost(false);
        updateSubmitButtonState();
    });

    contentInput.addEventListener("input", function () {
        validatePost(false);
        updateSubmitButtonState();
    });

    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];

        if (!file) {
            fileName.textContent = "파일을 선택해주세요.";
            return;
        }

        fileName.textContent = file.name;
    });

    makePostForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (makePostSubmitButton.disabled) {
            return;
        }

        const isPostValid = validatePost(true);

        updateSubmitButtonState();

        if (!isPostValid) {
            return;
        }

        makePostSubmitButton.disabled = true;

        try {
            await requestCreatePost();
        } finally {
            makePostSubmitButton.disabled = false;
            updateSubmitButtonState();
        }
    });
    updateSubmitButtonState();
});