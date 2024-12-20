import dotenv from "dotenv";
import fetch from "node-fetch";
import { promises as dns } from "dns";

dotenv.config();

// Function to query WHOIS API for domain creation date
export async function apiRequest(domain) {
  const apiKey = process.env.whois_key;

  const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WHOIS API returned status ${response.status}`);
    }

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (parseError) {
      console.error("Invalid JSON response:", responseText);
      throw new Error("Unexpected response format from WHOIS API.");
    }
  } catch (error) {
    console.error("Error fetching WHOIS data:", error);
    throw error;
  }
}

// Function to check domain age based on the creation date
export function checkDomainAge(data) {
  try {
    let domainCreationDate;
    // Fetch the domain creation
    if (data.WhoisRecord && data.WhoisRecord.createdDate) {
      domainCreationDate = new Date(data.WhoisRecord.createdDate);
    } else {
      // Recoed doesn't have creation date data
      return "Suspicious (New Domain)";
    }

    // Calculate domain age in years
    const ageInYears =
      (Date.now() - domainCreationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    return ageInYears < 1 ? "Suspicious (New Domain)" : "Safe";
  } catch (error) {
    console.error("Error checking domain age:", error);
    return "Unknown (Error occurred)";
  }
}

export function checkServerLocation(data) {
  const suspiciousRegions = ["IN", "NG", "RU"];
  let domainCountryCode;
  if (
    data.WhoisRecord &&
    data.WhoisRecord.registrant &&
    data.WhoisRecord.registrant.countryCode
  ) {
    domainCountryCode = data.WhoisRecord.registrant.countryCode;
  } else {
    // Recoed doesn't have location data
    return "Suspicious Location";
  }

  return suspiciousRegions.includes(domainCountryCode)
    ? "Suspicious Location"
    : "Safe";
}

export function checkTopLevelDomain(domain) {
  const auspiciousTLDs = [".sx", ".cc", ".lc", ".cn"]; // According to www.spamhaus.org
  const tld = domain.substring(domain.lastIndexOf("."));

  return auspiciousTLDs.includes(tld)
    ? "Suspicious (Unusual Top-Level Domain)"
    : "Safe";
}

async function performDNSCheck(domain) {
  try {
    console.log(`Performing DNS check for domain: ${domain}`);

    // Resolve the domain to an IP address
    const addresses = await dns.resolve4(domain);
    if (addresses.length === 0) {
      throw new Error("No IP address found for the domain.");
    }
    const resolvedIP = addresses[0]; // Take the first resolved IP
    console.log(`Resolved IP address: ${resolvedIP}`);

    // Perform reverse DNS lookup on the resolved IP
    const reverseDomains = await dns.reverse(resolvedIP);
    if (reverseDomains.length === 0) {
      throw new Error("No reverse DNS entry found for the IP.");
    }
    const backResolvedDomain = reverseDomains[0]; // Take the first reverse entry
    console.log(`Back resolved domain: ${backResolvedDomain}`);

    // Compare the original domain with the back-resolved domain
    return backResolvedDomain.includes(domain)
      ? "Safe"
      : "Suspicious (DNS Mismatch)";
  } catch (error) {
    console.error("Error performing DNS check:", error.message);
    return "Unknown (Error occurred)";
  }
}

async function calculateUserRating(domain) {
  // Mocked example: Replace with actual rating retrieval from your database
  const userRating = 3.2; // Example rating (out of 5)
  return userRating < 3 ? "Low User Rating" : "Safe";
}

export async function evaluateSite(url) {
  const domain = new URL(url).hostname;
  const data = await apiRequest(domain);
  // Combine filters
  const results = [];
  results.push(checkDomainAge(data));
  results.push(checkServerLocation(data));
  results.push(checkTopLevelDomain(domain));
  results.push(await performDNSCheck(domain));
  results.push(await calculateUserRating(domain));

  // Print detailed results
  console.log("Evaluation Results:", results);

  // Aggregate results
  const suspiciousFilters = results.filter((result) => result !== "Safe");
  return {
    status: suspiciousFilters.length > 0 ? "Suspicious" : "Safe",
    details: suspiciousFilters,
  };
}

// Test: Run evaluation on google.com
(async function testGoogle() {
  console.log("Running evaluation for google.com...");
  const result = await evaluateSite("https://google.com");
  console.log("Evaluation Result for google.com:", result);
})();