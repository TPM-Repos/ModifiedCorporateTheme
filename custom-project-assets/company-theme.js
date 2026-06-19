/**
 * Runtime Company Theme Injector
 *
 * Reads a JSON string of color tokens from a hidden TextBox named
 * "CompanyThemeData" (populated by DriveWorks rules from a DB lookup)
 * and injects them into every dw-form shadow DOM. Uses MutationObservers
 * to instantly catch newly created shadow roots (e.g. navigating between
 * forms, expanding collapsible sections).
 *
 * USAGE:
 *   This file contains all the logic. Each project just needs a one-liner
 *   JS file in custom-project-assets/ that loads this script:
 *
 *     // custom-project-assets/myproject.js
 *     document.head.appendChild(Object.assign(document.createElement("script"),
 *       {src: "custom-project-assets/company-theme.js"}))
 *
 * SETUP IN DRIVEWORKS:
 *   1. Add a TextBox named "CompanyThemeData" to the form
 *   2. Set its value with a DW rule that builds a JSON string from DB:
 *      =IF(UserCompany="","",
 *        "{""brand-primary"":""" & DBLookup(...) &
 *        """,""brand-primary-dark"":""" & DBLookup(...) & """}"
 *      )
 *   3. Hide the control (Visible = FALSE)
 *   4. Set its background to Transparent so CSS doesn't conflict
 *
 *   The JSON value should look like:
 *   {"brand-primary":"#E63946","brand-primary-dark":"#C1121F","brand-accent":"#FFE0E0"}
 */

;(function injectCompanyTheme() {
    "use strict"

    var STYLE_ID = "company-theme-override"
    var lastCssText = ""
    var lastAppliedValue = null
    var lastTokens = null
    var observers = [] // track active MutationObservers

    // -------------------------------------------------------------------------
    // Build CSS text from tokens
    // -------------------------------------------------------------------------
    function buildCssText(tokens) {
        var cssLines = [":host {"]
        for (var key in tokens) {
            if (tokens.hasOwnProperty(key)) {
                cssLines.push("  --" + key + ": " + tokens[key] + " !important;")
            }
        }
        cssLines.push("}")
        return cssLines.join("\n")
    }

    // -------------------------------------------------------------------------
    // Inject style into a single shadow root (if not already there)
    // -------------------------------------------------------------------------
    function injectIntoRoot(shadowRoot) {
        if (!lastCssText || shadowRoot.getElementById(STYLE_ID)) return false
        var style = document.createElement("style")
        style.id = STYLE_ID
        style.textContent = lastCssText
        shadowRoot.appendChild(style)
        return true
    }

    // -------------------------------------------------------------------------
    // Watch a shadow root for new dw-frame-control / dw-form children
    // -------------------------------------------------------------------------
    function observeShadowRoot(shadowRoot) {
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes
                for (var j = 0; j < added.length; j++) {
                    var node = added[j]
                    if (node.nodeType !== 1) continue
                    processElement(node)
                }
            }
        })
        observer.observe(shadowRoot, { childList: true, subtree: true })
        observers.push(observer)
    }

    // -------------------------------------------------------------------------
    // Process a single element: if it's a dw-form or dw-frame-control,
    // inject theme and set up observers on its shadow root
    // -------------------------------------------------------------------------
    function processElement(el) {
        var tag = el.tagName ? el.tagName.toLowerCase() : ""

        if (tag === "dw-form" && el.shadowRoot) {
            if (injectIntoRoot(el.shadowRoot)) {
                console.log("[CompanyTheme] Theme injected into new dw-form shadow root.")
            }
            observeShadowRoot(el.shadowRoot)
            // Process existing children in this shadow root
            scanShadowRoot(el.shadowRoot)
        }

        if (tag === "dw-frame-control" && el.shadowRoot) {
            observeShadowRoot(el.shadowRoot)
            scanShadowRoot(el.shadowRoot)
        }

        // Also check children (e.g. a div[part="controls"] containing frame controls)
        if (el.querySelectorAll) {
            var forms = el.querySelectorAll("dw-form")
            for (var i = 0; i < forms.length; i++) processElement(forms[i])
            var frames = el.querySelectorAll("dw-frame-control")
            for (var j = 0; j < frames.length; j++) processElement(frames[j])
        }
    }

    // -------------------------------------------------------------------------
    // Scan an existing shadow root for dw-form and dw-frame-control elements
    // -------------------------------------------------------------------------
    function scanShadowRoot(shadowRoot) {
        var forms = shadowRoot.querySelectorAll("dw-form")
        for (var i = 0; i < forms.length; i++) processElement(forms[i])
        var frames = shadowRoot.querySelectorAll("dw-frame-control")
        for (var j = 0; j < frames.length; j++) processElement(frames[j])
    }

    // -------------------------------------------------------------------------
    // Full injection: build CSS, inject into all known roots, set up observers
    // -------------------------------------------------------------------------
    function injectTheme(tokens) {
        lastCssText = buildCssText(tokens)

        // Inject into all existing shadow roots
        var topForm = document.querySelector("dw-form")
        if (topForm && topForm.shadowRoot) {
            injectIntoRoot(topForm.shadowRoot)
            scanShadowRoot(topForm.shadowRoot)
        }

        console.log("[CompanyTheme] Theme applied.")
    }

    // -------------------------------------------------------------------------
    // Update all existing injected styles (when the JSON value changes)
    // -------------------------------------------------------------------------
    function updateAllRoots() {
        function findAllFormShadowRoots(root, results) {
            if (!root) return results
            var forms = root.querySelectorAll("dw-form")
            for (var i = 0; i < forms.length; i++) {
                if (forms[i].shadowRoot) {
                    results.push(forms[i].shadowRoot)
                    findAllFormShadowRoots(forms[i].shadowRoot, results)
                }
            }
            var frames = root.querySelectorAll("dw-frame-control")
            for (var j = 0; j < frames.length; j++) {
                if (frames[j].shadowRoot) {
                    findAllFormShadowRoots(frames[j].shadowRoot, results)
                }
            }
            return results
        }

        var topForm = document.querySelector("dw-form")
        var roots = []
        if (topForm && topForm.shadowRoot) {
            roots.push(topForm.shadowRoot)
            findAllFormShadowRoots(topForm.shadowRoot, roots)
        }

        for (var i = 0; i < roots.length; i++) {
            var existing = roots[i].getElementById(STYLE_ID)
            if (existing) existing.textContent = lastCssText
            else injectIntoRoot(roots[i])
        }
    }

    // -------------------------------------------------------------------------
    // Remove injected theme (revert to defaults)
    // -------------------------------------------------------------------------
    function removeTheme() {
        lastCssText = ""
        var topForm = document.querySelector("dw-form")
        if (!topForm || !topForm.shadowRoot) return

        function findAllFormShadowRoots(root, results) {
            if (!root) return results
            var forms = root.querySelectorAll("dw-form")
            for (var i = 0; i < forms.length; i++) {
                if (forms[i].shadowRoot) {
                    results.push(forms[i].shadowRoot)
                    findAllFormShadowRoots(forms[i].shadowRoot, results)
                }
            }
            var frames = root.querySelectorAll("dw-frame-control")
            for (var j = 0; j < frames.length; j++) {
                if (frames[j].shadowRoot) {
                    findAllFormShadowRoots(frames[j].shadowRoot, results)
                }
            }
            return results
        }

        var roots = [topForm.shadowRoot]
        findAllFormShadowRoots(topForm.shadowRoot, roots)
        for (var i = 0; i < roots.length; i++) {
            var existing = roots[i].getElementById(STYLE_ID)
            if (existing) existing.remove()
        }
        console.log("[CompanyTheme] Theme removed. Using defaults.")
    }

    // -------------------------------------------------------------------------
    // Find the CompanyThemeData TextBox
    // -------------------------------------------------------------------------
    var dwForm = document.querySelector("dw-form")
    if (!dwForm || !dwForm.shadowRoot) {
        console.warn("[CompanyTheme] dw-form not found.")
        return
    }

    function findControl(root) {
        var found = root.querySelector('dw-text-box[name="CompanyThemeData"]')
        if (found) return found
        var frames = root.querySelectorAll("dw-frame-control")
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].shadowRoot) {
                var innerForm = frames[i].shadowRoot.querySelector("dw-form")
                if (innerForm && innerForm.shadowRoot) {
                    found = findControl(innerForm.shadowRoot)
                    if (found) return found
                }
            }
        }
        return null
    }

    // Set up observers on the top-level form's shadow root immediately
    observeShadowRoot(dwForm.shadowRoot)
    scanShadowRoot(dwForm.shadowRoot)

    // -------------------------------------------------------------------------
    // Read the TextBox value, parse JSON, and inject
    // Poll for value changes and also keep searching for the control if not yet found
    // -------------------------------------------------------------------------
    var themeControl = null

    function readAndApply() {
        // If we haven't found the control yet, keep searching
        if (!themeControl) {
            themeControl = findControl(dwForm.shadowRoot)
            if (!themeControl) return
            console.log("[CompanyTheme] Found CompanyThemeData control. Applying theme.")
        }

        var inputEl = themeControl.shadowRoot
            ? (themeControl.shadowRoot.querySelector("textarea:not([hidden])") || themeControl.shadowRoot.querySelector("input:not([hidden])"))
            : (themeControl.querySelector("textarea:not([hidden])") || themeControl.querySelector("input:not([hidden])"))

        var value = null
        if (inputEl) {
            value = inputEl.value
        }

        var valueChanged = value !== lastAppliedValue
        lastAppliedValue = value

        if (!value || value.trim() === "") {
            if (valueChanged) removeTheme()
            lastTokens = null
            return
        }

        try {
            if (valueChanged) {
                lastTokens = JSON.parse(value)
                if (lastCssText) {
                    injectTheme(lastTokens)
                    updateAllRoots()
                } else {
                    injectTheme(lastTokens)
                }
            }
        } catch (e) {
            console.warn("[CompanyTheme] Invalid JSON in CompanyThemeData: " + value)
            removeTheme()
        }
    }

    console.log("[CompanyTheme] Searching for CompanyThemeData control. Polling every 2s.")
    readAndApply()
    setInterval(readAndApply, 2000)
})()
