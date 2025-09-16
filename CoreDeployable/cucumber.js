export default {
  paths: ['./test/features/*.feature'],
  loader: ['ts-node/esm'],
  import: [
    './test/step_definitions/**/*.ts',
    './test/step_definitions/**/*.js'
  ],
  format: ['progress', ['html', 'test/cucumber-report.html']],
  parallel: 1,
};
