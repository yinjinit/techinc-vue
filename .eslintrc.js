module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: "vuetify",
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "max-len": [
      "error",
      { "code": 80 }]
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
