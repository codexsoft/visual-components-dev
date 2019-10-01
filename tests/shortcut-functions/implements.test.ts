import {listenEventsInterface} from "../../src/types/ListenEventsInterface";
import Common__Dialog__Confirm from "../../src/components/Common__Dialog__Confirm";
import Common__Modal__Blurred from "../../src/components/Common__Modal__Blurred";
import TestComponent from "../../src/components/TestComponent";
import {implementsInterface} from "../../src/shortcut-functions/implements";

test('basic', () => {

    let tests = [
        [{}, {x: 'string'}, false], // 0
        [{x: ''}, {x: 'string'}, true],
        [{x: 42}, {x: 'string'}, false],
        [{x: {}}, {x: 'object'}, true],
        [{x: 'asd', y: 42}, {x: 'string'}, true],
        [{x: ['asd', 42, 'fff'], y: 42}, {x: 'array'}, true],
        [{x: ['asd', 42, 'fff'], y: 42}, {x: []}, false],
        [{x: ['asd', 42, 'fff'], y: 42}, {x: ['string','number']}, true],
        [{x: ['asd', {}, 'fff'], y: 42}, {x: ['string','number']}, false], // 6
        [{x: ['asd', 'bbb', 'qwe'], y: 42}, {x: ['string']}, true],
        [{x: 'asd', y: 42}, {x: ['number', 'object']}, false],
        [{x: {z: 42}, y: 42}, {x: {z: 'number'}}, true],
        [{x: {z: [42]}, y: 42}, {x: {z: ['number']}}, true],
        [{}, listenEventsInterface, false],
        [new Common__Dialog__Confirm, listenEventsInterface, true],
        [new Common__Modal__Blurred, listenEventsInterface, true],
        [new TestComponent, listenEventsInterface, false],
    ];

    // let passed = 0;
    // let failed = 0;

    tests.forEach(function(el: any, index, arr) {
        // console.log('test no: ', index);
        let actualObj = el[0];
        let expectedInterface = el[1];
        let expectedResult = el[2];

        // console.log(expectedResult);

        let realResult = implementsInterface(actualObj, expectedInterface);
        // noinspection TypeScriptUnresolvedFunction
        expect(realResult).toBe(expectedResult);

        // if (realResult === expectedResult) {
        //     passed++;
        //     console.log(index, expectedResult, realResult);
        // } else {
        //     failed++;
        //     console.log(actualObj);
        //     console.log(expectedInterface);
        //     console.error(index, expectedResult, realResult)
        // }

    });


});