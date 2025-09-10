export default {
  paths: ['test/features/*.feature'],
  loader: ['ts-node/esm'],
  import: ['test/step_definitions/**/*.ts'],
  format: ['progress', ['html', 'test/cucumber-report.html']],
  parallel: 1,
};
