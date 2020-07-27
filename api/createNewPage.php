<?php

$_POST = json_decode( file_get_contents("php://input"), true ); // декодирование из json в другой формат 
$newFile = "../../" . $_POST["name"] . ".html"; // расположение и имя нового файла

if(file_exists($newFile)) {
    header("HTTP/1.0 400 Bad Request"); // Bad Request
} else {
    fopen($newFile, "w"); // Создание нового файла
}
