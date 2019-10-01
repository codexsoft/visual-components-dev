///<reference path="./helper.d.ts"/>

import JsxArray from "../src/JsxArray";

test('basic', async () => {

    interface testCase {
        jsx: [],
        result: string,
    }

    let tests: testCase[] = [

        {
            jsx: <b>hello world<h1>Big world</h1></b>,
            result: '<b>hello world<h1>Big world</h1></b>',
        },

        {
            jsx: <b>hello world<h1>Big world</h1></b>,
            result: '<b>hello world<h1>Big world</h1></b>',
        },

        // [<b>hello world<h1>Big world</h1></b>, '<b>hello world<h1>Big world</h1></b>'],
    ];

    tests.forEach(async (el: testCase, index, arr) => {
        let jsx = new JsxArray(el.jsx);
        let html = await jsx.render();
        expect(html.outerHTML).toBe(el.result);
    });

    // let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);
    // let html = await jsx.render();
    // expect(html.outerHTML).toBe('<b>hello world<h1>Big world</h1></b>');
});