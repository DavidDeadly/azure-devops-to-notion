import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotionWebApi } from "../apis/notion";
import { getEnv } from "../env/getEnv";

import { ID_ACCEPTENCE_CRITERIA_PROP, ID_DESCRIPTION_PROP, ID_ID_PROP, ID_NAME_PROP, ID_STATUS_PROP, ID_STORY_POINTS_PROP, ID_TYPE_PROP, ID_URL_PROP } from "../env/propsIds";
import { PageItem } from "../models/Page";


export class Notion {
  private notionApi: Client;

  private constructor(notionApi: Client) {
    this.notionApi = notionApi;
  }

  public static async build() {
    const notionApi = await getNotionWebApi();
    return new Notion(notionApi);
  }

  public createWorkItemPage ({ id, title, state, description, acceptanceCriteria, type, storyPoints, url }: PageItem): Promise<PageObjectResponse> {

    return this.notionApi?.pages.create({
      parent: {
        database_id: getEnv("TASKS_DATABASE_ID")
      },
      properties: {
        [ID_ID_PROP]: {
          number: id ?? 0
        },
        [ID_NAME_PROP]: {
          title: [
            {
              text: {
                content: title ?? ""
              }
            }
          ]
        },
        [ID_STATUS_PROP]: {
          select: {
            name: state ?? "New"
          }
        },
        [ID_URL_PROP]: {
          url: url ?? ""
        },
        [ID_STORY_POINTS_PROP]: {
          number: storyPoints ?? 0
        },
        [ID_DESCRIPTION_PROP]: {
          rich_text: [
            {
              text: {
                content: description ?? ""
              }
            }
          ]
        },
        [ID_ACCEPTENCE_CRITERIA_PROP]: {
          rich_text: [
            {
              text: {
                content: acceptanceCriteria ?? ""
              }
            }
          ]
        },
        [ID_TYPE_PROP]: {
          select: {
            name: type
          }
        },
      }
    }) as Promise<PageObjectResponse>
  }

  public async filterAlreadyExistings(pageIds: Array<number>) {
    const database = await this.getTasksDatabase();
    const databasePagesIds = database?.results
    // @ts-ignore:next-line
    .map(result => result.properties.ID.number);
    
    return pageIds.filter(pageId => !databasePagesIds.includes(pageId));
  }

  public getTasksDatabase() {
    return this.notionApi?.databases.query({
      database_id: getEnv("TASKS_DATABASE_ID")
    })
  }
}