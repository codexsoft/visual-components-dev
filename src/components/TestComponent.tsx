import VisualComponent from "../VisualComponent";
import TestComponent2 from "./TestComponent2";

export default class TestComponent extends VisualComponent{

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