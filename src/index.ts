import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BehaviorSubject, from, map, mergeMap, Subject } from "rxjs";

import { Azure } from "./services/azure";
import { Notion } from "./services/notion";
import { $existingPages, subscribeExistingPages } from "./subjects/existingPages";
import { $newPages, subscribeNewPages } from "./subjects/newPages";


// * Getting apis
const notion = await Notion.build();
const azure = await Azure.build();

// Subscritions
subscribeNewPages(notion, azure);
subscribeExistingPages();

// * Get user work items
azure.getAccountWorkData()
  .pipe(
    mergeMap(async (itemsIds) => {
      const [existings, news] = await notion.getExistingAndNews(itemsIds);

      return { existings, news };
    })
  )
  .subscribe({
    next: ({ existings, news }) => {
      console.log({ existings, news });
      
      from(existings).subscribe($existingPages);

      from(news).subscribe($newPages);

    },
    error: err => console.error("Error getting your work data: ", err.message)
  })
