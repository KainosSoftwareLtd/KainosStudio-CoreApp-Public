import { check, sleep } from 'k6';
import http from 'k6/http';

const PERFORMANCE_THRESHOLDS = {
  OVERALL_P95: 2000,
  PAGE_LOAD_P95: 2000,
  FORM_SUBMISSION_P95: 2000,
  FAILURE_RATE: 0.01
};

export const options = {
  thresholds: {
    http_req_failed: [`rate<${PERFORMANCE_THRESHOLDS.FAILURE_RATE}`],
    http_req_duration: [`p(95)<${PERFORMANCE_THRESHOLDS.OVERALL_P95}`],
    'http_req_duration{name:start_page}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_text}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_text_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:enter_number}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_number_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:select_option}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:select_option_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:enter_date}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_date_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:enter_address}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_address_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:enter_postcode}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_postcode_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:enter_phone}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_phone_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:enter_email}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:enter_email_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:check_answers}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`],
    'http_req_duration{name:check_answers_submit}': [`p(95)<${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}`],
    'http_req_duration{name:submitted}': [`p(95)<${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}`]
  },
  stages: [
    { duration: '30s', target: 100 },
    { duration: '60s', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

const BROWSER_HEADERS_FOR_GET = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
}

const BROWSER_HEADERS_FOR_POST = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded'
}


export default function () {
  const services = ['perf/Start%20page', 
    'perf/Enter%20Text%20Information',
    'perf/Enter%20a%20Number', 
    'perf/Select%20an%20Option', 
    'perf/Enter%20a%20Date', 
    'perf/Enter%20an%20Address', 
    'perf/Enter%20a%20Postcode', 
    'perf/Enter%20a%20Phone%20Number', 
    'perf/Enter%20an%20Email%20Address', 
    'perf/Check%20your%20answers%20before%20sending%20your%20application',
    'perf/Submitted'
  ];

  const testUrl = __ENV.PERF_TEST_URL;
  if (!testUrl) {
    throw new Error('PERF_TEST_URL environment variable is not set');
  }

  const formData = {
    'perf/Enter%20Text%20Information': 'f-text=Magda',
    'perf/Enter%20a%20Number': 'f-text-2=42',
    'perf/Select%20an%20Option': 'f-radio=Polish',
    'perf/Enter%20a%20Date': 'f-dateInput-day=15&f-dateInput-month=08&f-dateInput-year=2025',
    'perf/Enter%20an%20Address': 'f-addressInput-line1=Main+Street+11b&f-addressInput-line2=&f-addressInput-town=Plymouth&f-addressInput-county=Devon&f-addressInput-postcode=PL1+7HJ',
    'perf/Enter%20a%20Postcode': 'f-addressInput-2=PL3+8JK',
    'perf/Enter%20a%20Phone%20Number': 'f-phoneNumberInput=07700+900+982',
    'perf/Enter%20an%20Email%20Address': 'f-emailInput-2=mail%40mail.com',
    'perf/Check%20your%20answers%20before%20sending%20your%20application': 'action=submit'
  };

  services.forEach((service, index) => {
    const tagNames = [
      'start_page', 
      'enter_text', 
      'enter_number', 
      'select_option', 
      'enter_date', 
      'enter_address', 
      'enter_postcode', 
      'enter_phone', 
      'enter_email', 
      'check_answers', 
      'submitted'
    ];
    const tagName = tagNames[index] || `endpoint_${index}`;
    

    // GET request to load the page
    let res = http.get(`${testUrl}/${service}`, {
      headers: BROWSER_HEADERS_FOR_GET,
      tags: { name: tagName }
    });
    
    check(res, { 
      [`${service} GET status was 200`]: (r) => {
        const isSuccess = r.status == 200;
        if (!isSuccess) {
          console.error(`❌ GET ${service} failed - Actual Status: ${r.status}, Expected: 200`);
        }
        return isSuccess;
      },
      [`${service} GET response time < ${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}ms`]: (r) => {
        const isWithinThreshold = r.timings.duration < PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95;
        if (!isWithinThreshold) {
          console.error(`❌ GET ${service} timing failed - Duration: ${r.timings.duration}ms, Threshold: ${PERFORMANCE_THRESHOLDS.PAGE_LOAD_P95}ms`);
        }
        return isWithinThreshold;
      }
    });
    
    // Simulate user reading/filling time
    sleep(Math.random() * 2 + 1); // 1-3 seconds
    

    // POST request for form submission
    if (formData[service]) {
      const postRes = http.post(`${testUrl}/${service}`, formData[service], {
        headers: BROWSER_HEADERS_FOR_POST,
        tags: { name: `${tagName}_submit` }
      });
            
      check(postRes, { 
        [`${service} POST status was 200`]: (r) => {
          const isSuccess = r.status == 200;
          if (!isSuccess) {
            console.error(`❌ POST ${service} failed - Actual Status: ${r.status}, Expected: 200`);
          }
          return isSuccess;
        },
        [`${service} POST response time < ${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}ms`]: (r) => {
          const isWithinThreshold = r.timings.duration < PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95;
          if (!isWithinThreshold) {
            console.error(`❌ POST ${service} timing failed - Duration: ${r.timings.duration}ms, Threshold: ${PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_P95}ms`);
          }
          return isWithinThreshold;
        }
      });
      
      // Small delay after form submission
      sleep(0.5);
    }
    
    // Small delay between requests to simulate user behavior
    sleep(0.5);
  });

  sleep(1);
}
