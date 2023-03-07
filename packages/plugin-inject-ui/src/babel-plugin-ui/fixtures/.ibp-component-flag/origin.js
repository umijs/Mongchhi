import { Step } from 'antd';
import { UmiUIFlag } from 'umi';

// TODO: import { UmiUIFlag } from 'umi'; 未实现，感觉用处不大
export default function () {
  return (
    <Step>
      <div>
        <UmiUIFlag />
      </div>
      <div>
        <UmiUIFlag />
        foo
      </div>
      <div>
        <UmiUIFlag />
        bar
      </div>
      <div>
        <UmiUIFlag />
      </div>
      <div>
        <UmiUIFlag inline />
        Hello
        <UmiUIFlag inline />
      </div>
    </Step>
  );
}
