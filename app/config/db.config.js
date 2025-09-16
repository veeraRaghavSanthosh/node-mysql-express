// Use test config in test environment, otherwise use production config
if (process.env.NODE_ENV === "test") {
  module.exports = require("./db.config.test.js");
} else {
  module.exports = {
    HOST: "us-cdbr-iron-east-02.cleardb.net",
    USER: "b7e24378878xxx",
    PASSWORD: "0200exxx",
    DB: "heroku_7643ec736354xxx"
  };
}
