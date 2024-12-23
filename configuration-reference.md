# Configuration Reference

This document provides detailed information about all available configuration options in TPM's Modified Corporate Theme.

## Core Settings

### Server Connection
```javascript
{
  serverUrl: "",              // Full URL to DriveWorks Live server
  groupAlias: "",            // Public alias for main group
  guestAlias: "",           // Alias for guest access
  folder: "",              // Optional subfolder path
}
```

### Session Management
```javascript
{
  specificationPingInterval: 30,  // Seconds between ping requests (0 to disable)
  loginReturnUrls: true,         // Enable return URL after login redirect
  locale: "en-US",               // Default locale for dates/numbers
}
```

## Login Configuration

### Basic Settings
```javascript
{
  login: {
    redirectUrl: "projects.html",           // Default redirect after login
    redirectGuestUrl: "projects.html",      // Guest user redirect
    columnLocation: "right"                 // Form position: "left"|"right"|"center"
  },
  usernameType: "Username",                 // Field type: "Username"|"Email Address"
  passwordRequired: false,                  // Require password input
}
```

### Authentication Options
```javascript
{
  allowSingleSignOn: false,      // Enable SSO integration
  disableRegularLogin: false,    // Disable username/password login
  guestLogin: true,              // Allow guest access
}
```

### Account Management
```javascript
{
  accountManagement: {
    projectName: "AccountManagement",  // Project name for account functions
    guestAlias: "Guest",              // Override default guest alias
    createAccount: true,              // Enable account creation
    forgotPassword: true,             // Enable password reset
    resetPassword: true               // Enable password changes
  }
}
```

## Visual Customization

### Branding
```javascript
{
  images: {
    login: "dist/img/logo-dark.png",     // Login page logo
    sidebar: "dist/img/logo-light.png",  // Sidebar logo
    loginCover: "dist/img/cover.png",    // Login background
  },
  siteName: "Company Name",              // Browser tab title
}
```

### Login Cover Carousel
```javascript
{
  images: {
    carousel: {
      enabled: true,
      interval: 7.5,                     // Transition time in seconds
      images: [                          // Array of image paths
        "dist/img/carousel-1.jpg",
        "dist/img/carousel-2.jpg"
      ]
    }
  }
}
```

### Typography
```javascript
{
  styles: {
    text: {
      font: "Poppins",          // Main text font
      size: "12pt",            // Base font size
      color: "black",         // Text color
      lineHeight: "1.8"      // Line spacing
    },
    heading: {
      font: "Inter",         // Heading font
      size: "48pt",         // Heading size
      color: "black",      // Heading color
      weight: "bold",     // Font weight
      lineHeight: "1.2"  // Heading line spacing
    }
  }
}
```

### Colors
```javascript
{
  styles: {
    color: {
      primary: "#000000",       // Primary brand color
      secondary: "#00AEEF",     // Secondary brand color
      background: "white",      // Page background
      icon: "#00AEEF",         // Icon color
      focus: "#00AEEF"        // Focus state color
    }
  }
}
```

### Layout
```javascript
{
  styles: {
    sidebar: {
      background: "#292929",     // Sidebar background
      width: "18em",            // Sidebar width
      logoPadding: "1em",      // Logo padding
      textColor: "white"      // Sidebar text color
    },
    loginForm: {
      background: "white",      // Login form background
      padding: "1em",          // Form padding
      textColor: "black"      // Form text color
    }
  }
}
```

### Components
```javascript
{
  styles: {
    button: {
      radius: "2rem",           // Button corner radius
      color: "#00AEEF",        // Button background
      textColor: "white",      // Button text color
      colorHover: "#243A76",   // Hover background
      textColorHover: "white", // Hover text color
      border: "none"          // Button border
    },
    logo: {
      width: "50%"            // Logo width
    },
    projectCard: {
      background: "#efeeed",   // Project card background
      margin: "22px"          // Card spacing
    },
    inputRadius: "10pt"       // Form input corner radius
  }
}
```

## Navigation

### Sidebar Links
```javascript
{
  sidebarLinks: [
    {
      title: "Projects",        // Link text
      icon: "projects",         // Icon name
      href: "projects.html"     // Target URL
    }
    // Additional links...
  ]
}
```

## History View
```javascript
{
  history: {
    specLimitOnPage: 10,    // Items per page
    dateOrder: "desc",      // Initial sort: "asc"|"desc"
    showRunningSpecs: false // Show active specifications
  }
}
```

## Project Settings
```javascript
{
  project: {
    redirectOnClose: "details.html",  // After completion
    redirectOnCancel: "projects.html" // After cancellation
  }
}
```

## Development

### Debug Options
```javascript
{
  debug: false,              // Enable debug logging
  watermark: "Development"   // Development watermark text
}
```

## Copyright
```javascript
{
  copyright: {
    show: true,           // Show copyright notice
    holder: "Company",    // Copyright holder
    year: "2024"         // Copyright year
  }
}
```

## Notes

- All style values should use valid CSS units
- Colors can use any valid CSS color format
- Font families must be imported in the CSS or available on the system
- Images should use relative paths from the root directory
- Boolean values must be `true` or `false`, not strings
- Numeric values should not include units in the value
