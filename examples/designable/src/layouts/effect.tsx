// import {
//   CursorType,
//   DragStopEvent,
//   Engine,
//   MouseClickEvent,
// } from '@designable/core';

// export enum CursorDragType {
//   Move = 'MOVE',
//   Resize = 'RESIZE',
//   Rotate = 'ROTATE',
//   Scale = 'SCALE',
//   Translate = 'TRANSLATE',
//   Round = 'ROUND',
// }

// export const useDragDropEffect2 = (engine: Engine) => {
//   engine.subscribeTo(MouseClickEvent, (event) => {
//     const target = event.data.target as Element;
//     console.log('MouseClickEvent', target);
//   });
//   engine.subscribeTo(DragStopEvent, (event) => {
//     console.log('DragStopEvent');
//     console.log(engine.cursor.type);
//     console.log(engine.cursor.dragType);

//     if (engine.cursor.type !== CursorType.Normal) return;
//     if (engine.cursor.dragType !== CursorDragType.Move) return;
//     engine.workbench.eachWorkspace((currentWorkspace) => {
//         const operation = currentWorkspace.operation;
//         const moveHelper = operation.moveHelper;
//         const dragNodes = moveHelper.dragNodes;
//         const closestNode = moveHelper.closestNode;
//         const closestDirection = moveHelper.closestDirection;
//         const selection = operation.selection;
//         console.log(dragNodes)
//         if (!dragNodes.length) return;
//         if (dragNodes.length && closestNode && closestDirection) {
//           if (
//             closestDirection === ClosestPosition.After ||
//             closestDirection === ClosestPosition.Under
//           ) {
//             if (closestNode.allowSibling(dragNodes)) {
//               selection.batchSafeSelect(
//                 closestNode.insertAfter(
//                   ...TreeNode.filterDroppable(dragNodes, closestNode.parent),
//                 ),
//               );
//             }
//           } else if (
//             closestDirection === ClosestPosition.Before ||
//             closestDirection === ClosestPosition.Upper
//           ) {
//             if (closestNode.allowSibling(dragNodes)) {
//               selection.batchSafeSelect(
//                 closestNode.insertBefore(
//                   ...TreeNode.filterDroppable(dragNodes, closestNode.parent),
//                 ),
//               );
//             }
//           } else if (
//             closestDirection === ClosestPosition.Inner ||
//             closestDirection === ClosestPosition.InnerAfter
//           ) {
//             if (closestNode.allowAppend(dragNodes)) {
//               selection.batchSafeSelect(
//                 closestNode.append(
//                   ...TreeNode.filterDroppable(dragNodes, closestNode),
//                 ),
//               );
//               moveHelper.dragDrop({ dropNode: closestNode });
//             }
//           } else if (closestDirection === ClosestPosition.InnerBefore) {
//             if (closestNode.allowAppend(dragNodes)) {
//               selection.batchSafeSelect(
//                 closestNode.prepend(
//                   ...TreeNode.filterDroppable(dragNodes, closestNode),
//                 ),
//               );
//               moveHelper.dragDrop({ dropNode: closestNode });
//             }
//           }
//         }
//         moveHelper.dragEnd();
//     });
//     engine.cursor.setStyle('');
//   });
// };
