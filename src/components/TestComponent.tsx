import VisualComponent from "../VisualComponent";

export default class TestComponent extends VisualComponent{

    render(params?: {[p: string]: any}): Promise<any[] | string> | any[] | string {
        return <component>
            <b>hello world<h1>Big world</h1></b>
        </component>;
    }

}