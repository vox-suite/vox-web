// Ordered Bayer thresholds, repeated in SVG user space. Static, so the treatment
// adds no animation loop and stays attached to the original vector geometry.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4">${BAYER.map((value, index) => `<rect x="${index % 4}" y="${Math.floor(index / 4)}" width="1" height="1" fill="rgb(${Array(3).fill(Math.round(((value + 0.5) / 16) * 255)).join(",")})"/>`).join("")}</svg>`;
const TILE_URL = `data:image/svg+xml,${encodeURIComponent(tile)}`;
const LEVELS = Array.from({ length: 12 }, (_, index) => index / 11).join(" ");

export function ditherSvg(markup: string, id: string) {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  if (doc.querySelector("parsererror")) return markup;
  const svg = doc.documentElement;
  const defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${TILE_URL}" x="0" y="0" width="24" height="24" preserveAspectRatio="none" result="threshold"/><feTile in="threshold" result="matrix"/><feComposite in="SourceGraphic" in2="matrix" operator="arithmetic" k1="0" k2="1" k3="0.0833333" k4="0" result="ordered"/><feComponentTransfer in="ordered" result="quantized"><feFuncR type="discrete" tableValues="${LEVELS}"/><feFuncG type="discrete" tableValues="${LEVELS}"/><feFuncB type="discrete" tableValues="${LEVELS}"/></feComponentTransfer><feComposite in="quantized" in2="SourceGraphic" operator="in"/></filter>`;
  // Only substantial surface fills: text, paths, controls, brand images, clipping
  // geometry and masks keep their original colors and sharp vector rendering.
  const template = defs.firstElementChild!;
  let surfaceIndex = 0;
  svg.querySelectorAll("rect").forEach((rect) => {
    if (rect.closest("defs, clipPath, mask, pattern, symbol")) return;
    const width = Number.parseFloat(rect.getAttribute("width") || "0");
    const height = Number.parseFloat(rect.getAttribute("height") || "0");
    const fill = rect.getAttribute("fill");
    if (width >= 120 && height >= 64 && fill !== "none" && !rect.hasAttribute("filter")) {
      const surfaceId = `${id}-${surfaceIndex++}`;
      const filter = template.cloneNode(true) as Element;
      filter.setAttribute("id", surfaceId);
      const image = filter.querySelector("feImage")!;
      image.setAttribute("x", rect.getAttribute("x") || "0");
      image.setAttribute("y", rect.getAttribute("y") || "0");
      defs.appendChild(filter);
      rect.setAttribute("filter", `url(#${surfaceId})`);
    }
  });
  template.remove();
  svg.insertBefore(defs, svg.firstChild);
  return new XMLSerializer().serializeToString(svg);
}
