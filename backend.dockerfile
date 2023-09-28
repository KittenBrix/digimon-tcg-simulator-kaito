FROM openjdk:20 as build

# copy base files over.
COPY backend/.mvn .mvn
COPY backend/mvnw .
COPY backend/pom.xml .

# build dependencies (shouldn't need to happen every run, only when new deps are added) (skips tests too)
RUN ./mvnw -B dependency:go-offline -Dmaven.test.skip

# copy src
COPY backend/src src

# build backend application (happens near everytime)
# use ./mvnw if linux/mac, ./mvnw.cmd if windows
RUN ./mvnw -B package



# start new running container to actually execute code.
FROM openjdk:20 as server

COPY --from=build target/digimon-tcg-sim.jar .

# Command to run the Spring Boot application
CMD ["sh", "-c", "java -DServer.port=8080 -jar digimon-tcg-sim.jar"]