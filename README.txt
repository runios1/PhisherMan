# PhisherMan

PhisherMan is a Chrome extension designed to help users identify phishing websites and enhance their online security.
 The extension evaluates the current website for potential security threats and allows users to report websites as safe or malicious.

## Features
- **Evaluate Website Security:** Press a button to check if the current website is suspicious or safe.
- **Dynamic Safety Score:** The extension returns a percentage-based safety score:
  - **80%+**: Relatively safe
  - **50%-80%**: Relatively unsafe (warning)
  - **<50%**: Dangerous
- **User Reporting:**
  - Report websites as "Safe."
  - Report websites as "Malicious."
- **Dynamic Feedback:** Get real-time feedback on the website's status.

## Installation
### Server
- Install node js
- Open powershell in the path of the project
- Run `node src/server.mjs`
### Front-end
- Clone or download the repository to your local machine.
- Open Chrome and navigate to `chrome://extensions/`.
- Enable **Developer mode** using the toggle in the top-right corner.
- Click **Load unpacked** and select the project folder.
- The extension should now be visible in the Chrome toolbar.

## Usage
1. Click on the PhisherMan icon in the Chrome toolbar to open the popup.
2. Use the following buttons:
   - **Send:** Evaluate the current website.
   - **Report as Malicious:** Mark the current website as unsafe.
   - **Report as Safe:** Mark the current website as safe.
3. View the result dynamically displayed in the popup window, including the safety percentage and a classification.
