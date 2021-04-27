import https from 'https';
import { Service } from './config';

interface OkCheckResult {
  ok: true;
  message: null;
}

interface FailedCheckResult {
  ok: false;
  message: string;
}

export type CheckResult = OkCheckResult | FailedCheckResult;

export function checkService (service: Service): Promise<CheckResult> {
  if (service.type === 'https') {

    if (service.method === 'GET') {

      return new Promise(function (resolve, reject) {
        const req = https.request(service.url, {
          method: 'GET',
          port: 443,
        }, function (res) {
          const expectedStatusCode = service.conditions.status;

          if (expectedStatusCode && res.statusCode !== expectedStatusCode) {
            return resolve({ ok: false, message: `status code ${res.statusCode} does not match expected status code of ${expectedStatusCode}.` });
          }
 
          return resolve({ ok: true, message: null });
        });

        req.on('error', function (err) {
          return resolve({ ok: false, message: err.message });
        });
        
        req.end();
      });
      
    }

  }

  throw new Error('Unknown service type.');
}
