import { Client } from "@notionhq/client";

import { getEnv } from "../env/getEnv";


export const getNotionWebApi = (): Promise<Client> => {
  return new Promise<Client>(async (resolve, _reject) => {
    try {
      const auth = {
        auth: getEnv("NOTION_TOKEN")
      }

      const notion = new Client(auth)
      const bot = await notion.users.me({});

      console.log(`${bot.name} connected succesfully to notion!`)

      return resolve(notion);
    } catch (err: any) {
      console.error("Error connecting to Notion Api:", err?.message);
    }
  })
}