# TPM Modified Corporate Theme (MCT)

A highly customizable DriveWorks Live web interface based on DriveWorks' Corporate Theme template.

## Overview

TPM's Modified Corporate Theme (MCT) is a fork of DriveWorks' Integration Theme Corporate Site example that adds extensive customization options through a configuration file system. It provides a professional, modern interface for DriveWorks Live while maintaining the core functionality of the original template.

### Features

- All features from the original DriveWorks Corporate Theme
- Extensive customization options via configuration file
- Simplified deployment through configuration separation
- Enhanced login page with carousel support
- Configurable navigation and branding
- Support for guest users and SSO
- Account management integration
- Customizable styling including fonts, colors, and layouts

## Prerequisites

- DriveWorks Live (Version 21.0 or later)
- Web server capable of hosting static files
- Basic understanding of DriveWorks Live configuration
- Knowledge of HTML/CSS/JavaScript for advanced customizations

## Installation

1. Clone this repository or download as a ZIP file
2. Copy `config.js` to create your `configUser.js` file
3. Configure your DriveWorks Live Integration Theme settings:
   - Set up Group Aliases in `DriveWorksConfigUser.xml`
   - Configure CORS settings for your domain
   - Enable HTTPS if using SSO or cross-domain access
4. Update `configUser.js` with your specific settings:
   ```javascript
   const config = {
     serverUrl: "https://your-driveworks-server.com",
     groupAlias: "your-group-alias",
     // Additional configuration...
   }
   ```
5. Host the files on your web server

## Configuration

### Essential Settings

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| `serverUrl` | String | Full URL to DriveWorks Live server | `""` |
| `groupAlias` | String | Public alias for DriveWorks Group | `""` |
| `guestAlias` | String | Alias for guest access | `""` |

### Login Settings

| Setting | Type | Options | Description |
|---------|------|---------|-------------|
| `login.columnLocation` | String | `"left"`, `"right"`, `"center"` | Position of login form |
| `login.redirectUrl` | String | Valid URL path | Page to load after login |
| `usernameType` | String | `"Username"`, `"Email Address"` | Login field type |

### Visual Customization

| Setting | Type | Description | Example |
|---------|------|-------------|---------|
| `styles.text.font` | String | Font family name | `"Poppins"` |
| `styles.color.primary` | String | CSS color value | `"#000000"` |
| `styles.button.radius` | String | CSS border-radius | `"2rem"` |

[View full configuration reference](#configuration-reference)

## Usage

### Basic Setup

The most common configuration involves setting up server connection and basic branding:

```javascript
const config = {
  serverUrl: "https://dw21.api.yourdomain.com",
  groupAlias: "public",
  siteName: "Your Company",
  images: {
    login: "dist/img/your-logo.png",
    sidebar: "dist/img/your-logo-white.png"
  }
}
```

### Advanced Customization

For needs beyond configuration options:

1. Fork this repository
2. Make structural changes as needed
3. Maintain a separate branch for your customizations
4. Pull updates from the main repository as needed


## Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue templates when available
3. Include:
   - MCT version
   - DriveWorks Live version
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if relevant

## License

The original DriveWorks Integration Theme Corporate Site is licensed under MIT.
TPM reserves the right to their modifications. Contact us directly if you would like to use this template: driveworksteam@tpm.com

## Configuration Reference

[View full configuration reference](#configuration-reference)

## Support

For support:

1. Check the documentation
2. Search existing issues
3. Open a new issue following the guidelines
4. Contact TPM directly for enterprise support driveworksteam@tpm.com

## Authors

- Joseph C. Caswell - TPM, Inc.
- TPM Development Team

## Acknowledgments

- Based on DriveWorks' Integration Theme Corporate Site
- DriveWorks Development Team for the original template
