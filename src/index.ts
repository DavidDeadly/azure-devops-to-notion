import { from, mergeMap } from "rxjs";

import { Azure } from "./services/azure";
import { Notion } from "./services/notion";


// * Getting apis
const notion = await Notion.build();
const azure = await Azure.build();
// * Get user work items

azure.getAccountWorkData()
.pipe(
  mergeMap(async (itemsIds) => {
    const [existings, news] = await notion.getExistingAndNews(itemsIds);
    console.log({ existings, news });
    
    return news;
  }),

  mergeMap(newIds => {
    if(newIds.length === 0) {
      console.log("All your workItems are already in notion!")
    }
    
    return from(newIds)
  }),

  mergeMap(itemId => {
    console.log(`Processing item #${itemId}...`)
    return azure.getPageItemId(itemId);
  }),

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