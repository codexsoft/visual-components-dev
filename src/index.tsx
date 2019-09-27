import JsxArray from "./JsxArray";
import TestComponent from "./components/TestComponent";
import Components from "./Components";
import * as $ from "jquery";
import ConsoleLogger from "./ConsoleLogger";
import {implementsInterface} from "./shortcut-functions/implements";

function x(jsx: JsxArray): Promise<any> {
    return new Promise<any>(async (resolve) => {
        resolve(await jsx.render());
    })
}

// let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);

$(() => {

    Components.logger = new ConsoleLogger();
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
    component.display().then((result) => {
        console.log(result);
        $(result).appendTo($('body'));
    });

    let tests = [
        [{}, {x: 'string'}, false],
        [{x: ''}, {x: 'string'}, true],
        [{x: 42}, {x: 'string'}, false],
        [{x: {}}, {x: 'object'}, true],
        [{x: 'asd', y: 42}, {x: 'string'}, true],
        [{x: 'asd', y: 42}, {x: ['string']}, true],
        [{x: 'asd', y: 42}, {x: ['number', 'object']}, false],
        [{x: {z: 42}, y: 42}, {x: {z: 'number'}}, true],
        [{x: {z: [42]}, y: 42}, {x: {z: ['number']}}, true],
    ];

    tests.forEach(function(el: any, index, arr) {
        console.log('test no: ', index);
        let actualObj = el[0];
        let expectedInterface = el[1];
        let expectedResult = el[2];

        console.log(actualObj);
        console.log(expectedInterface);
        console.log(expectedResult);

        let realResult = implementsInterface(actualObj, expectedInterface);
        if (realResult === expectedResult) {
            console.log(realResult);
        } else {
            console.error(realResult)
        }

    });

    // console.log(...[1,2,3]);
    // console.log(1, implementsInterface({x: ''}, {x: 'string'}));
    // console.log(2, implementsInterface({x: ''}, {x: 'string'}));



// Promise.all(x(jsx)).then((result: any) => {
//     console.log(result);
// });

// let component = new TestComponent;
// component.render();

});