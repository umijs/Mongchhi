import {
  useDndMonitor,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import React, { type FC } from 'react';
import { socket } from 'umi';

export const onEvent = (type: string, event: DragEndEvent) => {
  const payload = { over: event.over, active: event.active };
  socket.send({
    type,
    payload,
  });
  console.log(type, payload);
};

export const DnDable: FC = ({ data, children }) => {
  useDndMonitor({
    // onDragStart(event) {
    //   onEvent('onDragStart', event);
    // },
    // onDragMove(event) {
    //   onEvent('onDragMove', event);
    // },
    // onDragOver(event) {
    //   onEvent('onDragOver', event);
    // },
    onDragEnd(event) {
      onEvent('onDragEnd', event);
    },
    // onDragCancel(event) {
    //   onEvent('onDragCancel', event);
    // },
  });
  const { type } = data;
  const {
    attributes,
    listeners,
    setNodeRef: setNode,
    transform,
  } = useDraggable({
    data,
    id: `${type}draggable`,
  });
  const { isOver, setNodeRef } = useDroppable({ data, id: `${type}droppable` });
  const styleDropp = {
    color: isOver ? 'green' : undefined,
  };

  const styleDragg = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={styleDropp}>
      <button
        ref={setNode}
        type="button"
        style={styleDragg}
        {...listeners}
        {...attributes}
      >
        {children}
      </button>
    </div>
  );
};
