function loadClient() {
    const script = document.createElement("script")
    script.src =
        config.serverUrl + "/DriveWorksLiveIntegrationClient.min.js"
    script.onerror = () => dwClientLoadError()
    script.onload = () => dwClientLoaded() // Custom local function run when client has loaded
    document.body.appendChild(script)
}