/**
 * Runtime Company Theme Injector — Variable Method
 *
 * Reads color tokens from a DriveWorks Variable called
 * "TPMTempUICSSJSONThemeData" via the DriveWorks Live REST API,
 * then injects them as CSS custom properties into every dw-form
 * shadow DOM. Uses MutationObservers to instantly catch newly
 * created shadow roots (e.g. navigating between forms, expanding
 * collapsible sections).
 *
 * Unlike company-theme.js (which reads from a form control),
 * this version uses the API, so the variable does not need to be
 * on a visible form.
 *
 * USAGE:
 *   Each project just needs a one-liner JS file in custom-project-assets/:
 *
 *     // custom-project-assets/myproject.js
 *     document.head.appendChild(Object.assign(document.createElement("script"),
 *       {src: "custom-project-assets/company-theme-variable-method.js"}))
 *
 * SETUP IN DRIVEWORKS:
 *   1. Create a Variable named "TPMTempUICSSJSONThemeData"
 *   2. Set its value with a DW rule that builds a JSON string from DB:
 *      =IF(UserCompany="","",
 *        "{""brand-primary"":""" & DBLookup(...) &
 *        """,""brand-primary-dark"":""" & DBLookup(...) & """}"
 *      )
 *
 *   The JSON value should look like:
 *   {"brand-primary":"#E63946","brand-primary-dark":"#C1121F","brand-accent":"#FFE0E0"}
 */

;(function injectCompanyThemeFromVariable() {
    "use strict"

    var STYLE_ID = "company-theme-override"
    var VARIABLE_NAME = "TPMTempUICSSJSONThemeData"
    var POLL_INTERVAL = 3000 // ms between API polls
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
                console.log("[CompanyTheme-Var] Theme injected into new dw-form shadow root.")
            }
            observeShadowRoot(el.shadowRoot)
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
    // Full injection: build CSS, inject into all known roots
    // -------------------------------------------------------------------------
    function injectTheme(tokens) {
        lastCssText = buildCssText(tokens)

        var topForm = document.querySelector("dw-form")
        if (topForm && topForm.shadowRoot) {
            injectIntoRoot(topForm.shadowRoot)
            scanShadowRoot(topForm.shadowRoot)
        }

        console.log("[CompanyTheme-Var] Theme applied.")
    }

    // -------------------------------------------------------------------------
    // Update all existing injected styles (when the variable value changes)
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
        console.log("[CompanyTheme-Var] Theme removed. Using defaults.")
    }

    // -------------------------------------------------------------------------
    // Read variable value via DriveWorks Live REST API
    // -------------------------------------------------------------------------
    function fetchVariable(callback) {
        // Ensure required globals are available
        if (typeof client === "undefined" || !client) {
            return callback(null, "client not yet available")
        }
        if (typeof GROUP_ALIAS === "undefined" || !GROUP_ALIAS) {
            return callback(null, "GROUP_ALIAS not available")
        }
        if (typeof rootSpecificationId === "undefined" || !rootSpecificationId) {
            return callback(null, "rootSpecificationId not yet available")
        }

        client.getSpecificationVariableByName(
            GROUP_ALIAS,
            rootSpecificationId,
            VARIABLE_NAME
        ).then(function (result) {
            // result may be { value: "..." } or the value directly
            var value = null
            if (typeof result === "object" && result !== null) {
                value = result.value !== undefined ? result.value : JSON.stringify(result)
            } else if (typeof result === "string") {
                value = result
            }
            callback(value, null)
        }).catch(function (err) {
            callback(null, String(err))
        })
    }

    // -------------------------------------------------------------------------
    // Set up observers on the top-level form
    // -------------------------------------------------------------------------
    var dwForm = document.querySelector("dw-form")
    if (dwForm && dwForm.shadowRoot) {
        observeShadowRoot(dwForm.shadowRoot)
        scanShadowRoot(dwForm.shadowRoot)
    }

    // -------------------------------------------------------------------------
    // Poll the API for the variable value and apply/update theme
    // -------------------------------------------------------------------------
    var initializing = true

    function readAndApply() {
        fetchVariable(function (value, error) {
            if (error) {
                if (initializing) {
                    console.log("[CompanyTheme-Var] Waiting for API... (" + error + ")")
                }
                return
            }

            if (initializing) {
                initializing = false
                console.log("[CompanyTheme-Var] Connected to API. Reading variable: " + VARIABLE_NAME)
            }

            var valueChanged = value !== lastAppliedValue
            lastAppliedValue = value

            if (!value || value.trim() === "" || value.trim() === '""') {
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
                    console.log("[CompanyTheme-Var] Variable value changed. Theme updated.")
                }
            } catch (e) {
                if (valueChanged) {
                    console.warn("[CompanyTheme-Var] Invalid JSON in " + VARIABLE_NAME + ": " + value)
                    removeTheme()
                }
            }
        })
    }

    console.log("[CompanyTheme-Var] Starting. Polling variable '" + VARIABLE_NAME + "' every " + (POLL_INTERVAL / 1000) + "s.")
    readAndApply()
    setInterval(readAndApply, POLL_INTERVAL)
})()
