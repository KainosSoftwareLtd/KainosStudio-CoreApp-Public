const envConfig = {
  get port() {
    return process.env.PORT || 3003;
  },
  get logLevel() {
    return process.env.LOG_LEVEL || 'info';
  },
};

export default envConfig;
