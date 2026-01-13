plugins {
    kotlin("jvm")
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
}

application {
    mainClass.set("cl.payments.examples.webpay.WebpayExampleKt")
}

tasks.register<JavaExec>("runWebpay") {
    group = "examples"
    description = "Run Webpay example"
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("cl.payments.examples.webpay.WebpayExampleKt")
    standardInput = System.`in`
}

tasks.register<JavaExec>("runGetnet") {
    group = "examples"
    description = "Run Getnet example"
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("cl.payments.examples.getnet.GetnetExampleKt")
    standardInput = System.`in`
}

tasks.register<JavaExec>("runComparison") {
    group = "examples"
    description = "Run Comparison example"
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("cl.payments.examples.comparison.ComparisonExampleKt")
}