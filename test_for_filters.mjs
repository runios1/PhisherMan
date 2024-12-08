import {
  evaluateSite,
  apiRequest,
  checkDomainAge,
  checkServerLocation,
  checkTopLevelDomain,
} from "./path/to/your/module";
import assert from "assert";

(async function runTests() {
  console.log("Running Tests...");

  // Mock API responses
  const validApiResponse = {
    WhoisRecord: {
      createdDate: "2020-01-01T00:00:00Z",
      registrant: {
        countryCode: "US",
      },
    },
  };

  const invalidApiResponse = {
    WhoisRecord: {},
  };

  // Test: API Request (Success and Failure)
  console.log("Test: API Request");
  try {
    const data = await apiRequest("google.com");
    assert(data.WhoisRecord, "API response should contain WhoisRecord");
    console.log("API Request Success Test Passed");
  } catch (error) {
    console.error("API Request Success Test Failed", error);
  }
  try {
    await apiRequest("invalid_domain"); // Simulate an invalid domain request
    console.error("API Request Failure Test Failed: Error was expected");
  } catch (error) {
    console.log("API Request Failure Test Passed");
  }

  // Test: Check Domain Age (Success and Failure)
  console.log("Test: Check Domain Age");
  try {
    const result = checkDomainAge("google.com", validApiResponse);
    assert(result === "Safe", "Domain age should be marked as Safe");
    console.log("Check Domain Age Success Test Passed");
  } catch (error) {
    console.error("Check Domain Age Success Test Failed", error);
  }
  try {
    checkDomainAge("google.com", invalidApiResponse);
    console.error("Check Domain Age Failure Test Failed: Error was expected");
  } catch (error) {
    console.log("Check Domain Age Failure Test Passed");
  }

  // Test: Check Server Location (Success and Failure)
  console.log("Test: Check Server Location");
  try {
    const result = checkServerLocation(validApiResponse);
    assert(result === "Safe", "Server location should be marked as Safe");
    console.log("Check Server Location Success Test Passed");
  } catch (error) {
    console.error("Check Server Location Success Test Failed", error);
  }
  try {
    checkServerLocation(invalidApiResponse);
    console.error(
      "Check Server Location Failure Test Failed: Error was expected"
    );
  } catch (error) {
    console.log("Check Server Location Failure Test Passed");
  }

  // Test: Check Top-Level Domain (Success and Failure)
  console.log("Test: Check Top-Level Domain");
  try {
    const result = checkTopLevelDomain("example.com");
    assert(result === "Safe", "TLD should be marked as Safe");
    console.log("Check Top-Level Domain Success Test Passed");
  } catch (error) {
    console.error("Check Top-Level Domain Success Test Failed", error);
  }
  try {
    const result = checkTopLevelDomain("example.xyz");
    assert(
      result === "Suspicious (Unusual Top-Level Domain)",
      "TLD should be marked as Suspicious"
    );
    console.log("Check Top-Level Domain Failure Test Passed");
  } catch (error) {
    console.error("Check Top-Level Domain Failure Test Failed", error);
  }

  // Test: Evaluate Site (Success and Failure)
  console.log("Test: Evaluate Site");
  try {
    const result = await evaluateSite("https://example.com");
    assert(
      result.status === "Safe" || result.status === "Suspicious",
      "Site evaluation status should be valid"
    );
    assert(
      Array.isArray(result.details),
      "Site evaluation details should be an array"
    );
    console.log("Evaluate Site Success Test Passed");
  } catch (error) {
    console.error("Evaluate Site Success Test Failed", error);
  }
  try {
    await evaluateSite("https://invalid_domain");
    console.error("Evaluate Site Failure Test Failed: Error was expected");
  } catch (error) {
    console.log("Evaluate Site Failure Test Passed");
  }

  console.log("All tests completed.");
})();
