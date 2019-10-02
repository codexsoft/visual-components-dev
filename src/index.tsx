// import JsxArray from "./JsxArray";
import Components from "./Components";
import * as $ from "jquery";
import ConsoleLogger from "./ConsoleLogger";
import TestComponent from "./components/TestComponent/TestComponent";

// async function x(jsx: JsxArray): Promise<any> {
//     return new Promise<any>(async (resolve) => {
//         resolve(await jsx.render());
//     })
// }

// let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);

// Promise.all([x(jsx)]).then((result: any) => {
//     console.log(result);
// });

$(() => {

    Components.logger = new ConsoleLogger();
    Components.init();
    let component = new TestComponent;

    console.log('displaying');
    component.display().then((result) => {
        console.log(result);
        $(result).appendTo($('body'));
    }).catch((e) => {
        console.log(e);
    });

});