/* ========================================================
   SONORA CLOCK
   Minimal Vertical Roll
======================================================== */


/* ========================================================
   DOM
======================================================== */

const clock =
    document.getElementById("clock");


const clockSlots =
    clock
        ? Array.from(
        clock.querySelectorAll(
            ".clock-digit-slot"
        )
    )
        : [];


/* ========================================================
   STATE
======================================================== */

let clockValues = [
    "0",
    "0",
    "0",
    "0",
    "0",
    "0"
];


/* ========================================================
   FORMAT TIME
======================================================== */

function getClockValues() {

    const now =
        new Date();


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return [

        hours[0],
        hours[1],

        minutes[0],
        minutes[1],

        seconds[0],
        seconds[1]

    ];

}


/* ========================================================
   SET INITIAL DIGIT
======================================================== */

function setInitialDigit(
    slot,
    value
) {

    if (!slot) {
        return;
    }


    const current =
        slot.querySelector(
            ".current"
        );


    const next =
        slot.querySelector(
            ".next"
        );


    if (!current || !next) {
        return;
    }


    current.textContent =
        value;


    next.textContent =
        value;


    current.classList.remove(
        "is-exiting"
    );


    next.classList.remove(
        "is-entering"
    );

}


/* ========================================================
   ROLL DIGIT
======================================================== */

function rollDigit(
    slot,
    oldValue,
    newValue
) {

    if (!slot) {
        return;
    }


    /*
     * 数字没有变化，
     * 不执行动画。
     */
    if (
        oldValue === newValue
    ) {

        return;

    }


    const current =
        slot.querySelector(
            ".current"
        );


    const next =
        slot.querySelector(
            ".next"
        );


    if (!current || !next) {
        return;
    }


    /*
     * 清理上一轮动画。
     */
    current.classList.remove(
        "is-exiting"
    );

    next.classList.remove(
        "is-entering"
    );


    /*
     * 设置新数字。
     */
    next.textContent =
        newValue;


    /*
     * 强制回流。
     */
    void slot.offsetWidth;


    /*
     * 同一时间：
     *
     * 旧数字 → 向上 4px
     *
     * 新数字 → 从下方 4px
     *            向上进入
     */
    current.classList.add(
        "is-exiting"
    );


    next.classList.add(
        "is-entering"
    );


    /*
     * 动画完成以后，
     * 新数字正式成为 current。
     */
    window.setTimeout(
        () => {

            current.textContent =
                newValue;


            current.classList.remove(
                "is-exiting"
            );


            next.classList.remove(
                "is-entering"
            );

            next.textContent =
                newValue;

        },
        170
    );

}


/* ========================================================
   UPDATE CLOCK
======================================================== */

function updateClock() {

    if (
        !clockSlots.length
    ) {

        return;

    }


    const newValues =
        getClockValues();


    for (
        let i = 0;
        i < clockSlots.length;
        i++
    ) {

        const oldValue =
            clockValues[i];


        const newValue =
            newValues[i];


        /*
         * 第一次初始化。
         */
        if (
            clockValues[i] === "0"
                &&
                clockSlots[i]
                    .querySelector(
                        ".current"
                    )
                    .textContent === "0"
                &&
                clockSlots[i]
                    .querySelector(
                        ".next"
                    )
                    .textContent === "0"
        ) {

            setInitialDigit(
                clockSlots[i],
                newValue
            );

        }


        /*
         * 数字变化。
         */
        else if (
            oldValue !== newValue
        ) {

            rollDigit(
                clockSlots[i],
                oldValue,
                newValue
            );

        }

    }


    /*
     * 保存当前时间。
     */
    clockValues =
        newValues;

}


/* ========================================================
   INITIALIZE
======================================================== */

function initializeClock() {

    if (
        !clockSlots.length
    ) {

        return;

    }


    const initialValues =
        getClockValues();


    for (
        let i = 0;
        i < clockSlots.length;
        i++
    ) {

        setInitialDigit(
            clockSlots[i],
            initialValues[i]
        );

    }


    clockValues =
        initialValues;

}


/* ========================================================
   SYNC TO SECOND
======================================================== */

function scheduleClock() {

    const now =
        new Date();


    const delay =
        1000 -
        now.getMilliseconds();


    setTimeout(
        () => {

            updateClock();

            scheduleClock();

        },
        delay
    );

}


/* ========================================================
   START
======================================================== */

initializeClock();

scheduleClock();