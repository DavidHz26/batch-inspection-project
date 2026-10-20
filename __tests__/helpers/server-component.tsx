import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { AlertProvider } from "@/app/alert-provider";

type AsyncComponent = (props: unknown) => Promise<ReactNode>;

function isAsyncComponent(type: unknown): type is AsyncComponent {
  return typeof type === "function" && type.constructor.name === "AsyncFunction";
}

export async function resolveServerTree(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) {
    return Promise.all(node.map(resolveServerTree));
  }

  if (!isValidElement(node)) return node;

  const element = node as ReactElement<{ children?: ReactNode }>;
  if (isAsyncComponent(element.type)) {
    return resolveServerTree(await element.type(element.props));
  }

  const { children } = element.props;
  if (children === undefined) return element;

  if (Array.isArray(children)) {
    const resolved_children = await Promise.all(children.map(resolveServerTree));
    return cloneElement(element, undefined, ...resolved_children);
  }

  return cloneElement(element, undefined, await resolveServerTree(children));
}

export async function renderServerComponent(node: ReactNode) {
  const resolved = await resolveServerTree(node);
  return render(<AlertProvider>{resolved}</AlertProvider>);
}
