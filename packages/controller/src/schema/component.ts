import { zod } from '@umijs/utils';

export const schemaComponent = zod.object({
  /**
   * 类型，唯一标识，类型重复无法注册
   */
  type: zod.string(),
  /**
   * 组件名称
   */
  label: zod.string().optional(),
  /**
   * 组件允许编辑的所有属性
   */
  todoProps: zod.object({}).optional(),
  /**
   * 组件的所有属性默认值，包括允许编排的属性和其他属性
   */
  props: zod.object({}).optional(),
  /**
   * 组件的所有样式默认值，包括允许编排的样式和其他样式
   */
  style: zod.object({}).optional(),
  /**
   * 是否为容器组件
   */
  isContainer: zod.boolean().optional(),
  /**
   * 标识为 InlineBlock 布局，编辑器需要特殊处理
   * 比如 拖入一个文本，会默认占用一行，需要修改外层容器的样式
   */
  isInlineBlock: zod.boolean().optional(),
  /**
   * 组件详情，用于 card 显示，或资产商店说明
   */
  description: zod.string().optional(),
  /**
   * 组件大图
   */
  image: zod.string().optional(),
  /**
   * 左侧编辑时，配套显示的 icon
   * 允许直接写 http:// 和 icon type
   */
  icon: zod.string().optional(),
  /**
   * 分组名称，直接按字符匹配分组，便于直接扩展
   */
  groupsName: zod.string().optional(),
  /**
   * 需要对标的 api，比如编辑器中配置 button 的 value，真实的 button 值属性是 children
   * transform: {
   * // 需要翻译的字段名称
   * value: 'children',
   * },
   */
  transform: zod.object({}).optional(),
  /**
   * 标记组件能够存放的父级元素
   * DFormCustom 的父级容器只能是 "DForm", "DGroup"
   * {
   *   type: "DFormCustom",
   *   onlyRoot: ["DForm", "DGroup"]
   * }
   */
  onlyRoot: zod.array(zod.string()).optional(),
  /**
   * 标记当前容器只能放入的元素
   * DForm 容器只能放入 "DFormCustom"
   * {
   *   type: "DForm",
   *   onlyChildren: ["DFormCustom"]
   * }
   */
  onlyChildren: zod.array(zod.string()).optional(),
  /**
   * 当前页面只允许放一个这个组件
   */
  onlyOnce: zod.boolean().optional(),
});

export type SchemaComponentType = zod.infer<typeof schemaComponent>;
