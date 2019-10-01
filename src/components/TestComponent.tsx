import VisualComponent from "../VisualComponent";
import TestComponent2 from "./TestComponent2";
// import style from './TestComponent.style.css';
const style = require('./TestComponent.style.css');
// import style from './TestComponent.style.css';

export default class TestComponent extends VisualComponent{

    render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
        // return <component class={style.main}>
        return <component>

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

        </component>;
    }

}