import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.1'],
  },
};

const BROWSER_HEADERS_FOR_GET = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
}

export default function () {
  const testUrl = __ENV.PERF_TEST_URL;
  if (!testUrl) {
    throw new Error('PERF_TEST_URL environment variable is not set');
  }

  console.log('🔥 Starting Lambda warmup...');

  const warmupRequests = [];
    const warmupEndpoints = [
    'perf/Start%20page',
    'perf/Enter%20Text%20Information', 
    'perf/Enter%20a%20Number',
    'perf/Select%20an%20Option',
    'perf/Enter%20a%20Date'
  ];

  warmupEndpoints.forEach((endpoint, index) => {
    const res = http.get(`${testUrl}/${endpoint}`, {
      headers: BROWSER_HEADERS_FOR_GET,
      tags: { name: `warmup_${index + 1}` }
    });
    
    check(res, {
      [`Warmup ${index + 1} - ${endpoint} responded`]: (r) => {
        const success = r.status >= 200 && r.status < 500;
        console.log(`${success ? '✅' : '❌'} Warmup ${index + 1}: Status ${r.status}, Duration: ${r.timings.duration}ms`);
        return success;
      }
    });
    sleep(0.5);
  });
  
  sleep(2);
  
  console.log('✅ Warmup phase finished - Lambdas should be ready!');
}
