import JsxArray from "./JsxArray";

let jsx = new JsxArray(<b>hello world</b>);
console.log(jsx);
let rendered = jsx.render();
console.log(rendered);