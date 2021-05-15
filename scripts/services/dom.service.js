/**
 * Create a DOM element
 * @param {string} tag - The HTML tag.
 * @param {string} textContent - Text content of the node.
 * @param  {...string} classNames - Spread classList.
 * @returns {HTMLElement} - The HTML Element.
 */
export function createElement(tag, textContent, ...classNames) {
  const element = document.createElement(tag);
  element.classList.add(classNames);
  if (textContent) element.textContent = textContent;
  return element;
}