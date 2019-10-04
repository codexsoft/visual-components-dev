// import * as style from './TestComponent.style.less';
import VisualComponent from "../../VisualComponent";
import TestComponent3 from "../TestComponent3/TestComponent3";
import Signal from "../../Signal";
import Common__Dialog__Confirm from "../Common__Dialog__Confirm/class";
import Common__Modal__Blurred from "../Common__Modal__Blurred/class";
import JsxArray from "../../JsxArray";
import * as $ from "jquery";
import {ComponentRenderResultType} from "../../types/ComponentRenderResultType";

export default class TestComponent extends VisualComponent {

    // protected activate(): void {
    activate(): Promise<void> {

        return new Promise(async (resolve: Function) => {

            // let content = await (new Common__Dialog__Confirm()).render();
            // $(await (new JsxArray(content).render())).appendTo(this.$element());

            // debugger;
            // let displayed = await (new Common__Dialog__Confirm()).display();
            let com1 = new Common__Dialog__Confirm().setText('Sure?');
            $('<div>').mountComponent(com1);
            // let displayed1 = await com1.display();
            // $(displayed1).appendTo(this.$element());

            let modal = (new Common__Modal__Blurred()).setComponent(com1);
            $('body').mountComponent(modal);
            // let displayed = await (new Common__Modal__Blurred()).setComponent(com1).display();
            // $(displayed).appendTo($('body'));
            // debugger;

            resolve();
            return;

            console.log('promising...');
            try {
                // let rendered = await (new Common__Modal__Blurred).display();
                // let rendered = await (new Common__Dialog__Confirm()).display();
                let guck = new Common__Dialog__Confirm();
                // debugger;
                // let rendered = await guck.display();
                let rendered = await guck.render();

                let jsx = new JsxArray(rendered);


                try {
                    // debugger;
                    let renderPromise = await jsx.toHtml();
                    console.log('confirm:');
                    console.log(renderPromise);

                    $(renderPromise).appendTo(this.$element());
                    // renderPromise.then((result: any) => {
                    //     debugger;
                    //     console.log('confirm:');
                    //     console.log(result);
                    // }).catch((e) => {
                    //     debugger;
                    //     console.log('confirm catch:');
                    //     console.log(e.message);
                    // });
                } catch (e) {
                    console.log('fuck');
                    console.log(e.message);
                    console.log(e);
                }



                console.log('resolved:');
                console.log(rendered);
                console.log('/resolved:');
            } catch (e) {
                console.log('NOT resolved');
                console.log(e.message);
            }

            resolve();
        });

        // let $element = this.$element();
        //
        // console.log('ok');
        // let rendered = await
        // (new Common__Modal__Blurred).display().then((result) => {
        //     console.log('resolved');
        //     console.log(result);
        //     $(result).appendTo($element);
        // }).catch((e) => {
        //     console.log('not resolved');
        //     console.log(e);
        // });

        /*
        this.openModal({

            modalComponent: (new Common__Modal__Blurred).setTitle('Требуется подтверждение'),

            content: ( new Common__Dialog__Confirm )
                .setDefault(false)
                .setText('Точно выйти?'),

            terminators: {
                yes: ( s: Signal ) => this.signal('logout'),
                no: ( s: Signal ) => {},
            }

        });
        */
    }

    render(params?: {[p: string]: any}) {

        // return 'COOL';
        // console.log('test CSS module...');
        // console.log('style: ');
        // console.log(style);
        // console.log('wow: ');
        // console.log(style.wow);
        // console.log(style.locals.wow);

        return <component>
             fasp[dfasdkfasdkf;okasdo;fko;asdk;flkasd;fk;lasdkf;aksd;ofkasfk
            <h1>Works? Really!?</h1>

            <b>hello world<h1>Big world</h1></b>

            <switch var={'c'}>

                <case value="a">
                    <h1>TEST CASE A</h1>
                </case>

                <case value="b">
                    <h1>TEST CASE B</h1>
                </case>

                <default>
                    <h1>TEST DEFAULT CASE</h1>
                </default>

            </switch>

            <for each={['a', 'b', 'c']} do={(letter: string)=>{
                return <div class="extraInfo">{letter}</div>;
            }} />

            <if pass={true}>
                <h2>TRUE</h2>
            </if>

            <if not={false}>
                <h1>FALSE</h1>
            </if>

            <Common__Dialog__Confirm>
                dfg
            </Common__Dialog__Confirm>

            {/*<Common__Modal__Blurred>*/}
            {/**/}
            {/*</Common__Modal__Blurred>*/}

        </component>;

        // return <component class="{style.main}">
        return <component class="hello" style="color: blue;">

            {/*<h3 class={style.locals.wow}>Hello</h3>*/}
            {/*<h1 class={style.wow}>Works? Really!?</h1>*/}
            <h1>Works? Really!?</h1>

            <b>hello world<h1>Big world</h1></b>

            {/*<TestComponent2>*/}
            {/**/}
            {/*</TestComponent2>*/}

            <switch var={'c'}>

                <case value="a">
                    <h1>TEST CASE A</h1>
                </case>

                <case value="b">
                    <h1>TEST CASE B</h1>
                </case>

                <default>
                    <h1>TEST DEFAULT CASE</h1>
                </default>

            </switch>

            <for each={['a', 'b', 'c']} do={(letter: string)=>{
                // if (!letter) return;
                return <div class="extraInfo">{letter}</div>;
            }} />

            <if pass={true}>
                <h2>TRUE</h2>
            </if>

            <if not={false}>
                <h1>FALSE</h1>
            </if>

            {/*<TestComponent3>*/}
            {/*    Ok*/}
            {/*</TestComponent3>*/}

            {/*<Common__Modal__Blurred>*/}
            {/**/}
            {/*</Common__Modal__Blurred>*/}

            {/*<Common__Dialog__Confirm>*/}
            {/*    dfg*/}
            {/*</Common__Dialog__Confirm>*/}

        </component>;
    }

}