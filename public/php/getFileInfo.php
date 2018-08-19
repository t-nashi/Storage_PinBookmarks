<?php

// dateエラー対策
date_default_timezone_set('Asia/Tokyo');

/*---------------------------------------------------
  変数宣言
----------------------------------------------------*/
// $dir 		= 'tmp';						// 処理対象ディレクトリ
$dir = $_POST['targetDir'];						// 処理対象ディレクトリ
$fileName 	= array();							// 
$fileSize 	= array();							// 
$timestamp 	= array();							// 
$youbi 		= array();							// 
$fileExists	= array();							// 
$baseDirPath = '.././';							// phpファイルが「php」フォルダ内にあるので、index.htmlと同じ階層指定にするために必要な記述

/*---------------------------------------------------
  ファイル保存先フォルダの有無を確認、無ければ作成
----------------------------------------------------*/
$res_dir = opendir($baseDirPath);					// ディレクトリ・ハンドルをオープン（phpフォルダの上階層指定）
	while($file_name = readdir($res_dir)){		// ディレクトリ内のファイル名を１つずつを取得し、「$file_name」に格納する
		if($file_name == $dir){					// echo "ディレクトリ {$dir} はすでに存在します。<br>\n";
			$folderCheck = true;
			//break;
		}
	}
	if(!$folderCheck){							//echo "ディレクトリ {$dir} がありません。<br>\n";
		mkdir($dir);
	}
closedir($res_dir);								//ディレクトリ・ハンドルをクローズ

/*---------------------------------------------------
  指定フォルダ内のファイルをチェック
----------------------------------------------------*/
if($handle = opendir($baseDirPath.$dir)){ 		//（phpフォルダの上階層指定）
	/* ファイル名を配列へ代入（$fileName[]）
	------------------------------------*/
	$count = 0;
	while (false !== ($file = readdir($handle))) {

		// 除外するファイルを設定
		if ($file != "." && $file != ".." && $file != "min" && $file != ".DS_Store") {

			//ファイル名
			$fileName[] = [$file, $count];										// (01) ファイル名

			$arrlen = strlen($file);
			$arrlen -= 4;

			//ファイルサイズ
			$fullPath = realpath($dir."/".$file);				// このphpから見たファイルのパス
			$byte = filesize($fullPath);						// ファイルサイズを取得
			$byte = byteFormat($byte);							// ファイルサイズを見やすく
			$fileSize[] = [$count, $byte];									// (02) ファイルサイズ

			//日付
			$pyear = date("Y", filemtime($fullPath));			// 年
			$pmonth = date("m", filemtime($fullPath));			// 月
			$pday = date("d", filemtime($fullPath));			// 日
			$_date = date("Y.m.d", filemtime($fullPath));		// 年月日
			$_youbi = weekFormat($pyear, $pmonth, $pday);		// 曜日
			$_time = date("H:i:s", filemtime($fullPath));		// 時分秒

			$timestamp[] = [$count, $_date."\t".$_time."\n".$_youbi];			// (03) 曜日と時間

			$fileExists[] = [$count, file_exists($baseDirPath.$dir."/min/".$file)];

			// カウントをプラス
			$count++;
		}
	}
	closedir($handle);

	//ここで配列をソートする（※ファイルサイズ・日付との順番が変わってしまうので調整必須）
	sort($fileName);
}

/*--------------------------------------------------- [ function ]
  曜日を返す
----------------------------------------------------*/
function weekFormat($y, $m, $d){
	$weekjp_array = array('日', '月', '火', '水', '木', '金', '土');
	$week_array = array('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');

	//タイムスタンプを取得
	$ptimestamp = mktime(0, 0, 0, $m, $d, $y);

	//曜日番号を取得
	$weekno = date('w', $ptimestamp);		// 'l' - Sunday, Monday, ... ,	'w' - 0, 1, ...
	//日本語の曜日を出力
	$weekjp = $week_array[$weekno];
	return $weekjp;
}

/*--------------------------------------------------- [ function ]
  byte を B - KB - MB - GB に分類して返す
----------------------------------------------------*/
function byteFormat($size){

	$filesize = "";
	$len = strlen($size);

		if($len < 4) {
		$filesize = $size."B";
	}elseif($len < 7){
		$len -= 3;
		$size = substr($size, 0, $len);
		$filesize = $size."KB";
	}elseif($len < 10){
		$len -= 6;
		$size = substr($size, 0, $len);
		$filesize = $size."MB";
	}else{
		$len -= 9;
		$size = substr($size, 0, $len);
		$filesize = $size."GB";
	}
	return $filesize;

}//byteFormat

/*---------------------------------------------------
  jsに値を返す
----------------------------------------------------*/

// 配列をまとめる（多次元配列）
$pc = array($fileName, $fileSize, $timestamp, $fileExists);

// echoで返す
echo json_encode($pc);

?>

