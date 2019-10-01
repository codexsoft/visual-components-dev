import VisualComponent from "../VisualComponent";

export default class TestComponent extends VisualComponent{

    render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
        return <component>
            <b style="color: red;">hello world<h1>Big world</h1></b>

            {/*<if pass={true}>*/}
            {/*    <h2>TRUE</h2>*/}
            {/*</if>*/}

            {/*<if not={false}>*/}
            {/*    <h1>FALSE</h1>*/}
            {/*</if>*/}

        </component>;
    }

}