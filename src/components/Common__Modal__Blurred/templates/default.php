<?php

/** @var \Component\Common__Modal__Standard $this */

?>

<?php /*
<table style="width: 100%; cursor: move;">
    <tbody>
    <tr>
        <td style="text-align: left; vertical-align: middle; font-size: 18px;">
            <?= $this->title ?>&nbsp;
        </td>
        <td style="text-align: right;">
            <img onclick="$(this).triggerEvent('refresh')" style="cursor: pointer;" onmouseover="$(this).css('opacity','0.5');" onmouseout="$(this).css('opacity','1');" src="<?= LE_URL_TO_HTTP ?>Frontend/Resources/Styles/Images/refresh.png" />
            <img onclick="$(this).triggerEvent('cancel')" style="cursor: pointer;" onmouseover="$(this).css('opacity','0.5');" onmouseout="$(this).css('opacity','1');" src="<?= LE_URL_TO_HTTP ?>Frontend/Resources/Styles/Images/close-button.png" />
        </td>
    </tr>
    </tbody>
</table>

<div class="component ajax-loading"></div>
*/ ?>


<div class="header">
    <div style="text-align: left; vertical-align: middle; font-size: 18px;">
        <?= $this->title ?>&nbsp;
    </div>
    <div style="text-align: right;">
        <div onclick="$(this).triggerEvent('refresh')" class="button refreshButton"></div>
        <div onclick="$(this).triggerEvent('cancel')" class="button closeButton"></div>
    </div>
</div>

<div class="component ajax-loading"></div>