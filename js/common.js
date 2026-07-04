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

    function formatDateTime(dateTime) {
        if (!dateTime) {
            return "";
        }

        return dateTime
            .slice(0, 19)
            .replace("T", " ");
    }

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