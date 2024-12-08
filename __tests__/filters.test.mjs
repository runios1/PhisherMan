import {
  evaluateSite,
  apiRequest,
  checkDomainAge,
  checkServerLocation,
  checkTopLevelDomain,
} from "../src/filters.mjs";
import assert from "assert";

describe("Filters Module Tests", () => {
  it("should pass API Request Test", async () => {
    const mockApiResponse = {
      WhoisRecord: {
        createdDate: "2020-01-01T00:00:00Z",
        registrant: {
          countryCode: "US",
        },
      },
    };

    const apiResponse = await apiRequest("google.com");
    assert.deepStrictEqual(apiResponse, mockApiResponse);
  });

  it("should pass Check Domain Age Test", () => {
    const mockApiResponse = {
      WhoisRecord: {
        createdDate: "2020-01-01T00:00:00Z",
      },
    };

    const domainAgeResult = checkDomainAge(mockApiResponse);
    assert.strictEqual(domainAgeResult, "Safe");
  });

  it("should pass Check Server Location Test", () => {
    const mockApiResponse = {
      WhoisRecord: {
        registrant: {
          countryCode: "US",
        },
      },
    };

    const serverLocationResult = checkServerLocation(mockApiResponse);
    assert.strictEqual(serverLocationResult, "Safe");
  });

  it("should pass Check Top-Level Domain Test", () => {
    const tldResult = checkTopLevelDomain("google.com");
    assert.strictEqual(tldResult, "Safe");
  });

  it("should pass Evaluate Site Test", async () => {
    const evaluateResult = await evaluateSite("http://example.com");
    assert.strictEqual(evaluateResult.status, "Safe");
  });
});
