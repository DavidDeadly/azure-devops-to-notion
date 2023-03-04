import { from, map, mergeMap } from "rxjs";

import { getAzureWebApi } from "./apis/azure";
import { PageItem } from "./models/Page";
import { Notion } from "./services/notion";


// * Getting apis
const webApi = await getAzureWebApi();
const notion = await Notion.build();
const workItemTrackingApi = await webApi.getWorkItemTrackingApi();

// * Get user work items

const { workItemDetails } = await workItemTrackingApi.getAccountMyWorkData()
const workItem = workItemDetails!.at(0)!;

console.log(workItem);

const xd = await workItemTrackingApi.getWorkItem(workItem.id!)
console.log(xd);

from(workItemTrackingApi.getAccountMyWorkData())
.pipe(
  map(({ workItemDetails }) => {
    return workItemDetails
    ?.map(itemDetail =>  itemDetail.id) as Array<number>
  }),

  mergeMap(itemsIds => notion.filterAlreadyExistings(itemsIds)),

  mergeMap(newIds => {
    if(newIds.length === 0) {
      console.log("All your workItems are already in notion!")
    }
    
    return from(newIds)
  }),

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
    return notion.createWorkItemPage(workItem)
  })
)
.subscribe({
  next: page => {
    console.log("Visited here: ", page.url);
  },
  error: err => console.error("Error getting your work data: ", err.message)
})

