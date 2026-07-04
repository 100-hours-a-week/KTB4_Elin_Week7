document.addEventListener("DOMContentLoaded", function () {
    const profileButton = document.querySelector("#profileButton");
    const profileDropdown = document.querySelector("#profileDropdown");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    const writePostButton = document.querySelector("#writePostButton");
    const postList = document.querySelector("#postList");

    let postCards = [];
    let shownCount = 0;
    let scrollTimer = null;
    let scrollEventAdded = false;

    const pageSize = 10;

    function formatTitle(title) {
        const safeTitle = title ?? "";

        if (safeTitle.length > 26) {
            return safeTitle.slice(0, 26);
        }

        return safeTitle;
    }

    function showPostListMessage(message) {
        postList.innerHTML = "";

        const messageElement = document.createElement("p");
        messageElement.textContent = message;

        postList.appendChild(messageElement);

        postCards = [];
        shownCount = 0;
    }

    function renderPosts(posts) {
        postList.innerHTML = "";

        if (posts.length === 0) {
            showPostListMessage("게시글이 없습니다.");
            return;
        }

        posts.forEach(function (post) {
            const postCard = document.createElement("article");
            postCard.className = "post-card is-hidden";

            postCard.dataset.link = `./post.html?postId=${post.postId}`;

            postCard.innerHTML = `
                <div class="post-card-top">
                    <h2 class="post-title">
                        ${formatTitle(post.title)}
                    </h2>

                    <div class="post-meta-row">
                        <div class="post-meta">
                            <span class="post-count">좋아요 ${formatCount(post.likeCount ?? 0)}</span>
                            <span class="post-count">댓글 ${formatCount(post.commentCount ?? 0)}</span>
                            <span class="post-count">조회수 ${formatCount(post.viewCount ?? 0)}</span>
                        </div>

                        <time class="post-date">
                            ${formatDateTime(post.createdAt)}
                        </time>
                    </div>
                </div>

                <div class="post-author">
                    <img 
                        src="${post.profileImage || "./images/profile.png"}"
                        alt="작성자 프로필"
                        class="author-image"
                    >
                    <span class="author-name">${post.nickname || "알 수 없음"}</span>
                </div>
            `;

            postCard.addEventListener("click", function () {
                location.href = postCard.dataset.link;
            });

            postList.appendChild(postCard);
        });

        postCards = postList.querySelectorAll(".post-card");
        shownCount = 0;

        showNextPosts();
        setupScrollEvent();
        checkScroll();
    }

    function showNextPosts() {
        const nextCount = shownCount + pageSize;

        for (let i = shownCount; i < nextCount && i < postCards.length; i++) {
            postCards[i].classList.remove("is-hidden");
        }

        shownCount = nextCount;
    }

    function hasMorePosts() {
        return shownCount < postCards.length;
    }

    function isBottom() {
        const scrollBottom = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;

        return scrollBottom >= pageHeight - 100;
    }

    function checkScroll() {
        while (isBottom() && hasMorePosts()) {
            showNextPosts();
        }
    }

    function setupScrollEvent() {
        if (scrollEventAdded) {
            return;
        }

        scrollEventAdded = true;

        window.addEventListener("scroll", function () {
            if (scrollTimer !== null) {
                return;
            }

            scrollTimer = setTimeout(function () {
                checkScroll();
                scrollTimer = null;
            }, 200);
        });
    }

    async function requestPosts() {
        try {
            const userId = getLoginUserId();

            console.log("목록 조회 userId:", userId);

            if (!userId) {
                alert("로그인이 필요합니다.");
                location.href = "login.html";
                return;
            }

            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: "GET",
                headers: {
                    "X-USER-ID": userId
                }
            });

            const result = await response.json();

            console.log("게시글 목록 status:", response.status);
            console.log("게시글 목록 응답:", result);

            if (!response.ok) {
                showPostListMessage("게시글 목록을 불러오지 못했습니다.");
                alert("게시글 목록을 불러오지 못했습니다.");
                return;
            }

            const posts = result.data || [];

            renderPosts(posts);
        } catch (error) {
            console.error(error);
            showPostListMessage("서버와 연결할 수 없습니다.");
            alert("서버와 연결할 수 없습니다.");
        }
    }

    profileButton.addEventListener("click", function (event) {
        event.stopPropagation();
        profileDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function () {
        profileDropdown.classList.remove("show");
    });

    function logout() {
        removeLoginUserId();
        location.href = "./login.html";
    }

    dropdownLinks.forEach(function (button) {
        button.addEventListener("click", function () {
            const link = button.dataset.link;

            if (link === "login.html") {
                logout();
                return;
            }

            location.href = link;
        });
    });

    writePostButton.addEventListener("click", function () {
        if (!isLoggedIn()) {
            alert("로그인이 필요합니다.");
            location.href = "login.html";
            return;
        }

        location.href = "makePost.html";
    });

    requestPosts();
});