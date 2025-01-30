<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<?php
        // PHP code starts here

        // Variable declaration
        $name = "John Doe";
        $age = 25;

        // Simple output
        echo "<h1>Welcome, $name!</h1>";
        echo "<p>Your age is: $age</p>";

        // Conditional Statement
        if ($age >= 18) {
            echo "<p>Status: You are an adult.</p>";
        } else {
            echo "<p>Status: You are a minor.</p>";
        }

        // Loop example
        echo "<h2>Numbers from 1 to 5:</h2>";
        for ($i = 1; $i <= 5; $i++) {
            echo "<p>Number: $i</p>";
        }

        // Associative Array Example
        $user = array(
            "name" => "John Doe",
            "email" => "johndoe@example.com",
            "age" => 25
        );

        echo "<h2>User Information:</h2>";
        foreach ($user as $key => $value) {
            echo "<p>$key: $value</p>";
        }
    ?>
</body>
</html>