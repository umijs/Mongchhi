import { schemaComponent, type SchemaComponentType } from './schema/component';
export const isBrowser = typeof window !== 'undefined';

export function findItem<T = any>(
  target: T[],
  callback: (item: T, index: number, list: T[]) => boolean,
) {
  const list = target;
  // Makes sures is always has an positive integer as length.
  // eslint-disable-next-line
  const length = list.length >>> 0;
  // eslint-disable-next-line
  const thisArg = arguments[1];
  for (let i = 0; i < length; ) {
    const element = list[i];
    if (callback.call(thisArg, element, i, list)) {
      return element;
    }
    i += 1;
  }
  return null;
}
export class Mongchhi {
  constructor() {
    if (Mongchhi.singletonInstance) {
      return Mongchhi.singletonInstance;
    }
  }

  static singletonInstance: Mongchhi;
  public componentClass: any = {};
  // 展示的所有组件
  public components: SchemaComponentType[] = [];
  private addComponent(component: SchemaComponentType) {
    const components = this.components;
    const current = findItem(
      this.components,
      (item) => item.type === component.type,
    );
    if (current) {
      console.warn(`组件 [ ${component.type} ] 被重复注册，请检查您注册的组件`);
      components.splice(components.indexOf(current), 1, component);
    } else {
      components.push(component);
    }
  }

  public registerComponent(component: any, options: SchemaComponentType) {
    if (!component) {
      console.warn(
        `组件 [ ${options.type} ] 未找到，请检查您的<组件>构建程序\n`,
      );
      return { message: '组件未找到' };
    }
    const res = schemaComponent.safeParse(options);

    if (!res?.success) {
      console.warn(
        `组件 [ ${options.type} ] 注册信息错误，请检查您的 options:\n`,
      );
      console.error(res?.error);
      return res?.error;
    }
    // 单独存放组件文件
    this.componentClass[options.type] = component;
    this.addComponent(options);
    return null;
  }

  public getComponentByType(type: string) {
    if (this.componentClass[type]) {
      return this.componentClass[type];
    }
    return null;
  }

  public getComponentConfigByType(type: string) {
    return findItem(this.components, (item) => item.type === type);
  }
}

if (!isBrowser) {
  (global as any).window = global;
}
// eslint-disable-next-line
let mongchhi: Mongchhi;
if ((window as any).mongchhi) {
  mongchhi = (window as any).mongchhi;
} else {
  mongchhi = new Mongchhi();
}
Mongchhi.singletonInstance = mongchhi;

// 将注册器挂载在全局，方便多个地方同时注册
(window as any).mongchhi = mongchhi;
export { mongchhi };
