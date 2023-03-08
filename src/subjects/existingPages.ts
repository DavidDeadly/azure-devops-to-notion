import { Subject } from "rxjs";

export const $existingPages = new Subject<number>();

export const subscribeExistingPages = () => {
  $existingPages
  .subscribe({
    next: value => console.log("page updated: ", { value })
  })
}
