# Getting Started

## Online Version

You can directly start using CAVis with the online version we have deployed for you by clicking the link in the top-right corner.

### TODO: Step by step getting started with the deployed version

To be filled with screenshots, etc.

## Deploying CAVis locally

The server of CAVis has some limitations, especially when many users access it in parallel, because many mechanisms include solving winner determination problems.
So given that you have a access to a version of CPLEX (e.g., via educational license), you can take the following steps to let CAVis run on your own machine.

### Via Docker

The easiest way to achieve this is with Docker. The main difficulty is that there is no CPLEX docker image out there, because it's a commercial software, so you have to build this yourself. We give you all the tools that are needed for this.

1. Pull the backend repository:

   ```bash
   git pull git@github.com:marketdesignresearch/cavis-backend.git && cd cavis-backend
   ```

2. Build the CPLEX docker image:

   - Place your `cplex_studio129.linux-x86-64.bin` file into the `docker/cplex/` directory
   - Run the following command:

     ```bash
     docker build -t cplex:12.9 docker/cplex
     ```

3. Build the CAVis images:

   ```bash
   docker-compose build
   ```

4. Run CAVis:

   ```bash
   docker-compose up -d
   ```

### Without Docker --- TODO

- Prerequisites: Maven, Java, Node
- Install CPLEX
- Maven-install cplex.jar
- pull both repositories
- Backend: `mvn spring-boot:run`
- Frontend: `npm run serve`
