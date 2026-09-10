/* ========================================================
   SEARCH
======================================================== */


/*
 * Search Button
 */
searchButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        searchBox.classList.toggle(
            "open"
        );


        /*
         * 打开之后自动获得焦点
         */
        if (
            searchBox.classList.contains(
                "open"
            )
        ) {

            setTimeout(
                () => {

                    searchInput.focus();

                },
                50
            );

        }

    }
);


/* ========================================================
   SEARCH INPUT
======================================================== */

searchInput.addEventListener(
    "input",
    () => {

        renderTracks();

    }
);


/* ========================================================
   CLOSE SEARCH
======================================================== */

document.addEventListener(
    "click",
    event => {

        if (
            !searchBox.contains(
                event.target
            )
            &&
            !searchButton.contains(
                event.target
            )
        ) {

            searchBox.classList.remove(
                "open"
            );

        }

    }
);