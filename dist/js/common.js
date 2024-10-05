// Global client
let client

const script = document.createElement("script")

function checkConfig() {
    if (typeof config !== 'undefined' && config.serverUrl) {
        loadClient()
    } else {
        setTimeout(checkConfig, 50)
    }
}

function loadClient() {
    script.src =
        config.serverUrl + "/DriveWorksLiveIntegrationClient.min.js"
    script.onerror = () => dwClientLoadError()
    script.onload = () => dwClientLoaded()
    document.body.appendChild(script)
}

/**
 * DriveWorks Live client library loaded.
 */
function dwClientLoaded() {
	try {
		// Create client
		client = new window.DriveWorksLiveClient(SERVER_URL)

		// Set session id from stored value - set by and passed from login page
		client._sessionId = getLocalSession()
	} catch (error) {
		dwClientLoadError()
		return
	}

	// Quick Logout (?bye)
	// https://docs.driveworkspro.com/Topic/WebThemeLogout
	const coreQuery = new URLSearchParams(window.location.search)
	if (coreQuery.has("bye")) {
		handleLogout()
		return
	}

	// Start individual page functions
	startPage()
}

function startPage() {
    if (typeof startPageFunctions !== 'undefined') {
        startPageFunctions()
    } else {
        setTimeout(startPage, 50)
    }
}

/**
 * DriveWorks Live client library load error.
 */
function dwClientLoadError() {
	redirectToLogin("Cannot access client.", "error")
}

/**
 * Handle group logout and redirect to login.
 */
async function handleLogout() {
	try {
		await client.logoutAllGroups()
        logoutRedirect()
	} catch (error) {
		debug(error, true)
	}

	redirectToLogin("You have been logged out.", "success")
}

/**
 * Debug console messaging.
 * @param {string|object} message - Error object, or the message string to display in the console.
 * @param {boolean} forceLog - Force logging if debug mode is disabled.
 */
function debug(message, forceLog = false) {
	if (config.debug || forceLog) {
		console.log(message)
	}
}

