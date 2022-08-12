/* eslint-disable prefer-object-spread */
import React, { useMemo, useState } from 'react';
import { FixedSizeList, FixedSizeListProps, ListChildComponentProps } from 'react-window';
import { Spin, Empty, BaseIcon } from 'coding-oa-uikit';
import classNames from 'classnames';
import { isNotNullArray } from 'common/utils/commFunc';
import styles from './style.module.scss';

type TCustomComponent = React.ComponentClass | React.FC | string;

type TVirtualListTableColumn<T extends object> = {
  /** 列标题 */
  title: string;
  /** 列字段 */
  dataIndex: string;
  /** 列宽 */
  width?: string | number;
  /** 列样式 */
  className?: string | {
    /** 头样式 */
    header?: string;
    /** 单元格样式 */
    cell?: string;
  };
  components?: {
    /** 头 */
    header?: TCustomComponent;
    /** 单元格 */
    cell?: TCustomComponent;
  };
  /** 头渲染函数 */
  headerRender?(args: TVirtualListTableColumn<T>, index: number): JSX.Element;
  /** 列渲染函数 */
  render?(record: T, row: ListChildComponentProps<T>): JSX.Element;
};

type TVirtualListTableArgs<T extends object> = {
  /** 数据数组 */
  dataSource: T[];
  /** 表格列 */
  columns: TVirtualListTableColumn<T>[];
  /** 容器样式 */
  className?: string | {
    /** 容器样式 */
    body?: string;
    /** 头样式 */
    header?: string;
    /** 行样式 */
    row?: string;
  };
  components?: {
    /** 容器 */
    body?: TCustomComponent;
    /** 头 */
    header?: TCustomComponent;
    /** 行 */
    row?: TCustomComponent;
    /** 无数据，需要已渲染 */
    empty?: React.ReactElement;
  },
  /** 载入中 */
  loading?: boolean;
  /** 显示边框 */
  bordered?: boolean;
  /** 紧凑 */
  size?: 'middle' | 'small';
  /** 虚拟滚动列表参数 */
  listAttr: { height: number } & Partial<Omit<FixedSizeListProps<T>, 'children' | 'height'>>;
  /** 头渲染函数 */
  headerRender?(data: T[]): JSX.Element;
  /** 列渲染函数 */
  rowRender?(record: T, row: ListChildComponentProps<T>): JSX.Element;
  /** 列参数 */
  onRow?(record: T, row: ListChildComponentProps<T>): object;
};

function virtualListTableHeaderRender<T extends object>(props: TVirtualListTableArgs<T>) {
  if (typeof props.headerRender === 'function') {
    return props.headerRender(props.dataSource);
  }
  const columns = Array.isArray(props.columns) ? props.columns : [];
  const $headerCells = columns.map((column, index) => {
    if (typeof column.headerRender === 'function') {
      return column.headerRender(column, index);
    }
    const headerCell = column.components?.header || 'span';
    const attr = {
      key: `H${column.dataIndex}`,
      className: classNames(column.className?.header || column.className),
      style: column.width && { width: column.width }
    };
    return React.createElement(headerCell, attr, column.title);
  });
  const header = props.components?.header || 'header';
  const attr = {
    key: 'VLT_HEADER',
    className: classNames(props.className?.header)
  };
  return React.createElement(header, attr, $headerCells);
}

function virtualListTableListRender<T extends object>(prop1: TVirtualListTableArgs<T>): React.ReactElement {
  function colRender(data: T, row: ListChildComponentProps<T>) {
    return prop1.columns.map(column => {
      if (typeof column.render === 'function') {
        return column.render(data, row);
      }
      const cell = column.components?.cell || 'span';
      const attr = {
        key: `R${row.index}${column.dataIndex}`,
        className: classNames(column.className?.cell || column.className),
        style: column.width && { width: column.width }
      };
      return React.createElement(cell, attr, data[column.dataIndex]);
    });
  }
  const row = prop1.components?.row || 'div';
  const onRow = typeof prop1.onRow === 'function' ? prop1.onRow : (_, prop2) => ({
    style: prop2.style,
    className: classNames(prop1.className?.row)
  });
  function listRender(prop2: ListChildComponentProps<T>) {
    const record = prop1.dataSource[prop2.index];
    if (typeof prop1.rowRender === 'function') {
      return prop1.rowRender(record, prop2);
    }
    return React.createElement(row, onRow(record, prop2), colRender(record, prop2));
  }
  if (isNotNullArray(prop1.dataSource)) {
    const attr = { ...prop1.listAttr, key: 'VLT_LIST', itemCount: prop1.listAttr.itemCount || prop1.dataSource?.length || 0 };
    return React.createElement(FixedSizeList, attr, listRender);
  }
  return prop1.components?.empty || React.createElement(Empty, { key: 'VLT_LIST_EMPTY', type: 'horizontal', image: Empty.PRESENTED_IMAGE_INBOX });
}

export function VirtualListTableCore<T extends object>(props: TVirtualListTableArgs<T>): React.ReactElement {
  const $header = virtualListTableHeaderRender(props);
  const $list = virtualListTableListRender(props);
  const $body = React.createElement(props.components?.body || 'div', { className: classNames(props.className?.body || props.className) }, [$header, $list]);
  if (Reflect.has(props, 'loading')) {
    const attr = typeof props.loading === 'boolean' ? { spinning: props.loading } : props.loading;
    return React.createElement(Spin, attr, $body);
  }
  return $body;
}

const ROW_HEIGHT_KVS = {
  default: 55,
  middle: 49,
  small: 39
};

const ROW_SIZE_KVS = {
  middle: styles.body_middleSize,
  small: styles.body_smallSize
};

function withBasicStyle<T extends object>(Com: typeof VirtualListTableCore) {
  return function BasicStyleWrap(props: TVirtualListTableArgs<T>): React.ReactElement {
    const className = {
      body: classNames(styles.style_wrap, props.bordered && styles.body_withBorder, ROW_SIZE_KVS[props.size], props.className?.body || props.className),
      header: classNames(styles.header, props.className?.header),
      row: classNames(styles.row, props.className?.row),
    };
    const columns = Array.isArray(props.columns) && props.columns.map(column => {
      const className = {
        header: classNames(styles.cell, column.className?.header || column.className),
        cell: classNames(styles.cell, column.className?.cell || column.className)
      };
      return { ...column, className };
    });
    const listAttr = {
      itemSize: ROW_HEIGHT_KVS[props.size] || ROW_HEIGHT_KVS.default,
      ...props.listAttr,
    };
    const attr = { ...props, className, columns, listAttr };
    return React.createElement(Com, attr);
  };
}

type TFilterRenderArgsFilter = {
  value: any;
  iconState: boolean;
  dropdownState: boolean;
};
type TFilterRenderArgs<T extends object> = {
  column: TVirtualListTableColumn<T>;
  index: number;
  filter: TFilterRenderArgsFilter,
  setFilter(value: TFilterRenderArgsFilter): void;
};
type TFilterRenderKVs<T extends object> = {
  [dataIndex: string]: React.FC<TFilterRenderArgs<T>> | {
    initValue?: any;
    className?: string | {
      cell?: string;
      title?: string;
      icon?: string;
      dropdown?: string;
    };
    icon?: React.ReactElement;
    render: React.FC<TFilterRenderArgs<T>>;
  }
};
export function withVirtualListTableFilter<T extends object>(Com: typeof VirtualListTableCore, filterRenderKVs: TFilterRenderKVs<T>) {
  return function VirtualListTableFilterWrap(props: TVirtualListTableArgs<T>): React.ReactElement {
    const [filterState, setFilterState] = useState(() => Object.entries(filterRenderKVs).reduce((prev, [key, v]) => Object.assign(prev, { [key]: {
      value: v.initValue || null,
      iconState: false,
      dropdownState: false
    } }), {}));
    const columns = useMemo(() => {
      function headerRender(column: TVirtualListTableColumn<T>, index) {
        const getFilterDropdown = filterRenderKVs[column.dataIndex].render || filterRenderKVs[column.dataIndex];
        const headerCell = column.components?.header || 'div';
        if (typeof getFilterDropdown === 'function') {
          const filter = filterState[column.dataIndex];
          function setFilter(value) {
            setFilterState(prevState => ({ ...prevState, [column.dataIndex]: value }));
          }
          const $filterDropdown = filterState[column.dataIndex].dropdownState && React.createElement('div', {
            key: 'FD',
            className: classNames(styles.filter_dropdown, filterRenderKVs[column.dataIndex]?.className?.dropdown)
          }, getFilterDropdown({ column, index, filter, setFilter }));
          const $title = React.createElement('span', {
            key: 'FT',
            className: classNames(styles.filter_title, filterRenderKVs[column.dataIndex]?.className?.title)
          }, column.title);
          const $icon = React.createElement('span', {
            key: 'FI',
            className: classNames(styles.filter_icon, filterRenderKVs[column.dataIndex]?.className?.icon, filter.iconState && 'active'),
            onClick() {
              setFilterState({ ...filterState, [column.dataIndex]: Object.assign(filter, { dropdownState: !filter.dropdownState }) });
            }
          }, filterRenderKVs[column.dataIndex]?.icon || React.createElement(BaseIcon, { name: 'Filter' }));
          const attr = {
            key: `HWF${column.dataIndex}`,
            className: classNames(styles.filter_cell, { icon: filter.iconState, dropdown: filter.dropdownState }, filterRenderKVs[column.dataIndex]?.className?.cell || filterRenderKVs[column.dataIndex]?.className, column.className?.header || column.className),
            style: column.width && { width: column.width }
          };
          return React.createElement(headerCell, attr, [$title, $icon, $filterDropdown || null]);
        }
        const attr = {
          key: `H${column.dataIndex}`,
          className: classNames(column.className?.header || column.className),
          style: column.width && { width: column.width }
        };
        return React.createElement(headerCell, attr, column.title);
      }
      return Array.isArray(props.columns) && props.columns.map(column => {
        if (Reflect.has(filterState, column.dataIndex)) {
          return Object.assign({ headerRender }, column);
        }
        return column;
      });
    }, [props.columns, filterState]);

    return React.createElement(Com, { ...props, columns });
  };
}

export default withBasicStyle(VirtualListTableCore);
