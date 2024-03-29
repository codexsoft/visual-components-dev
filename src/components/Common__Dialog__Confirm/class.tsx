import VisualComponent from "../../VisualComponent";
import trigger from "../../shortcut-functions/trigger";
import {signal} from "../../plugin/SignalsPlugin/SignalsPlugin";
import SignalsTrait from "../../plugin/SignalsPlugin/SignalsTrait";
import mixin from "../../shortcut-functions/mixin";
import KeypressTrait from "../../plugin/KeypressPlugin/KeypressTrait";
import EventsTrait from "../../types/EventsTrait";

interface Common__Dialog__Confirm extends SignalsTrait, KeypressTrait, EventsTrait {}

class Common__Dialog__Confirm extends VisualComponent implements SignalsTrait, KeypressTrait, EventsTrait {

    private text: string = '- NO TEXT PROVIDED FOR CONFIRMATION -';
    private confirmIsDefault: boolean = false;
    private isFocusedOnConfirm: boolean = false;

    listenKeyboard() { return {
        left: () => this.focusOnYes(),
        right: () => this.focusOnNo(),
        esc: () => signal(this, 'no'),
        // enter: () => { this.signal( this.isFocusedOnConfirm ? 'yes' : 'no' ); },
        enter: () => {signal(this, this.isFocusedOnConfirm ? 'yes' : 'no' ); },
    }; }

    // }, super.listenKeyboard()); }

    listenEvents() { return {
        // yes: (e: Event) => this.signal('yes'),
        // yes: (e: Event) => {console.log('signal YES'); this.signal('yes')},
        yes: (e: Event) => {console.log('signal YES'); signal(this, 'yes')},
        no: (e: Event) => this.signal('no'),
        // no: (e: Event) => signal(this, 'no'),
    };}

    protected async activate(): Promise<void> {
        // TODO: а это сработает? Ведь init() в конструкторе вызывается!
        // А setDefault мы вызываем позже!
        this.confirmIsDefault
            ? this.focusOnYes()
            : this.focusOnNo();
    }

    async init() {
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

    public setDefault( value: boolean ): Common__Dialog__Confirm {
        this.confirmIsDefault = value;
        return this;
    }

    public setText( text: string ): Common__Dialog__Confirm {
        this.text = text;
        return this;
    }

    render() {
        return <component>

            <p>{this.text}</p>
            <hr />

            <button class="yes" onclick={trigger('yes')}>ДА</button>
            {/*<UI_Button class="yes" onclick={ trigger('yes') }>ДА</UI_Button>*/}
            &nbsp;

            <button class="no" onclick={trigger('no')}>НЕТ</button>
            {/*<UI_Button class="no" onclick={ trigger('no') }>НЕТ</UI_Button>*/}

        </component>
    }

}

export default Common__Dialog__Confirm;

mixin(Common__Dialog__Confirm, [SignalsTrait, KeypressTrait, EventsTrait]);
