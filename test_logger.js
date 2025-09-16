const logger = require("./app/utils/logger.js");

console.log("Testing logger with different levels...");

// Test with default log level (INFO)
logger.trace("This trace message should not appear (default level: INFO)");
logger.debug("This debug message should not appear (default level: INFO)"); 
logger.info("This info message should appear");
logger.warn("This warning message should appear");
logger.error("This error message should appear");

// Test with DEBUG level
logger.setLogLevel("DEBUG");
console.log("\\nTesting with DEBUG level...");
logger.trace("This trace message should not appear (level: DEBUG)");
logger.debug("This debug message should appear (level: DEBUG)");
logger.info("This info message should appear (level: DEBUG)");

// Test with TRACE level  
logger.setLogLevel("TRACE");
console.log("\\nTesting with TRACE level...");
logger.trace("This trace message should appear (level: TRACE)");
logger.debug("This debug message should appear (level: TRACE)");
logger.info("This info message should appear (level: TRACE)");
