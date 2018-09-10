// htmlへ要素出力などの重要ポイントに「★」コメントを付与

//-------------------------------------------------------------
// 変数定義
//-------------------------------------------------------------
// id名
var outputHtmlIdName = '#content';	// htmlの出力先のid名

// 重要要素
var tagBranchPoint = '___';			// ファイル名に含まれているタグ情報を取得するための分割値
var oldVal = "";					// input と textarea に onfocus したときの値をセットする変数

// ボタン名
var btnOption = '#btnOption';			// Optionボタン名管理（デフォルトで表示）
var btnReload = '#btnReload';			// Reloadボタン名管理（ファイル等に変更が走ってリロードした方が良いタイミングで表示）
var btnShowLogBoard = '#btnShowLogBoard';		// Show Logボタン名管理（Optionボタン押下で出現）
var btnSwitchList = '#btnSwitchList';		// Listボタン名管理（Optionボタン押下で出現）
var btnUrlConvertTool = '#btnUrlConvertTool'	// URLボタン名管理（URL変換ツールの表示ON・OFF）

// メソッド「getFileInfo()」で必要な入れ物
var imgFileNames = [];				// /imagesファイルの名称管理
var imgFileSizes = [];				// /imagesファイルの容量管理
var imgFileTimestamps = [];			// /imagesファイルのタイムスタンプ管理
var imgMinExists = [];				// /images/min 内の画像の有無管理
var tagLists = [];					// タグ情報管理

// タグ・フィルター
var filterActiveStatus = [];		// .active が付いているフィルターのboolean値を管理（付いてたらtrue）
var filterActiveCount = 0;			// .active が付いているフィルター数を管理

//-------------------------------------------------------------
// ドキュメント読み込み後に実行する処理
//-------------------------------------------------------------
$(function(){
	//---------------------------------------------
	// リスナーイベントをセット（Setup the dnd listeners.）
	//---------------------------------------------
	//「Select files here」フォームに変化があったとき（dropZone内のボタンクリック）
	document.getElementById("files").addEventListener("change", handleFileSelect, false);

	//「dropZone」に変化があったとき
	var dropZone = document.getElementById("dropZone");
	dropZone.addEventListener("dragover", handleDragOver, false);	// ドラッグ
	dropZone.addEventListener("drop", handleDrop, false);			// ドロップ
	dropZone.addEventListener("dragleave", handleLeave, false);		// リーブ

	// imagesフォルダの中身調査（ファイル名・重さ・作成日時を特定変数へ入れる）
	getFileInfo("images");
	  // └ ★setImageToHtml();
	  //    … htmlに出力（順番に待機処理ができなかったから中に処理を書く）

	// Optionボタン押下時の挙動（Show Logボタン表示、各種img要素のファイル名・メモ編集、削除ボタン表示）
	$(btnOption).click(function(){
		if($(this).hasClass('on') && $(btnShowLogBoard).hasClass('on')){
			hideLogBoard();
		}else{
			$(btnShowLogBoard).toggleClass('opacity-100 pos-on');
		}
		$(btnSwitchList).toggleClass('opacity-100 pos-on');
		$(btnUrlConvertTool).toggleClass('opacity-100');

		$('.img-overlay-content').each(function(index, object){
			$(object).toggleClass('show');
		});
		$(this).toggleClass('on');
	});

	// Reloadボタン押下時
	$(btnReload).click(function(){
		tagLists = [];
		getFileInfo("images");
		$(this).toggleClass('opacity-100 pos-on');
		// ログボタン・ボード隠し
		hideLogBoard();
		// オプションボタンoff
		$(btnOption).removeClass('on');
		// オプションボタンoff
		$(btnSwitchList).removeClass('opacity-100 pos-on on');
		// URLボタン隠し
		$(btnUrlConvertTool).toggleClass('opacity-100');
	});

	// Show Logボタン押下時
	$(btnShowLogBoard).click(function(){
		$(this).toggleClass('on');
		// console.log($('#logBoard').is(":hidden"));
		if($('#logBoard').is(":hidden")) {
			$('#logBoard').toggleClass('z-index-100');
			$('#logBoard').fadeIn(300);
		}else{
			$('#logBoard').fadeOut(300).queue(function() {
				$(this).stop(true, true)
				.toggleClass('z-index-100');
			});
		}
	});

	// Listボタン押下時
	$(btnSwitchList).click(function(){
		$(this).toggleClass('on');
		if($(this).hasClass('on')){
			$('#items').removeClass('flexbox');
			$('#items').addClass('list');
		}else{
			$('#items').addClass('flexbox');
			$('#items').removeClass('list');
		}
	});

	// URLボタン押下時
	$(btnUrlConvertTool).click(function(){
		$(this).toggleClass('on');
		if($('#urlWholeBg').is(":hidden")) {
			$('#urlWholeBg').toggleClass('z-index-1000');
			$('#urlWholeBg').fadeIn(100);
		}else{
			$('#urlWholeBg').fadeOut(100).queue(function() {
				$(this).stop(true, true)
				.toggleClass('z-index-1000');
			});
		}
	});
});

//---------------------------------------------
// クリップボードにコピーする
//---------------------------------------------
function copyToClipboard(data){
	//フォームが空でなければ処理
	if (data != ""){
		document.execCommand(data);
		document.execCommand("copy");
		document.execCommand(data);
		showMessage("URL copy");
	}
}

//---------------------------------------------
// クリップボードにコピーする
//---------------------------------------------
function urlConverter(externalUrl, target){
	//フォームが空でなければ処理
	if (externalUrl != ""){
		var urlText = "";

		if(~externalUrl.indexOf('\n')) {
			// 複数行の場合
			var LineData = externalUrl.split("\n");
			// データを一行毎に処理
			for (var i=0; i < LineData.length-1; i++){
				urlText += urlCompile(LineData[i]) + "\n";
			}
			target.val(urlText);
		}else{
			// 1行の場合
			target.val(urlCompile(externalUrl));
		}
	}
}

//---------------------------------------------
// 【Drop Files】「files」に変化があったときに選択されたファイルのデータをPHPへ渡す
//---------------------------------------------
function handleFileSelect(evt){
	var files = evt.target.files;
	uploadFiles(files);
}//function

//---------------------------------------------
// 【Drop Files】「dropZone」にドロップされたらそのファイルのデータをPHPへ渡す
//---------------------------------------------
function handleDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var files = evt.dataTransfer.files;
	uploadFiles(files);
	$('#dropZone').removeClass('dragover');
}//function

//---------------------------------------------
// 【Drop Files】「dropZone」へのドラッグ時の処理
//---------------------------------------------
function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
	$('#dropZone').addClass('dragover');
}

//---------------------------------------------
// 【Drop Files】「dropZone」からドラッグが外れた時の処理
//---------------------------------------------
function handleLeave(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	$('#dropZone').removeClass('dragover');
}

//---------------------------------------------
// 【Drop Files】PHPへデータをPOSTする
//---------------------------------------------
function uploadFiles(files){
	var fd = new FormData();
	var count = 0;

	//form要素内の全てのコントロールの名前と値を取得し、1つのオブジェクトにまとめる
	for (var i = 0, f; f = files[i]; i++) {
		fd.append("file", files[i]);
		//phpとの非同期通信処理
		$.ajax({
			type: "POST",
			url: "php/uploadFiles.php",
			data: fd,
			processData: false,		//jQuery がデータを処理しないよう指定
			contentType: false,		//jQuery が contentType を設定しないよう指定
			success: function(html){
				count++;
				var e = document.getElementById("list");
				var total = "["+count+"/"+files.length+"]";
				$(e).prepend('<li>' + total + ' ' + html + '</li>');
				showLogBoard();
			}
		});//ajax
	}
}//function


//---------------------------------------------
// 【Tag Filter】フィルターliの状態チェック
//---------------------------------------------
function checkFilterStatus() {
	filterActiveStatus = [];
	filterActiveCount = 0;
	$('#filter li').each(function() {
		if($(this).hasClass('active')){
			filterActiveStatus.push(true);
			filterActiveCount++;
		}else{
			filterActiveStatus.push(false);
		}
	});

	// liタグでclassの有無を見て非表示か否かを判断・設定
	showSelectByFilter();
	// console.log(filterActiveStatus);
}

//---------------------------------------------
// 【Tag Filter】liタグでclassの有無を見て非表示か否かを判断・設定
//---------------------------------------------
function showSelectByFilter() {
	for(var i=0; i<filterActiveStatus.length; i++) {
		var className = '.tag-' + escapeSelectorString(tagLists[i]);
		if(filterActiveStatus[i]){
			$(className).removeClass('d-none');
		}else{
			$(className).addClass('d-none');
		}
	}
	if(filterActiveCount === 0){
		// console.log('true');
		// 「#items li.item」を全表示（全てのli要素がoffの時など）
		itemVisibleReset();
	}else{
		// console.log('false');
	}
}

//---------------------------------------------
// 【Tag Filter】jqueryで扱う値に特定の文字が入っているとエラーになるのでエスケープ処理をする必要がある。そのためのサポートメソッド
//---------------------------------------------
function escapeSelectorString(val){
	return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, "\\$&");
}

//---------------------------------------------
// 【Tag Filter】「#items li.item」を全表示（全てのli要素がoffの時など）
//---------------------------------------------
function itemVisibleReset() {
	$('#items li').each(function() {
		$(this).removeClass('d-none');
	});
}

//---------------------------------------------------
// 画像アップロードが終わった後のログ処理
//---------------------------------------------------
function showLogBoard() {

	// ログボードが表示後ろに隠れたままだったら手前表示する
	if(!($('#logBoard').hasClass('z-index-100'))){
		$('#logBoard').addClass('z-index-100');
	}
	// リロードボタンが表示されてなかったら表示
	if(!($(btnReload).hasClass('pos-on'))){
		showBtnReload();
	}
	// フェードイン・アウト処理
	$('#logBoard').fadeIn(300).queue(function() {
		$(this).stop(true, true)
		.delay(1500).fadeOut(500).queue(function() {
			$(this).stop(true, true)
			.removeClass('z-index-100').queue(function() {
				$(this).stop(true, true);
				$(btnShowLogBoard).removeClass('on');
				// .remove();
			});
		});
	});
}

//---------------------------------------------------
// リロード時にログボタン格納（Reloadボタン押下時など）
//---------------------------------------------------
function hideLogBoard() {
	$('#logBoard').fadeOut(300).queue(function() {
		$(this).stop(true, true)
		.removeClass('z-index-100');
	});
	$(btnShowLogBoard).removeClass('opacity-100 pos-on on');
}


//---------------------------------------------------
// 短文メッセージ用ボックス（画面中央に表示 - 一時的に要素を生成・表示後に削除）
//---------------------------------------------------
function showMessage(val) {
	// body下に要素を出力
	var $message = $('<div class="notifyMessage"><span>'+val+'</span></div>').appendTo('body');
	// アニメーション処理
	$message.fadeIn(300).queue(function() {
		$(this).stop(true, true)
		.delay(1500).fadeOut(500).queue(function() {
			$(this).stop(true, true)
			.remove();
		});
	});
}

//---------------------------------------------------
// imagesフォルダの中身調査（ファイル名・重さ・作成日時を特定変数へ入れる）
//---------------------------------------------------
function getFileInfo(dirName){
	$.ajax({
		type: "POST",
		url: "php/getFileInfo.php", //PHPを呼び出す
		data: {'targetDir': dirName}
	}).done(function(phpData){
		// ◆success（旧）

		// phpから返ってきたデータを扱いやすい形に整形
		result = JSON.parse(phpData);

		// 本js内の各種目的別の変数へ値を代入
		imgFileNames = result[0];
		imgFileSizes = result[1];
		imgFileTimestamps = result[2];
		imgMinExists = result[3];

		// ★【ホントは内包したくない】html内に要素を出力
		setImageToHtml(outputHtmlIdName);

	}).fail(function(){
		// ◆error（旧）
		$(outputHtmlIdName).html('処理に失敗しました');
	}).always(function(){
		// ◆complete（旧）
	});
}

//---------------------------------------------------
// html内に要素を出力
//---------------------------------------------------
function setImageToHtml(id){
	var html = "";				// imagesのhtmlデータの入れ物
	var tagBefore = "";			// タグの切り替わりを確認するための入れ物（前処理のタグは何か）
	var tagAfter = "";			// タグの切り替わりを確認するための入れ物（今回の処理のタグは何か）
	var listTagName = "";		// 

	// lodash.jsのtemplateを利用してhtml用のソースを生成・出力
	html += '<ul id="items" class="flexbox">\n';
	for(var i=0; i<imgFileNames.length; i++){

		var url = "";
		var ext = "";

		// ファイル名にタグとファイル名を分割するための分岐値が入っているか
		if(~imgFileNames[i][0].indexOf(tagBranchPoint)) {
			var sepName = imgFileNames[i][0].split(tagBranchPoint);

			// console.log("tag["+i+"]="+sepName[0]);
			// console.log("name["+i+"]="+getSepFileName(sepName[1], 1));
			url = getSepFileName(sepName[1], 1);
			url = urlDecompile(url);
			ext = getSepFileName(sepName[1], 2);

			tagAfter = sepName[0];
			// 一つ前に処理した要素のタグと今回分を比較して、違うタグであれば新しいタグの始まりを示すための要素を用意
			if(tagBefore !== tagAfter) {
				listTagName = 'tag-' + tagAfter;
				html += '\t<li class="item ' + listTagName + '"><div class="tag inner"><div><span>'+tagAfter+'</span></div></div></li>\n';
				tagBefore = tagAfter;
				tagLists.push(tagAfter);
			}
		}

		// /image/min にファイルがあるかどうかを識別
		var minImgPath = '';
		for(var j=0; j<imgMinExists.length; j++){
			if(imgMinExists[j][0]==imgFileNames[i][1]){
				if(imgMinExists[j][1]) minImgPath = 'min/';
				break;
			}
		}

		// lodash.jsのtemplateで記述簡略化
		// <%= num %>
		// <%= fullFileName %>
		// <%= sepFileName %>
		// <%= minImgPath %>
		// <%= listTagName %>
		// <%= url %>
		// <%= tag %>
		// <%= sepFileExt %>
		html += getTemplate(i, imgFileNames[i][0], getSepFileName(imgFileNames[i][0], 1), minImgPath, listTagName, url, tagAfter, ext);

	}
	html += "</ul>";

	// ★html内にimages要素を出力
	$(id).html(html);

	// ★html内にtagFilter要素を出力
	// [filter]01. 一度空にする
	$('#filter').html("");
	// [filter]02. filterを追加
	for(var i=0; i<tagLists.length; i++) {
		$('#filter').append('<li>'+tagLists[i]+'</li>');
	}

	//---------------------------------------------
	// リスナーイベントをセット（Setup the dnd listeners.）
	//---------------------------------------------
	// タグフィルター（#filter li）押下時 ※li要素配置後でないと効かないのでココに記述
	$('#filter li').click(function(){
		var index = $(this).index() + 1;
		// console.log('要素:' + index + '番目');
		$('#filter li').eq($(this).index()).toggleClass('active');
		// フィルターliの状態チェック
		checkFilterStatus();
	});

	// 各itemに仕込んだ「×ボタン」を押したときにその要素を削除する処理を設定
	$('.btn-delete').click(function(){
	    $(this).parent().parent().parent().remove(); //divとその中身が全て消えちゃう
	});
}


//---------------------------------------------------
// ファイルで使える文字に変換したURL → 通常URL
//---------------------------------------------------
function urlDecompile(source) {
	//	ファイル名には次の文字は使えません
	//	\/:*?"<>|
	var replaced = source
		.replace(/\[1\]/g, "\\")
		.replace(/\[2\]/g, "/")
		.replace(/\[3\]/g, ":")
		.replace(/\[4\]/g, "*")
		.replace(/\[5\]/g, "?")
		.replace(/\[6\]/g, "\"")
		.replace(/\[7\]/g, "<")
		.replace(/\[8\]/g, ">")
		.replace(/\[9\]/g, "|")
		.replace(/\[php\]/g, ".php");
	return replaced;
}

//---------------------------------------------------
// 通常URL → ファイルで使える文字に変換したURL
//---------------------------------------------------
function urlCompile(source) {
	//	ファイル名には次の文字は使えません
	//	\/:*?"<>|
	var replaced = source
		.replace(/\\/g, "[1]")
		.replace(/\//g, "[2]")
		.replace(/\:/g, "[3]")
		.replace(/\*/g, "[4]")
		.replace(/\?/g, "[5]")
		.replace(/\"/g, "[6]")
		.replace(/\</g, "[7]")
		.replace(/\>/g, "[8]")
		.replace(/\|/g, "[9]")
		.replace(/\.php/g, "[php]");
	return replaced;
}

//---------------------------------------------------
// テンプレート用の記述に指定したID毎のデータを入れ込み、値を返す
//---------------------------------------------------
function getTemplate(num, fullFileName, sepFileName, minImgPath, listTagName, url, tagAfter, ext) {
    var compile = _.template(document.getElementById('template').innerHTML);
    var html = compile({
    	num: num,
        fullFileName: fullFileName,
        sepFileName: sepFileName,
        minImgPath: minImgPath,
        listTagName: listTagName,
        url: url,
        tag: tagAfter,
        sepFileExt: ext
    });
    return html;
}

//---------------------------------------------------
// Reloadボタンを表示
//---------------------------------------------------
function showBtnReload() {
	if(!($(btnReload).hasClass('pos-on'))){
		$(btnReload).addClass('opacity-100 pos-on');
	}
}

//---------------------------------------------------
// input と textarea に onfocus したときの値をセットする
//---------------------------------------------------
function setVal(e) {
	oldVal = e.value;
}

//---------------------------------------------------
// input と textarea で keyup したときに呼び出して、特定の値と内容を比較する
//---------------------------------------------------
function checkValChange(e, type){
	// 違いがあったときにアクションを起こす
	if(oldVal != e.value) {
		var id = '#'+e.id;
		if(type == "input") {
			// button の disabled を取る
			$(id).parent(".img-overlay-content").find(".btn-save-filename").prop("disabled", false);
		}else{
			$(id).parent(".item").find(".btn-save-memo").prop("disabled", false);
		}
	}
}

//---------------------------------------------------
// ファイル名を拡張子と分けて返す（拡張子の前部分）
//---------------------------------------------------
function getSepFileName(fileName, selectPos) {
	var reg=/(.*)(?:\.([^.]+$))/;
	// var file_name="demon_uploader.jpg";
	return fileName.match(reg)[selectPos];
	// console.log(file_name.match(reg)[0]);//demon_uploader.jpg
	// console.log(file_name.match(reg)[1]);//demon_uploader
	// console.log(file_name.match(reg)[2]);//jpg
}


//---------------------------------------------------
// ファイル名を変更する
//---------------------------------------------------
function renameFiles(id, oldFileName, minImgPath, ext){

	var beforeURL = $('#fileurl'+id).val();
	var afterURL = urlCompile(beforeURL);
	var newFileName = $('#filetag'+id).val() + tagBranchPoint + afterURL + "." + ext;

	$.ajax({
		type: "POST",
		url: "php/renameFiles.php", //PHPを呼び出す
		data: {
			'oldImgFileName': 'images/' + oldFileName,
			'newImgFileName': 'images/' + newFileName,
			'oldMinImgFileName': 'images/' + minImgPath + oldFileName,
			'newMinImgFileName': 'images/' + minImgPath + newFileName
	}
	}).done(function(phpData){
		// ◆success（旧）
		showMessage('<span class="color">' + phpData + '</span><br>completed.');
		// console.log(phpData);
	}).fail(function(){
		// ◆error（旧）
		// console.log(phpData);
	}).always(function(){
		// ◆complete（旧）
	});
}


//---------------------------------------------------
// ファイルを削除する
//---------------------------------------------------
function deleteFiles(id, oldFileName, minImgPath, ext){

	var beforeURL = $('#fileurl'+id).val();
	var afterURL = urlCompile(beforeURL);
	var newFileName = $('#filetag'+id).val() + tagBranchPoint + afterURL + "." + ext;

	$.ajax({
		type: "POST",
		url: "php/deleteFiles.php", //PHPを呼び出す
		data: {
			'deleteFileName': 'images/' + newFileName,
			'deleteMinFileName': 'images/' + minImgPath + newFileName
	}
	}).done(function(phpData){
		// ◆success（旧）
		// console.log(phpData);
		showMessage('<span class="color">' + phpData + '</span><br>deleted.');
	}).fail(function(){
		// ◆error（旧）
		// console.log(phpData);
	}).always(function(){
		// ◆complete（旧）
	});
}
