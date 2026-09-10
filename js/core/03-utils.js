/* ========================================================
   COLORS
======================================================== */

const coverGradients = [

    "linear-gradient(135deg,#8d62ff,#ff70c2)",

    "linear-gradient(135deg,#42dfff,#725eff)",

    "linear-gradient(135deg,#ff9b61,#ff5b9f)",

    "linear-gradient(135deg,#56e0bd,#7e6aff)",

    "linear-gradient(135deg,#ffcf70,#ff6d9f)",

    "linear-gradient(135deg,#6d75ff,#ba68ff)",

    "linear-gradient(135deg,#63e5ff,#ff74ba)",

    "linear-gradient(135deg,#a5ff8f,#5b91ff)"

];


/* ========================================================
   TIME
======================================================== */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {

        return "00:00";

    }


    seconds =
        Math.max(
            0,
            Math.floor(seconds)
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(secs).padStart(2, "0")
    );

}


/* ========================================================
   TOAST
======================================================== */

function showToast(message) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            1800
        );

}


/* ========================================================
   FILE NAME
======================================================== */

function getFileNameWithoutExtension(name) {

    return name.replace(
        /\.[^/.]+$/,
        ""
    );

}


/* ========================================================
   GUESS ARTIST
======================================================== */

function guessArtist(fileName) {

    const clean =
        getFileNameWithoutExtension(
            fileName
        );


    /*
     * 如果以数字开头，
     * 艺术家 = 第一个 " - " 之后的内容。
     */
    if (/^\d/.test(clean)) {

        const index =
            clean.indexOf(" - ");

        if (index !== -1) {

            return clean
                .substring(index + 3)
                .trim();

        }

        return "Local Artist";

    }


    /*
     * 默认格式：
     * 艺术家 - 标题
     */
    const parts =
        clean.split(" - ");

    if (parts.length >= 2) {

        return parts[0].trim();

    }


    return "Local Artist";

}

/* ========================================================
   GUESS TITLE
======================================================== */

function guessTitle(fileName) {

    const clean =
        getFileNameWithoutExtension(
            fileName
        );


    /*
     * 如果以数字开头，
     * 标题 = 第一个 " - " 之前的所有内容。
     *
     * 数字和空格原样保留。
     */
    if (/^\d/.test(clean)) {

        const index =
            clean.indexOf(" - ");

        if (index !== -1) {

            return clean
                .substring(0, index)
                .trim();

        }

        return clean;

    }


    /*
     * 默认格式：
     * 艺术家 - 标题
     */
    const parts =
        clean.split(" - ");

    if (parts.length >= 2) {

        return parts
            .slice(1)
            .join(" - ")
            .trim();

    }


    return clean;

}



/* ========================================================
   ESCAPE HTML
======================================================== */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}