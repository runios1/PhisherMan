import dotenv from "dotenv";
import fetch from "node-fetch";
import { promises as dns } from "dns";
import { getRatingsForDomain } from "./db_query.mjs";

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
    const addresses = await dns.resolve(domain, "CNAME");
    if (addresses.length === 0) {
      throw new Error("No IP address found for the domain.");
    }
    const resolvedIP = addresses[0]; // Take the first resolved IP
    console.log(`Resolved IP addresses: ${addresses}`);
    for (const resolvedIP of addresses) {
      console.log(`Checking resolved IP: ${resolvedIP}`);
    }

    // Perform reverse DNS lookup on the resolved IP
    const reverseDomains = await dns.reverse(resolvedIP);
    if (reverseDomains.length === 0) {
      throw new Error("No reverse DNS entry found for the IP.");
    }
    const backResolvedDomain = reverseDomains[0]; // Take the first reverse entry
    console.log(`Back resolved domain: ${reverseDomains}`);

    // Compare the original domain with the back-resolved domain
    return reverseDomains.includes(domain)
      ? "Safe"
      : "Suspicious (DNS Mismatch)";
  } catch (error) {
    console.error("Error performing DNS check:", error.message);
    return "Unknown (Error occurred)";
  }
}

async function calculateUserRating(domain) {
  try {
    const ratings = await getRatingsForDomain(domain);
    const userRating =
      ratings.negative_reports + ratings.positive_reports !== 0
        ? ratings.positive_reports /
          (ratings.negative_reports + ratings.positive_reports)
        : 1; // If no reports at all return 1. If no positive reports return 0.

    console.log(`User rating: ${userRating}`);

    return userRating < 0.6 ? "Low User Rating" : "Safe";
  } catch (err) {
    console.error(err);
    throw new Error("Failed to calculate user rating");
  }
}

export async function evaluateSite(url) {
  const domain = new URL(url).hostname;
  const data = await apiRequest(domain);
  // Combine filters
  const results = [];
  results.push(checkDomainAge(data));
  results.push(checkServerLocation(data));
  results.push(checkTopLevelDomain(domain));
  // results.push(await performDNSCheck(domain));
  results.push(await calculateUserRating(domain));

  // Print detailed results
  console.log("Evaluation Results:", results);

  // Aggregate results
  const suspiciousFilters = results.filter((result) => result !== "Safe");
  return ((results.length - suspiciousFilters.length) / 4) * 100;
  // return {
  //   status: ((results.length - suspiciousFilters.length) / 4) * 100,
  //   details: suspiciousFilters,
  // };
}

// Test: Run evaluation on google.com
// (async function testGoogle() {
//   console.log("Running evaluation for google.com...");
//   const result = await evaluateSite("https://google.com");
//   console.log("Evaluation Result for google.com:", result);
// })();
