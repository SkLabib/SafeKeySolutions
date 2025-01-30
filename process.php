<?php
$file = 'user.txt';

// Create file if it doesn't exist
if (!file_exists($file)) {
    touch($file);
    chmod($file, 0666);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    $users = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    // Handle login
    if ($action === 'login') {
        $found = false;
        foreach ($users as $user) {
            list($name, $storedEmail, $storedPassword) = explode(',', $user);
            if ($storedEmail === $email && $storedPassword === $password) {
                $found = true;
                break;
            }
        }
        if ($found) {
            echo "Login successful";
        } else {
            echo "Invalid email or password";
        }
    }
    // Handle registration
    elseif ($action === 'register') {
        $name = trim($_POST['name']);
        $exists = false;

        foreach ($users as $user) {
            list(, $storedEmail,) = explode(',', $user);
            if ($storedEmail === $email) {
                $exists = true;
                break;
            }
        }

        if ($exists) {
            echo "Email already registered!";
        } else {
            $newUser = "$name,$email,$password\n";
            file_put_contents($file, $newUser, FILE_APPEND);
            echo "Registration successful!";
        }
    }
}
?>
