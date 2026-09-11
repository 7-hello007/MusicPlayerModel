/* ========================================================
   SONORA
   Main Script Loader
   Non-ES Module Version
======================================================== */

/*
 * 自动读取 js/ 目录中的所有 JavaScript 文件。
 *
 * 文件名使用数字编号控制加载顺序，例如：
 *
 * js/
 * ├── 01-dom.js
 * ├── 02-state.js
 * ├── 03-utils.js
 * ├── 04-clock.js
 * ├── 05-import.js
 * ├── 06-tracks.js
 * ├── 07-playback.js
 * ├── 08-progress.js
 * ├── 09-seek.js
 * ├── 10-search.js
 * ├── 11-keyboard.js
 * ├── 12-swipe.js
 * └── 13-particles.js
 *
 * 不需要在这里手动维护文件名。
 */


/* ========================================================
   CONFIG
======================================================== */

const JS_DIRECTORY =
  "js/";


/* ========================================================
   GET JS FILE LIST
======================================================== */

/*
 * 注意：
 *
 * 浏览器本身没有 fs.readdirSync()。
 *
 * 这里通过 Vite 开发服务器提供的目录页面
 * 获取 js/ 目录内容。
 *
 * 如果运行在 Vite dev server 下：
 *
 * http://127.0.0.1:5173/js/
 *
 * 可以读取目录中的文件。
 */
async function getScriptFiles() {

  try {

    const response =
      await fetch(
        JS_DIRECTORY
      );


    if (
      !response.ok
    ) {

      throw new Error(
        `Unable to read ${JS_DIRECTORY}`
      );

    }


    const html =
      await response.text();


    /*
     * 解析目录页面
     */
    const parser =
      new DOMParser();


    const document =
      parser.parseFromString(
        html,
        "text/html"
      );


    /*
     * 获取目录中的链接
     */
    const links =
      Array.from(
        document.querySelectorAll(
          "a"
        )
      );


    /*
     * 只保留 .js 文件
     */
    const files =
      links
        .map(
          link =>
          link.getAttribute(
            "href"
          )
        )
        .filter(
          href =>
          href
            &&
          href.endsWith(".js")
        )
        .map(
          href => {

            /*
             * 只保留文件名
             */
            return href
              .split("/")
              .pop();

          }
        )
        .filter(
          file =>
          file !== "scripts.js"
        );


    /*
     * 按文件名中的数字排序。
     *
     * 例如：
     *
     * 2-test.js
     * 10-test.js
     *
     * 会正确得到：
     *
     * 2-test.js
     * 10-test.js
     */
    files.sort(
      (
        a,
        b
      ) => {

        return a.localeCompare(
          b,
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        );

      }
    );


    return files;

  } catch (error) {

    console.error(
      "SONORA script loader failed:",
      error
    );


    return [];

  }

}


/* ========================================================
   LOAD ONE SCRIPT
======================================================== */

function loadScript(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const script =
        document.createElement(
          "script"
        );


      /*
       * 传统 Script。
       *
       * 不使用 module。
       */
      script.type =
        "text/javascript";


      /*
       * 禁止异步，
       * 保证顺序执行。
       */
      script.async =
        false;


      script.src =
        `${JS_DIRECTORY}${file}`;


      /*
       * 加载成功
       */
      script.onload =
        () => {

          resolve();

        };


      /*
       * 加载失败
       */
      script.onerror =
        () => {

          reject(
            new Error(
              `Failed to load ${file}`
            )
          );

        };


      document.head.appendChild(
        script
      );

    }
  );

}


/* ========================================================
   LOAD ALL SCRIPTS
======================================================== */

async function loadAllScripts() {

  const files =
    await getScriptFiles();


  /*
   * 没有找到 JS 文件
   */
  if (
    files.length === 0
  ) {

    console.error(
      "SONORA: No JavaScript files found in js/"
    );

    return;

  }


  console.log(
    "SONORA JavaScript files:"
  );


  files.forEach(
    (
      file,
      index
    ) => {

      console.log(
        `  ${index + 1}. ${file}`
      );

    }
  );


  /*
   * 严格按照顺序加载。
   */
  for (
    const file of files
  ) {

    try {

      await loadScript(
        file
      );

    } catch (error) {

      console.error(
        error
      );


      /*
       * 如果某个文件加载失败，
       * 停止继续加载。
       */
      return;

    }

  }


  console.log(
    "SONORA: all scripts loaded."
  );

}


/* ========================================================
   START
======================================================== */

/*
 * DOM 已经创建完成。
 */
loadAllScripts();