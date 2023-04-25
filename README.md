# squatmaster
 Mixed Reality Coaching for Barbelll





### Events

Events generated by bar-monitor.  Listen for these on `<a-scene>`

| Event                     | Description                                                  | Detail |
| ------------------------- | ------------------------------------------------------------ | ------ |
| entered-rack              | Lifter has entered the rack                                  | None   |
| exited-rack               | Lifter has existed the rack                                  | None   |
| reached hooks             | Lifter has reached the hooks (shoulders beneath bar, head beyond the bar) | None   |
| left-hooks                | Lifter has moved away from the hooks.  They may have left the bar on the hooks, or shouldered it. | None   |
| shouldered-bar            | Lifter has taken the bar onto their shoulders                | None   |
| returned-bar              | Lifter has returned the bar to the pins                      | None   |
| hit-top                   | Lifter has reached the top of a rep (or reached the start position for the first rep of a set) | None   |
| lowered-from-top          | Lifter has begun the downward movement from the top (either beginning a rep, or returning the bar to the hooks) | None   |
| hit-target-depth          | Lifter has hit target depth                                  | None   |
| upwards-from-target-depth | Lifter is moving upwards after hitting target depth          | None   |
| below-safety-pins         | Lifter has gone below the safety pins.  This indicates the end of the rep.  **For safety reasons, the app *must* insist very clearly that they now abandon the rep, unload the bar, and return it to the hooks.  If the lifter doesn't follow these instructions, the app will have an incorrect view of whether they have the bar on their shoulders, which could be a serious safety issue.** | None.  |
| bailed-out                | Lifter has left the bar down on the safety pins.  Note that app makes an assumption that the user has bailed out, and has not re-shouldered the weight after going below the safety pins.  **The app must make it very clear that the lifter should not be continuing with the bar on their shoulders, and must unload the bar, and return it to the hooks.** | None   |
