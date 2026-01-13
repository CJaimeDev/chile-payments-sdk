plugins {
    kotlin("jvm") version "1.9.22"
    `maven-publish`
}

group = "cl.payments"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // Kotlin
    implementation(kotlin("stdlib"))
    
    // HTTP Client
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    
    // JSON
    implementation("com.google.code.gson:gson:2.10.1")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    
    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0")
}

kotlin {
    jvmToolchain(17)
}

tasks.test {
    useJUnitPlatform()
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            from(components["java"])
            
            pom {
                name.set("Chile Payments SDK - Kotlin")
                description.set("SDK unificado para integrar pasarelas de pago chilenas")
                url.set("https://github.com/CJaimeDev/chile-payments-sdk")
                
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }
            }
        }
    }
}