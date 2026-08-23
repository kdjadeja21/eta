/**
 * Chrome mobile (especially iOS, where the address bar sits at the bottom)
 * initially reports a layout viewport that extends behind the browser chrome.
 * `position: fixed; bottom: 0` therefore paints under the toolbar until the
 * first scroll, when Chrome corrects `window.innerHeight`.
 *
 * `--vv-offset-bottom` is the gap between the layout viewport and the visual
 * viewport so fixed footers can sit in the visible area on first paint.
 */
export const VISUAL_VIEWPORT_OFFSET_VAR = "--vv-offset-bottom";

const LISTENER_FLAG = "__etaVvOffsetBound";

type FlaggedWindow = Window & { [LISTENER_FLAG]?: boolean };

export function getVisualViewportBottomOffset(
  innerHeight: number,
  visualViewport: Pick<VisualViewport, "height" | "offsetTop"> | null | undefined,
): number {
  if (!visualViewport) {
    return 0;
  }

  return Math.max(
    0,
    innerHeight - visualViewport.height - visualViewport.offsetTop,
  );
}

export function applyVisualViewportOffset(targetWindow: Window = window): void {
  const offset = getVisualViewportBottomOffset(
    targetWindow.innerHeight,
    targetWindow.visualViewport,
  );

  targetWindow.document.documentElement.style.setProperty(
    VISUAL_VIEWPORT_OFFSET_VAR,
    `${offset}px`,
  );
}

export function bindVisualViewportOffset(targetWindow: Window = window): () => void {
  const flaggedWindow = targetWindow as FlaggedWindow;
  const update = () => applyVisualViewportOffset(targetWindow);

  update();
  const outerRaf = targetWindow.requestAnimationFrame(() => {
    update();
    targetWindow.requestAnimationFrame(update);
  });

  if (flaggedWindow[LISTENER_FLAG]) {
    return () => {
      targetWindow.cancelAnimationFrame(outerRaf);
    };
  }

  flaggedWindow[LISTENER_FLAG] = true;

  const visualViewport = targetWindow.visualViewport;
  visualViewport?.addEventListener("resize", update);
  visualViewport?.addEventListener("scroll", update);
  targetWindow.addEventListener("resize", update);
  targetWindow.addEventListener("orientationchange", update);
  targetWindow.addEventListener("pageshow", update);

  return () => {
    flaggedWindow[LISTENER_FLAG] = false;
    targetWindow.cancelAnimationFrame(outerRaf);
    visualViewport?.removeEventListener("resize", update);
    visualViewport?.removeEventListener("scroll", update);
    targetWindow.removeEventListener("resize", update);
    targetWindow.removeEventListener("orientationchange", update);
    targetWindow.removeEventListener("pageshow", update);
  };
}

/**
 * Runs before hydration so Chrome mobile can lift fixed footers on first paint.
 * Keep the formula aligned with getVisualViewportBottomOffset().
 */
export const VISUAL_VIEWPORT_INLINE_SCRIPT = `(function(){
  function update(){
    var vv=window.visualViewport;
    var offset=vv?Math.max(0,window.innerHeight-vv.height-vv.offsetTop):0;
    document.documentElement.style.setProperty("${VISUAL_VIEWPORT_OFFSET_VAR}",offset+"px");
  }
  update();
  requestAnimationFrame(function(){
    update();
    requestAnimationFrame(update);
  });
  if(window.${LISTENER_FLAG})return;
  window.${LISTENER_FLAG}=true;
  if(window.visualViewport){
    window.visualViewport.addEventListener("resize",update);
    window.visualViewport.addEventListener("scroll",update);
  }
  window.addEventListener("resize",update);
  window.addEventListener("orientationchange",update);
  window.addEventListener("pageshow",update);
})();`;
