plugins {
    id("com.android.application")
}

// La versión la pone GitHub Actions: -Pvn=0.41.3 -Pvc=<número de compilación>
val vn = (project.findProperty("vn") as String?) ?: "0.0.0"
val vc = ((project.findProperty("vc") as String?) ?: "1").toInt()

android {
    namespace = "com.heison.raicesdeniebla"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.heison.raicesdeniebla"
        minSdk = 24
        targetSdk = 34
        versionCode = vc
        versionName = vn
    }

    // Llave fija guardada en el repositorio: así cada APK nuevo se instala ENCIMA del anterior sin borrar
    // la partida. (Con la llave de depuración que Gradle inventa en cada máquina, Android rechazaría la
    // actualización y habría que desinstalar.) Para publicar en Play Store se debe crear una llave privada.
    signingConfigs {
        create("fija") {
            storeFile = file("raices.keystore")
            storePassword = "raicesdeniebla"
            keyAlias = "raices"
            keyPassword = "raicesdeniebla"
        }
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("fija")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.11.0")
}
