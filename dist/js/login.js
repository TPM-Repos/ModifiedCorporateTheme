// Version 1.3.7
/**
 * LOGIN
 */

const SERVER_URL = config.serverUrl
let LOGIN_REDIRECT_URL = config.login.redirectUrl
let GROUP_ALIAS = config.groupAlias
const URL_QUERY = new URLSearchParams(window.location.search)
const delay = ms => new Promise(res => setTimeout(res, ms));

// Account Management
const AM_GUEST_ALIAS = config.accountManagement?.guestAlias || config.guestAlias
const AM_PROJECT_NAME = config.accountManagement?.projectName || "TPMTempAccountManagement"
const AM_QUERY_STRING = `query?alias=${AM_GUEST_ALIAS}&run=${AM_PROJECT_NAME}&DWMacroNavRequestInputs=`
const CREATE_ACCOUNT_URL = AM_QUERY_STRING + (typeof config.accountManagement?.createAccount === 'string' ? config.accountManagement.createAccount : "CreateAccount");
const FORGOT_PASSWORD_URL = AM_QUERY_STRING + (typeof config.accountManagement?.forgotPassword === 'string' ? config.accountManagement.forgotPassword : "ForgotPassword");
const RESET_PASSWORD_URL = AM_QUERY_STRING + (typeof config.accountManagement?.resetPassword === 'string' ? config.accountManagement.resetPassword : "ResetPassword");

// Elements
const loginForm = document.getElementById("login-form")
const loginCover = document.querySelector(".login-cover")
const loginButton = document.getElementById("login-button")
const loginGuest = document.getElementById("login-guest-button")
const loginSSOButton = document.getElementById("login-sso-button")
const loginNotices = document.getElementById("login-notices")
const forgotLink = document.getElementById("forgot-link")
const createAccountButton = document.getElementById("create-account-button")
const copyright = document.querySelector(".login-copyright")
const loginPassword = document.querySelector("#login-password")

const usernameLabel = document.querySelector("#username-label")
const usernameInput = document.querySelector("#login-username")
const loginDivider = document.querySelector(".login-divider")

// Error Messages
const genericErrorMessage = "Unable to login."
const clientErrorMessage = "There is an issue with the API site. Please contact your system administrator."
const privateErrorMessage = "Please use a non-private window."
const authErrorMessage = "Incorrect username or password."
const maxSessionsErrorMessage = "The maximum number of sessions has been reached. Please try again later."
const licensingServerWarningMessage = "Warning: Unable to verify licensing. License Info Server is unreachable. Please contact your system administrator."
const licensingServerLoginErrorMessage = "Unable to login. This may be a licensing issue. Please contact your system administrator."
const noLicensingErrorMessage = "No licensing available. Please contact your system administrator."

// Global variables
let interval;
let imageElements = [];
let currentIndex = 0;

// DriveWorks Live Client
let client;

/**
 * On page load.
 */
(async function () {
	// Check localStorage support (show warning if not e.g. <= iOS 10 Private Window)
	if (!localStorageSupported()) {
		removeSkeleton()
		loginError(privateErrorMessage)
		return
	}

	setUsernameType()
	setLoginCover()
	addCarouselImages()

	loginForm.addEventListener("submit", handleLoginForm)

	if (loginPassword && config.passwordRequired) {
		loginPassword.required = true
	}

	if (loginSSOButton) {
		if (config.allowSingleSignOn) {
			loginSSOButton.addEventListener("click", handleLoginSSO)
			loginSSOButton.classList.remove("hidden")
			loginSSOButton.classList.add("skeleton-block")
		}
	}

	if (loginGuest) {
		if (config.guestLogin) {
			loginGuest.addEventListener("click", handleGuestLogin)
			loginGuest.classList.remove("hidden")
			loginGuest.classList.add("skeleton-block")
		}
	}

	if (forgotLink) {
		if (config.accountManagement.forgotPassword) {
			forgotLink.href = FORGOT_PASSWORD_URL
			forgotLink.classList.remove("hidden")
		}
	}

	if (loginButton) {
		if (config.disableRegularLogin) {
			loginButton.classList.add("hidden")
		}
	}

	if (createAccountButton) {
		if (config.accountManagement.createAccount) {
			createAccountButton.addEventListener("click", createAccount)
			createAccountButton.classList.remove("hidden")
			loginDivider.classList.remove("hidden")
			createAccountButton.classList.add("skeleton-block")
		}
	}
	showLoginNotice()
	setLoginColumnLocation()
	setCopyright()
	handlePasswordToggle()
	// how long until timing out trying to connect?
	await delay(5000)
	removeSkeleton()
})()

/**
 * Create client.
 */
async function dwClientLoaded() {
	try {
		client = new window.DriveWorksLiveClient(SERVER_URL)
	} catch (error) {
		loginError(clientErrorMessage, error)
		removeSkeleton()
	}

	// Quick Logout (?bye)
	// https://docs.driveworkspro.com/Topic/WebThemeLogout
	if (URL_QUERY.has("bye")) {
		await forceLogout()
	}

	if (client == null) {
		dwClientLoadError()
	} else {
		startPageFunctions()
		enableButtons()
	}

}

/**
 * Start page functions.
 */
async function startPageFunctions() {
	try {
		// Check if logged in, and redirect
		await checkExistingLogin()
	} catch (error) {
		handleGenericError(error)
	}
	removeSkeleton()

	const licenseResult = await checkLicenseStatus()
	if (licenseResult) {
		addLoginNotice(licenseResult.message, licenseResult.state)
	}
}

async function login(type) {
	// Show error if cannot connect to client
	if (!client) {
		loginError(clientErrorMessage)
		return
	}

	try {
		// Show loading state, reset notice
		loginButton.classList.add("is-loading")
		clearLoginNotices()

		let result = null
		let inputUsername = null
		// Start Session
		if (type === "default" || type === null || type === "") {
			// Get credentials
			inputUsername =
				document.getElementById("login-username").value
			const inputPassword =
				document.getElementById("login-password").value
			const userCredentials = {
				username: inputUsername,
				password: inputPassword,
			}
			result = await client.loginGroup(GROUP_ALIAS, userCredentials)
		} else if (type === "SSO") {
			result = await client.loginSSO(GROUP_ALIAS)
		} else if (type === "Guest") {
			GROUP_ALIAS = config.guestAlias
			inputUsername = "Guest"

			result = await client.loginGroup(GROUP_ALIAS)
		}

		// Show error is login failed
		if (!result) {
			loginError(genericErrorMessage)
			return
		}

		loginSuccess(result, inputUsername)
	} catch (error) {
		handleGenericError(error)
		loginButton.classList.remove("is-loading")
		clearLoginNotices()

		const licenseResult = await checkLicenseStatus(true)
		if (licenseResult) {
			addLoginNotice(licenseResult.message, licenseResult.state)
		} else if (isAuthError(error)) {
			addLoginNotice(authErrorMessage, "error")
		} else {
			addLoginNotice(genericErrorMessage, "error")
		}
	}
}

function handleLoginForm(event) {
	event.preventDefault()
	login("default", event)
}

function handleGuestLogin() {
	login("Guest")
}

function handleLoginSSO() {
	login("SSO")
}

function createAccount() {
	window.location.href = CREATE_ACCOUNT_URL
}

function removeSkeleton() {
	loginButton.classList.remove("skeleton-block")
	loginSSOButton.classList.remove("skeleton-block")
	loginGuest.classList.remove("skeleton-block")
	createAccountButton.classList.remove("skeleton-block")
}

function enableButtons() {
	loginButton.disabled = false
	loginSSOButton.disabled = false
	loginGuest.disabled = false
	createAccountButton.disabled = false
	createAccountButton.classList.add("pill")
}

/**
 * Handle successful login. Store Session data to localStorage & redirect.
 */
function loginSuccess(result, username) {
	// Store session details to localStorage
	localStorage.setItem("sessionId", result.sessionId)
	localStorage.setItem("sessionAlias", GROUP_ALIAS)

	if (username) {
		localStorage.setItem("sessionUsername", username)
	}

	// Return to previous location (if redirected to login)
	const returnUrl = URL_QUERY.get("returnUrl")

	if (returnUrl && config.loginReturnUrls) {
		window.location.href = `${window.location.origin}/${decodeURIComponent(
			returnUrl,
		)}`
		return
	}

	if (config.login.redirectGuestUrl && config.guestLogin.enabled && config.guestLogin.alias) {
		LOGIN_REDIRECT_URL = (GROUP_ALIAS === config.guestLogin.alias) ? config.login.redirectGuestUrl : config.login.redirectUrl
	}

	// Redirect to default location
	window.location.href = LOGIN_REDIRECT_URL
}

/**
 * Handle login errors.
 *
 * @param {string} noticeText - The message to display when directed to the login screen.
 * @param {Object} [error] - The error object.
 */
function loginError(noticeText, error = null) {
	if (error) {
		handleGenericError(error)
	}

	// Remove loading state
	loginButton.classList.remove("is-loading")

	// Show client error
	addLoginNotice(noticeText, "error")
}

/**
 * Add a notice to the login form.
 *
 * @param {string} text - The message to display.
 * @param {string} [state] - The type of message state (error/success/warning/neutral).
 */
function addLoginNotice(text, state = "neutral") {
	const notice = document.createElement("div")
	notice.className = `login-notice ${state}`
	notice.innerText = text
	loginNotices.appendChild(notice)
}

/**
 * Set login screen notice in localStorage (for display after redirect).
 *
 * @param {string} text - The message to display when directed to the login screen.
 * @param {string} [state] - The type of message state (error/success/info).
 */
function setLoginNotice(text, state = "info") {
	const notice = JSON.stringify({text: text, state: state})
	localStorage.setItem("loginNotice", notice)
}

/**
 * Show notice from localStorage on login form.
 */
function showLoginNotice() {
	const notice = JSON.parse(localStorage.getItem("loginNotice"))

	if (!notice) {
		return
	}

	addLoginNotice(notice.text, notice.state || "neutral")

	// Clear message
	localStorage.removeItem("loginNotice")
}

/**
 * Clear all notices from the login form.
 */
function clearLoginNotices() {
	loginNotices.innerHTML = ""
}

/**
 * Handle password visibility toggle.
 */
function handlePasswordToggle() {
	const passwordToggle = document.getElementById("password-toggle")

	passwordToggle.onclick = function () {
		const passwordInput = document.getElementById("login-password")
		const currentType = passwordInput.type

		if (currentType === "password") {
			passwordInput.type = "text"
			passwordToggle.innerHTML =
				'<svg class="icon"><use xlink:href="dist/icons.svg#eye-closed"/></svg> Hide'
			return
		}

		passwordInput.type = "password"
		passwordToggle.innerHTML =
			'<svg class="icon"><use xlink:href="dist/icons.svg#eye-open"/></svg> Show'
	}
}

/**
 * Check existing login. Automatically login if found.
 */
async function checkExistingLogin() {
	const storedGroupAlias = localStorage.getItem("sessionAlias")

	if (!storedGroupAlias) {
		return
	}

	if (config.login.redirectGuestUrl && config.guestLogin.enabled && config.guestLogin.alias) {
		LOGIN_REDIRECT_URL = (storedGroupAlias === config.guestLogin.alias) ? config.login.redirectGuestUrl : config.login.redirectUrl
	}

	try {
		// Test connection
		await client.getProjects(storedGroupAlias, "$top=1")

		// Redirect to initial location
		window.location.replace(LOGIN_REDIRECT_URL)
	} catch (error) {
		handleGenericError(error)
	}
}

/**
 * Force logout and session data clearing.
 */
async function forceLogout() {
	// Logout from all Groups.
	try {
		await client.logoutAllGroups()
	} catch (error) {
		handleGenericError(error)
	}

	// Clear session information from storage.
	localStorage.removeItem("sessionId")
	localStorage.removeItem("sessionAlias")
	localStorage.removeItem("sessionUsername")
	localStorage.removeItem("historyFilterName")
	localStorage.removeItem("historyDateOrder")
	localStorage.removeItem("historyRunningSpecVisibility")
	localStorage.removeItem("historyPosition")

	// Show login screen message.
	setLoginNotice("You have been logged out.", "success")
	showLoginNotice()
}

/**
 * Check for localStorage support - used to store session information.
 * Example: Incognito (Private) windows in iOS 10 and below do not allow localStorage, errors when accessed.
 */
function localStorageSupported() {
	try {
		localStorage.setItem("storageSupportTest", "Test")
		localStorage.removeItem("storageSupportTest")
		return true
	} catch (e) {
		return false
	}
}

/**
 * Check if an error is an authentication/credentials error.
 */
function isAuthError(error) {
	const status = error?.status || error?.response?.status
	if (status === 401 || status === 403) {
		return true
	}

	const message = (error?.message || error?.statusText || String(error)).toLowerCase()
	return message.includes("401") || message.includes("403") || message.includes("unauthorized") || message.includes("forbidden")
}

/**
 * Check license server status to provide a specific error message.
 * @param {boolean} isLoginFailure - true when called after a failed login attempt, false on page load.
 * Returns { message, state } or null if license checking is not configured or status is OK.
 */
async function checkLicenseStatus(isLoginFailure = false) {
	const licenseUrl = config.license?.licenseDataUrl
	if (!licenseUrl) {
		return null
	}

	try {
		const response = await fetch(licenseUrl + "/info")
		if (!response.ok) {
			return isLoginFailure
				? { message: licensingServerLoginErrorMessage, state: "error" }
				: { message: licensingServerWarningMessage, state: "warning" }
		}

		const data = await response.json()
		const majorVersion = config.license?.driveWorksMajorVersion
		const versionData = data.find(v => v.driveWorksMajorVersion === majorVersion)

		if (!versionData) {
			return { message: noLicensingErrorMessage, state: "error" }
		}

		if (versionData.maxConcurrentUsers === 0) {
			return { message: noLicensingErrorMessage, state: "error" }
		}

		const capacity = versionData.maxConcurrentUsers + (versionData.onDemandCap || 0)
		if (versionData.activeSessionsCount >= capacity) {
			return { message: maxSessionsErrorMessage, state: "error" }
		}

		return null
	} catch (error) {
		handleGenericError(error)
		return isLoginFailure
			? { message: licensingServerLoginErrorMessage, state: "error" }
			: { message: licensingServerWarningMessage, state: "warning" }
	}
}

/**
 * Handle generic errors e.g. tryCatch.
 *
 * @param {Object} error - The error object.
 */
function handleGenericError(error) {
	console.log(error)
}

/**
 * Set the loginCover
 */
function setLoginCover() {
	if (config.images.loginCover) {
		document.documentElement.style.setProperty(
			"--background-image",
			`url(${"../../../" + config.images.loginCover})`,
		)
	}
}

function setLoginColumnLocation() {
	if (!config.login.columnLocation) {
		return
	}

	if (config.login.columnLocation === "") {
		return
	}

	const loginContainer = document.querySelector(".login-container")

	if (config.login.columnLocation === "left") {
		loginContainer.style.flexDirection = "row"
		return
	}

	if (config.login.columnLocation === "right") {
		loginContainer.style.flexDirection = "row-reverse"
		return
	}

	if (config.login.columnLocation === "center") {
		const loginForm = loginContainer.querySelector("#login-form")
		loginContainer.style.justifyContent = "center"
		loginContainer.style.backgroundImage = config.images.loginCover

		loginCover.style.display = "none"

		return
	}
}

function addCarouselImages() {
	if (!config.images.carousel || config.images.carousel.enabled === false || !config.images.carousel.images || config.images.carousel.images.length === 0) {
		return;
	}

	if (config.images.carousel.images.length === 1) {
		// if there is only one image, set it as the background image
		loginCover.style.backgroundImage = `url(${config.images.carousel.images[0]})`;
		return;
	}

	// otherwise add an image element for each image in the array, set the first image as active, and transition images every X seconds

	// Create image elements
	config.images.carousel.images.forEach((image, index) => {
		const imageElement = document.createElement("img");
		imageElement.src = image;
		imageElement.id = `cover-image-${index + 1}`;
		imageElement.loading = "lazy";
		imageElement.classList.add("login-cover");
		imageElements.push(imageElement);
	})

	// Add image elements to login cover
	loginCover.append(...imageElements);

	// set the first image as active
	imageElements[0].classList.add("active");
	// eager load this image
	imageElements[0].loading = "eager";

	// default interval is 7500ms
	interval = 7500;

	if (config.images.carousel.interval) {
		// convert interval to milliseconds
		interval = config.images.carousel.interval * 1000;
	}

	// Call the transitionImages function every X seconds (milliseconds)
	setInterval(transitionImages, interval);
}

// a function to transition the opacity of the images every X seconds
function transitionImages() {
	// set the current image inactive
	imageElements[currentIndex].classList.remove("active");
	// roll over the current index if it's at the end of the array
	if (currentIndex >= imageElements.length - 1) {
		currentIndex = 0;
	} else {
		currentIndex++;
	}
	// set the current image as active
	imageElements[currentIndex].classList.add("active");
}

// function to set the copyright information
function setCopyright() {
	if (!copyright || !config.copyright.show) {
		// nothing to do if the copyright div can't be found
		// or if the config.copyright.show doesn't exist
		// or if config.copyright.show is false
		return
	}

	// otherwise, set the text
	copyright.innerText =
		config.copyright.holder + " - " + config.copyright.year
}

function setUsernameType() {
	if (!config.usernameType || !usernameInput || !usernameLabel)
		return

	let type = config.usernameType
	// force to all lowercase and remove - if set to e-mail
	type = type.toLowerCase().replace("-", "")

	if (type === "email address") {
		usernameLabel.innerText = "Email Address"
		usernameInput.type = "email"
	}
}

/**
 * DriveWorks Live client library load error.
 */
function dwClientLoadError() {
	loginError(clientErrorMessage)
	removeSkeleton()
}

