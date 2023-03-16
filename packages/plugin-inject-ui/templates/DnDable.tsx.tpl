import {
  useDndMonitor,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '{{{ dndkit }}}';
import React, { type FC } from 'react';
import { socket } from 'umi';

export const onEvent = (type: string, event: DragEndEvent) => {
  console.log(event);
  const payload = {
    over: event.over.data.current,
    active: event.active.data.current,
  };
  socket.send({
    type,
    payload,
  });
};

export const DnDable: FC = ({ index, filename, children, data }) => {
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
      console.log('@@mongchhi:onDragEnd');
      onEvent('@@mongchhi:onDragEnd', event);
    },
    // onDragCancel(event) {
    //   onEvent('onDragCancel', event);
    // },
  });
  const {
    attributes,
    listeners,
    setNodeRef: setNode,
    transform,
  } = useDraggable({
    data: {
      index,
      filename,
      data: JSON.parse(data),
    },
    id: `${index}${filename}draggable`,
  });
  const { isOver, setNodeRef } = useDroppable({
    data: {
      index,
      filename,
      data: JSON.parse(data),
    },
    id: `${index}${filename}droppable`,
  });
  const styleDropp = {
    color: isOver ? 'green' : undefined,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={(ref) => {
        setNodeRef(ref);
        setNode(ref);
      }}
      style={styleDropp}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};
