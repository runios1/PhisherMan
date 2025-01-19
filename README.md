# PhisherMan

PhisherMan is a Chrome extension designed to help users identify malicious websites and enhance their online security.
 The extension evaluates the current website for potential security threats and allows users to report websites as safe or malicious.

## Project Goals
The primary goal is to create a Chrome extension that enhances user
safety while browsing by identifying potential phishing websites. Specific
measurable outcomes include successfully flagging phishing websites based on
suspicious characteristics, collecting and displaying user feedback, and
achieving a high detection accuracy rate without significantly impacting
browsing speed.

## Features
- **Evaluate Website Security:** Press a button to check if the current website is suspicious or safe.
- **Dynamic Safety Score:** The extension returns a percentage-based safety score:
  - **80%+**: Relatively safe
  - **50%-80%**: Relatively unsafe (warning)
  - **<50%**: Dangerous
- **User Reporting:**
  - Report websites as "Safe"
  - Report websites as "Malicious"
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

## Obstacles
1. Accurately identifying malicious websites without generating false positives or negatives.
2. Maintaining real-time performance without affecting browser speed or user experience.
3. Handling edge cases, such as newly registered or highly obfuscated websites, where data may be limited.
4. Implementing back-resolve functionality, which proved technically challenging due to DNS limitations and inconsistencies.

## Handling These Obstacles
1. We tested a large number of websites, safe, suspicious and malicious and changed the weights of the filters accordingly. Some ratings are still not fully acurate but user ratings can change over time and make for a more accurate analysis.
2. We optimized the extension's code to minimize resource usage and ensure that website assessments occur with only moderate delays. Due to API performance some website analyses take longer than expected.
3. Newly registered websites and websites with limited data are flaged as suspicious by default by some filters to assure a more accurate rating.
4. Recognizing the technical challenges early on, we pivoted to using an existing solution (the Virus-total API) to achieve a comparable outcome with minimal impact on development timelines.

## Did We Achieve the Goals?
The extension successfully assesses websites and provides a probability score for malicious intent.
Integration with the Chrome browser is seamless, offering real-time analysis without noticeable performance impact.
While we initially aimed to use reverse DNS lookup for determining website safety, this goal was not achieved due to technical challenges.
Instead, we integrated the Virus-total API to enhance our extension's functionality and boost detection accuracy.
