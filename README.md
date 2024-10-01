# Group 3 Shotmaniacs Web Application

## Description
This repository contains a Java web application developed for Shotmaniacs, as part of the module 4 Data & Information for University of Twente curriculum.

## Important information
- You can find the complete backend api documentation inside `/design` folder containing the api-usage.yaml file
- The DB schema is also inside the `/design` folder, these 2 together can help you map out the backend infrastructure easily
- Trello board link https://trello.com/b/GtiCeWXY/shotmaniacs-group-3

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Java Development Kit (JDK) installed
- Apache Maven installed
- Apache Tomcat installed

## Installation
Follow these steps to run the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://gitlab.utwente.nl/s3087573/di3shotmaniacs.git
   cd di3shotmaniacs
   
2. **Open the project in IntelliJ IDEA**
   - Ensure IntelliJ IDEA is installed on your system.
   - Open IntelliJ IDEA and import the project (File -> Open -> Navigate to project directory -> Select pom.xml).
   - IntelliJ IDEA should automatically recognize the project as a Maven project and import the necessary dependencies.

3. **Configure Tomcat Server**
   - Configure Apache Tomcat in IntelliJ IDEA as an Application Server:
   - Go to Run -> Edit Configurations.
   - Click the + button and select Tomcat Server -> Local.
   - Choose an existing Tomcat installation or configure a new one by specifying the Tomcat installation directory.
   - Apply the changes.

4. **Build and Run the Project**
   - Ensure the project builds successfully:
     - Click on the green hammer icon or use Ctrl + F9 to build the project.
   - Deploy the application to Tomcat:
     - Create a run configuration by clicking on the + icon, Select Tomcat Local. Ensure in the server tab the url is set to: `http://localhost:8080/shotmaniacs_war/` and in the deployment tab, press the + button and add the shotmaniacs:war **artifact**.
     - Click on the green play button or use Shift + F10 to run the application on the configured Tomcat server.

5. **Access the application**
   - Once the application is deployed, access it at `http://localhost:8080/shotmaniacs_war/`

## Additional Configuration
Normally, the application would keep the database login info and email login info inside a `.env` file which would contain all the sensitive login information necessary to run the server. However, we chose to save the login information directly in the code for ease of testing. So there is no need to load any external environmental files. This is not really a security concern currently, as the git repository is set to private.

## Authors
- Tudor Matei - [s3184609]
- Roelof Hooft - [s3017087]
- Ana Stoica - [s3186156]
- Aron Eekma - [s3135306]
- Harveer Singh - [s3231046]
- Andrei Dorneanu - [s3237478]