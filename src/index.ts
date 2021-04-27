import { sleep } from './utils';
import { getConfig, Service } from './config';
import { CheckResult, checkService } from './checker';
import { Incident, reportIncidents } from './reporter';

main();

async function main () {
  const config = await getConfig();

  const services = config.services;
  const last3CheckResults: CheckResult[][] = [];

  while (true) {
    const checkResults = await Promise.all(
      services.map(service => checkService(service))
    );

    last3CheckResults.push(checkResults);
    if (last3CheckResults.length > 3) {
      last3CheckResults.shift();
    }

    const incidents = generateIncidents(services, last3CheckResults);

    if (incidents.length > 0) {
      try {
        await reportIncidents(config.reporter, incidents);
      } catch (err) {
        console.error('Could not report incidents: ', err);
      }
    }

    await sleep(60 * 1000);
  }
}

function generateIncidents (services: Service[], last3CheckResults: CheckResult[][]): Incident[] {
  const incidents: Incident[] = [];

  if (last3CheckResults.length === 2) {

    for (let i = 0; i < services.length; i++) {
      const firstCheck = last3CheckResults[0][i];
      const secondCheck = last3CheckResults[1][i];

      if (!firstCheck.ok && !secondCheck.ok) {
        incidents.push({ serviceTitle: services[i].title, message: `New incident: ${secondCheck.message}` });
      }
    }

  }

  if (last3CheckResults.length === 3) {

    for (let i = 0; i < services.length; i++) {
      const firstCheck = last3CheckResults[0][i];
      const secondCheck = last3CheckResults[1][i];
      const thirdCheck = last3CheckResults[2][i];

      if (firstCheck.ok && !secondCheck.ok && !thirdCheck.ok) {
        incidents.push({ serviceTitle: services[i].title, message: `New incident: ${thirdCheck.message}` });
      } else if (!firstCheck.ok && !secondCheck.ok && thirdCheck.ok) {
        incidents.push({ serviceTitle: services[i].title, message: 'Service status changed to OK.' });
      } else if (!firstCheck.ok && !secondCheck.ok && !thirdCheck.ok) {
        if (secondCheck.message !== thirdCheck.message) {
          incidents.push({ serviceTitle: services[i].title, message: `Service status changed: ${thirdCheck.message}` });
        }
      }
    }

  }

  return incidents;
}
