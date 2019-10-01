import VisualComponent from "../VisualComponent";

export default class TestComponent2 extends VisualComponent{

    render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
        return <component>
            <b style="color: red;">subcomponent <h3>data</h3></b>
        </component>;
    }

}