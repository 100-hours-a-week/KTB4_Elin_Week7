document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(location.search);
    const postId = params.get("postId");
    const loginUserId = getLoginUserId();

    const backButton = document.querySelector("#backButton");

    const profileButton = document.querySelector("#profileButton");
    const profileDropdown = document.querySelector("#profileDropdown");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    const editPostButton = document.querySelector("#editPostButton");
    const postDeleteButton = document.querySelector("#postDeleteButton");
    const postDeleteModal = document.querySelector("#postDeleteModal");
    const postDeleteCancelButton = document.querySelector("#postDeleteCancelButton");
    const postDeleteConfirmButton = document.querySelector("#postDeleteConfirmButton");

    const likeButton = document.querySelector("#likeButton");
    const likeCount = document.querySelector("#likeCount");
    const detailCounts = document.querySelectorAll(".detail-count");

    const commentInput = document.querySelector("#commentInput");
    const commentSubmitButton = document.querySelector("#commentSubmitButton");
    const commentList = document.querySelector("#commentList");
    const commentCount = document.querySelector("#commentCount");

    const commentDeleteModal = document.querySelector("#commentDeleteModal");
    const commentDeleteCancelButton = document.querySelector("#commentDeleteCancelButton");
    const commentDeleteConfirmButton = document.querySelector("#commentDeleteConfirmButton");

    const postTitle = document.querySelector("#postTitle");
    const postAuthor = document.querySelector("#postAuthor");
    const postCreatedAt = document.querySelector("#postCreatedAt");
    const postViewCount = document.querySelector("#postViewCount");
    const postContent = document.querySelector("#postContent");
    const postImage = document.querySelector("#postImage");

    let isLiked = false;
    let selectedComment = null;
    let editingComment = null;

    function formatCount(count) {
        if (count >= 100000) {
            return "100k";
        }

        if (count >= 10000) {
            return "10k";
        }

        if (count >= 1000) {
            return "1k";
        }

        return count;
    }

    function renderPost(post) {
        postTitle.textContent = post.title;
        postAuthor.textContent = post.nickname;
        postCreatedAt.textContent = post.createdAt;
        postContent.textContent = post.content;

        postViewCount.dataset.count = post.viewCount ?? 0;
        postViewCount.textContent = formatCount(Number(postViewCount.dataset.count));

        likeCount.dataset.count = post.likeCount ?? 0;
        likeCount.textContent = formatCount(Number(likeCount.dataset.count));

        commentCount.dataset.count = post.commentCount ?? 0;
        commentCount.textContent = formatCount(Number(commentCount.dataset.count));

        const contentImage = post.contentImage;

        if (
            contentImage &&
            contentImage !== "null" &&
            contentImage !== "undefined"
        ) {
            postImage.src = contentImage;
            postImage.style.display = "block";
        } else {
            postImage.removeAttribute("src");
            postImage.style.display = "none";
        }
    }
    async function requestPost() {
        try {

            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "GET"
            });

            const result = await response.json();

            console.log("게시글 status:", response.status);
            console.log("게시글 응답:", result);

            if (!response.ok) {
                alert("게시글을 불러오지 못했습니다.");
                return;
            }

            const post = result.data;

            renderPost(post);

        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
        }
    }
    
    async function requestDeletePost() {
        if (!loginUserId || loginUserId === "undefined") {
            alert("로그인이 필요합니다.");
            location.href = "./login.html";
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "X-USER-ID": loginUserId
                }
            });

            console.log("게시글 삭제 status:", response.status);

            if (response.status === 204) {
                alert("게시글이 삭제되었습니다.");
                location.href = "posts.html";
                return;
            }

            if (response.status === 403) {
                alert("게시글을 삭제할 권한이 없습니다.");
                return;
            }

            if (response.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                return;
            }

            alert("게시글 삭제에 실패했습니다.");
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
        }
    }

    
    function prepareCounts() {
        const likeNumber = Number(likeCount.dataset.count);
        likeCount.textContent = formatCount(likeNumber);

        detailCounts.forEach(function (countElement) {
            const count = Number(countElement.dataset.count);
            countElement.textContent = formatCount(count);
        });

        updateCommentCount();
    }

    function updateCommentSubmitButtonState() {
        const comment = commentInput.value.trim();

        if (comment.length > 0) {
            commentSubmitButton.classList.add("active");
        } else {
            commentSubmitButton.classList.remove("active");
        }
    }

    function updateCommentCount() {
        const comments = document.querySelectorAll(".comment-item");
        const count = comments.length;

        commentCount.dataset.count = count;
        commentCount.textContent = formatCount(count);
    }
    function createCommentItem(comment) {
        const article = document.createElement("article");
        article.className = "comment-item";
        article.dataset.commentId = comment.commentId;

        const isAuthor =
            loginUserId !== null &&
            String(comment.userId) === String(loginUserId);

        article.innerHTML = `
            <div class="comment-top">
                <div class="detail-author-info">
                    <div class="author-image"></div>
                    <span class="author-name"></span>
                    <span class="detail-date"></span>
                </div>

                <div class="detail-button-group">
                    <button type="button"
                            class="small-outline-button comment-edit-button">
                        수정
                    </button>
                    <button type="button"
                            class="small-outline-button comment-delete-button">
                        삭제
                    </button>
                </div>
            </div>

            <p class="comment-text"></p>
        `;

        article.querySelector(".author-name").textContent =
            comment.nickname || "알 수 없음";

        article.querySelector(".comment-text").textContent =
            comment.content;

        if (!isAuthor) {
            article.querySelector(".detail-button-group").remove();
        }

        return article;
    }
    async function requestComments() {
        try {
            const response = await fetch(
                `${API_BASE_URL}/posts/${postId}/comments`
            );

            const result = await response.json();

            console.log("댓글 목록 status:", response.status);
            console.log("댓글 목록 응답:", result);

            if (!response.ok) {
                alert("댓글을 불러오지 못했습니다.");
                return;
            }

            commentList.innerHTML = "";

            result.data.forEach(function (comment) {
                commentList.appendChild(createCommentItem(comment));
            });

            updateCommentCount();
        } catch (error) {
            console.error(error);
            alert("댓글을 불러오지 못했습니다.");
        }
    }

    async function requestCreateComment(content) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/posts/${postId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-USER-ID": loginUserId
                    },
                    body: JSON.stringify({
                        content: content
                    })
                }
            );

            const result = await response.json();

            console.log("댓글 등록 status:", response.status);
            console.log("댓글 등록 응답:", result);

            if (!response.ok) {
                alert("댓글 등록에 실패했습니다.");
                return false;
            }

            commentList.appendChild(createCommentItem(result.data));
            updateCommentCount();

            return true;
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
            return false;
        }
    }
    async function requestUpdateComment(commentItem, content) {
        const commentId = commentItem.dataset.commentId;

        try {
            const response = await fetch(
                `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-USER-ID": loginUserId
                    },
                    body: JSON.stringify({
                        content: content
                    })
                }
            );

            const result = await response.json();

            console.log("댓글 수정 status:", response.status);
            console.log("댓글 수정 응답:", result);

            if (!response.ok) {
                alert("댓글 수정에 실패했습니다.");
                return false;
            }

            commentItem.querySelector(".comment-text").textContent =
                result.data.content;

            return true;
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
            return false;
        }
    }

    async function requestDeleteComment(commentItem) {
        const commentId = commentItem.dataset.commentId;

        try {
            const response = await fetch(
                `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "X-USER-ID": loginUserId
                    }
                }
            );

            console.log("댓글 삭제 status:", response.status);

            if (response.status === 204) {
                commentItem.remove();
                updateCommentCount();
                return true;
            }

            if (response.status === 403) {
                alert("댓글을 삭제할 권한이 없습니다.");
                return false;
            }

            if (response.status === 404) {
                alert("댓글을 찾을 수 없습니다.");
                return false;
            }

            alert("댓글 삭제에 실패했습니다.");
            return false;
        } catch (error) {
            console.error(error);
            alert("서버와 연결할 수 없습니다.");
            return false;
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

    editPostButton.addEventListener("click", function () {

        location.href = `editPost.html?postId=${postId}`;
    });

    postDeleteButton.addEventListener("click", function () {
        postDeleteModal.classList.add("show");
    });

    postDeleteCancelButton.addEventListener("click", function () {
        postDeleteModal.classList.remove("show");
    });

    postDeleteConfirmButton.addEventListener("click", function () {
        requestDeletePost();
    });

    likeButton.addEventListener("click", function () {
        let count = Number(likeCount.dataset.count);

        if (isLiked) {
            count -= 1;
            isLiked = false;
            likeButton.classList.remove("active");
        } else {
            count += 1;
            isLiked = true;
            likeButton.classList.add("active");
        }

        likeCount.dataset.count = count;
        likeCount.textContent = formatCount(count);
    });

    commentInput.addEventListener("input", function () {
        updateCommentSubmitButtonState();
    });

    commentSubmitButton.addEventListener("click", async function () {
        const content = commentInput.value.trim();

        if (content.length === 0) {
            return;
        }

        let success;

        if (editingComment) {
            success = await requestUpdateComment(editingComment, content);

            if (success) {
                editingComment = null;
                commentSubmitButton.textContent = "댓글 등록";
            }
        } else {
            success = await requestCreateComment(content);
        }

        if (!success) {
            return;
        }

        commentInput.value = "";
        updateCommentSubmitButtonState();
    });


    commentList.addEventListener("click", function (event) {
        const editButton = event.target.closest(".comment-edit-button");
        const deleteButton = event.target.closest(".comment-delete-button");

        if (editButton) {
            const commentItem = editButton.closest(".comment-item");
            const commentText = commentItem.querySelector(".comment-text");

            commentInput.value = commentText.textContent;
            editingComment = commentItem;
            commentSubmitButton.textContent = "댓글 수정";

            updateCommentSubmitButtonState();

            return;
        }

        if (deleteButton) {
            selectedComment = deleteButton.closest(".comment-item");
            commentDeleteModal.classList.add("show");
        }
    });

    commentDeleteCancelButton.addEventListener("click", function () {
        commentDeleteModal.classList.remove("show");
        selectedComment = null;
    });

    commentDeleteConfirmButton.addEventListener("click", async function () {
        if (!selectedComment) {
        return;
    }

        const success = await requestDeleteComment(selectedComment);

        if (!success) {
            return;
        }

        selectedComment = null;
        commentDeleteModal.classList.remove("show");
    });

    prepareCounts();
    updateCommentSubmitButtonState();

    requestPost();
    requestComments();
});
