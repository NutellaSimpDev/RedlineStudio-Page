<?php
declare(strict_types=1);

// Receives the site's lead forms and emails them directly via the
// hosting's own mail transport (Hostinger/PHP mail()) - no third-party
// form service, no submission limits, no credentials to keep secret.

$to = 'contacto@redlinestudio.es';
$fromDomain = 'redlinestudio.es';

function wantsJson(): bool
{
    return isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
}

function respond(int $status, array $payload, ?string $redirect): void
{
    http_response_code($status);

    if (wantsJson()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload);
        return;
    }

    // Native (no-JS) fallback: send the visitor to a real page instead of raw JSON.
    $isRelativePath = $redirect !== null && substr($redirect, 0, 1) === '/' && substr($redirect, 0, 2) !== '//';
    $safeRedirect = $isRelativePath ? $redirect : '/';
    header('Location: ' . $safeRedirect, true, 302);
}

function cleanHeaderValue(string $value): string
{
    return trim(str_replace(["\r", "\n"], '', $value));
}

$redirectTarget = isset($_POST['redirect']) ? (string) $_POST['redirect'] : '/gracias';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'message' => 'Method not allowed'], $redirectTarget);
    exit;
}

// Honeypot: bots fill hidden fields humans never see. Pretend success, send nothing.
if (!empty($_POST['botcheck'])) {
    respond(200, ['success' => true], $redirectTarget);
    exit;
}

$name = cleanHeaderValue((string) ($_POST['Nombre'] ?? ''));
$company = cleanHeaderValue((string) ($_POST['Empresa'] ?? ''));
$service = cleanHeaderValue((string) ($_POST['Servicio_Interes'] ?? ''));
$email = trim((string) ($_POST['Email'] ?? ''));
$phone = cleanHeaderValue((string) ($_POST['Telefono'] ?? ''));
$sourcePage = cleanHeaderValue((string) ($_POST['source_page'] ?? 'unknown'));
$subject = cleanHeaderValue((string) ($_POST['subject'] ?? 'Nuevo Lead - REDLINE STUDIO'));

if ($name === '' || $company === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['success' => false, 'message' => 'Missing or invalid fields'], $redirectTarget);
    exit;
}

$body = "Nuevo lead desde redlinestudio.es\n\n"
    . "Nombre: {$name}\n"
    . "Empresa: {$company}\n"
    . "Servicio de interes: {$service}\n"
    . "Email: {$email}\n"
    . "Telefono: {$phone}\n"
    . "Pagina de origen: {$sourcePage}\n";

$headers = "From: Redline Studio Web <no-reply@{$fromDomain}>\r\n"
    . "Reply-To: {$email}\r\n"
    . "MIME-Version: 1.0\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    respond(200, ['success' => true], $redirectTarget);
} else {
    respond(500, ['success' => false, 'message' => 'Mail send failed'], $redirectTarget);
}
