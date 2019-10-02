<?php

namespace Component;

use LE\Ware\Process\Event;
use LE\Ware\VisualComponent;

/**
 * ВРОДЕ ГОТОВО
 * Class Common__Dialog__Confirm
 */
class Common__Dialog__Confirm extends VisualComponent
{

    public $text = '';

    //function init( $parameters = [] ) {}

    /*
    function on_yes( Event $e ) {
        $this->finish( true );
    }

    function on_no( Event $e ) {
        $this->finish( false );
    }
    */

    public function setText( $text ) {
        $this->text = $text;
        return $this;
    }

    function parameters_for_template_default() {
        if ( !$this->text ) $this->text = 'Требуется подтверждение';
        return [];
    }

}