import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces"

export const workItemToPage = ({ id, fields, _links }: WorkItem) => {
  return {
    id: id!,
    title: fields?.['System.Title'],
    description: fields?.['System.Description'],
    acceptanceCriteria: fields?.['Microsoft.VSTS.Common.AcceptanceCriteria'],
    type: fields?.['System.WorkItemType'],
    storyPoints: fields?.['Microsoft.VSTS.Scheduling.StoryPoints'],
    state: fields?.['System.State'],
    url: _links?.html.href
  }
}