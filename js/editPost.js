document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(location.search);
    const postId = params.get("postId");
    const loginUserId = getLoginUserId();

    let existingContentImage = null;    
    const backButton = document.querySelector("#backButton");
    const profileButton = document.querySelector("#profileButton");
    const profileDropdown = document.querySelector("#profileDropdown");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    const editPostForm = document.querySelector("#editPostForm");

    const titleInput = document.querySelector("#title");
    const contentInput = document.querySelector("#content");
    const imageInput = document.querySelector("#image");

    const titleHelper = document.querySelector("#titleHelper");
    const contentHelper = document.querySelector("#contentHelper");
    const fileName = document.querySelector("#fileName");

    const editPostSubmitButton = document.querySelector("#editPostSubmitButton");

    function validateTitle(showMessage) {
        const title = titleInput.value.trim();

        if (title.length === 0) {
            if (showMessage) {
                titleHelper.textContent = "* 제목을 입력해주세요.";
            }

            return false;
        }

        if (title.length > 26) {
            if (showMessage) {
                titleHelper.textContent = "* 제목은 최대 26자까지 작성 가능합니다.";
            }

            return false;
        }

        titleHelper.textContent = "";
        return true;
    }

    function validateContent(showMessage) {
        const content = contentInput.value.trim();

        if (content.length === 0) {
            if (showMessage) {
                contentHelper.textContent = "* 내용을 입력해주세요.";
            }

            return false;
        }

        contentHelper.textContent = "";
        return true;
    }
    async function requestPostForEdit() {
        if (!postId) {
            alert("게시글 정보가 없습니다.");
            location.href = "./posts.html";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
            const result = await response.json();

            if (!response.ok) {
                alert("게시글을 불러오지 못했습니다.");
                return;
            }

            const post = result.data;

            if (String(post.userId) !== String(loginUserId)) {
                alert("게시글을 수정할 권한이 없습니다.");
                location.href = `./post.html?postId=${postId}`;
                return;
            }

            titleInput.value = post.title;
            contentInput.value = post.content;
            existingContentImage = post.contentImage;

            fileName.textContent =
                existingContentImage || "파일을 선택해주세요.";

            updateSubmitButtonState();
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
        }
    }
    async function requestUpdatePost() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER-ID": loginUserId
                },
                body: JSON.stringify({
                    title: titleInput.value.trim(),
                    content: contentInput.value.trim(),
                    contentImage: existingContentImage
                })
            });

            const result = await response.json();

            console.log("게시글 수정 status:", response.status);
            console.log("게시글 수정 응답:", result);

            if (!response.ok) {
                contentHelper.textContent = "* 게시글 수정에 실패했습니다.";
                return;
            }

            location.href = `./post.html?postId=${postId}`;
        } catch (error) {
            console.error(error);
            contentHelper.textContent = "* 서버와 연결할 수 없습니다.";
        }
    }

    function updateSubmitButtonState() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        const isTitleValid = title.length > 0 && title.length <= 26;
        const isContentValid = content.length > 0;

        if (isTitleValid && isContentValid) {
            editPostSubmitButton.classList.add("active");
            editPostSubmitButton.classList.remove("btn-inactive");
        } else {
            editPostSubmitButton.classList.remove("active");
            editPostSubmitButton.classList.add("btn-inactive");
        }
    }

    backButton.addEventListener("click", function () {
        location.href = `./post.html?postId=${postId}`;
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
        validateTitle(false);
        updateSubmitButtonState();
    });

    contentInput.addEventListener("input", function () {
        validateContent(false);
        updateSubmitButtonState();
    });

    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];

        if (!file) {
            return;
        }

        fileName.textContent = file.name;
    });

    editPostForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const isTitleValid = validateTitle(true);
        const isContentValid = validateContent(true);

        updateSubmitButtonState();

        if (!isTitleValid || !isContentValid) {
            return;
        }

        await requestUpdatePost();
    });

    requestPostForEdit();
    updateSubmitButtonState();
});