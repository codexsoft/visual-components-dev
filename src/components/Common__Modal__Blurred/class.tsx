import Common__Modal from "../Common__Modal/Common__Modal";
import trigger from "../../shortcut-functions/trigger";

export default class Common__Modal__Blurred extends Common__Modal {

    protected title: string = 'Untitled';

    public setTitle( title: string ) {
        this.title = title;
        return this;
    }

    /**
     * Конструирует модальное окно
     * @returns {JQuery}
     */
    protected constructModal(): JQuery {

        let zIndex = this.parentComponent.$element().css('z-index') + 1;
        let $body = $('body');
        // let $background = $('<div class="'+this.getClass()+'_CONTAINER">' );
        let $background = $('<div>' );
        $background
        // .addClass(this.getCssClass()+'_CONTAINER')
            .addClass('CONTAINER_'+this.getCssClass())
            // .appendTo( this.parentComponent.$element() )
            .appendTo( $body )
            .css('z-index',zIndex);

        $body.children('.VisualComponent').first()
            .css('transition','all 0.5s ease')
            .css('filter','blur(2px) grayscale(1)')
        ;

        //    filter: blur(10px);

        let $placeholder = $('<div>' );
        $placeholder.appendTo( $background );

        return $placeholder;

    }

    protected destroyModal() {

        $('body').children('.VisualComponent').first()
            .css('filter','none');

        // уничтожаем модальное окно
        this.$element().closest('.'+'CONTAINER_'+this.getCssClass()).remove();
        // this.$element().closest('.'+this.getCssClass()+'_CONTAINER').remove();

    }

    public afterFinish() {
        // $("html, body").animate({scrollTop: this.parentComponent.$element().offset().top },"slow");
    }

    protected afterComponentMounted(renderedComponentElement: Element) {
    }

    render() {
        return (
            <component>
                <div class="header">
                    <div class="title">{this.title}&nbsp;</div>
                    <div style="text-align: right;">
                        <div onclick={ trigger('cancel') } class="button closeButton">

                        </div>
                    </div>
                </div>

                <div class="component ajax-loading">

                </div>

            </component>
        );
    }

}