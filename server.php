<?php

require_once 'php-graph-sdk-5.0.0/src/Facebook/autoload.php';
require_once 'config.php';

$fb = new Facebook\Facebook([
  'app_id' => APP_ID,
  'app_secret' => APP_SECRET,
  //'default_graph_version' => 'v2.5',
]);


function token() {
  return APP_ID."|".APP_SECRET;
}

/*
 * GET ?page={page_id}
 * Returns list of albums as json object
 */
if (isset($_GET['page'])) {
	try {
		$response = $fb->get('/'.$_GET['page'].'/albums?fields=picture,name', token());
	} catch(Facebook\Exceptions\FacebookResponseException $e) {
	  echo 'Graph returned an error: ' . $e->getMessage();
	  exit;
	} catch(Facebook\Exceptions\FacebookSDKException $e) {
	  echo 'Facebook SDK returned an error: ' . $e->getMessage();
	  exit;
	}

	$data = $response->getGraphEdge()->asArray();
	header('Content-Type: application/json;charset=utf-8');
	echo json_encode($data);

/*
 * GET ?album={album_id}&limit={limit}&after={ref to next page}
 * Returns limited list of pictures in the album and cursor
 * to next page of results
 */
} else if (isset($_GET['album'])) {
	$path = '/'.$_GET['album'].'/photos?fields=picture,link';
	if (isset($_GET['after'])) {
		$path = $path.'&after='.$_GET['after'];
	}
	if (isset($_GET['limit'])) {
		$path = $path.'&limit='.$_GET['limit'];
	} else {
		$path = $path.'&limit=6';
	}

	try {
		$response = $fb->get($path, token());
	} catch(Facebook\Exceptions\FacebookResponseException $e) {
		echo 'Graph returned an error: ' . $e->getMessage();
		exit;
	} catch(Facebook\Exceptions\FacebookSDKException $e) {
		echo 'Facebook SDK returned an error: ' . $e->getMessage();
		exit;
	}

	$data = $response->getGraphEdge()->asArray();
	$result = array("data" => $data,
		"next" => $response->getGraphEdge()->getNextCursor());
		//"previous" => $response->getGraphEdge()->getPreviousCursor()
	header('Content-Type: application/json;charset=utf-8');
	echo json_encode($result);
}
?>
