// ///<reference path="./helper.d.ts"/>

import JsxArray from "../src/JsxArray";

test('basic', async () => {

    let tests = [
        [<b>hello world<h1>Big world</h1></b>, ],
    ];

    let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);
    let html = await jsx.render();
    expect(html.outerHTML).toBe('<b>hello world<h1>Big world</h1></b>');
});