import { from, mergeMap, Subject } from "rxjs";
import { Azure } from "../services/azure";
import { Notion } from "../services/notion";

export const $newPages = new Subject<number>();

export const subscribeNewPages = (notion: Notion, azure: Azure) => {
  $newPages
    .pipe(
      mergeMap(itemId => {
        console.log(`Processing item #${itemId}...`)
        return azure.getPageItemId(itemId);
      }),
  
      mergeMap(workItem => {
        console.log(`Creating page in base of workTTem #${workItem.id}...`)
        return notion.createWorkItemPage(workItem)
      })
    ).subscribe({
      next: value => console.log("new page created: ", { value })
    });
}
