plugins {
    alias(libs.plugins.kotlin.jvm)
    application
}

repositories {
    mavenCentral()
}

sourceSets.main {
    java.srcDirs("src/main")
}
dependencies {
     implementation("com.squareup.okhttp3:okhttp:4.9.1")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = "org.example.AppKt"
}
