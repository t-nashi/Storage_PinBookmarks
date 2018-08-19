<?php

$baseDirPath 	= '.././';			// phpファイルが「php」フォルダ内にあるので、index.htmlと同じ階層指定にするために必要な記述

// ファイルパスセット
$oldImg 		= $baseDirPath.$_POST['oldImgFileName'];			// images/***
$newImg 		= $baseDirPath.$_POST['newImgFileName'];			// 
$oldMinImg 		= $baseDirPath.$_POST['oldMinImgFileName'];			// images/min/***
$newMinImg 		= $baseDirPath.$_POST['newMinImgFileName'];			// 

// ファイルリネーム
rename($oldImg, $newImg);

// ファイルが存在したらファイルリネーム
if(file_exists($oldMinImg)) {
	if($oldImg != $oldMinImg) {
		rename($oldMinImg, $newMinImg);
	}
}

// jsに返す値（リネームしたimagesのファイルパス）
echo $oldImg." → ".$newImg;

?>
