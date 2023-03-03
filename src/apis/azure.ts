import azdev from "azure-devops-node-api";

import { getEnvs } from "../env/getEnv";

export const getAzureWebApi = (): Promise<azdev.WebApi> => {
  return new Promise<azdev.WebApi> (async (resolve, _reject) => {
    try {
      const [token, ORG_URL] = getEnvs("ACCESS_TOKEN", "ORG_URL");

      const authHandler = azdev.getPersonalAccessTokenHandler(token);
      const webApi = new azdev.WebApi(ORG_URL, authHandler);
      const connection = await webApi.connect();

      console.log(`Successfully connected to Azure DevOps as ${connection.authenticatedUser?.providerDisplayName}!`)
      
      return resolve(webApi);
    } catch (err: any) {
      console.error("Error connecting to AzureDevOps:", err?.message);
    }
  })
}