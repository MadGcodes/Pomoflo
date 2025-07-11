module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',  // Include this if using TypeScript
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
};
