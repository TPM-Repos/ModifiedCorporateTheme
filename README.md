# DriveWorks Live - Integration Theme Example - Corporate Website
### Release: 20.1
#### Minimum DriveWorks Version: 18.1

An example of a full Corporate Website built upon the DriveWorks Live Integration Theme API.
Its features are based on the Web Theme's "Corporate Skin".

This template is designed to be configured and used as is, or the starting point for a larger application.


### Overview:
- Dynamically injects the DriveWorks Live Client library script using the configured server url (see config.js).
    - Provides an example of loading from a static URL, if preferred.
- Connects to the DriveWorks Live Integration Theme API.
- 'Login'
    - Customizable login screen, with credentials attached to a config file.
- 'Projects' view
    - Renders a list of available Projects.
    - Orders Projects alphabetically by name.
    - Shown on successful login by default - redirect configurable.
- 'DriveApps' view
    - Renders a list of available DriveApps.
    - Orders DriveApps alphabetically by name.
- 'Run' view
    - Render and transition Specifications.
    - Tab title shows name of running Specification.
    - Optional warning before navigating from page (where supported).
        - Set `config.run.showWarningOnExit` to `true` to enable.
    - Load custom assets (JavaScript/CSS) matching the current Project name.
        - Implement advanced customizations using JavaScript and CSS.
        - See `/custom-project-assets` for examples.
- 'Details' view
    - View Specification details
    - Access documents and view images in a basic carousel.
- 'History' view
    - Search and filter Specifications.
    - Change ordering using OData.
- 'Query' function
    - Create new or edit existing Specifications through a URL query.
    - Similar to the [DriveWorks Live "Integration Module"](https://docs.driveworkspro.com/topic/IntegrationModuleLive)
    - Examples:
        - /query?run={ProjectName}
        - /query?specification={SpecificationName}
        - /query?specification={SpecificationName}&transition={TransitionName}

### To use:
1. Download latest stable release as zip and unzip into a folder of your choosing. 

2. Enter your Integration Theme details into `config.js`
    * `serverUrl` - The URL that hosts your Integration Theme, including any ports.
    * `groupAlias` - The public alias created for the Group containing the data to display - as configured in DriveWorksConfigUser.xml.
        * This *must* be specified for each Group you wish to use.
        * This allows you to mask the true Group name publicly, if desired.
        * See [Integration Theme Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings) for additional guidance.
    * `specificationPingInterval` - [optional] The interval at which to 'ping' the server automatically
        * This ensures a session is kept alive during inactivity, if desired.
    * *Optional*:
        * Configure various redirects (login, logout, specification close/cancel).
        * Configure update intervals (Details view).
        * Configure 'Query' function settings and defaults

3. Ensure that the Integration Theme server is running, using any of the available methods (e.g. Personal Web Edition, DriveWorks Live, IIS).
    * For more information, see [Selecting the Integration Theme](https://docs.driveworkspro.com/Topic/IntegrationThemeSelect).

4. Host the example locally or on a remote server.
    * Ensure `<corsOrigins>` in DriveWorksConfigUser.xml permits requests from this location.
    See [Integration Theme Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings) for additional guidance.

### Troubleshooting:

If encountering any issues, please check the browser's console for error messages (F12).  

If you are unable to use the dynamic library loading demonstrated in this example:
1. In all .html files, uncomment "Option A" & replace "YOUR-DRIVEWORKS-LIVE-SERVER-URL.COM" with the URL of your own DriveWorks Live server that is serving `DriveWorksLiveIntegrationClient.min.js` - including any ports.
    * This should be the URL that hosts the Integration Theme, and serves it's landing page.
    * To check that this URL is correct, attempt to load DriveWorksLiveIntegrationClient.min.js in a browser. It should return a minified code library.
2. Remove the "Option B" `<script>` tag.

### Potential Issues:

* When serving this example for a domain different to your DriveWorks Live server, e.g. api.my-site.com from www.company.com, 'SameSite' cookie warnings may be thrown when the Client SDK attempts to store the current session id in a cookie.
    * This appears as "Error: 401 Unauthorized" in the browser console, even with the correct configuration set.
    * To resolve:
        * Ensure you are running DriveWorks 18.2 or above
        * Ensure HTTPS is enabled in DriveWorks Live's settings
        * Ensure a valid SSL certificate has been configured via DriveWorksConfigUser.xml.
        * Ensure if using an incognito/private window, third-party cookies are not blocked (see browser settings).
        * See [Integration Theme Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings) for additional guidance.

---

The example requires that you have the latest DriveWorks Live SDK installed, operational and remotely accessible.
