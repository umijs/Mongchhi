import { expect, test } from 'vitest';
import { mongchhi } from './index';

test('components', () => {
  mongchhi.registerComponent(
    {},
    {
      type: 'select',
      label: 'select',
      groupsName: '基础',
      props: {
        min: '',
        max: '',
        label: '名称',
        options: [],
        dependProps: {},
        inhibitBtn: 'true',
      },
    },
  );
  const current = mongchhi.getComponentConfigByType('select');
  expect(current?.type).toBe('select');
});

test('components error', () => {
  const a: any = mongchhi.registerComponent({}, {
    type: 'abc',
    label: 12321211,
    abc: '基础',
    rules: [],
    props: {
      min: '',
      max: '',
      label: '名称',
      options: [],
      dependProps: {},
      inhibitBtn: 'true',
    },
    defaultValue: '',
  } as any);
  const current = mongchhi.getComponentConfigByType('abc');
  expect(current).toBe(null);
  expect(a?.issues[0]?.message).toBe('Expected string, received number');
});
