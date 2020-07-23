// https://observablehq.com/@d3/draw-me@134
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Draw Me

Draw something! Command-Z to undo and Shift-Command-Z to redo.`
)});
  main.variable(observer("viewof lineWidth")).define("viewof lineWidth", ["html"], function(html)
{
  const form = html`<form>
  <input name=i type=range min=0.5 max=20 value=1 step=0.5 style="width:120px;">
  <output style="font-size:smaller;font-style:oblique;" name=o></output>
</form>`;
  form.i.oninput = () => form.o.value = `${form.value = form.i.valueAsNumber}px width`;
  form.i.oninput();
  return form;
}
);
  main.variable(observer("lineWidth")).define("lineWidth", ["Generators", "viewof lineWidth"], (G, _) => G.input(_));
  main.variable(observer("viewof strokeStyle")).define("viewof strokeStyle", ["html"], function(html)
{
  const form = html`<form>
  <input name=i type=color style="width:120px;">
  <output style="font-size:smaller;font-style:oblique;" name=o>color</output>
</form>`;
  form.i.oninput = () => form.value = form.i.value;
  form.i.oninput();
  return form;
}
);
  main.variable(observer("strokeStyle")).define("strokeStyle", ["Generators", "viewof strokeStyle"], (G, _) => G.input(_));
  main.variable(observer("undo")).define("undo", ["viewof strokes","html","invalidation"], function($0,html,invalidation)
{
  const keydowned = event => {
    if (event.key === "z" && event.metaKey && !event.altKey) {
      if (event.shiftKey) $0.redo();
      else $0.undo();
      event.preventDefault();
    }
  };
  const form = html`<form>
    <button name=undo type=button title="Command-Z">Undo</button>
    <button name=redo type=button title="Shift-Command-Z">Redo</button>
  </form>`;
  form.redo.onclick = () => $0.redo();
  form.undo.onclick = () => $0.undo();
  window.addEventListener("keydown", keydowned);
  invalidation.then(() => window.removeEventListener("keydown", keydowned));
  return form;
}
);
  main.variable(observer("viewof strokes")).define("viewof strokes", ["DOM","width","height","d3","viewof lineWidth","viewof strokeStyle"], function(DOM,width,height,d3,$0,$1)
{
  const context = DOM.context2d(width, height);
  const strokes = context.canvas.value = [];
  const curve = d3.curveBasis(context);
  const redo = [];

  context.lineJoin = "round";
  context.lineCap = "round";

  // Render and report the new value.
  function render() {
    context.clearRect(0, 0, width, height);
    for (const stroke of strokes) {
      context.beginPath();
      curve.lineStart();
      for (const point of stroke) {
        curve.point(...point);
      }
      if (stroke.length === 1) curve.point(...stroke[0]);
      curve.lineEnd();
      context.lineWidth = stroke.lineWidth;
      context.strokeStyle = stroke.strokeStyle;
      context.stroke();
    }
    context.canvas.value = strokes;
    context.canvas.dispatchEvent(new CustomEvent("input"));
  }

  d3.select(context.canvas).call(d3.drag()
      .container(context.canvas)
      .subject(dragsubject)
      .on("start drag", dragged)
      .on("start.render drag.render", render));

  context.canvas.undo = () => {
    if (strokes.length === 0) return;
    redo.push(strokes.pop());
    render();
  };

  context.canvas.redo = stroke => {
    if (redo.length === 0) return;
    strokes.push(redo.pop());
    render();
  };

  // Create a new empty stroke at the start of a drag gesture.
  function dragsubject() {
    const stroke = [];
    stroke.lineWidth = $0.value;
    stroke.strokeStyle = $1.value;
    strokes.push(stroke);
    redo.length = 0;
    return stroke;
  }

  // Add to the stroke when dragging.
  function dragged() {
    d3.event.subject.push([d3.event.x, d3.event.y]);
  }

  return context.canvas;
}
);
  main.variable(observer("strokes")).define("strokes", ["Generators", "viewof strokes"], (G, _) => G.input(_));
  main.variable(observer()).define(["strokes"], function(strokes){return(
strokes
)});
  main.variable(observer("height")).define("height", function(){return(
500
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
