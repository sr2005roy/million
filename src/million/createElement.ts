import {
  COLON_CHAR,
  DOMNode,
  Flags,
  OLD_VNODE_FIELD,
  VNode,
  XLINK_NS,
  XML_NS,
  X_CHAR,
} from './types';

/**
 * Creates an Element from a VNode
 */
export const createElement = (vnode?: VNode | null, attachField = true): DOMNode => {
  if (vnode === undefined || vnode === null) return document.createComment('');
  if (typeof vnode === 'string') return document.createTextNode(vnode);

  const el = vnode.props?.ns
    ? (document.createElementNS(vnode.props?.ns as string, vnode.tag) as SVGElement)
    : (document.createElement(vnode.tag) as HTMLElement);

  if (vnode.props) {
    for (const propName in vnode.props) {
      const propValue = vnode.props[propName];
      if (propName.startsWith('on')) {
        const eventPropName = propName.slice(2).toLowerCase();
        el.addEventListener(eventPropName, propValue as EventListener);
      } else if (propName.charCodeAt(0) === X_CHAR) {
        if (propName.charCodeAt(3) === COLON_CHAR) {
          el.setAttributeNS(XML_NS, propName, String(propValue));
        } else if (propName.charCodeAt(5) === COLON_CHAR) {
          el.setAttributeNS(XLINK_NS, propName, String(propValue));
        }
      } else if (el[propName] !== undefined && !(el instanceof SVGElement)) {
        el[propName] = propValue;
      } else {
        el.setAttribute(propName, String(propValue));
      }
    }
  }

  if (vnode.children) {
    if (vnode.flag === Flags.ELEMENT_TEXT_CHILDREN) {
      el.textContent = Array.isArray(vnode.children) ? vnode.children?.join('') : vnode.children;
    } else {
      for (let i = 0; i < vnode.children.length; ++i) {
        el.appendChild(createElement(vnode.children[i], false));
      }
    }
  }

  if (attachField) el[OLD_VNODE_FIELD] = vnode;

  return el;
};