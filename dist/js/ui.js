// Version 1.2.2
// The purpose of this file is UI tweaks that should be run on all pages.
// core.js only runs on pages the user is logged in to.

const isLoginPage = !window.location.pathname.includes(".html") || window.location.pathname.includes("index.html");

/**
 * Run on page load.
 */
(() => {
	console.log("This site is running Modified Corporate Theme from TPM");
	console.log("You can learn more here: https://github.com/TPM-Repos/ModifiedCorporateTheme");
	console.log("Version: " + config.version);
	
	setTitle();
	setLogo();
	setWatermark();
})();

function setTitle() {
	if (!config.siteName) {
		return;
	}

	const title = document.querySelector("title");
	title.innerText += " | " + config.siteName;
}

function setWatermark() {
	if (!config.watermark) {
		return;
	}

	let contentInner;

	if (isLoginPage) {
		contentInner = document.querySelector(".login-form");
	} else {
		contentInner = document.querySelector(".content-inner");
	}

	const watermark = document.createElement("div");
	watermark.classList.add("watermark");
	// if the page is run.html, add a class to the watermark
	if (window.location.pathname.includes("run.html")) {
		watermark.classList.add("sideways");
	}
	watermark.innerHTML = config.watermark;
	contentInner.prepend(watermark);
}

function setLogo() {
	const logo = document.getElementById("logo");

	if (!logo || !config.images) {
		return;
	}

	if (isLoginPage && config.images.login) {
		logo.src = config.images.login;
	} else if (config.images.sidebar) {
		logo.src = config.images.sidebar;
	}
}
