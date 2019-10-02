<?php

namespace Component;

class Common__Modal__Blurred extends Common__Modal
{

    const ASSETS = [
        \Assets\JQueryMutate::class,
        \Assets\JQueryUi::class, // TODO: а без этого draggable не сделать?
    ];

    /** @var string */
    public $title = '';

}