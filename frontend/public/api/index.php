<?php
$m = $_SERVER["REQUEST_METHOD"];
$u = "http://127.0.0.1:3001" . $_SERVER["REQUEST_URI"];
$ch = curl_init($u);
$h = [];
foreach ($_SERVER as $k => $v) {
    if (strpos($k, "HTTP_") === 0) {
        $name = str_replace("_", "-", substr($k, 5));
        if ($name !== "HOST") $h[] = $name . ": " . $v;
    }
}
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER     => $h,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $m,
    CURLOPT_FOLLOWLOCATION => false,
]);
if (in_array($m, ["POST", "PUT", "DELETE", "PATCH"])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents("php://input"));
}
$r    = curl_exec($ch);
$c    = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($c) header("Content-Type: " . $c);
http_response_code($code ?: 502);
curl_close($ch);
echo $r;
