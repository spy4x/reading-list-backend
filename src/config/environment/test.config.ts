// Test specific configuration
export const testConfig = {
  port: process.env.PORT || 9002,

  mongo: {
    uri: 'mongodb://localhost/reading-list-test',
    debug: false
  }
};
