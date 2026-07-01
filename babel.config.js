module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          alias: {
            '@constants': './src/constants',
            '@types':     './src/types',
            '@lib':       './src/lib',
            '@services':  './src/services',
            '@store':     './src/store',
            '@hooks':     './src/hooks',
            '@components':'./src/components',
            '@screens':   './src/screens',
            '@navigation':'./src/navigation',
          },
        },
      ],
      // Required by react-native-reanimated — must be last
      'react-native-reanimated/plugin',
    ],
  };
};
