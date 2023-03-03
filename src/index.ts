import dotenv from "dotenv";

import { getEnv } from "./env/getEnv";
import { getAzureWebApi } from "./apis/azure";
import { getNotionWebApi } from "./apis/notion";
import { from, map, mergeMap } from "rxjs";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

dotenv.config();

interface PageItem {
  id: number,
  title: string,
  description: string,
  acceptanceCriteria: string,
  type: string,
  storyPoints: number,
  state: string,
  url: string
}

// * Getting apis
const webApi = await getAzureWebApi();
const notionApi = await getNotionWebApi();
const workItemTrackingApi = await webApi.getWorkItemTrackingApi();

// * Get user work items 

from(workItemTrackingApi.getAccountMyWorkData())
.pipe(
  map(({ workItemDetails }) => {
    return workItemDetails
    ?.map(itemDetail =>  itemDetail.id) as Array<number>
  }),

  mergeMap(itemsIds => from(itemsIds)),

  mergeMap(itemId => {
    console.log(`Processing item #${itemId}...`)

    return workItemTrackingApi.getWorkItem(itemId, [
      'System.Description',
      'Microsoft.VSTS.Common.AcceptanceCriteria',
      'System.Title',
      'System.State',
      'System.WorkItemType',
      'Microsoft.VSTS.Scheduling.StoryPoints'
    ])
  }),

  map(({ id, fields, _links }): PageItem => ({
    id: id!,
    title: fields?.['System.Title'],
    description: fields?.['System.Description'],
    acceptanceCriteria: fields?.['Microsoft.VSTS.Common.AcceptanceCriteria'],
    type: fields?.['System.WorkItemType'],
    storyPoints: fields?.['Microsoft.VSTS.Scheduling.StoryPoints'],
    state: fields?.['System.State'],
    url: _links?.html.href
  })),

  mergeMap(workItem => {
    console.log(`Creating page in base of workTTem #${workItem.id}...`)
    return createWorkItemPage(workItem)
  })
)
.subscribe({
  next: page => {
    console.log("Visited here: ", page.url);
  },
  error: err => console.error("Error getting your work data: ", err.message)
})

function createWorkItemPage ({ id, title, state, description, acceptanceCriteria, type, storyPoints, url }: PageItem): Promise<PageObjectResponse> {
  return notionApi.pages.create({
    parent: {
      database_id: getEnv("TASKS_DATABASE_ID")
    },
    properties: {
      "ID": {
        number: id ?? 0
      },
      "Name": {
        title: [
          {
            text: {
              content: title ?? ""
            }
          }
        ]
      },
      "Status": {
        select: {
          name: state ?? "New"
        }
      },
      "URL": {
        url: url ?? ""
      },
      "Story points": {
        number: storyPoints ?? 0
      },
      "Description": {
        rich_text: [
          {
            text: {
              content: description ?? ""
            }
          }
        ]
      },
      "Acceptance Criteria": {
        rich_text: [
          {
            text: {
              content: acceptanceCriteria ?? ""
            }
          }
        ]
      },
      "Type": {
        select: {
          name: type
        }
      },
    }
  }) as Promise<PageObjectResponse>
}






