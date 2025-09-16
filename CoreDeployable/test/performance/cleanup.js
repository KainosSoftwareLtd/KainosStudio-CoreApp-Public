import { LambdaClient, DeleteProvisionedConcurrencyConfigCommand } from '@aws-sdk/client-lambda';

const FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME || 'kainoscore-app-dev';
const AWS_REGION = process.env.AWS_REGION || 'eu-west-2';
const LAMBDA_QUALIFIER = 'CoreLambda';

const lambdaClient = new LambdaClient({ 
  region: AWS_REGION,
});

async function removeProvisionedConcurrency(functionName) {
  console.log(`Removing provisioned concurrency for function: ${functionName}`);
  
  const command = new DeleteProvisionedConcurrencyConfigCommand({
    FunctionName: functionName,
    Qualifier: LAMBDA_QUALIFIER,
  });

  try {
    await lambdaClient.send(command);
    console.log(`Provisioned concurrency removed successfully`);
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`No provisioned concurrency configuration found (already removed)`);
    } else {
      console.error(`Failed to remove provisioned concurrency:`, error.message);
      throw error;
    }
  }
}

async function cleanup() {
  if (!process.env.LAMBDA_FUNCTION_NAME) {
    throw new Error('LAMBDA_FUNCTION_NAME environment variable is required');
  }
  
  console.log('Starting Lambda cleanup...');
  console.log(`Function: ${FUNCTION_NAME}`);
  console.log(`Region: ${AWS_REGION}`);
  await removeProvisionedConcurrency(FUNCTION_NAME);

}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanup()
    .then(() => {
      console.log('Cleanup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup script failed:', error);
      process.exit(1);
    });
}