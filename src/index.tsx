import JsxArray from "./JsxArray";
import TestComponent from "./components/TestComponent";
import Components from "./Components";
import * as $ from "jquery";

function x(jsx: JsxArray): Promise<any> {
    return new Promise<any>(async (resolve) => {
        resolve(await jsx.render());
    })
}

// let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);

$(() => {

    Components.init();
    let component = new TestComponent;
    let jsx = new JsxArray(component.render());
// console.log(jsx);
// let rendered = jsx.render();
// console.log(rendered);
// console.log(x(jsx));

    // x(jsx).then((result) => {
    //     console.log(result);
    // });

    // console.log(component.displayUniversal());
    component.displayUniversal().then((result) => {
        console.log(result);
        $(result).appendTo($('body'));
    });



// Promise.all(x(jsx)).then((result: any) => {
//     console.log(result);
// });

// let component = new TestComponent;
// component.render();

});