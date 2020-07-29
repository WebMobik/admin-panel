<?php
$file = "../../ytytyr33345_12ee.html";

if (file_exists($file)) {
    unlink($file);
} else {
    header("HTTP/1.0 400 Bad Request");
}
