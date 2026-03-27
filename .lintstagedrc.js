module.exports = {
  '*.{ts,tsx}': ['eslint --fix --max-warnings 0'],
  '*.{ts,tsx,js,jsx,json,md,css}': ['prettier --write'],
};
