import azdev from "azure-devops-node-api";
import dotenv from "dotenv";

dotenv.config();

const getEnvs = (...envKeynames: Array<string>): Array<string> => {
  return envKeynames.map(envKeyname => {
    const value = process.env[envKeyname];
    if (!value) {
      throw new Error(`You must have a ${envKeyname} env variables`);
    }
    return value;
  })
}

const getAzureWebApi = (): Promise<azdev.WebApi> => {
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

const webApi = await getAzureWebApi();
const workItemTrackingApi = await webApi.getWorkItemTrackingApi();

workItemTrackingApi.getAccountMyWorkData()
  .then(({ workItemDetails }) => {
    const itemsIds = workItemDetails
      ?.map(itemDetail =>  itemDetail.id) as Array<number>;
      
    return workItemTrackingApi.getWorkItems(itemsIds);
  })
  .then(myWorkItems => {
    console.log(myWorkItems)
  })
  .catch(err => console.error("Error getting your work data: ", err.message));



