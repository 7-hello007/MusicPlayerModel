/* ========================================================
   RENDER TRACKS
======================================================== */

function renderTracks() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    /*
     * 搜索过滤
     */
    const filtered =
        tracks.filter(
            track => {

                if (!keyword) {

                    return true;

                }


                return (

                    track.title
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    track.artist
                        .toLowerCase()
                        .includes(keyword)

                );

            }
        );


    /*
     * 清空列表
     */
    trackList.innerHTML = "";


    /*
     * 渲染歌曲
     */
    filtered.forEach(
        track => {

            const realIndex =
                tracks.indexOf(track);


            const item =
                document.createElement(
                    "div"
                );


            /*
             * active 状态
             */
            item.className =
                "track"
                +
                (
                    realIndex === currentIndex
                        ? " active"
                        : ""
                );


            item.dataset.index =
                realIndex;


            /*
             * HTML
             */
            item.innerHTML = `

                <div
                    class="cover"
                    style="
                        --cover:${track.cover};
                    "
                ></div>

                <div class="track-info-small">

                    <div class="track-name">
                        ${escapeHtml(track.title)}
                    </div>

                    <div class="track-artist-small">
                        ${escapeHtml(track.artist)}
                    </div>

                </div>

                <div class="equalizer">

                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>

                </div>

                <div class="track-duration">
                    ${formatTime(track.duration)}
                </div>

            `;


            /*
             * 点击歌曲
             */
            item.addEventListener(
                "click",
                () => {

                    handleTrackClick(
                        realIndex
                    );

                }
            );


            trackList.appendChild(
                item
            );

        }
    );


    /*
     * 歌曲数量
     */
    trackCount.textContent =
        `${tracks.length} songs`;


    /*
     * 空状态
     */
    emptyState.classList.toggle(
        "show",
        tracks.length === 0
    );

}


/* ========================================================
   TRACK CLICK
======================================================== */

function handleTrackClick(index) {

    if (
        index < 0
        ||
        index >= tracks.length
    ) {

        return;

    }


    /*
     * 点击当前正在播放歌曲
     * → 暂停
     */
    if (
        index === currentIndex
        &&
        !audio.paused
    ) {

        audio.pause();

        return;

    }


    /*
     * 点击当前已经暂停歌曲
     * → 继续
     */
    if (
        index === currentIndex
        &&
        audio.paused
    ) {

        audio.play()
            .catch(
                () => {

                    showToast(
                        "Unable to play this file"
                    );

                }
            );

        return;

    }


    /*
     * 点击其他歌曲
     * → 切换并播放
     */
    playTrack(index);

}


/* ========================================================
   INITIAL TRACK RENDER
======================================================== */

/*
 * 注意：
 *
 * 这里不能直接调用 renderTracks()
 * 因为 playback.js、particles.js 等还没有执行。
 *
 * scripts.js 会等所有脚本加载完成后，
 * 由 particles.js / 最后初始化逻辑统一执行。
 */