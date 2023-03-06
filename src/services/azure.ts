import { WebApi } from "azure-devops-node-api"
import { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import { from, map } from "rxjs";
import { getAzureWebApi } from "../apis/azure";
import { workItemToPage } from "../models/workItemToPage";

export class Azure {
  private webApi: WebApi;
  private workItemTrackingApi: IWorkItemTrackingApi

  private constructor(webApi: WebApi, workItemTrackingItem: IWorkItemTrackingApi) {
    this.webApi = webApi;
    this.workItemTrackingApi = workItemTrackingItem;
  }

  public static async build() {
    const webApi = await getAzureWebApi();
    const workItemTrackingApi = await webApi.getWorkItemTrackingApi();

    return new Azure(webApi, workItemTrackingApi);
  }

  public getAccountWorkData() {
    return from(this.workItemTrackingApi?.getAccountMyWorkData())
    .pipe(
      map(({ workItemDetails }) => {
        return workItemDetails
        ?.map(itemDetail =>  itemDetail.id) as Array<number>
      })
    )
  }

  public getPageItemId(itemId: number) {
    return from(
      this.workItemTrackingApi.getWorkItem(itemId, [
        'System.Description',
        'Microsoft.VSTS.Common.AcceptanceCriteria',
        'System.Title',
        'System.State',
        'System.WorkItemType',
        'Microsoft.VSTS.Scheduling.StoryPoints'
      ])
    )
    .pipe(
      map(workItemToPage),
    );
  }
}