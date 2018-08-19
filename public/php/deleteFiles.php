<?php

$baseDirPath 	= '.././';			// phpファイルが「php」フォルダ内にあるので、index.htmlと同じ階層指定にするために必要な記述

// ファイルパスセット
$delImg 		= $baseDirPath.$_POST['deleteFileName'];		// images/***
$delMinImg 		= $baseDirPath.$_POST['deleteMinFileName'];		// images/min/***

// ファイル削除
unlink($delImg);

// ファイルが存在したら削除
if(file_exists($delMinImg)) { unlink($delMinImg); }

// jsに返す値（削除したimagesのファイルパス）
echo $delImg;

?>
