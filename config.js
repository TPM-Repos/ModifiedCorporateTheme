// COPY THIS FILE TO 'configUser.js' AND UPDATE THE VALUES TO MATCH YOUR SERVER URL & GROUP ALIAS

const config = {
    // the full path the site running the DriveWorks Live API
    // serverUrl: "https://dw21api.yourdomain.com",
    serverUrl: "",
    // The default alias for the DriveWorks Group
    // This is a custom string that must match the name in the ConfigUser.xml file
    groupAlias: "",
    // (Optional) Configure ping & update intervals - in seconds
    // A Specification will timeout after a configured period of inactivity (see DriveWorksConfigUser.xml).
    // This function prevents a Specification timing out as long as the page is in view.
    // Disable the ping by setting to 0
    specificationPingInterval: 0,
    // (Optional) Enter custom redirect URLs for login/logout and Project/DriveApp close/cancel
    folder: "",
    login: {
        redirectUrl: "projects.html",
        // Set this to left, center, or right to position the login form on the page
        columnLocation: "right",
    },
    logout: {
        redirectUrl: "index.html",
    },
    project: {
        redirectOnClose: "details.html",
        redirectOnCancel: "projects.html",
    },
    driveApp: {
        redirectOnClose: "details.html",
        redirectOnCancel: "drive-apps.html",
    },
    // (Optional) Configure 'Run' view
    run: {
        showWarningOnExit: true, // Toggle warning dialog when exiting "Run" view with potentially unsaved changes (where supported)
        loadCustomProjectAssets: {
            scripts: false,
            styles: false,
        },
    },
    // (Optional) Configure 'Details' view
    details: {
        updateInterval: 5, // Interval to refresh content - in seconds
        showStartNewSpecificationAction: true,
    },
    // (Optional) Configure the query function
    // Enter a default Group Alias and/or Project name to be used (when none are passed in the query string)
    // Choose how sessions are handled
    query: {
        defaultGroupAlias: "",
        defaultProjectName: "",
        autoLogin: false,
        requireNewSession: true,
        requireExactAlias: false,
    },
    copyright: {
        show: true,
        holder: "TPM",
        year: "2024"
    }
    loginReturnUrls: true, // Toggle appending return urls to restore the previous location when redirected to the login form 
    locale: "en-US", // Set the default locale for displaying dates and numbers
    dateFormat: {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    },
    // Whether to show debugging information in the console
    debug: false,
    allowSingleSignOn: false,
    accountManagement: {
        allowForgotPassword: false,
        allowChangePassword: false,
        allowCreateAccount: false,
    },
    sidebarLinks: [
        {
            title: "Projects",
            icon: "projects",
            href: "projects.html",
        },
        {
            title: "DriveApps",
            icon: "drive-apps",
            href: "drive-apps.html",
        },
        {
            title: "History",
            icon: "history",
            href: "history.html",
        },
        // {
        //     title: "Reset Password",
        //     icon: "reset",
        //     href: "query?DWConstantForm=PasswordReset",
        // },
    ],
    images: {
        // You may use a different (or same) company logo for the login and sidebar
        // You may wish to do this due to the color of the logo and contrast with the background color
        // Here is an example with svgs and with pngs
        // login: "dist/img/logo-dark.svg",
        // sidebar: "dist/img/logo-light.svg",
        login: "dist/img/tpm_logo_color.png",
        sidebar: "dist/img/tpm_logo_white.png",
        // By default the login screen will show a static cover image
        // You can change it to a different image here.
        loginCover: "dist/img/login-cover.png",
        // You can use a series of images instead of a static cover image by enabling the carousel
        // These will fade into the next image every 'interval' seconds
        // You may use as many as you want but the more you use the longer the page will take to load
        carousel: {
            enabled: false,
            interval: 7.5,
            images: [
                "dist/img/carousel-1.jpg",
                "dist/img/carousel-2.jpg",
                "dist/img/carousel-3.jpg",
                "dist/img/carousel-4.jpg",
            ],
        }
    },

};
