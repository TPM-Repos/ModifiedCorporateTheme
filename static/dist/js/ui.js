// Version 1.3.1
// The purpose of this file is UI tweaks that should be run on all pages.
// core.js only runs on pages the user is logged in to.

const isLoginPage =
	!window.location.pathname.includes(".html") ||
	window.location.pathname.includes("index.html")
const rs = document.querySelector(":root").style

/**
 * Run on page load.
 */
;(() => {
	console.log("This site is running Modified Corporate Theme from TPM")
	console.log(
		"You can learn more here: https://github.com/TPM-Repos/ModifiedCorporateTheme",
	)
	console.log("Version: " + config.version)

	setTitle()
	setLogo()
	setWatermark()
	setStyles(config.styles)
})()

function setTitle() {
	if (!config.siteName) {
		return
	}

	const title = document.querySelector("title")
	title.innerText += " | " + config.siteName
}

function setWatermark() {
	if (!config.watermark) {
		return
	}

	let contentInner

	if (isLoginPage) {
		contentInner = document.querySelector(".login-form")
	} else {
		contentInner = document.querySelector(".content-inner")
	}

	const watermark = document.createElement("div")
	watermark.classList.add("watermark")
	// if the page is run.html, add a class to the watermark
	if (window.location.pathname.includes("run.html")) {
		watermark.classList.add("sideways")
	}
	watermark.innerHTML = config.watermark
	contentInner.append(watermark)
}

function setLogo() {
	const logo = document.getElementById("logo")

	if (!logo || !config.images) {
		return
	}

	if (isLoginPage && config.images.login) {
		logo.src = config.images.login
	} else if (config.images.sidebar) {
		logo.src = config.images.sidebar
	}
}

/**
 *
 * @param {object} styles Object with properties to be converted to CSS, can have nested objects
 * @param {string} parentKey only used for recursion. the name of the nested object
 * @returns {boolean} if styles were set
 */
function setStyles(styles, parentKey = "") {
	if (!styles) {
		return false
	}

	try {
		for (const style in styles) {
			if (styles.hasOwnProperty(style)) {
				const key = parentKey ? `${parentKey}-${style}` : style

				if (
					typeof styles[style] === "object" &&
					styles[style] !== null
				) {
					// Recursive call for nested objects
					setStyles(styles[style], key)
				} else {
					// Set the CSS variable for non-object properties
					document.documentElement.style.setProperty(
						`--${key}`,
						styles[style],
					)
				}
			}
		}
	} catch {
		return false
	}
	return true
}