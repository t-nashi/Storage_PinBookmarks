<?php

// 変数定義
$baseDirPath 	= '.././';						// phpファイルが「php」フォルダ内にあるので、index.htmlと同じ階層指定にするために必要な記述
define("FILE_PATH", $baseDirPath."images/");	//保存するパスを指定
$mes = "";										//最後にjsに返すメッセージの入れ物

//---------------------------------------------
// main
//---------------------------------------------
if(!empty($_FILES)){
	if(is_uploaded_file($_FILES["file"]["tmp_name"])){
		$name = $_FILES["file"]["name"];
		$tempFile = $_FILES["file"]["tmp_name"];

		// アップロード可能なファイルの種類を制御（拡張子）
		$fileTypes = array('jpg','gif','png','bmp','jpeg','JPG','GIF','PNG','BMP','JPEG');	// File extensions
		// 拡張子一覧
		$fileTypesName = "";
		for($j=0; $j<count($fileTypes); $j++){
			$fileTypesName .= ".".$fileTypes[$j]."/";
		}
		//ファイル名を分解できる形に整形（Validate the file type）
		$fileParts = pathinfo($_FILES["file"]["name"]);

		//ファイル名がアルファベットのみかをチェック（＋で[]も許容対象に含む）
		if(preg_match("/^([a-zA-Z0-9\[\]\.\-\_])+$/ui", $name) == "0"){
			//アルファベット以外を含む場合はファイル名を日時とする
			$saveFileName = date("Ymd_His", time());
			//マイクロ秒をファイル名に付加（同ファイル名対策）
			$saveFileName = "[" . (microtime()*1000000) . "]" . $saveFileName;
		} else {
			//特定の拡張子が含まれるかどうかチェックし、含まれていたら拡張子を除いて変数へ格納
			for($j=0; $j<count($fileTypes); $j++){
				if(preg_match("/\.".$fileTypes[$j]."$/ui", $name) == true){
					$ret = explode('.'.$fileTypes[$j], $name);
					break;		//対象の拡張子が見つかった段階でfor処理を抜ける
				}
			}//for
			$saveFileName = $ret[0];					// 拡張子を除いたそのまま
			//$saveFileName = $fileParts["filename"];	//拡張子を除いたそのまま
		}//if

		//初期タグ用の値を付与（「@」がタグ。「___」はタグとURLの分岐ポイント）
		$saveFileName =  "@___".$saveFileName;

		//処理対象のファイル名を変数へ格納
		$mes .= '<span class="color"><b>'.$_FILES["file"]["name"].'</b></span>';

		if(in_array($fileParts['extension'], $fileTypes)){
			if(move_uploaded_file($_FILES["file"]["tmp_name"], FILE_PATH . $saveFileName . "." . $fileParts["extension"])){
				//chmod($fileName, 0644);
				$mes .= " uploaded.";
				// copy($baseDirPath."text/@@@.txt", $baseDirPath."text/".$saveFileName.".txt");

				// min/用のリサイズ画像用意
				imgResize(FILE_PATH, 'min/', $saveFileName.".".$fileParts["extension"]);
			} else {
				$mes .= "アップロードエラー";
			}
		} else {
			$mes .= "   ※only（".$fileTypesName."）type files.";
		}//if

	}//if
}//if

//---------------------------------------------
// 画像リサイズ（min/用のリサイズ画像用意）
//---------------------------------------------
function imgResize($imagesDirPath, $minImagesPath, $imageFileName) {

	// 変数定義
	$imageFullPath = $imagesDirPath.$imageFileName;							// リサイズ対象の画像ファイルのパス
	$ext = substr($imageFullPath, strrpos($imageFullPath, '.') + 1);		// ファイルの拡張子
	// 縦横の最大値を設定
	$want_width = 500;
	$want_height = 500;

	// 読み込み対象のファイルタイプ決定
	switch ($ext) {
		case 'jpg':
			//JPGファイルを読み込む
			$imageFullPath = ImageCreateFromJPEG($imageFullPath);
			break;
		case 'png':
			//PNGファイルを読み込む
			$imageFullPath = ImageCreateFromPNG($imageFullPath);
			break;
		case 'gif':
			//GIFファイルを読み込む
			$imageFullPath = ImageCreateFromGIF($imageFullPath);
			break;
		// default:
			// throw new RuntimeException("サポートしていない画像形式です: $type");
	}

	// 元画像のファイルサイズを取得
	$org_width = ImageSx($imageFullPath);
	$org_height = ImageSy($imageFullPath);

	// 指定サイズの方が小さければ実行
	if($want_width < $org_width && $want_width < $org_height){

		//元画像の比率を計算し、高さを設定
		$proportion = $org_width / $org_height;
		$want_height = $want_width / $proportion;

		//高さが幅より大きい場合は、高さを幅に合わせ、横幅を縮小
		if($proportion < 1){
			$want_height = $want_width;
			$want_width = $want_width * $proportion;
		}

		// 画像作成
		$createNewImage = ImageCreateTrueColor($want_width, $want_height);
		// 元画像から再サンプリング
		ImageCopyResampled($createNewImage, $imageFullPath, 0, 0, 0, 0, $want_width, $want_height, $org_width, $org_height);

		// 保存先のファイルタイプ決定
		switch ($ext) {
			case 'jpg':
				//JPGファイルを読み込む
				ImageJpeg($createNewImage, $imagesDirPath.$minImagesPath.$imageFileName, 80);
				break;
			case 'png':
				//PNGファイルを読み込む
				ImagePng($createNewImage, $imagesDirPath.$minImagesPath.$imageFileName);
				break;
			case 'gif':
				//GIFファイルを読み込む
				ImageGif($createNewImage, $imagesDirPath.$minImagesPath.$imageFileName, 255);
				break;
			// default:
				// throw new RuntimeException("サポートしていない画像形式です: $type");
		}

		// 画像の破棄（メモリの開放）
		imagedestroy($imageFullPath);
		imagedestroy($createNewImage);

		// echo 'w: ' .$want_width. ', h: '.$want_height.'<br>';
		// echo 'w: ' .$org_width. ', h: '.$org_height;
	}
}

//jsに返す値（メッセージ）
echo $mes;

?>