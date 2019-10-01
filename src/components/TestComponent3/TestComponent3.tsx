// import style from './TestComponent.style.css';
// const style = require('./TestComponent.style.css');
// import style from './TestComponent.style.css';

import VisualComponent from "../../VisualComponent";

export default class TestComponent3 extends VisualComponent{

    render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
        // return <component class={style.main}>
        return <component>

            <h1>This is TestComponent3</h1>
            <p>After starting gulp command, plugin gulp-concat will take all the CSS files located in the css/ directory and concatenate them into a one file css/dist/concat.css</p>

        </component>;
    }

}