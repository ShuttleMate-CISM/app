/**
 * Authentication Event Logger
 * Logs all authentication attempts for security auditing (ISO/IEC 27001:2013 compliance)
 *
 * Logs include: Timestamp, IP Address, Username, Event Outcome
 * NEVER logs passwords or sensitive data
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../logs");
const logFile = path.join(logDir, "auth-events.log");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Log authentication events
 * @param {string} username - Username attempting authentication
 * @param {string} ipAddress - IP address of the request
 * @param {string} outcome - Result of authentication (SUCCESS/FAIL/LOCKOUT)
 * @param {string} event - Event type (LOGIN/REGISTER)
 */
export const logAuthEvent = (username, ipAddress, outcome, event = "LOGIN") => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] EVENT: ${event} | USERNAME: ${username} | IP: ${ipAddress} | OUTCOME: ${outcome}\n`;

  // Append to log file
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error("Failed to write auth log:", err);
    }
  });

  // Also log to console for development
  console.log(
    `🔐 Auth Event - ${event}: ${username} from ${ipAddress} - ${outcome}`,
  );
};

export default logAuthEvent;
