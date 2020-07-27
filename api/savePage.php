<?php
$_POST = json_decode(file_get_contents("php://input"), true); // декодирование из json в другой формат 

$file = "../../" . $_POST["pageName"]; // расположение и имя нового файла
$newHTML = $_POST['html'];

if ($newHTML) {
    file_put_contents($file, $newHTML);
} else {
    header("HTTP/1.0 400 Bad Request"); // Bad Request
}
