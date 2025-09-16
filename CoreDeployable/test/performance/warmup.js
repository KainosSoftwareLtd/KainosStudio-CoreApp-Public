import { LambdaClient, PutProvisionedConcurrencyConfigCommand, DeleteProvisionedConcurrencyConfigCommand, GetProvisionedConcurrencyConfigCommand } from '@aws-sdk/client-lambda';

const FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME || 'kainoscore-app-dev';
const PROVISIONED_CONCURRENCY = parseInt(process.env.PROVISIONED_CONCURRENCY || '5');
const AWS_REGION = process.env.AWS_REGION || 'eu-west-2';
const WARMUP_DURATION_MS = parseInt(process.env.WARMUP_DURATION_MS || '30000');
const LAMBDA_QUALIFIER = 'CoreLambda';

const lambdaClient = new LambdaClient({ 
  region: AWS_REGION,
});

async function setProvisionedConcurrency(functionName, concurrency) {
  console.log(`Setting provisioned concurrency to ${concurrency} for function: ${functionName}`);
  
  const command = new PutProvisionedConcurrencyConfigCommand({
    FunctionName: functionName,
    Qualifier: LAMBDA_QUALIFIER,
    ProvisionedConcurrentExecutions: concurrency,
  });

  try {
    const response = await lambdaClient.send(command);
    console.log(`Provisioned concurrency set successfully:`, response.Status);
    return response;
  } catch (error) {
    console.error(`Failed to set provisioned concurrency:`, error.message);
    throw error;
  }
}

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

async function waitForProvisionedConcurrency(functionName, maxWaitTime = 180000) {
  console.log(`Waiting for provisioned concurrency to become ready`);
  
  const startTime = Date.now();
  const checkInterval = 10000;
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const command = new GetProvisionedConcurrencyConfigCommand({
        FunctionName: functionName,
        Qualifier: LAMBDA_QUALIFIER,
      });
      
      const response = await lambdaClient.send(command);
      
      if (response.Status === 'READY') {
        console.log(`Provisioned concurrency is ready!`);
        return true;
      }
      else {
        console.log(`Provisioned concurrency is not ready yet. Current status: ${response.Status}`);
      }
            
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      
    } catch (error) {
      console.error(`Error checking provisioned concurrency status:`, error.message);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }
  
  console.log(`Timeout waiting for provisioned concurrency to become ready`);
  return false;
}

async function warmupLambda() {
  if (!process.env.LAMBDA_FUNCTION_NAME) {
    throw new Error('LAMBDA_FUNCTION_NAME environment variable is required');
  }
  
  console.log('Starting Lambda warmup with provisioned concurrency...');
  console.log(`Function: ${FUNCTION_NAME}`);
  console.log(`Region: ${AWS_REGION}`);
  console.log(`Provisioned Concurrency: ${PROVISIONED_CONCURRENCY}`);
  
  try {
    await setProvisionedConcurrency(FUNCTION_NAME, PROVISIONED_CONCURRENCY);
    const isReady = await waitForProvisionedConcurrency(FUNCTION_NAME);
    
    if (isReady) {
      console.log(`Keeping Lambda warm for ${WARMUP_DURATION_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, WARMUP_DURATION_MS));
      console.log('Warmup completed!');
    } else {
      console.log('Proceeding with performance tests even though warmup didn\'t fully complete.');
    }
    
  } catch (error) {
    console.error('Warmup failed:', error.message);
    throw error;
  } finally {
    try {
      await removeProvisionedConcurrency(FUNCTION_NAME);
    } catch (cleanupError) {
      console.error('Failed to clean up provisioned concurrency:', cleanupError.message);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  warmupLambda()
    .then(() => {
      console.log('Warmup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Warmup script failed:', error);
      process.exit(1);
    });
}
