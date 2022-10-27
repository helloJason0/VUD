export type ProTableColumn<K extends string = string> = {
  /** 字段的名称 */
  field: keyof K | 'operate';
  /** 表格中显示的标题 */
  title: string;
  /**
   * form表单中输入的类型
   * @default 'input''
   */
  type?: 'select' | 'dateRange' | 'input';
  /** 透传给form-item下的元素表单的props */
  formProps?: any;
   /** 透传给form-item下的元素表单的emits */
  formEmits?: Record<string, Function>;
  /** 使用的v-model绑定的字段名，如果没有就会取field */
  formName?: string;
  /** 表格中的宽度 */
  width?: string | number;
  /** 透传给tale-column的props */
  columnProps?: any;
  /** table-column 的插槽表 */
  columnSlotName?: Record<string, string>;
  /** 是否在table中隐藏 */
  hideInTable?: boolean;
  /** 是否固定，固定在哪边 */
  fixed?: 'left' | 'right';
  /** 格式化数据 */
  formatter: (r: Record<string, any>, c: any, cellValue: string) => string;
  /** 传给select选框的options */
  valueEnum?: Record<string, string> | string[] | Record<'label' | 'value', string>[];
  /** form表单中显示的label, 没有就会显示title */
  formLabel?: string;
  /**
   * 表单中占用的姗格，一行是24
   * @default 8
   */
  span?: number;
  /** 表单的初始值 */
  initValue?: unknown;
  /** 是否要出现在表单的中 */
  search?: boolean;
  /** formItem的插槽 */
  formSlotName?: string;
  /** options的配置 */
  options?: Record<'value' | 'label', string>[];
}
export type ProTableProps = {
  columns: ProTableColumn[];
}
export type Params = Record<string | number | symbol, unknown>

export type RequestList = Record<string, unknown>[]

export type RequestRes = {list: RequestList} & ProTableData

export type ProTableData = {
  formData: Params;
  tempFormData: Params;
  tableData: RequestList;
  total: number;
  current: number;
  loading: true;
  pageSizeData: number;
}


