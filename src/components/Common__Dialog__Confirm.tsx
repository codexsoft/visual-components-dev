import VisualComponent from "../VisualComponent";
import trigger from "../shortcut-functions/trigger";
import * as _ from "lodash";
import ListenEventsInterface from "../types/ListenEventsInterface";

export default class Common__Dialog__Confirm extends VisualComponent implements ListenEventsInterface {
// export default class Common__Dialog__Confirm implements VisualComponent, ListenEventsInterface {
// export default class Common__Dialog__Confirm extends VisualComponent implements VisualComponent {
// export default class Common__Dialog__Confirm extends VisualComponent {

    // public static readonly class: string = __CLASS__;
    // private readonly class: string = __CLASS__;

    private text: string = '- NO TEXT PROVIDED FOR CONFIRMATION -';
    private confirmIsDefault: boolean = false;
    private isFocusedOnConfirm: boolean = false;

    listenKeyboard() { return _.assign({
        left: () => this.focusOnYes(),
        right: () => this.focusOnNo(),
        esc: () => this.signal( 'no' ),
        enter: () => {
            this.signal( this.isFocusedOnConfirm ? 'yes' : 'no' );
        },

    }, super.listenKeyboard()); }

    listenEvents() { return {
        yes: (e: Event) => this.signal('yes'),
        no: (e: Event) => this.signal('no'),
    };}

    init() {

        // TODO: а это сработает? Ведь init() в конструкторе вызывается!
        // А setDefault мы вызываем позже!
        this.confirmIsDefault
            ? this.focusOnYes()
            : this.focusOnNo();

    }

    private focusOnNo() {
        this.$element().find('button' ).css('color','inherit');
        this.$element().find('.no' ).css('color','#f00');
        this.isFocusedOnConfirm = false;
    }

    private focusOnYes() {
        this.$element().find('button' ).css('color','inherit');
        this.$element().find('.yes' ).css('color','#f00');
        this.isFocusedOnConfirm = true;
    }

    // configuration

    public setDefault( value: boolean ): this {
        this.confirmIsDefault = value;
        return this;
    }

    public setText( text: string ): this {
        this.text = text;
        return this;
    }

    // layouts render functions

    layout_default() {
        return (
            <component>

                <p>{this.text}</p>
                <hr />

                <button class="yes" onclick={ trigger('yes') }>ДА</button>
                {/*<UI_Button class="yes" onclick={ trigger('yes') }>ДА</UI_Button>*/}
                &nbsp;

                <button class="no" onclick={ trigger('no') }>НЕТ</button>
                {/*<UI_Button class="no" onclick={ trigger('no') }>НЕТ</UI_Button>*/}

            </component>
        );
    }

    render() {
        return this.layout_default();
    }

}