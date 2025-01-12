import dotenv from "dotenv";
import fetch from "node-fetch";
import { getRatingsForDomain } from "./db_query.mjs";

dotenv.config();

async function checkUrlWithVirusTotal(domain) {
  const apiKey = process.env.virustotal_key;
  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        method: "GET",
        headers: {
          "x-apikey": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const maliciousVotes =
      data.data.attributes.last_analysis_stats.malicious || 0;
    const suspiciousVotes =
      data.data.attributes.last_analysis_stats.suspicious || 0;

    const output =
      (maliciousVotes + suspiciousVotes) /
      (data.data.attributes.last_analysis_stats.harmless +
        data.data.attributes.last_analysis_stats.malicious +
        data.data.attributes.last_analysis_stats.suspicious +
        data.data.attributes.last_analysis_stats.timeout +
        data.data.attributes.last_analysis_stats.undetected);

    const score = Math.max(
      0,
      1 - 0.333 * maliciousVotes - 0.15 * suspiciousVotes
    );

    return score;
  } catch (error) {
    console.error("Error checking URL with VirusTotal:", error);
    return { error: true };
  }
}

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
    if (
      data.WhoisRecord &&
      data.WhoisRecord.registryData.createdDateNormalized
    ) {
      domainCreationDate = new Date(
        data.WhoisRecord.registryData.createdDateNormalized
      );
    } else {
      // Record doesn't have creation date data
      return 0;
    }

    // Calculate domain age in years
    const ageInYears =
      (Date.now() - domainCreationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    return Math.min(1, ageInYears);
  } catch (error) {
    console.error("Error checking domain age:", error);
    return "Unknown (Error occurred)";
  }
}

export function checkServerLocation(data) {
  const suspiciousRegions = [
    "IN",
    "NG",
    "RU",
    "ML",
    "GA",
    "CN",
    "IR",
    "PK",
    "AF",
  ];

  let domainCountryCode;
  if (
    data.WhoisRecord &&
    data.WhoisRecord.registryData.registrant &&
    data.WhoisRecord.registryData.registrant.countryCode
  ) {
    domainCountryCode = data.WhoisRecord.registryData.registrant.countryCode;
  } else if (
    data.WhoisRecord &&
    data.WhoisRecord.registrant &&
    data.WhoisRecord.registrant.countryCode
  ) {
    domainCountryCode = data.WhoisRecord.registrant.countryCode;
  } else {
    // Record doesn't have location data
    return 1;
  }

  return suspiciousRegions.includes(domainCountryCode) ? 0 : 1;
}

export function checkTopLevelDomain(domain) {
  const auspiciousTLDs = [".sx", ".cc", ".lc", ".cn"]; // According to www.spamhaus.org
  const tld = domain.substring(domain.lastIndexOf("."));

  return auspiciousTLDs.includes(tld) ? 0 : 1;
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

    return userRating;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to calculate user rating");
  }
}

export async function evaluateSite(url) {
  const domain = new URL(url).hostname;
  const results = [];
  results.push(await checkUrlWithVirusTotal(domain));

  const data = await apiRequest(domain);
  results.push(checkDomainAge(data));
  results.push(checkServerLocation(data));
  results.push(checkTopLevelDomain(domain));
  results.push(await calculateUserRating(domain));

  // Print detailed results
  console.log("Evaluation Results:", results);

  const weights = [60, 8, 8, 8, 16];
  let score = 0;

  for (let i = 0; i < results.length; i++) {
    score += results[i] * weights[i];
  }

  return score;
}
