<?php

namespace Component;

abstract class Common__Modal extends \LE\Ware\VisualComponent
{

    const ASSETS = [
        \Assets\JQueryMutate::class,
        \Assets\JQueryUi::class, // TODO: а без этого draggable не сделать?
    ];

    /** @var string */
    public $title = '';

}