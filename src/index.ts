export * from './class';
export * from './property';

export type classOf<T> = { new(...args: any[]): T };
export type Rendered = JSX.Element | JSX.Element[] | React.ReactNode;
