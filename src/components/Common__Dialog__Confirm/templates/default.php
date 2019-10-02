<?php
/** @var \Component\Common__Dialog__Confirm $this */
?>
<p><?= $this->text ?></p>
<hr />
<button class="yes" onclick="$(this).triggerEvent('yes');">ДА</button>
<button class="no" onclick="$(this).triggerEvent('no');">НЕТ</button>