import fs from 'fs/promises';
import path from 'path';

interface HTTPConditions {
  status: number;
}

export interface Service {
  title: string;
  type: 'https';
  url: string;
  method: 'GET';
  conditions: HTTPConditions;
}

export interface Reporter {
  type: 'slack';
  webhookUrl: string;
}

export interface Config {
  services: Service[];
  reporter: Reporter;
}

export async function getConfig (): Promise<Config> {
  const configPath = path.join(__dirname, '../config.sample.json'); // TODO get config from different path

  // TODO consider using json5 instead of json

  const configJSON = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(configJSON);

  // TODO validate config

  return config;
}
