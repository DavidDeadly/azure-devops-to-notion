export const getEnvs = (...envKeynames: Array<string>): Array<string> => {
  return envKeynames.map(envKeyname => {
    return getEnv(envKeyname);
  })
}

export const getEnv = (envKeyname: string): string => {
  const value = process.env[envKeyname];
    if (!value) {
      throw new Error(`You must have a ${envKeyname} env variables`);
    }
    return value;
}