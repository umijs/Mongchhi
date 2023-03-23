import { Button } from 'antd';
import React, { useEffect, useRef } from 'react';
import { socket } from 'umi';

const MyFloatButton: React.FC = () => {
  const styleInfo = {
    left: 0,
    top: 0,
    itemHeight: 50,
    itemWidth: 50,
  };
  const floatButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 给悬浮按钮添加鼠标 移动监听
    const floatButton = floatButtonRef.current;
    try {
      floatButton!.onmousedown = (e: any) => {
        let moved = false; // 判断是否进行了移动 若只是点击一下 则不会进入onmouseup的回调逻辑
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;
        const maxX = clientWidth - styleInfo.itemWidth; // x轴最大距离
        const maxY = clientHeight - styleInfo.itemHeight; // y轴最大距离
        const disX = e.pageX - (floatButton?.offsetLeft ?? 0); // 鼠标相对目标元素的x轴距离
        const disY = e.pageY - (floatButton?.offsetTop ?? 0); // 鼠标相对目标元素的y轴距离
        let lastX = 0; // 记录最后目标元素距离可视区域左边界的距离
        let lastY = 0; // 记录最后目标元素距离可视区域上边界的距离
        document.onmousemove = (e: any) => {
          moved = true;
          let left = e.pageX - disX; // 目标元素到当前可视区域左边界的距离
          let top = e.pageY - disY; // 目标元素到当前可视区域上边界的距离
          // 限定活动范围
          if (left >= maxX) left = maxX;
          if (left < 0) left = 0;
          if (top >= maxY) top = maxY;
          if (top < 0) top = 0;
          floatButton!.style.left = left + 'px';
          floatButton!.style.top = top + 'px';
          lastX = left;
          lastY = top;
        };
        document.onmouseup = () => {
          if (!moved) {
            document.onmousemove = document.onmouseup = null;
            return;
          }
          // 自动吸边
          let XTend: 'right' | 'left' | 'none' = 'right'; // x方向的吸边趋势 （贴左（left） or 贴右（right）or 横向无趋势 (none)）
          let YTend: 'bottom' | 'top' | 'none' = 'none'; // y方向的吸边趋势 （贴上（top） or 贴下（bottom) or 纵向无趋势(none)）
          XTend = lastX < clientWidth / 2 ? 'left' : 'right';
          YTend = lastY < clientHeight / 2 ? 'top' : 'bottom';
          if (Math.min(lastX, maxX - lastX) < Math.min(lastY, maxY - lastY)) {
            // 距离边界最短的一个维度生效，另一个维度失效
            YTend = 'none';
          } else {
            XTend = 'none';
          }
          switch (XTend) {
            case 'left':
              floatButton!.style.left = '0px';
              break;
            case 'right':
              floatButton!.style.left = maxX + 'px';
              break;
            case 'none':
            default:
              break;
          }
          switch (YTend) {
            case 'top':
              floatButton!.style.top = '0px';
              break;
            case 'bottom':
              floatButton!.style.top = maxY + 'px';
              break;
            case 'none':
            default:
              break;
          }
          document.onmousemove = document.onmouseup = null;
          moved = false;
        };
      };
    } catch (e) {}
  }, []);

  return (
    <div
      ref={floatButtonRef}
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '0px',
        width: styleInfo.itemWidth,
        height: styleInfo.itemHeight,
      }}
    >
      <Button
        type="primary"
        shape="circle"
        style={{
          width: '100%',
          height: '100%',
        }}
        onClick={() => {
          socket.send({
            type: 'call',
            payload: {
              type: 'switchBlockEditMode',
            },
          });
        }}
      >
        ?
      </Button>
    </div>
  );
};

export default MyFloatButton;
