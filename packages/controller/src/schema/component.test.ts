import { expect, test } from 'vitest';
import { schemaComponent } from './component';

test('schemaComponent error', async () => {
  // @ts-ignore
  const { error } = schemaComponent.safeParse({ type: 1994 });

  expect(error?.issues[0]?.message).toBe('Expected string, received number');
});

test('schemaComponent success', async () => {
  const { success } = schemaComponent.safeParse({
    todoProps: {
      footer: {},
    },
    label: '按钮',
    type: 'Button',
    description: '',
    image: '展示大图',
    groupsName: '容器',
    props: {
      header: 'a123',
    },
  });
  expect(success).toBe(true);
});
