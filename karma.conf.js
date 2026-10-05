module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: require('path').join(__dirname, 'coverage/stations-task'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeKeepAwake'],
    customLaunchers: {
      // A covered or background Chrome window stops running timers and animation frames, which
      // made the Ionic overlay specs (they wait for `didPresent`) time out.
      ChromeKeepAwake: {
        base: 'Chrome',
        flags: [
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-background-timer-throttling',
          '--disable-features=CalculateNativeWinOcclusion',
        ],
      },
    },
    restartOnFileChange: true,
  });
};
