# E-Library

A simple personal book collection management system.

Access your collection locally at http://127.0.0.1:8080 using a lightweight local server.

## Getting Started

Follow the steps below to set up and run the E-Library on your local machine:

## Prerequisites

Ensure you have Node.js installed on your system. You can download it from nodejs.org.

Steps to Run

### 1.	Install http-server Globally
Use the following command to install a lightweight HTTP server globally:

    ```bash
    npm install -g http-server
    ```

### 2.	Navigate to Your Project Directory
Move into the folder where your E-Library project files are located:
    ```bash
    cd /path/to/your/project
    ```

### 3.	Start the Local Server
Launch the server in your project directory:

    ```bash
    http-server
    ```

### 4.	Access the E-Library
Open your browser and go to:

    ```bash
    http://127.0.0.1:8080
    ```

## Features

	•	Browse and search your personal book collection.
	•	Filter books by category.
	•	View detailed information about each book in a modal window.
	•	Automatically fetch missing book covers from online sources.
	•	Graceful fallback for books with no available covers.

## Contributing

Feel free to contribute by submitting pull requests or reporting issues.

## License

This project is open-source and available under the MIT License.
