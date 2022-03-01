// ==UserScript==
// @name         YouTube Simple Timestamp Logger
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Save a video timestamp with a single key press
// @author       Anonymous
// @author       Ex
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @grant        none
// @noframes
// ==/UserScript==

// What key to press. Uppercase letters bind Shift+letter.
const HOT_KEY = "z";
// Add or subtract seconds when recording. Can be fractional.
const ADJUST_TS_VALUE = 0;
// Include milliseconds in timestamps. 00:01:02.123
const SAVE_MILLIS = false;

(function() {
    'use strict';

    const LOG = []
    let diagsWindow

    function saveLog() {
        const logText = diagsWindow.querySelector(".log").value
        const el = document.createElement("a")
        const vidTitle = document.querySelector('meta[property="og:title"]').content
        el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(logText));
        el.setAttribute("download", ` ${vidTitle} - timestamps.txt`)
        el.style.display = "none"
        document.body.appendChild(el)
        el.click()
        document.body.removeChild(el)
    }

    function clearLog() {
        diagsWindow.querySelector(".log").value = ""
        showMessage("Cleared log.")
    }

    function hideLogger() {
        const hiddenStatus = diagsWindow.querySelector(".log").hidden
        if (hiddenStatus == false) {
            diagsWindow.querySelector(".log").hidden = true
            diagsWindow.querySelector(".msg").hidden = true
            diagsWindow.querySelector(".saveLogButton").hidden = true
            diagsWindow.querySelector(".clearLogButton").hidden = true
            showMessage("Logger Hidden.")
        } else {
            diagsWindow.querySelector(".log").hidden = false
            diagsWindow.querySelector(".msg").hidden = false
            diagsWindow.querySelector(".saveLogButton").hidden = false
            diagsWindow.querySelector(".clearLogButton").hidden = false
            showMessage("Logger Shown.")
        }
    }

    function createDiagsWindow() {
        const cont = document.createElement("div")
        cont.className = "timestampLogger"
        cont.style.backgroundColor = "rgba(0, 0, 0, 0.50)"
        cont.style.position = "fixed"
        cont.style.left = "1rem"
        cont.style.bottom = "1rem"
        cont.style.zIndex = "1000"
        cont.style.padding = "1rem"
        const logArea = document.createElement("textarea")
        logArea.className = "log"
        logArea.style.display = "block"
        logArea.style.width = "420px"
        logArea.style.height = "80px"
        logArea.hidden = true
        cont.appendChild(logArea)
        const lastMsg = document.createElement("div")
        lastMsg.className = "msg"
        lastMsg.style.color = "#ffffff"
        lastMsg.style.fontSize = "12px"
        lastMsg.style.display = "inline-block"
        lastMsg.hidden = true
        cont.appendChild(lastMsg)
        const saveButton = document.createElement("button")
        saveButton.className = "saveLogButton"
        saveButton.onclick = saveLog
        saveButton.textContent = "Save Log"
        saveButton.hidden = true
        cont.appendChild(saveButton)
        const clearButton = document.createElement("button")
        clearButton.className = "clearLogButton"
        clearButton.onclick = clearLog
        clearButton.textContent = "Clear Log"
        clearButton.hidden = true
        cont.appendChild(clearButton)
        const hideButton = document.createElement("button")
        hideButton.className = "timestampHideButton"
        hideButton.onclick = hideLogger
        hideButton.textContent = "Hide/Show Logger"
        cont.appendChild(hideButton)
        document.body.appendChild(cont)
        return cont
    }

    function showMessage(s) {
        diagsWindow.querySelector(".msg").textContent = `${s}`
    }

    function logTimestampEvent(ts) {
        LOG.push(ts)
        const logValue = diagsWindow.querySelector(".log").value
        const nl = (logValue.endsWith("\n") || logValue == "") ? "" : "\n"
        diagsWindow.querySelector(".log").value += `${nl}${toVideoTime(ts)}: `
        showMessage(`Saved timestamp at ${toVideoTime(ts)}.`)
    }

    function toVideoTime(ts) {
        const hrs = (ts / 3600)
        const mins = ((ts % 3600) / 60)
        const secs = ts % 60

        const zeroFill2 = (n) => { const s = (n | 0).toString(); return n < 10 ? ("0" + s) : s }
        const zeroFill2Ms = (n) => { return n < 10 ? ("0" + n.toFixed(3)) : n.toFixed(3) }
        return `${zeroFill2(hrs)}:${zeroFill2(mins)}:${(SAVE_MILLIS ? zeroFill2Ms : zeroFill2)(secs)}`
    }

    function keydown(event) {
        const player = document.querySelector(".html5-main-video")
        if (!player) {
            // console.log("No active player!")
            return
        }

        const ts = player.currentTime + ADJUST_TS_VALUE
        console.log(event)

        if (event.key !== HOT_KEY || event.ctrlKey == false) {
            return
        }

        const active = document.activeElement.tagName
        /*if (active.toLowerCase() == "textarea" || active.toLowerCase() == "input") {
            showMessage("Key press was ignored because a text field is active.")
            return
        }*/

        event.preventDefault()
        logTimestampEvent(ts)
    }

    const loadEvt = () => {
        window.addEventListener("keydown", keydown)
        console.log("Bound and ready.")
        diagsWindow = createDiagsWindow()
        showMessage(`Ready. Configured hotkey is ${HOT_KEY}.`)
    }

    if (document.readyState == "complete") {
        loadEvt()
    } else {
        window.addEventListener("load", loadEvt)
    }
})();