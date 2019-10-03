///<reference path="./helper.d.ts"/>

import JsxArray from "../src/JsxArray";
import VisualComponent from "../src/VisualComponent";

test('basic', async () => {

    interface testCase {
        jsx: [],
        result: string,
    }

    class TestComponent extends VisualComponent{

        render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
            return <component>
                <b>hello world<h1 style="color: red;">Big world</h1></b>

                <TestComponent2>

                </TestComponent2>

                {/*<if pass={true}>*/}
                {/*    <h2>TRUE</h2>*/}
                {/*</if>*/}

                {/*<if not={false}>*/}
                {/*    <h1>FALSE</h1>*/}
                {/*</if>*/}

            </component>;
        }

    }

    class TestComponent2 extends VisualComponent{

        render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
            return <component>
                <b style="color: blue;">subcomponent <h3>data</h3></b>
            </component>;
        }

    }

    let tests: testCase[] = [

        {
            jsx: <b>hello world<h1>Big world</h1></b>,
            result: '<b>hello world<h1>Big world</h1></b>',
        },

        {
            jsx: await (new TestComponent()).render(),
            result: '<div class="TestComponent VisualComponent"><b>hello world<h1 style="color: red;">Big world</h1></b><div class="TestComponent2 VisualComponent"><b style="color: red;">subcomponent <h3>data</h3></b></div></div>',
        },

        // [<b>hello world<h1>Big world</h1></b>, '<b>hello world<h1>Big world</h1></b>'],
    ];

    tests.forEach(async (el: testCase, index, arr) => {
        let jsx = new JsxArray(el.jsx);
        let html = await jsx.toHtml();
        expect(html.outerHTML).toBe(el.result);
    });

    // let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);
    // let html = await jsx.render();
    // expect(html.outerHTML).toBe('<b>hello world<h1>Big world</h1></b>');
});