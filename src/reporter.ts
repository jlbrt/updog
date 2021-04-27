import https from 'https';
import { Reporter } from './config';

export interface Incident {
  serviceTitle: string;
  message: string;
}

export async function reportIncidents(reporter: Reporter, incidents: Incident[]): Promise<void> {
  if (reporter.type === 'slack') {
    return new Promise(function (resolve, reject) {
      const data = JSON.stringify({
        text: incidents.map(i => `${i.serviceTitle}: ${i.message}`).join('\n'),
      });
      
      const requestOptions: https.RequestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        }
      };
    
      const req = https.request(reporter.webhookUrl, requestOptions, function (res) {
        if (res.statusCode !== 200) {
          reject();
        }

        resolve();
      });

      req.on('error', function (error) {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  throw new Error('Unknown reporter type.');
}
