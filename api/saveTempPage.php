<?php

$_POST = json_decode(file_get_contents("php://input"), true); // декодирование из json в другой формат 
$newFile = "../../ytytyr33345_12ee.html"; // расположение и имя нового файла

if ($_POST["html"]) {
    file_put_contents($newFile, $_POST["html"]); // html dom структура в новый файл
} else {
    header("HTTP/1.0 400 Bad Request"); // Bad Request
}
