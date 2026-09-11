/* ========================================================
   IMPORT UI
======================================================== */


/*
 * 点击 Import 区域
 */
importArea.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);

/* ========================================================
   WINDOWS STYLE SORT
   
   排序规则：
   1. 数字优先（数值小的在前）
   2. 数值相同时，前导零多的在前（000 < 00 < 0）
   3. 字母优先于中文 / 日文 / 韩文
   4. 中文按拼音排序
======================================================== */

function windowsStyleSort(a, b) {

    const strA =
        (a.title || "").toString();

    const strB =
        (b.title || "").toString();


    /* ====================================================
       TOKENIZE
       把字符串拆成「数字片段」和「文本片段」
    ==================================================== */

    function tokenize(str) {

        const tokens = [];

        const regex =
            /(\d+)|(\D+)/g;

        let match;

        while (
            (match = regex.exec(str)) !== null
        ) {

            if (match[1]) {

                tokens.push({
                    type: "number",
                    value: parseInt(match[1], 10),
                    raw: match[1]
                });

            } else {

                tokens.push({
                    type: "text",
                    value: match[2]
                });

            }

        }

        return tokens;

    }


    /* ====================================================
       CHAR WEIGHT
       
       数字        → 0（实际由 number 片段处理）
       拉丁字母    → 1
       其他（CJK） → 2
    ==================================================== */

    function charWeight(char) {

        const code =
            char.charCodeAt(0);


        /*
         * ASCII 大写字母 A-Z
         */
        if (
            code >= 65
            &&
            code <= 90
        ) {

            return 1;

        }


        /*
         * ASCII 小写字母 a-z
         */
        if (
            code >= 97
            &&
            code <= 122
        ) {

            return 1;

        }


        /*
         * 非 ASCII 但有大小写概念，
         * 例如 é、ñ、α、д 等，
         * 也当作字母处理。
         */
        if (
            char.toUpperCase()
            !==
            char.toLowerCase()
        ) {

            return 1;

        }


        /*
         * 其他，包括中文、日文、韩文、
         * 数字之外的符号等。
         */
        return 2;

    }


    /* ====================================================
       COMPARE TEXT
       逐字符比较两个文本片段
    ==================================================== */

    function compareText(textA, textB) {

        const len =
            Math.min(
                textA.length,
                textB.length
            );


        for (
            let i = 0;
            i < len;
            i++
        ) {

            const charA =
                textA[i];

            const charB =
                textB[i];


            const weightA =
                charWeight(charA);

            const weightB =
                charWeight(charB);


            /*
             * 类别不同：
             * 字母（1）优先于中文（2）
             */
            if (weightA !== weightB) {

                return weightA - weightB;

            }


            /*
             * 完全相同，继续
             */
            if (charA === charB) {

                continue;

            }


            /*
             * 同类别，使用 localeCompare
             * 支持中文拼音、字母不区分大小写
             */
            const cmp =
                charA.localeCompare(
                    charB,
                    "zh-Hans-CN",
                    {
                        sensitivity: "base"
                    }
                );


            if (cmp !== 0) {

                return cmp;

            }

        }


        /*
         * 前缀相同，短者在前
         */
        return textA.length - textB.length;

    }


    /* ====================================================
       TOKEN COMPARE
    ==================================================== */

    const tokensA =
        tokenize(strA);

    const tokensB =
        tokenize(strB);


    const minLength =
        Math.min(
            tokensA.length,
            tokensB.length
        );


    for (
        let i = 0;
        i < minLength;
        i++
    ) {

        const tokenA =
            tokensA[i];

        const tokenB =
            tokensB[i];


        /*
         * 类型不同：
         * 数字优先于文本
         */
        if (
            tokenA.type
            !==
            tokenB.type
        ) {

            return tokenA.type === "number"
                ? -1
                : 1;

        }


        /* ============================================
           数字片段
        ============================================ */

        if (tokenA.type === "number") {

            /*
             * 数值小的在前
             */
            if (
                tokenA.value
                !==
                tokenB.value
            ) {

                return tokenA.value
                    - tokenB.value;

            }


            /*
             * 数值相同，前导零多的在前
             * 000 < 00 < 0
             */
            if (
                tokenA.raw.length
                !==
                tokenB.raw.length
            ) {

                return tokenB.raw.length
                    - tokenA.raw.length;

            }

        }


        /* ============================================
           文本片段
        ============================================ */

        else {

            const cmp =
                compareText(
                    tokenA.value,
                    tokenB.value
                );


            if (cmp !== 0) {

                return cmp;

            }

        }

    }


    /*
     * 前缀相同，短者在前
     */
    return tokensA.length
        - tokensB.length;

}



/*
 * 点击 Add 按钮
 */
addButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        fileInput.click();

    }
);


/*
 * 文件选择
 */
fileInput.addEventListener(
    "change",
    event => {

        const files =
            Array.from(
                event.target.files
            );


        importFiles(files);


        /*
         * 允许重复选择同一个文件
         */
        fileInput.value = "";

    }
);


/*
 * Drag Over
 */
importArea.addEventListener(
    "dragover",
    event => {

        event.preventDefault();


        importArea.classList.add(
            "dragging"
        );

    }
);


/*
 * Drag Leave
 */
importArea.addEventListener(
    "dragleave",
    () => {

        importArea.classList.remove(
            "dragging"
        );

    }
);


/*
 * Drop
 */
importArea.addEventListener(
    "drop",
    event => {

        event.preventDefault();


        importArea.classList.remove(
            "dragging"
        );


        const files =
            Array.from(
                event.dataTransfer.files
            );


        importFiles(files);

    }
);


/* ========================================================
   IMPORT FILES
======================================================== */

function importFiles(files) {

    const supportedExtensions = [

        ".mp3",
        ".wav",
        ".flac",
        ".m4a",
        ".aac",
        ".ogg",
        ".oga",
        ".webm"

    ];


    /*
     * 只保留支持的音频格式
     */
    const audioFiles =
        files.filter(
            file => {

                const name =
                    file.name.toLowerCase();


                return supportedExtensions.some(
                    ext =>
                        name.endsWith(ext)
                );

            }
        );


    /*
     * 没有可用文件
     */
    if (!audioFiles.length) {

        showToast(
            "No supported music files found"
        );

        return;

    }


    /*
     * 清理旧 Object URL
     */
    objectUrls.forEach(
        url =>
            URL.revokeObjectURL(url)
    );


    objectUrls = [];


    /*
     * 新导入的音乐
     * 替换当前 Library。
     */
    tracks =
        audioFiles.map(
            (file, index) => {

                const url =
                    URL.createObjectURL(
                        file
                    );


                objectUrls.push(url);


                return {

                    id:
                        Date.now()
                        +
                        "-"
                        +
                        index,

                    file,

                    url,

                    title:
                        guessTitle(
                            file.name
                        ),

                    artist:
                        guessArtist(
                            file.name
                        ),

                    duration: 0,

                    cover:
                        coverGradients[
                            index %
                            coverGradients.length
                        ]

                };

            }
        );


    /* ====================================================
       排序：按标题自然顺序排序
       000 → 003 → 005 → 010 → 013
    ==================================================== */

    tracks.sort(windowsStyleSort);


    /*
     * 重置播放器
     */
    currentIndex = -1;


    audio.pause();


    audio.removeAttribute(
        "src"
    );


    audio.load();


    isPlaying = false;


    recordRotation = 0;


    applyRecordRotation();


    stopProgressAnimation();


    resetProgressVisual();


    /*
     * 隐藏 Import 区域
     */
    importArea.style.display =
        "none";


    /*
     * 重新渲染歌曲
     */
    renderTracks();


    showToast(
        `${tracks.length} songs imported`
    );


    /*
     * 异步读取所有歌曲长度
     */
    tracks.forEach(
        track => {

            const tempAudio =
                new Audio();


            tempAudio.preload =
                "metadata";


            tempAudio.src =
                track.url;


            tempAudio.addEventListener(
                "loadedmetadata",
                () => {

                    track.duration =
                        tempAudio.duration;


                    renderTracks();

                },
                {
                    once: true
                }
            );

        }
    );

}